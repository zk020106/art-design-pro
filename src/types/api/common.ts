/**
 * 通用 API 类型定义
 */

/** 分页参数 */
export interface PageParams {
  /** 页码 */
  page?: number
  /** 每页条数 */
  size?: number
  /** 排序条件 */
  sort?: string
}

/** 分页响应 */
export interface PageResp<T = any> {
  /** 记录列表 */
  records: T[]
  /** 当前页码 */
  current: number
  /** 每页条数 */
  size: number
  /** 总条数 */
  total: number
}

/** 启用状态枚举 {1=启用, 2=禁用} */
export type EnableStatus = 1 | 2

/** 性别枚举 {0=未知, 1=男, 2=女} */
export type Gender = 0 | 1 | 2

/** 标签值响应 */
export interface LabelValueResp<T = any> {
  label: string
  value: T
}

/** 树节点 */
export interface TreeNode<T = any> {
  id: number | string
  parentId?: number | string
  label: string
  children?: TreeNode<T>[]
  [key: string]: any
}

/** ID 请求参数 */
export interface IdsReq {
  ids: number[]
}
