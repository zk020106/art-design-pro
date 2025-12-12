/**
 * 详情展示字段类型
 */
export type DetailFieldType =
  | 'text' // 文本
  | 'tag' // 标签
  | 'image' // 图片
  | 'date' // 日期
  | 'datetime' // 日期时间
  | 'boolean' // 布尔值
  | 'number' // 数字
  | 'enum' // 枚举
  | 'dict' // 字典
  | 'component' // 自定义组件
  | 'slot' // 插槽

/**
 * 详情字段配置
 */
export interface DetailField {
  // 基础配置
  key: string // 数据键名
  label: string // 标签文本（支持i18n key）
  type: DetailFieldType // 字段类型

  // 布局配置
  span?: number // 占据列数（1-2）
  show?: boolean | ((data: any) => boolean) // 是否显示

  // 数据配置
  valueFormat?: string // 值格式化（如日期格式）
  defaultValue?: any // 默认值（当值为空时显示）

  // 枚举/字典配置
  enum?: Record<string, { label: string; type?: string }> // 枚举映射
  dictCode?: string // 字典编码

  // 自定义渲染
  render?: (value: any, data: any, field: DetailField) => any // 自定义渲染函数
  component?: any // 自定义组件
  slots?: Record<string, (scope: any) => any> // 插槽配置

  // 样式配置
  labelStyle?: Record<string, any> // 标签样式
  valueStyle?: Record<string, any> // 值样式
  props?: Record<string, any> // 组件props

  // 文本配置
  emptyText?: string // 空值显示文本
  copyable?: boolean // 是否可复制（仅text类型）
  tooltip?: string // 提示文本（支持i18n key）
}

/**
 * CaDetail 组件Props
 */
export interface DetailProps {
  // 数据
  data: Record<string, any> // 详情数据
  fields: DetailField[] // 字段配置

  // 布局配置
  column?: number // 列数（默认2）
  labelWidth?: string | number // 标签宽度
  size?: 'large' | 'default' | 'small' // 尺寸

  // 样式配置
  border?: boolean // 是否显示边框
  background?: boolean // 是否显示背景

  // 功能配置
  showTitle?: boolean // 是否显示标题
  title?: string // 标题文本
  titleSlot?: boolean // 是否使用标题插槽

  // 响应式配置
  responsive?: {
    xs?: number // <768px
    sm?: number // ≥768px
    md?: number // ≥992px
    lg?: number // ≥1200px
    xl?: number // ≥1920px
  }
}

/**
 * 插槽类型
 */
export interface DetailSlots {
  // 标题插槽
  title?: () => any

  // 字段值插槽
  [key: `field-${string}`]: (scope: { value: any; data: any; field: DetailField }) => any

  // 默认插槽
  default?: (scope: { data: any; fields: DetailField[] }) => any
}
