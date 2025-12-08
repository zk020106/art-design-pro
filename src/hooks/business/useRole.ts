import { listRoleDict } from '@/apis/system/role'
import { ref } from 'vue'

/**
 * 角色业务逻辑 Hook
 * @param options 配置项
 * @param options.onSuccess 成功回调
 */
export function useRole(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const roleList = ref<any[]>([])

  /**
   * 获取角色列表
   * @param name 角色名称（搜索关键词）
   * @param status 角色状态
   */
  const getRoleList = async (name?: string, status?: number) => {
    try {
      loading.value = true
      const query: any = {}
      if (name) query.name = name
      if (status !== undefined) query.status = status
      roleList.value = await listRoleDict(query)
      options?.onSuccess?.()
    } finally {
      loading.value = false
    }
  }

  return { roleList, getRoleList, loading }
}
