import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/log'

/** @desc 查询日志列表 */
export function listLog(query: T.LogPageQuery) {
  return http.get<PageRes<T.LogResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询日志详情 */
export function getLog(id: string) {
  return http.get<T.LogDetailResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 导出登录日志 */
export function exportLoginLog(query: T.LogQuery) {
  return http.download<any>({ url: `${BASE_URL}/export/login`, params: query })
}

/** @desc 导出操作日志 */
export function exportOperationLog(query: T.LogQuery) {
  return http.download<any>({ url: `${BASE_URL}/export/operation`, params: query })
}
