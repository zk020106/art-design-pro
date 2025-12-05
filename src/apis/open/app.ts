import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/open/app'

/** @desc 查询应用列表 */
export function listApp(query: T.AppPageQuery) {
  return http.get<PageRes<T.AppResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询应用详情 */
export function getApp(id: string) {
  return http.get<T.AppResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增应用 */
export function addApp(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改应用 */
export function updateApp(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除应用 */
export function deleteApp(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}

/** @desc 导出应用 */
export function exportApp(query: T.AppQuery) {
  return http.download({ url: `${BASE_URL}/export`, params: query })
}

/** @desc 获取密钥 */
export function getAppSecret(id: string) {
  return http.get({ url: `${BASE_URL}/${id}/secret` })
}

/** @desc 重置密钥 */
export function resetAppSecret(id: string) {
  return http.patch({ url: `${BASE_URL}/${id}/secret` })
}
