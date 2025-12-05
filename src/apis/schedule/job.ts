import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/schedule/job'

/** @desc 查询任务组列表 */
export function listGroup() {
  return http.get({ url: `${BASE_URL}/group` })
}

/** @desc 查询任务列表 */
export function listJob(query: T.JobPageQuery) {
  return http.get<PageRes<T.JobResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 新增任务 */
export function addJob(data: any) {
  return http.post({ url: `${BASE_URL}`, data })
}

/** @desc 修改任务 */
export function updateJob(data: any, id: number) {
  return http.put({ url: `${BASE_URL}/${id}`, data })
}

/** @desc 修改任务状态 */
export function updateJobStatus(data: any, id: number) {
  return http.patch({ url: `${BASE_URL}/${id}/status`, data })
}

/** @desc 删除任务 */
export function deleteJob(id: number) {
  return http.del({ url: `${BASE_URL}/${id}` })
}

/** @desc 执行任务 */
export function triggerJob(id: number) {
  return http.post({ url: `${BASE_URL}/trigger/${id}` })
}
