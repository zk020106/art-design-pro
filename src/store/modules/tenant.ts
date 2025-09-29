import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTenantStatus } from '@/apis/system/common'
import { getTenantIdByDomain } from '@/apis/tenant/common'

/**
 * 租户状态管理
 * 统一处理租户相关状态和操作
 */
export const useTenantStore = defineStore(
  'tenantStore',
  () => {
    // 租户是否启用
    const tenantEnable = ref(false)

    // 租户ID
    const tenantId = ref<string | null>(null)

    // 租户编码
    const tenantCode = ref<string>('')

    /**
     * 设置租户启用状态
     * @param enable 是否启用租户
     */
    const setTenantEnable = (enable: boolean) => {
      tenantEnable.value = enable
    }

    /**
     * 设置租户ID
     * @param id 租户ID
     */
    const setTenantId = (id: string | null) => {
      tenantId.value = id
    }

    /**
     * 设置租户编码
     * @param code 租户编码
     */
    const setTenantCode = (code: string) => {
      tenantCode.value = code
    }

    /**
     * 是否需要输入租户编码
     */
    const needInputTenantCode = computed(() => {
      return tenantEnable.value && !tenantId.value
    })

    /**
     * 获取租户信息
     * 根据域名查询租户状态和租户编码
     */
    const getTenantInfo = async () => {
      try {
        // 查询租户状态
        const enable = await getTenantStatus()
        setTenantEnable(enable)

        // 如果启用租户，根据域名查询租户ID
        if (enable) {
          const domain = window.location.hostname
          const id = await getTenantIdByDomain(domain)
          setTenantId(id)
        }
      } catch (error) {
        console.error('[TenantStore] Get tenant info error:', error)
        // 即使获取租户信息失败，也不影响登录流程
      }
    }

    return {
      tenantEnable,
      tenantId,
      tenantCode,
      needInputTenantCode,
      setTenantEnable,
      setTenantId,
      setTenantCode,
      getTenantInfo
    }
  },
  {
    persist: {
      key: 'tenant',
      storage: localStorage
    }
  }
)
