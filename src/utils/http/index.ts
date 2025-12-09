import { $t } from '@/locales'
import { useTenantStore } from '@/store/modules/tenant'
import { useUserStore } from '@/store/modules/user'
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { ErrorResponse, HttpError, handleError, showError, showSuccess } from './error'
import { ApiStatus } from './status'

const REQUEST_TIMEOUT = 30000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 2

export interface ApiRes<T = any> {
  code: string
  data: T
  msg: string
  success: boolean
  timestamp?: string
}
export interface PageRes<T> {
  list: T[]
  total: number
}

export interface PageQuery {
  page?: number
  size?: number
}
/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE/PATCH 等常用方法
/** 简化的 HTTP 请求封装（Axios） */

const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false

/** 扩展 AxiosRequestConfig */
export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  /** 是否显示错误消息（默认 true） */
  showErrorMessage?: boolean
  /** 是否显示成功消息（默认 false） */
  showSuccessMessage?: boolean
  /** 是否重试（默认 false） */
  retry?: boolean
  /** 最大重试次数（覆盖默认值） */
  maxRetries?: number
  /** 是否显示加载状态 */
  loading?: boolean
}

/** HTTP 实例配置 */
interface HttpInstanceConfig {
  baseURL?: string
  timeout?: number
  withCredentials?: boolean
  headers?: Record<string, string>
}

/**
 * 创建 Axios 实例
 */
function createHttpInstance(config?: HttpInstanceConfig) {
  const { VITE_API_URL, VITE_API_PREFIX, VITE_WITH_CREDENTIALS } = import.meta.env

  return axios.create({
    timeout: config?.timeout || REQUEST_TIMEOUT,
    baseURL: config?.baseURL || VITE_API_URL || VITE_API_PREFIX,
    withCredentials: config?.withCredentials ?? VITE_WITH_CREDENTIALS === 'true',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers
    },
    validateStatus: (status) => status >= 200 && status < 300
  })
}

/** Axios 实例 */
const axiosInstance = createHttpInstance()

/**
 * 请求拦截器
 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    // 自动添加 Authorization Token
    const userStore = useUserStore()
    const token = userStore.accessToken
    if (token && request.headers) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    // 自动添加租户ID（如果启用）
    const tenantStore = useTenantStore()
    if (tenantStore.tenantEnabled && tenantStore.tenantId && request.headers) {
      request.headers.set('X-Tenant-Id', tenantStore.tenantId)
    }

    // 处理请求数据
    if (
      request.data &&
      !(request.data instanceof FormData) &&
      !request.headers?.get('Content-Type')
    ) {
      request.headers.set('Content-Type', 'application/json')
    }

    // 记录请求日志
    if (import.meta.env.DEV) {
      console.log(`[HTTP Request] ${request.method?.toUpperCase()} ${request.url}`, {
        params: request.params,
        data: request.data
      })
    }

    return request
  },
  (error) => {
    console.error('[HTTP Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiRes<any>>) => {
    // 记录响应日志
    if (import.meta.env.DEV) {
      console.log(
        `[HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data
        }
      )
    }

    const { data } = response

    // 处理二进制数据
    if (response.request.responseType === 'blob') {
      return response
    }

    // 检查业务状态码
    if (data.code === ApiStatus.success) {
      return response
    }

    // 处理未授权
    if (data.code === ApiStatus.unauthorized) {
      handleUnauthorizedError(data.msg)
    }

    // 抛出业务错误
    throw new HttpError(data.msg || $t('httpMsg.requestFailed'), data.code, {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: data.data
    })
  },
  (error: AxiosError<ErrorResponse, any>) => {
    // 处理取消的请求
    if (axios.isCancel(error)) {
      console.warn('[HTTP] Request cancelled:', error.message)
      return Promise.reject(new HttpError('Request cancelled', ApiStatus.error))
    }

    // 处理未授权状态码
    if (error.response?.status === 401) {
      handleUnauthorizedError()
    }

    return Promise.reject(handleError(error))
  }
)

/**
 * 处理401错误（带防抖）
 */
function handleUnauthorizedError(message?: string): never {
  const errorMsg = message || $t('httpMsg.unauthorized')
  const error = new HttpError(errorMsg, ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true

    // 显示错误消息
    showError(error, true)

    // 延迟登出
    setTimeout(() => {
      const userStore = useUserStore()
      userStore.logOut()
    }, LOGOUT_DELAY)

    // 重置防抖状态
    setTimeout(() => {
      isUnauthorizedErrorShown = false
    }, UNAUTHORIZED_DEBOUNCE_TIME)
  }

  throw error
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 判断是否需要重试
 */
function shouldRetry(error: HttpError): boolean {
  const retryableStatuses = [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ]

  return retryableStatuses.includes(error.code as ApiStatus)
}

/**
 * 请求重试逻辑
 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await http<T>(config)
  } catch (error) {
    if (retries > 0 && config.retry && error instanceof HttpError && shouldRetry(error)) {
      console.log(`[HTTP] Retrying request, ${retries} attempts left`)
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/**
 * 核心请求函数
 */
async function http<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const response = await axiosInstance.request<ApiRes<T>>(config)

    // 处理二进制响应
    if (response.request.responseType === 'blob') {
      return response as unknown as T
    }

    // 显示成功消息
    if (config.showSuccessMessage && response.data.msg) {
      showSuccess(response.data.msg)
    }

    return response.data.data as T
  } catch (error) {
    if (error instanceof HttpError) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/**
 * 原始请求函数 - 返回完整响应
 */
async function httpRaw<T = any>(
  config: ExtendedAxiosRequestConfig
): Promise<AxiosResponse<ApiRes<T>>> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const response = await axiosInstance.request<ApiRes<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && response.data.msg) {
      showSuccess(response.data.msg)
    }

    return response
  } catch (error) {
    if (error instanceof HttpError) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/**
 * 工厂函数：生成特定方法的请求函数
 */
function createRequest(method: string) {
  return <T = any>(
    url: string,
    params?: Record<string, any>,
    config?: ExtendedAxiosRequestConfig
  ): Promise<T> => {
    const finalConfig: ExtendedAxiosRequestConfig = {
      method,
      url,
      [method.toLowerCase() === 'get' || method.toLowerCase() === 'delete' ? 'params' : 'data']:
        params,
      ...config
    }

    if (finalConfig.retry) {
      return retryRequest<T>(finalConfig, finalConfig.maxRetries)
    }

    return http<T>(finalConfig)
  }
}

/**
 * HTTP API 对象
 */
const api = {
  /**
   * GET 请求
   */
  get: createRequest('GET'),

  /**
   * POST 请求
   */
  post: createRequest('POST'),

  /**
   * PUT 请求
   */
  put: createRequest('PUT'),

  /**
   * DELETE 请求
   */
  del: createRequest('DELETE'),

  /**
   * PATCH 请求
   */
  patch: createRequest('PATCH'),

  /**
   * 通用请求方法
   */
  request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
    if (config.retry) {
      return retryRequest<T>(config, config.maxRetries)
    }
    return http<T>(config)
  },

  /**
   * 原始响应 - 返回完整的 AxiosResponse
   */
  requestNative<T = any>(config: ExtendedAxiosRequestConfig): Promise<AxiosResponse<ApiRes<T>>> {
    return httpRaw<T>(config)
  },

  /**
   * 原始响应数据 - 返回 ApiRes（包含 code/msg/data 等）
   */
  raw<T = any>(config: ExtendedAxiosRequestConfig): Promise<ApiRes<T>> {
    return axiosInstance.request<ApiRes<T>>(config).then((res) => res.data)
  },

  /**
   * 下载文件
   */
  download<T = Blob>(
    url: string,
    params?: Record<string, any>,
    config?: ExtendedAxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      responseType: 'blob',
      ...config
    })
  },

  /**
   * 上传文件
   */
  upload<T = any>(
    url: string,
    formData: FormData,
    config?: ExtendedAxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }
}

// 导出
export default api
export { createHttpInstance, http, httpRaw }
export type { HttpInstanceConfig }
