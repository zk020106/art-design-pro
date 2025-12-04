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

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PageQuery {
      /** 页码 */
      page?: number
      /** 每页条数 */
      size?: number
    }

    /** 分页响应基础结构 */
    interface PageResp<T = any> {
      /** 记录列表 */
      records: T[]
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 启用状态枚举 {1=启用, 2=禁用} */
    type EnableStatus = 1 | 2

    /** 性别枚举 {0=未知, 1=男, 2=女} */
    type Gender = 0 | 1 | 2

    /** 标签值响应 */
    interface LabelValueResp<T = any> {
      label: string
      value: T
    }

    /** 树节点 */
    interface TreeNode<T = any> {
      id: number | string
      parentId?: number | string
      label: string
      children?: TreeNode<T>[]
      [key: string]: any
    }
  }

  /** 认证模块类型 */
  namespace Auth {
    /** 账号登录请求 */
    interface AccountLoginReq {
      /** 用户名 */
      username: string
      /** 密码 */
      password: string
      /** 验证码 */
      captcha?: string
      /** 验证码ID */
      captchaId?: string
      /** 客户端ID */
      clientId?: string
    }

    /** 手机号登录请求 */
    interface PhoneLoginReq {
      /** 手机号 */
      phone: string
      /** 验证码 */
      captcha: string
      /** 客户端ID */
      clientId?: string
    }

    /** 邮箱登录请求 */
    interface EmailLoginReq {
      /** 邮箱 */
      email: string
      /** 验证码 */
      captcha: string
      /** 客户端ID */
      clientId?: string
    }

    /** 登录响应 */
    interface LoginResp {
      /** 访问令牌 */
      token: string
      /** 刷新令牌 */
      refreshToken?: string
    }

    /** 用户信息响应 */
    interface UserInfoResp {
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
      /** 性别 */
      gender?: Common.Gender
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

    type UserInfo = UserInfoResp

    /** 路由响应 */
    interface RouteResp {
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
      /** 状态 */
      status?: Common.EnableStatus
      /** 子菜单 */
      children?: RouteResp[]
    }

    type RouteItem = RouteResp

    /** 三方登录授权响应 */
    interface SocialAuthAuthorizeResp {
      /** 授权链接 */
      authorizeUrl: string
    }
  }

  /** 系统管理模块类型 */
  namespace System {
    /** 用户管理 */
    namespace User {
      /** 用户列表项 */
      interface UserResp {
        id: number
        username: string
        nickname: string
        email?: string
        phone?: string
        gender?: Common.Gender
        avatar?: string
        deptId?: number
        deptName?: string
        roleIds?: number[]
        roleNames?: string[]
        status?: Common.EnableStatus
        description?: string
        createTime?: string
        updateTime?: string
      }

      /** 用户搜索参数 */
      interface UserQuery extends Common.PageQuery {
        /** 关键词 */
        description?: string
        /** 状态 */
        status?: Common.EnableStatus
        /** 创建时间 */
        createTime?: string
        /** 部门ID */
        deptId?: number
        /** 用户ID列表 */
        userIds?: number[]
        /** 角色ID */
        roleId?: number
      }

      /** 用户详情响应 */
      interface UserDetailResp extends UserResp {
        roleIds: number[]
      }

      /** 用户创建/修改请求 */
      interface UserReq {
        username: string
        nickname: string
        password?: string
        email?: string
        phone?: string
        gender: Common.Gender
        deptId: number
        roleIds: number[]
        description?: string
        status?: Common.EnableStatus
      }
    }

    /** 角色管理 */
    namespace Role {
      /** 角色响应 */
      interface RoleResp {
        id: number
        name: string
        code: string
        sort?: number
        description?: string
        dataScope?: number
        status?: Common.EnableStatus
        createTime?: string
      }

      /** 角色查询参数 */
      interface RoleQuery {
        /** 关键词 */
        description?: string
        /** 排除的编码列表 */
        excludeRoleCodes?: string[]
        /** 排序条件 */
        sort?: string
      }

      /** 角色详情响应 */
      interface RoleDetailResp extends RoleResp {
        menuIds: number[]
        deptIds?: number[]
        menuCheckStrictly?: boolean
        deptCheckStrictly?: boolean
      }

      /** 角色创建/修改请求 */
      interface RoleReq {
        name: string
        code: string
        sort?: number
        description?: string
        dataScope?: number
        deptIds?: number[]
        deptCheckStrictly?: boolean
      }

      /** 角色权限修改请求 */
      interface RolePermissionUpdateReq {
        roleId: number
        menuIds: number[]
        menuCheckStrictly?: boolean
      }
    }

    /** 菜单管理 */
    namespace Menu {
      /** 菜单响应 */
      interface MenuResp {
        id: number
        parentId?: number
        type: 1 | 2 | 3
        title: string
        path?: string
        name?: string
        component?: string
        redirect?: string
        icon?: string
        permission?: string
        isExternal?: boolean
        isCache?: boolean
        isHidden?: boolean
        sort?: number
        status?: Common.EnableStatus
        children?: MenuResp[]
      }

      /** 菜单查询参数 */
      interface MenuQuery {
        /** 标题 */
        title?: string
        /** 状态 */
        status?: Common.EnableStatus
        /** 排序条件 */
        sort?: string
      }

      /** 菜单创建/修改请求 */
      interface MenuReq {
        type: 1 | 2 | 3
        icon?: string
        title: string
        sort: number
        permission?: string
        path?: string
        name?: string
        component?: string
        redirect?: string
        isExternal?: boolean
        isCache?: boolean
        isHidden?: boolean
        parentId?: number
        status: Common.EnableStatus
      }
    }

    /** 部门管理 */
    namespace Dept {
      /** 部门响应 */
      interface DeptResp {
        id: number
        parentId?: number
        name: string
        sort?: number
        description?: string
        status?: Common.EnableStatus
        createTime?: string
        children?: DeptResp[]
      }

      /** 部门查询参数 */
      interface DeptQuery {
        /** 关键词 */
        description?: string
        /** 状态 */
        status?: Common.EnableStatus
        /** 排序条件 */
        sort?: string
      }

      /** 部门创建/修改请求 */
      interface DeptReq {
        parentId: number
        name: string
        sort?: number
        description?: string
        status?: Common.EnableStatus
      }
    }
  }
}
