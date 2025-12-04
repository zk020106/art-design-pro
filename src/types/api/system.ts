/**
 * 系统管理模块 API 类型定义
 */

import type { EnableStatus, TreeKey, TreeNode } from './common'

/** ==================== 部门相关类型 ==================== */

/** 部门响应 */
export interface DeptResp {
  /** 部门ID */
  id: string
  /** 部门名称 */
  name: string
  /** 父级部门ID */
  parentId: string
  /** 排序 */
  sort: number
  /** 状态 {1=启用, 2=禁用} */
  status: EnableStatus
  /** 是否系统内置 */
  isSystem: boolean
  /** 描述 */
  description: string
  /** 创建人 */
  createUserString: string
  /** 创建时间 */
  createTime: string
  /** 更新人 */
  updateUserString: string
  /** 更新时间 */
  updateTime: string
  /** 子部门列表 */
  children?: DeptResp[]
}

/** 部门查询参数 */
export interface DeptQuery {
  /** 搜索关键词 */
  description?: string
  /** 状态 */
  status?: EnableStatus
}

/** 部门新增/修改请求 */
export interface DeptReq {
  /** 部门名称 */
  name: string
  /** 父级部门ID */
  parentId?: string
  /** 排序 */
  sort?: number
  /** 状态 */
  status?: EnableStatus
  /** 描述 */
  description?: string
}

/** 部门字典树节点 (Element Plus TreeV2 兼容) */
export interface DeptDictTreeNode extends TreeNode {
  /** 节点唯一标识 */
  key: TreeKey
  /** 父节点ID */
  parentId: TreeKey
  /** 节点标题 */
  title: string
  /** 排序 */
  sort: number
  /** 子节点列表 */
  children?: DeptDictTreeNode[]
}
