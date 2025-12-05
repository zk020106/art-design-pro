import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/notice'

/** @desc 查询公告列表 */
export function listNotice(query: T.NoticePageQuery) {
  return http.get<PageRes<T.NoticeResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询公告详情 */
export function getNotice(id: string) {
  return http.get<T.NoticeDetailResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增公告 */
export function addNotice(data: any) {
  return http.post({ url: BASE_URL, data })
}

/** @desc 修改公告 */
export function updateNotice(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除公告 */
export function deleteNotice(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}
