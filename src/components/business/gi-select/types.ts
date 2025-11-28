/**
 * 通用选择器组件类型定义
 *
 * 为 gi-select 组件提供 TypeScript 类型定义
 */

/**
 * 通用选择器组件属性
 */
export interface GiSelectProps<T> {
  /** 异步获取数据的函数 */
  fetchData: (params?: any) => Promise<T[]>
  /** 用作键/值的字段名 */
  keyField: string
  /** 用作标签显示的字段名 */
  valueField: string
  /** 启用多选 */
  multiple?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 禁用选择器 */
  disabled?: boolean
  /** 启用过滤/搜索 */
  filterable?: boolean
  /** 启用远程搜索 */
  remote?: boolean
  /** 远程搜索方法 */
  remoteMethod?: (query: string) => void
  /** 可清除 */
  clearable?: boolean
  /** 选择器尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 加载状态（外部控制） */
  loading?: boolean
}

/**
 * 通用选择器组件事件
 */
export interface GiSelectEmits<T = any> {
  /** 选择项变化时触发 */
  (e: 'change', selected: T | T[] | undefined): void
  /** 数据加载成功时触发 */
  (e: 'loadSuccess', data: T[]): void
  /** 数据加载失败时触发 */
  (e: 'loadError', error: any): void
  /** 模型值更新时触发 */
  (e: 'update:modelValue', value: any): void
}
