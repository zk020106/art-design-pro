import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/storage'

/** @desc 查询存储列表 */
export function listStorage(query: T.StorageQuery) {
  return http.get<T.StorageResp[]>({ url: `${BASE_URL}/list`, params: query })
}

/** @desc 查询存储详情 */
export function getStorage(id: string) {
  return http.get<T.StorageResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增存储 */
export function addStorage(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改存储 */
export function updateStorage(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除存储 */
export function deleteStorage(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}

/** @desc 修改存储状态 */
export function updateStorageStatus(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}/status`, data })
}

/** @desc 设置默认存储 */
export function setDefaultStorage(id: string) {
  return http.put({ url: `${BASE_URL}/${id}/default` })
}
