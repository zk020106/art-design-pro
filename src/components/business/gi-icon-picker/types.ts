/**
 * 图标选择器组件类型定义
 *
 * 为 gi-icon-picker 组件提供 TypeScript 类型定义
 */

/**
 * 图标选择器组件属性
 */
export interface GiIconPickerProps {
  /** 选中的图标值 */
  modelValue?: string
  /** 使用的图标集 */
  iconSet?: 'element' | 'custom'
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
 * 图标选择器组件事件
 */
export interface GiIconPickerEmits {
  /** 模型值更新时触发 */
  (e: 'update:modelValue', icon: string): void
  /** 图标变化时触发 */
  (e: 'change', icon: string): void
  /** 清除时触发 */
  (e: 'clear'): void
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
