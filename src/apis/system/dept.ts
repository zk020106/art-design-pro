/**
 * 部门管理 API
 * @module api/system/dept
 */

import type * as T from '@/types/api/system'
import http from '@/utils/http'

const BASE_URL = '/system/dept'

/**
 * 查询部门列表（树形结构）
 * @param query 查询参数
 */
export function fetchDeptTree(query?: T.DeptQuery) {
  return http.get<T.DeptResp[]>({
    url: `${BASE_URL}/tree`,
    params: query
  })
}

/**
 * 查询部门详情
 * @param id 部门ID
 */
export function fetchDeptDetail(id: string) {
  return http.get<T.DeptResp>({
    url: `${BASE_URL}/${id}`
  })
}

/**
 * 新增部门
 * @param data 部门信息
 */
export function fetchAddDept(data: T.DeptReq) {
  return http.post<boolean>({
    url: BASE_URL,
    data,
    showSuccessMessage: true
  })
}

/**
 * 修改部门
 * @param id 部门ID
 * @param data 部门信息
 */
export function fetchUpdateDept(id: string, data: T.DeptReq) {
  return http.put<boolean>({
    url: `${BASE_URL}/${id}`,
    data,
    showSuccessMessage: true
  })
}

/**
 * 删除部门
 * @param id 部门ID
 */
export function fetchDeleteDept(id: string) {
  return http.del<boolean>({
    url: BASE_URL,
    data: { ids: [id] },
    showSuccessMessage: true
  })
}

/**
 * 批量删除部门
 * @param ids 部门ID列表
 */
export function fetchBatchDeleteDept(ids: string[]) {
  return http.del<boolean>({
    url: BASE_URL,
    data: { ids },
    showSuccessMessage: true
  })
}

/**
 * 导出部门
 * @param query 查询参数
 */
export function fetchExportDept(query?: T.DeptQuery) {
  return http.get<Blob>({
    url: `${BASE_URL}/export`,
    params: query,
    responseType: 'blob'
  })
}

/**
 * 查询部门字典树
 * @param query 查询参数
 */
export function fetchDeptDictTree(query?: T.DeptQuery) {
  return http.get<T.DeptDictTreeNode[]>({
    url: `${BASE_URL}/dict/tree`,
    params: query
  })
}
