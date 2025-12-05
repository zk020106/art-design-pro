import type * as T from '@/types/api/auth'
import http from '@/utils/http'

const BASE_URL = '/auth'

/**
 * 统一登录处理函数
 * @param req 登录请求参数
 * @param tenantCode 租户编码
 */
const login = (req: T.AccountLoginReq | T.PhoneLoginReq | T.EmailLoginReq, tenantCode?: string) => {
  const headers: Record<string, string> = {}
  if (tenantCode) {
    headers['X-Tenant-Code'] = tenantCode
  }
  return http.post<T.LoginResp>({
    url: `${BASE_URL}/login`,
    data: req,
    headers
  })
}

/**
 * 账号登录
 * @param req 账号登录参数
 * @param tenantCode 租户编码
 */
export function fetchAccountLogin(req: T.AccountLoginReq, tenantCode?: string) {
  return login(req, tenantCode)
}

/**
 * 邮箱登录
 * @param req 邮箱登录参数
 * @param tenantCode 租户编码
 */
export function fetchEmailLogin(req: T.EmailLoginReq, tenantCode?: string) {
  return login(req, tenantCode)
}

/**
 * 手机号登录
 * @param req 手机号登录参数
 * @param tenantCode 租户编码
 */
export function fetchPhoneLogin(req: T.PhoneLoginReq, tenantCode?: string) {
  return login(req, tenantCode)
}

/**
 * 三方账号登录
 * @param req 三方登录参数
 */
export function fetchSocialLogin(req: any) {
  return http.post<T.LoginResp>({
    url: `${BASE_URL}/login`,
    data: req
  })
}

/**
 * 三方账号登录授权
 * @param source 来源
 */
export function fetchSocialAuth(source: string) {
  return http.get<T.SocialAuthAuthorizeResp>({
    url: `${BASE_URL}/${source}`
  })
}

/**
 * 退出登录
 */
export function fetchLogout() {
  return http.post<void>({
    url: `${BASE_URL}/logout`
  })
}

/**
 * 获取用户信息
 */
export function fetchGetUserInfo() {
  return http.get<T.UserInfoResp>({
    url: `${BASE_URL}/user/info`
  })
}

/**
 * 获取用户路由信息
 */
export function fetchGetUserRoute() {
  return http.get<T.RouteResp[]>({
    url: `${BASE_URL}/user/route`
  })
}
