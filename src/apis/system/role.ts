import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/role'

/** @desc 查询角色列表 */
export function listRole(query: T.RoleQuery) {
  return http.get<T.RoleResp[]>({ url: `${BASE_URL}/list`, params: query })
}

/** @desc 查询角色详情 */
export function getRole(id: string) {
  return http.get<T.RoleDetailResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增角色 */
export function addRole(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改角色 */
export function updateRole(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除角色 */
export function deleteRole(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}

/** @desc 查询角色权限树 */
export function listRolePermissionTree() {
  return http.get<T.RolePermissionResp[]>({ url: `${BASE_URL}/permission/tree` })
}

/** @desc 修改角色权限 */
export function updateRolePermission(id: string, data: any) {
  return http.put({ url: `${BASE_URL}/${id}/permission`, data })
}

/** @desc 查询角色关联用户 */
export function listRoleUser(id: string, query: T.RoleUserPageQuery) {
  return http.get<PageRes<T.RoleUserResp[]>>({ url: `${BASE_URL}/${id}/user`, params: query })
}

/** @desc 分配角色给用户 */
export function assignToUsers(id: string, userIds: Array<string>) {
  return http.post({ url: `${BASE_URL}/${id}/user`, data: userIds })
}

/** @desc 取消分配角色给用户 */
export function unassignFromUsers(userRoleIds: Array<string | number>) {
  return http.del({ url: `${BASE_URL}/user`, data: userRoleIds })
}

/** @desc 查询角色关联用户 ID */
export function listRoleUserId(id: string) {
  return http.get({ url: `${BASE_URL}/${id}/user/id` })
}

/** @desc 查询角色字典 */
export function listRoleDict(query?: { name: string; status: number }) {
  return http.get<LabelValueState[]>({ url: `${BASE_URL}/dict`, params: query })
}
