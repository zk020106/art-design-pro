import http from '@/utils/http'
import type * as T from './type'

const BASE_URL = '/system/user'

/** @desc 查询用户列表 */
export function listUser(query: T.UserPageQuery) {
  return http.get<PageRes<T.UserResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 查询所有用户列表 */
export function listAllUser(query: Partial<T.UserPageQuery>) {
  return http.get<T.UserResp[]>({ url: `${BASE_URL}/list`, params: query })
}

/** @desc 查询用户详情 */
export function getUser(id: string) {
  return http.get<T.UserDetailResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增用户 */
export function addUser(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改用户 */
export function updateUser(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除用户 */
export function deleteUser(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}

/** @desc 导出用户 */
export function exportUser(query: T.UserQuery) {
  return http.download({ url: `${BASE_URL}/export`, params: query })
}

/** @desc 下载用户导入模板 */
export function downloadUserImportTemplate() {
  return http.download({ url: `${BASE_URL}/import/template` })
}

/** @desc 解析用户导入数据 */
export function parseImportUser(data: FormData) {
  return http.post({ url: `${BASE_URL}/import/parse`, data })
}

/** @desc 导入用户 */
export function importUser(data: any) {
  return http.post({ url: `${BASE_URL}/import`, data })
}

/** @desc 重置密码 */
export function resetUserPwd(data: any, id: string) {
  return http.patch({ url: `${BASE_URL}/${id}/password`, data })
}

/** @desc 分配角色 */
export function updateUserRole(data: { roleIds: string[] }, id: string) {
  return http.patch({ url: `${BASE_URL}/${id}/role`, data })
}

/** @desc 查询用户字典 */
export function listUserDict(query?: { status: number }) {
  return http.get<LabelValueState[]>({ url: `${BASE_URL}/dict`, params: query })
}
