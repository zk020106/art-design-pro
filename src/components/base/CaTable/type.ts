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
  /** 是否显示列设置按钮 */
  showColumnSetting?: boolean
  /** 列设置按钮是否禁用 */
  columnSettingDisabled?: boolean
  /** 列设置禁用列的键名列表 */
  disabledColumnKeys?: string[]
  /** 表格ID，用于区分不同表格的列设置 */
  tableId?: string
}

export interface TableProps
  extends ExtractPropTypes<ElTableProps<Record<string | number | symbol, any>>> {
  columns?: TableColumnItem[]
  pagination?: Partial<PaginationProps>
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  tableId: string | number
}
