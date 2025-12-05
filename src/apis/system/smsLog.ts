import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/sms/log'

/** @desc 查询短信日志列表 */
export function listSmsLog(query: T.SmsLogPageQuery) {
  return http.get<PageRes<T.SmsLogResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询短信日志详情 */
export function getSmsLog(id: string) {
  return http.get<T.SmsLogResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 删除短信日志 */
export function deleteSmsLog(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}

/** @desc 导出短信日志 */
export function exportSmsLog(query: T.SmsLogQuery) {
  return http.download({ url: `${BASE_URL}/export`, params: query })
}
