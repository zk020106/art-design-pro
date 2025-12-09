/**
 * HTTP 模块统一导出
 *
 * @module utils/http/http
 */

// 核心功能
export { default as api, createHttpInstance, http, httpRaw } from './index'
export type {
  ApiRes,
  ExtendedAxiosRequestConfig,
  HttpInstanceConfig,
  PageQuery,
  PageRes
} from './index'

// 错误处理
export {
  handleError,
  HttpError,
  isHttpError,
  showError,
  showSuccess,
  type ErrorLogData,
  type ErrorResponse
} from './error'

// 状态码
export { ApiStatus } from './status'

// 请求取消
export {
  addPendingRequest,
  cancelAllPendingRequests,
  cancelRequestsByUrl,
  removePendingRequest
} from './cancel'
