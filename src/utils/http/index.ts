import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { useTenantStore } from '@/store/modules/tenant'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig<T = any> extends AxiosRequestConfig<T> {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  skipUnauthorizedHandler?: boolean // 添加跳过401处理的标志
}

/** 响应拦截器配置 */
interface ResponseInterceptorConfig {
  codeField: keyof Http.BaseResponse<any>
  dataField: keyof Http.BaseResponse<any>
  successCode: ((code: any) => boolean) | string
  messageField: keyof Http.BaseResponse<any>
}

const DEFAULT_RESPONSE_CONFIG: ResponseInterceptorConfig = {
  codeField: 'code',
  dataField: 'data',
  successCode: '0',
  messageField: 'msg'
}

let currentResponseConfig: ResponseInterceptorConfig = DEFAULT_RESPONSE_CONFIG

const setResponseConfig = (config: Partial<ResponseInterceptorConfig>) => {
  currentResponseConfig = { ...DEFAULT_RESPONSE_CONFIG, ...config }
}
const getResponseConfig = () => currentResponseConfig

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

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
    const tenantStore = useTenantStore()
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)
    if (tenantStore.tenantEnable && tenantStore.tenantId) {
      request.headers.set('X-Tenant-Id', tenantStore.tenantId)
    }
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

/** 响应拦截器（只做HTTP层校验） */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, statusText } = response
    if (status < 200 || status >= 300) {
      throw new HttpError($t('httpMsg.httpError') + ` (${status} ${statusText})`, status)
    }
    return response
  },
  (error) => {
    const { response, config } = error

    // 检查是否需要跳过401处理
    if (response?.status === ApiStatus.unauthorized && config?.skipUnauthorizedHandler) {
      // 如果需要跳过401处理，直接返回错误，不进行任何额外处理
      return Promise.reject(error)
    }

    // 处理401未授权错误
    if (response?.status === ApiStatus.unauthorized) {
      handleUnauthorizedError(response?.data?.[currentResponseConfig.messageField])
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

    const status = response?.status
    let errorMessage = ''
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
)

/** 创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 处理401错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)
  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    // 直接清理本地用户状态，不调用 logout API
    useUserStore().cleanupState()
    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)
    showError(error, true)
    throw error
  }
  throw error
}

function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
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
  config: ExtendedAxiosRequestConfig<Http.BaseResponse<T>>,
  retries: number = MAX_RETRIES
): Promise<Http.BaseResponse<T>> {
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 内部请求函数（业务层校验） */
async function internalRequest<T = any>(
  config: ExtendedAxiosRequestConfig<Http.BaseResponse<T>>
): Promise<Http.BaseResponse<T>> {
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
    const { codeField, successCode, messageField } = currentResponseConfig
    const responseData = res.data

    // 使用更精确的类型检查
    const isSuccess =
      typeof successCode === 'function'
        ? successCode(responseData[codeField])
        : responseData[codeField] === successCode

    if (!isSuccess) {
      throw new HttpError(
        (responseData[messageField] as string) || $t('httpMsg.businessError'),
        responseData[codeField] as any
      )
    }

    if (config.showSuccessMessage && responseData[messageField]) {
      showSuccess(responseData[messageField] as string)
    }

    return responseData
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** 基础请求函数 */
const request = async <T = unknown>(
  config: ExtendedAxiosRequestConfig<Http.BaseResponse<T>>
): Promise<T> => {
  const response = await retryRequest<T>(config)
  return response.data
}

/** 原生请求函数（完整响应） */
const requestNative = async <T = unknown>(
  config: ExtendedAxiosRequestConfig<Http.BaseResponse<T>>
): Promise<AxiosResponse<Http.BaseResponse<T>>> => {
  return axiosInstance.request<Http.BaseResponse<T>>(config)
}

/** 工厂方法 */
const createRequest = (method: 'get' | 'post' | 'put' | 'patch' | 'delete') => {
  return <T = any>(
    url: string,
    params?: object,
    config?: ExtendedAxiosRequestConfig<Http.BaseResponse<T>>
  ): Promise<T> => {
    return request<T>({
      method,
      url,
      [method === 'get' ? 'params' : 'data']: params,
      ...config
    })
  }
}

/** 下载 */
const download = (
  url: string,
  params?: object,
  config?: ExtendedAxiosRequestConfig<any>
): Promise<AxiosResponse> => {
  return requestNative({
    method: 'get',
    url,
    responseType: 'blob',
    params,
    ...config
  })
}

/** 上传 */
const upload = <T = any>(
  url: string,
  formData: FormData,
  config?: ExtendedAxiosRequestConfig<any>
): Promise<T> => {
  return request<T>({
    method: 'post',
    url,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  })
}

/** API集合 */
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
  setResponseConfig,
  getResponseConfig
}

export default http
