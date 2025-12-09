/**
 * 图标选择器组件类型定义
 *
 * 为 ca-icon-picker 组件提供 TypeScript 类型定义
 */

/**
 * 图标选择器组件属性
 */
export interface CaIconPickerProps {
  /** 选中的图标值 */
  modelValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 可清除 */
  clearable?: boolean
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 禁用 */
  disabled?: boolean
  /** 弹出框宽度 */
  popoverWidth?: number
}

/**
 * 图标分类
 */
export interface IconCategory {
  /** 分类名称 */
  name: string
  /** 分类标签 */
  label: string
  /** 该分类下的图标 */
  icons: string[]
}
