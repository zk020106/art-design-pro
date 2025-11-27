/**
 * 认证模块类型定义
 */

/** 认证类型 */
export type AuthType = 'ACCOUNT' | 'PHONE' | 'EMAIL' | 'SOCIAL'
/** 认证类型常量 */
export const AuthTypeConstants = {
  ACCOUNT: 'ACCOUNT',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  SOCIAL: 'SOCIAL'
} as const
/** 基础认证请求接口 */
export interface AuthReq {
  clientId?: string
  authType?: AuthType
}

/** 账号登录请求参数 */
export interface AccountLoginReq extends AuthReq {
  username: string
  password: string
  captcha?: string
  uuid?: string
}

/** 手机号登录请求参数 */
export interface PhoneLoginReq extends AuthReq {
  phone: string
  captcha: string
}

/** 邮箱登录请求参数 */
export interface EmailLoginReq extends AuthReq {
  email: string
  captcha: string
}

/** 登录响应 */
export interface LoginResp {
  /** 访问令牌 */
  token: string
  /** 刷新令牌 */
  refreshToken?: string
  /** 租户ID */
  tenantId: string
}

/** 用户信息响应 */
export interface UserInfoResp {
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 性别 {0=未知, 1=男, 2=女} */
  gender?: 0 | 1 | 2
  /** 头像 */
  avatar?: string
  /** 描述 */
  description?: string
  /** 部门ID */
  deptId?: number
  /** 部门名称 */
  deptName?: string
  /** 角色列表 */
  roles: string[]
  /** 权限列表 */
  permissions: string[]
}

export type UserInfo = UserInfoResp

/** 三方登录授权响应 */
export interface SocialAuthAuthorizeResp {
  /** 授权链接 */
  authorizeUrl: string
}

/** 路由响应 */
export interface RouteResp {
  /** 菜单ID */
  id: number
  /** 父级ID */
  parentId?: number
  /** 菜单类型 {1=目录, 2=菜单, 3=按钮} */
  type: 1 | 2 | 3
  /** 标题 */
  title: string
  /** 路由路径 */
  path?: string
  /** 组件名称 */
  name?: string
  /** 组件路径 */
  component?: string
  /** 重定向地址 */
  redirect?: string
  /** 图标 */
  icon?: string
  /** 权限标识 */
  permission?: string
  /** 是否外链 */
  isExternal?: boolean
  /** 是否缓存 */
  isCache?: boolean
  /** 是否隐藏 */
  isHidden?: boolean
  /** 排序 */
  sort?: number
  /** 状态 {1=启用, 2=禁用} */
  status?: 1 | 2
  /** 子菜单 */
  children?: RouteResp[]
}

export type RouteItem = RouteResp
