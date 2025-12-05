import { DeptDictTreeNode } from '@/types/api/system'
import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/dept'

/** @desc 查询部门列表 */
export function listDept(query: T.DeptQuery) {
  return http.get<T.DeptResp[]>({ url: `${BASE_URL}/tree`, params: query })
}

/** @desc 查询部门详情 */
export function getDept(id: string) {
  return http.get<T.DeptResp>({ url: `${BASE_URL}/${id}` })
}

/** @desc 新增部门 */
export function addDept(data: any) {
  return http.post<boolean>({ url: `${BASE_URL}`, data })
}

/** @desc 修改部门 */
export function updateDept(data: any, id: string) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 删除部门 */
export function deleteDept(id: string) {
  return http.del({ url: `${BASE_URL}`, data: { ids: [id] } })
}

/** @desc 导出部门 */
export function exportDept(query: T.DeptQuery) {
  return http.download({ url: `${BASE_URL}/export`, params: query })
}

/** @desc 查询部门字典树 */
export function listDeptDictTree(query: { description: string | unknown }) {
  return http.get<DeptDictTreeNode[]>({ url: `${BASE_URL}/dict/tree`, params: query })
}
