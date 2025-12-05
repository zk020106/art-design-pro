import { listDeptDictTree } from '@/apis/system'
import type { DeptDictTreeNode } from '@/types/api/system'
import { ref } from 'vue'

/**
 * 部门业务逻辑 Hook
 * @param options 配置项
 * @param options.onSuccess 成功回调
 */
export function useDept(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const deptList = ref<DeptDictTreeNode[]>([])

  /**
   * 获取部门列表
   * @param name 部门名称（搜索关键词）
   */
  const getDeptList = async (name?: string) => {
    try {
      loading.value = true
      deptList.value = await listDeptDictTree({ description: name })
      options?.onSuccess?.()
    } finally {
      loading.value = false
    }
  }

  return { deptList, getDeptList, loading }
}
