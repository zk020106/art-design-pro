import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/monitor/online'

/** @desc 查询在线用户列表 */
export function listOnlineUser(query: T.OnlineUserPageQuery) {
  return http.get<PageRes<T.OnlineUserResp[]>>({ url: `${BASE_URL}`, params: query })
}

/** @desc 强退在线用户 */
export function kickout(token: string) {
  return http.del({ url: `${BASE_URL}/${token}` })
}
