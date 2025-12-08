/**
 * CaAvatar 组件类型定义
 * @description 单个头像组件的类型定义文件
 * @module components/base/ca-avatar/types
 */

/** 头像属性接口 */
export interface AvatarProps {
  /** 头像 URL */
  src?: string
  /** 用户名（用于生成默认头像） */
  name?: string
  /** 头像大小（px） */
  size?: number | 'large' | 'default' | 'small'
  /** 头像形状 */
  shape?: 'circle' | 'square'
  /** 自定义背景色 */
  color?: string
  /** 是否显示边框 */
  showBorder?: boolean
  /** 边框颜色 */
  borderColor?: string
  /** 悬停效果 */
  hoverable?: boolean
  /** 加载失败时显示默认头像 */
  fallbackSrc?: string
  /** 头像填充方式 */
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** 自定义类名 */
  class?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
  /** 自定义样式 */
  style?: Record<string, string | number>
}

/** 头像事件接口 */
export interface AvatarEmits {
  /** 点击头像时 */
  click: [event: MouseEvent]
  /** 头像加载失败时 */
  error: [event: Event]
  /** 头像加载成功时 */
  load: [event: Event]
}

/** 头像尺寸预设 */
export type AvatarSize = 'large' | 'default' | 'small'

/** 头像形状 */
export type AvatarShape = 'circle' | 'square'

/** 头像填充方式 */
export type AvatarFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
