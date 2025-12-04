/**
 * 通用 API 类型定义
 */

/** 分页参数 */
export interface PageQuery {
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

/** 树节点键类型 (Element Plus TreeV2 兼容) */
export type TreeKey = string | number

/** 树节点数据 (Element Plus TreeV2 兼容) */
export type TreeNodeData = Record<string, any>

/**
 * 通用树节点接口 (Element Plus TreeV2 兼容)
 * @template T 扩展数据类型
 */
export interface TreeNode<T = Record<string, any>> {
  /** 节点唯一标识 */
  key?: TreeKey
  /** 节点标签 */
  label?: string
  /** 子节点列表 */
  children?: TreeNode<T>[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否叶子节点 */
  isLeaf?: boolean
  /** 扩展数据 */
  [K: string]: any
}

/**
 * 基础树节点 (适用于后端返回的树形数据)
 * @template T 扩展数据类型
 */
export interface BaseTreeNode<T = Record<string, any>> extends TreeNode<T> {
  /** 节点ID */
  id: TreeKey
  /** 父节点ID */
  parentId?: TreeKey
}

/** ID 请求参数 */
export interface IdsReq {
  ids: number[]
}
