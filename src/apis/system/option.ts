import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/option'

/** @desc 查询参数列表 */
export function listOption(query: T.OptionQuery) {
  return http.get<T.OptionResp[]>({ url: `${BASE_URL}`, params: query })
}

/** @desc 修改参数 */
export function updateOption(data: any) {
  return http.put({ url: `${BASE_URL}`, data })
}

/** @desc 重置参数 */
export function resetOptionValue(query: T.OptionQuery) {
  return http.patch({ url: `${BASE_URL}/value`, params: query })
}
