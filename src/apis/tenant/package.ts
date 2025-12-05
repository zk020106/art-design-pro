import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/tenant/package'

/** @desc 查询租户套餐列表 */
export function listTenantPackage(query: T.TenantPackagePageQuery) {
  return http.get<PageRes<T.TenantPackageResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询租户套餐详情 */
export function getTenantPackage(id: string) {
  return http.get<T.TenantPackageResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增租户套餐 */
export function addTenantPackage(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改租户套餐 */
export function updateTenantPackage(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除租户套餐 */
export function deleteTenantPackage(id: string) {
  return http.del({ url: `${BASE_URL}/${id}` })
}

/** @desc 查询租户套餐字典 */
export function listTenantPackageDict(query?: { description: string; status: number }) {
  return http.get<LabelValueState[]>({ url: `${BASE_URL}/dict`, params: query })
}

/** @desc 查询套餐菜单 */
export function listTenantPackageMenu() {
  return http.get<any>({ url: `${BASE_URL}/menu/tree` })
}
