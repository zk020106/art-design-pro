/**
 * 文件上传组件类型定义
 *
 * 为 gi-upload 组件提供 TypeScript 类型定义
 */

import type { UploadFile } from 'element-plus'

/**
 * 上传响应类型
 */
export interface UploadResponse<T = any> {
  /** 响应数据 */
  data?: T
  /** 文件URL */
  url?: string
  /** 失败时的错误信息 */
  message?: string
}

/**
 * 文件上传组件属性
 */
export interface GiUploadProps<T = any> {
  /** 自定义上传函数 */
  uploadFn: (file: File) => Promise<T>
  /** 启用多文件上传 */
  multiple?: boolean
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 接受的文件类型 */
  accept?: string
  /** 请求头 */
  headers?: Record<string, any>
  /** 显示上传进度 */
  showProgress?: boolean
  /** 携带凭证 */
  withCredentials?: boolean
  /** 最大文件数量 */
  limit?: number
  /** 启用拖拽上传 */
  drag?: boolean
  /** 列表类型 */
  listType?: 'text' | 'picture' | 'picture-card'
  /** 禁用 */
  disabled?: boolean
}

/**
 * 文件上传组件事件
 */
export interface GiUploadEmits<T = any> {
  /** 文件上传成功时触发 */
  (e: 'success', file: File, response: T): void
  /** 文件上传失败时触发 */
  (e: 'error', file: File, error: any): void
  /** 文件被移除时触发 */
  (e: 'remove', file: UploadFile): void
  /** 文件列表变化时触发 */
  (e: 'change', fileList: UploadFile[]): void
  /** 文件超过限制时触发 */
  (e: 'exceed', files: File[]): void
}
