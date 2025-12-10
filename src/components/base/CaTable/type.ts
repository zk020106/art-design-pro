import type { TableProps as ElTableProps, PaginationProps, TableColumnInstance } from 'element-plus'
import type { ExtractPropTypes, VNode } from 'vue'

type DefaultRow = Record<PropertyKey, any>

export interface TableColumnItem<T extends DefaultRow = DefaultRow>
  extends Omit<TableColumnInstance['$props'], never> {
  slotName?: string
  children?: TableColumnItem[]
  render?: (scope: {
    $index: number
    cellIndex: number
    column: TableColumnItem<T>
    row: T
  }) => VNode | VNode[] | string
  show?: boolean
  disabled?: boolean
}

export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 是否显示刷新按钮 */
  showRefresh?: boolean
  /** 是否显示密度调整按钮 */
  showSize?: boolean
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean
  /** 是否显示列设置按钮 */
  showColumnSetting?: boolean
  /** 列设置按钮是否禁用 */
  columnSettingDisabled?: boolean
  /** 列设置禁用列的键名列表 */
  disabledColumnKeys?: string[]
  /** 表格ID，用于区分不同表格的列设置 */
  tableId?: string
  /** 刷新回调函数 */
  onRefresh?: () => void | Promise<void>
  /** 密度选项 */
  sizeOptions?: Array<{ labelKey: string; value: 'default' | 'large' | 'small' }>
}

export interface TableProps
  extends ExtractPropTypes<ElTableProps<Record<string | number | symbol, any>>> {
  columns?: TableColumnItem[]
  pagination?: Partial<PaginationProps>
  title?: string
  tableId?: string | number
  toolbar?: ToolbarConfig
  /** 操作列配置 */
  actions?: {
    label?: string
    width?: string | number
    fixed?: boolean | 'left' | 'right'
    buttons?: Array<{
      label: string
      type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
      icon?: string
      size?: 'default' | 'large' | 'small'
      show?: (scope: { row: any; $index: number }) => boolean
      disabled?: (scope: { row: any; $index: number }) => boolean
      onClick?: (scope: { row: any; $index: number }) => void
    }>
  }
}
