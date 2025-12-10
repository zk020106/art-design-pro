import { listDeptDictTree } from '@/apis/system'
import { ref } from 'vue'

/**
 * 部门业务逻辑 Hook
 * @param options 配置项
 * @param options.onSuccess 成功回调
 */
export function useDept(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const deptList = ref<Record<string, any>[]>([])

  /**
   * 获取部门列表
   * @param name 部门名称（搜索关键词）
   */
  const getDeptList = async (name?: string) => {
    try {
      loading.value = true
      const data = await listDeptDictTree({ description: name })
      deptList.value = data as any[]
      options?.onSuccess?.()
    } finally {
      loading.value = false
    }
  }

  return { deptList, getDeptList, loading }
}
