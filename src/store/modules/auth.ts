import { defineStore } from 'pinia'
import { ref } from 'vue'
import { accountLogin, phoneLogin, emailLogin, socialLogin, logout, getUserInfo } from '@/apis/auth'
import { useUserStore } from './user'
import type { AccountLoginReq, PhoneLoginReq, EmailLoginReq, AuthType } from '@/apis/auth/type'
import { useTenantStore } from './tenant'

/**
 * 认证状态管理
 * 统一处理各种登录方式、退出登录等认证相关操作
 */
export const useAuthStore = defineStore(
  'authStore',
  () => {
    const userStore = useUserStore()
    const tenantStore = useTenantStore()
    // 客户端ID
    const clientId = ref(import.meta.env.VITE_CLIENT_ID)

    /**
     * 通用登录方法
     * @param req 登录请求参数
     * @param authType 认证类型
     * @param tenantCode 租户代码（可选）
     */
    const login = async (
      req: AccountLoginReq | PhoneLoginReq | EmailLoginReq,
      authType: AuthType,
      tenantCode?: string
    ) => {
      try {
        // 添加客户端ID和认证类型
        const loginReq = {
          ...req,
          clientId: clientId.value,
          authType
        }

        let result: any
        switch (authType) {
          case 'ACCOUNT':
            result = await accountLogin(loginReq as AccountLoginReq, tenantCode)
            break
          case 'PHONE':
            result = await phoneLogin(loginReq as PhoneLoginReq, tenantCode)
            break
          case 'EMAIL':
            result = await emailLogin(loginReq as EmailLoginReq, tenantCode)
            break
          default:
            throw new Error('Unsupported auth type')
        }

        if (!result.token) {
          throw new Error('Login failed - no token received')
        }
        console.log('[AuthStore] Login successful:', result)

        // 存储token
        userStore.setToken(result.token)
        tenantStore.setTenantId(result.tenantId)

        // 获取并存储用户信息
        const userInfo = await getUserInfo()
        userStore.setUserInfo(userInfo)
        userStore.setLoginStatus(true)

        return result
      } catch (error) {
        console.error('[AuthStore] Login error:', error)
        throw error
      }
    }

    /**
     * 账号密码登录
     * @param req 登录请求参数
     * @param tenantCode 租户代码（可选）
     */
    const loginWithAccount = async (
      req: Omit<AccountLoginReq, 'clientId' | 'authType'>,
      tenantCode?: string
    ) => {
      return login({ ...req }, 'ACCOUNT', tenantCode)
    }

    /**
     * 手机号验证码登录
     * @param req 登录请求参数
     * @param tenantCode 租户代码（可选）
     */
    const loginWithPhone = async (
      req: Omit<PhoneLoginReq, 'clientId' | 'authType'>,
      tenantCode?: string
    ) => {
      return login({ ...req }, 'PHONE', tenantCode)
    }

    /**
     * 邮箱验证码登录
     * @param req 登录请求参数
     * @param tenantCode 租户代码（可选）
     */
    const loginWithEmail = async (
      req: Omit<EmailLoginReq, 'clientId' | 'authType'>,
      tenantCode?: string
    ) => {
      return login({ ...req }, 'EMAIL', tenantCode)
    }

    /**
     * 第三方登录
     * @param req 登录请求参数
     */
    const loginWithSocial = async (req: any) => {
      try {
        // 添加客户端ID
        const loginReq = {
          ...req,
          clientId: clientId.value
        }

        const result: any = await socialLogin(loginReq)

        if (!result.token) {
          throw new Error('Login failed - no token received')
        }
        console.log('[AuthStore] Login successful:', result)

        // 存储token
        userStore.setToken(result.token)
        tenantStore.setTenantId(result.tenantId)

        // 获取并存储用户信息
        const userInfo = await getUserInfo()
        userStore.setUserInfo(userInfo)
        userStore.setLoginStatus(true)

        return result.data
      } catch (error) {
        console.error('[AuthStore] Social login error:', error)
        throw error
      }
    }

    /**
     * 退出登录
     */
    const logoutUser = async () => {
      try {
        // 调用后端退出登录接口
        await logout()
      } catch (error) {
        // 忽略 logout 接口的错误，避免无限循环
        console.warn('[AuthStore] Logout API error (ignored to prevent infinite loop):', error)
      } finally {
        // 清理用户状态
        userStore.logOut()
      }
    }

    return {
      clientId,
      login,
      loginWithAccount,
      loginWithPhone,
      loginWithEmail,
      loginWithSocial,
      logoutUser
    }
  },
  {
    persist: {
      key: 'auth',
      storage: localStorage
    }
  }
)
