import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/client'

/** @desc 查询客户端列表 */
export function listClient(query: T.ClientPageQuery) {
  return http.get<PageRes<T.ClientResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询客户端详情 */
export function getClient(id: string) {
  return http.get<T.ClientDetailResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增客户端 */
export function addClient(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改客户端 */
export function updateClient(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除客户端 */
export function deleteClient(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}
