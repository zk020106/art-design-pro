/**
 * HTTP 请求取消模块
 *
 * 提供请求取消功能，避免重复请求和组件卸载时的请求残留
 *
 * @module utils/http/cancel
 * @author Art Design Pro Team
 */

import axios, { CancelTokenSource } from 'axios'

/** 请求取消令牌存储 */
const pendingRequests = new Map<string, CancelTokenSource>()

/**
 * 生成请求的唯一标识
 */
function generateRequestKey(config: any): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

/**
 * 添加请求到待取消列表
 */
export function addPendingRequest(config: any): CancelTokenSource {
  const requestKey = generateRequestKey(config)

  // 取消之前的相同请求
  removePendingRequest(config)

  const source = axios.CancelToken.source()
  pendingRequests.set(requestKey, source)

  config.cancelToken = source.token

  return source
}

/**
 * 移除待取消的请求
 */
export function removePendingRequest(config: any): void {
  const requestKey = generateRequestKey(config)

  if (pendingRequests.has(requestKey)) {
    const source = pendingRequests.get(requestKey)
    source?.cancel('Request cancelled due to duplicate request')
    pendingRequests.delete(requestKey)
  }
}

/**
 * 取消所有待处理的请求
 */
export function cancelAllPendingRequests(): void {
  pendingRequests.forEach((source) => {
    source.cancel('Request cancelled due to page unload')
  })
  pendingRequests.clear()
}

/**
 * 取消指定 URL 的所有请求
 */
export function cancelRequestsByUrl(url: string): void {
  pendingRequests.forEach((source, key) => {
    if (key.includes(url)) {
      source.cancel('Request cancelled')
      pendingRequests.delete(key)
    }
  })
}
