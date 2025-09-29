import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, showError, showSuccess } from './error'
import { $t } from '@/locales'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** 响应拦截器配置 */
interface ResponseInterceptorConfig {
  /** 响应数据中代表访问结果的字段名 */
  codeField: string
  /** 响应数据中装载实际数据的字段名，或者提供一个函数从响应数据中解析需要返回的数据 */
  dataField: ((response: any) => any) | string
  /** 当codeField所指定的字段值与successCode相同时，代表接口访问成功。如果提供一个函数，则返回true代表接口访问成功 */
  successCode: ((code: any) => boolean) | number | string
  /** 响应数据中代表错误信息的字段名 */
  messageField: string
  /** 是否启用自动错误处理 */
  enableErrorHandle: boolean
  /** 是否启用成功消息显示 */
  enableSuccessMessage: boolean
}

/** 默认响应拦截器配置 */
const DEFAULT_RESPONSE_CONFIG: ResponseInterceptorConfig = {
  codeField: 'code',
  dataField: 'data',
  successCode: '0',
  messageField: 'msg',
  enableErrorHandle: true,
  enableSuccessMessage: false
}

/** 当前响应拦截器配置 */
let currentResponseConfig: ResponseInterceptorConfig = DEFAULT_RESPONSE_CONFIG

/** 设置响应拦截器配置 */
const setResponseConfig = (config: Partial<ResponseInterceptorConfig>) => {
  currentResponseConfig = { ...DEFAULT_RESPONSE_CONFIG, ...config }
}

/** 获取响应拦截器配置 */
const getResponseConfig = () => currentResponseConfig

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', accessToken)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 默认响应拦截器 */
const defaultResponseInterceptor = (): any => {
  return {
    fulfilled: (response: AxiosResponse<any>) => {
      const { config, data: responseData, status } = response
      const { codeField, dataField, successCode, messageField, enableSuccessMessage } =
        currentResponseConfig

      // 如果请求配置了返回原始响应
      if ((config as any).responseReturn === 'raw') {
        return response
      }

      // HTTP状态码检查
      if (status >= 200 && status < 400) {
        // 如果请求配置了返回响应体
        if ((config as any).responseReturn === 'body') {
          return responseData
        }

        // 检查业务状态码
        const isSuccess =
          typeof successCode === 'function'
            ? successCode(responseData[codeField])
            : responseData[codeField] === successCode

        if (isSuccess) {
          // 显示成功消息
          if (enableSuccessMessage && responseData[messageField]) {
            showSuccess(responseData[messageField])
          }

          // 返回数据
          return typeof dataField === 'function' ? dataField(responseData) : responseData[dataField]
        }
      }

      // 抛出错误
      throw Object.assign({}, response, { response })
    }
  }
}

/** 认证响应拦截器 */
const authenticateResponseInterceptor = (): any => {
  return {
    rejected: async (error: any) => {
      const { response } = error

      // 如果不是 401 错误，直接抛出异常
      if (response?.status !== ApiStatus.unauthorized) {
        throw error
      }

      // 处理未授权错误
      handleUnauthorizedError(response?.data?.[currentResponseConfig.messageField])
      throw error
    }
  }
}

/** 错误消息响应拦截器 */
const errorMessageResponseInterceptor = (): any => {
  return {
    rejected: (error: any) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error)
      }

      const err: string = error?.toString?.() ?? ''
      let errMsg = ''

      if (err?.includes('Network Error')) {
        errMsg = $t('httpMsg.networkError')
      } else if (error?.message?.includes?.('timeout')) {
        errMsg = $t('httpMsg.requestTimeout')
      }

      if (errMsg) {
        showError(createHttpError(errMsg, ApiStatus.error), true)
        return Promise.reject(error)
      }

      let errorMessage = ''
      const status = error?.response?.status

      switch (status) {
        case 400:
          errorMessage = $t('httpMsg.badRequest')
          break
        case 401:
          errorMessage = $t('httpMsg.unauthorized')
          break
        case 403:
          errorMessage = $t('httpMsg.forbidden')
          break
        case 404:
          errorMessage = $t('httpMsg.notFound')
          break
        case 408:
          errorMessage = $t('httpMsg.requestTimeout')
          break
        default:
          errorMessage = $t('httpMsg.internalServerError')
      }

      showError(createHttpError(errorMessage, status || ApiStatus.error), true)
      return Promise.reject(error)
    }
  }
}

/** 应用响应拦截器 */
axiosInstance.interceptors.response.use(defaultResponseInterceptor().fulfilled, async (error) => {
  // 先处理认证错误
  const authError = await authenticateResponseInterceptor().rejected(error)
  if (authError) return authError

  // 再处理错误消息
  return errorMessageResponseInterceptor().rejected(error)
})

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 处理401错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await internalRequest<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 内部请求函数 */
async function internalRequest<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<Http.BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** 基础请求函数 */
const request = async <T = unknown>(config: ExtendedAxiosRequestConfig): Promise<T> => {
  return retryRequest<T>(config)
}

/** 原生请求函数（返回完整响应） */
const requestNative = async <T = unknown>(
  config: ExtendedAxiosRequestConfig
): Promise<AxiosResponse<Http.BaseResponse<T>>> => {
  try {
    return await axiosInstance.request<Http.BaseResponse<T>>(config)
  } catch (error) {
    return Promise.reject(error)
  }
}

/** 创建请求方法的工厂函数 */
const createRequest = (method: string) => {
  return <T = any>(
    url: string,
    params?: object,
    config?: ExtendedAxiosRequestConfig
  ): Promise<T> => {
    return request<T>({
      method,
      url,
      [method === 'get' ? 'params' : 'data']: params,
      ...config
    })
  }
}

/** 下载文件 */
const download = (
  url: string,
  params?: object,
  config?: ExtendedAxiosRequestConfig
): Promise<AxiosResponse> => {
  return requestNative({
    method: 'get',
    url,
    responseType: 'blob',
    params,
    ...config
  })
}

/** 上传文件 */
const upload = <T = any>(
  url: string,
  formData: FormData,
  config?: ExtendedAxiosRequestConfig
): Promise<T> => {
  return request<T>({
    method: 'post',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

/** API方法集合 */
const http = {
  get: createRequest('get'),
  post: createRequest('post'),
  put: createRequest('put'),
  patch: createRequest('patch'),
  del: createRequest('delete'),
  request,
  requestNative,
  download,
  upload,
  // 响应拦截器配置相关方法
  setResponseConfig,
  getResponseConfig
}

export default http
