import { AppRouteRecord, RouteMeta } from '@/types'
import { RouteResp } from '@/types/api/auth'

/**
 * 将路由响应数据转换为应用路由记录
 * @param routes 路由响应数据
 * @returns 转换后的路由记录数组
 */
export function transformRoutesToRecords(routes: RouteResp[]): AppRouteRecord[] {
  return routes
    .filter((route) => route.status !== 2) // 过滤掉禁用的路由
    .sort((a, b) => (a.sort || 0) - (b.sort || 0)) // 先对当前层级的路由排序
    .map((route) => transformRouteToRecord(route))
    .filter(Boolean) as AppRouteRecord[]
}

/**
 * 单个路由转换
 * @param route 路由响应数据
 * @returns 转换后的路由记录
 */
function transformRouteToRecord(route: RouteResp): AppRouteRecord | null {
  // 按钮类型不作为路由，直接返回null
  if (route.type === 3) {
    return null
  }

  // 构建元数据
  const meta: RouteMeta = {
    title: route.title,
    icon: route.icon,
    authMark: route.permission,
    link: route.isExternal ? route.path : undefined,
    keepAlive: route.isCache,
    isHide: route.isHidden
  }

  // 构建路由记录
  const record: AppRouteRecord = {
    id: route.id,
    path: route.path || '',
    name: route.name,
    component: route.component,
    redirect: route.redirect,
    meta
  }

  // 递归转换子路由
  if (route.children && route.children.length > 0) {
    record.children = transformRoutesToRecords(route.children)
  }

  return record
}

/**
 * 带排序的转换函数（已弃用，使用 transformRoutesToRecords 即可）
 * @param routes 路由响应数据
 * @returns 排序后的路由记录数组
 * @deprecated transformRoutesToRecords 已经包含排序功能
 */
export function transformRoutesToRecordsWithSort(routes: RouteResp[]): AppRouteRecord[] {
  return transformRoutesToRecords(routes)
}
