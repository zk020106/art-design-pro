/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色、菜单、部门等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.AccountLoginReq = { username: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfoResp = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

/** 接口返回数据格式 */
interface ApiRes<T> {
  code: string
  data: T
  msg: string
  success: boolean
  timestamp: string
}

/** 分页响应数据格式 */
interface PageRes<T> {
  list: T
  total: number
}

/** 分页请求数据格式 */
interface PageQuery {
  page: number
  size: number
}

/** 键值对类型 */
interface LabelValueState {
  label: string
  value: any
  extra?: string
}
