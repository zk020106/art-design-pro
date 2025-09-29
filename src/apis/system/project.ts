import http from '@/utils/http'
import type { LabelValueState } from '@/types/global'

const BASE_URL = '/system/project'

export interface ProjectResp {
  id: string
  applicationId: string
  projectNo: string
  projectName: string
  estimateAmount: string
  mainEngineering: string
  yearFixed: string
  fundingSource: string
  entrustmentType: string
  contractingUnitId: string
  contractingManagerId: string
  contractingManagerMajorId: string
  contractingCompleteTime: string
  contractingCompleteType: string
  year: string
  deptId: string
  applicationStatus: string
  initiationTime: string
  hairPackageStatus: string
  contractId: string
  pendingFlag: string
  installationFlag: string
  installationAmount: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ProjectDetailResp {
  id: string
  applicationId: string
  projectNo: string
  projectName: string
  estimateAmount: string
  mainEngineering: string
  yearFixed: string
  fundingSource: string
  entrustmentType: string
  contractingUnitId: string
  contractingManagerId: string
  contractingManagerMajorId: string
  contractingCompleteTime: string
  contractingCompleteType: string
  year: string
  deptId: string
  applicationStatus: string
  initiationTime: string
  hairPackageStatus: string
  contractId: string
  pendingFlag: string
  installationFlag: string
  installationAmount: string
  createUserString: string
  updateUserString: string
}
export interface ProjectQuery {
  applicationId: string | undefined
  projectName: string | undefined
  estimateAmount: string | undefined
  yearFixed: string | undefined
  year: string | undefined
  deptId: string | undefined
  sort: Array<string>
}
export interface ProjectPageQuery extends ProjectQuery, PageQuery {}

/** @desc 查询零星项目-项目列表 */
export function listProject(query: ProjectPageQuery) {
  return http.get<PageRes<ProjectResp[]>>(BASE_URL, query)
}

/** @desc 查询零星项目-项目详情 */
export function getProject(id: string) {
  return http.get<ProjectDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增零星项目-项目 */
export function addProject(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改零星项目-项目 */
export function updateProject(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除零星项目-项目 */
export function deleteProject(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出零星项目-项目 */
export function exportProject(query: ProjectQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询零星项目-项目字典 */
export function listProjectDict(query?: ProjectQuery) {
  return http.get<LabelValueState[]>(`${BASE_URL}/dict`, query)
}
