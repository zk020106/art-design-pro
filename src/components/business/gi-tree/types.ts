/**
 * 通用树形组件类型定义
 *
 * 为 gi-tree 组件提供 TypeScript 类型定义
 */

/**
 * 树节点数据接口
 */
export interface TreeNode<T = any> extends Record<string, any> {
  /** 子节点 */
  children?: TreeNode<T>[]
  /** 是否为叶子节点 */
  isLeaf?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 通用树形组件属性
 */
export interface GiTreeProps<T extends TreeNode = TreeNode, M extends boolean = false> {
  /** 异步获取数据的函数（用于懒加载） */
  fetchData?: (parentNode?: T) => Promise<T[]>
  /** 静态树形数据 */
  data?: T[]
  /** 用作键的字段名 */
  keyField: keyof T
  /** 用作标签显示的字段名 */
  labelField: keyof T
  /** 启用多选（复选框） */
  multiple?: M
  /** 节点的选中状态是否影响其父节点和子节点 */
  checkStrictly?: boolean
  /** 默认展开所有节点 */
  expandAll?: boolean
  /** 启用搜索 */
  searchable?: boolean
  /** 懒加载 */
  lazy?: boolean
  /** 显示复选框 */
  showCheckbox?: boolean
  /** 默认展开的键 */
  defaultExpandedKeys?: any[]
  /** 默认选中的键 */
  defaultCheckedKeys?: any[]
}

/**
 * 通用树形组件事件
 */
export interface GiTreeEmits<T extends TreeNode = TreeNode, M extends boolean = false> {
  /** 节点被选中时触发（单选） */
  (e: 'select', node: T): void
  /** 选中节点变化时触发（多选） */
  (e: 'check', checkedNodes: M extends true ? T[] : T): void
  /** 数据加载成功时触发 */
  (e: 'loadSuccess', data: T[]): void
  /** 数据加载失败时触发 */
  (e: 'loadError', error: any): void
  /** 节点被点击时触发 */
  (e: 'nodeClick', node: T): void
}
