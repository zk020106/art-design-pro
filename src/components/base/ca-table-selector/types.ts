/**
 * 表格选择器组件类型定义
 *
 * 为 ca-table-selector 组件提供 TypeScript 类型定义
 */

/**
 * 表格列配置
 */
export interface TableColumn<T = any> {
  /** 列标题 */
  title: string
  /** 数据索引（字段名） */
  dataIndex: keyof T
  /** 列宽度 */
  width?: string | number
  /** 自定义渲染函数 */
  render?: (row: T) => any
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
}

/**
 * 表格选择器组件属性
 */
export interface CaTableSelectorProps<T = any> {
  /** 异步获取数据的函数 */
  fetchData: (params: { page: number; pageSize: number; query?: string }) => Promise<{
    data: T[]
    total: number
  }>
  /** 表格列配置 */
  columns: TableColumn<T>[]
  /** 用作行键的字段名 */
  rowKey: keyof T
  /** 启用多选 */
  multiple?: boolean
  /** 每页大小 */
  pageSize?: number
  /** 对话框标题 */
  title?: string
  /** 对话框宽度 */
  width?: string | number
  /** 显示搜索输入框 */
  showSearch?: boolean
}
