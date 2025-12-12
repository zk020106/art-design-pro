import { useBreakpoint, useLocale, usePagination } from '@/hooks'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Options as PaginationOptions } from './usePagination'

interface Options<T, U> {
  /** 数据格式化函数 */
  formatResult?: (data: T[]) => U[]
  /** 成功回调 */
  onSuccess?: () => void
  /** 是否立即加载数据 */
  immediate?: boolean
  /** 行数据的唯一标识键 */
  rowKey?: keyof T | ((row: T) => string | number)
  /** 分页配置 */
  paginationOption?: PaginationOptions
  /** 错误提示回调 */
  onError?: (error: any) => void
  /** 是否自动错误提示 */
  autoErrorMessage?: boolean
}

interface PaginationParams {
  page: number
  size: number
}

type Api<T> = (
  params: PaginationParams
) => Promise<PageRes<T[]>> | Promise<{ data: PageRes<T[]> } | Promise<T[]>>

/**
 * 表格数据管理 Hook
 * @description 提供表格数据的加载、分页、选择、删除等常用功能，适配 Element Plus
 * @param api 获取表格数据的 API 函数
 * @param options 配置选项
 * @returns 表格管理方法集合
 */
export function useTable<T extends U, U = T>(api: Api<T>, options?: Options<T, U>) {
  const {
    formatResult,
    onSuccess,
    immediate = true,
    rowKey,
    onError,
    autoErrorMessage = true
  } = options || {}

  const { t } = useLocale()
  const { pagination, setTotal } = usePagination(() => getTableData(), options?.paginationOption)
  const loading = ref(false)
  const tableData: Ref<U[]> = ref([])

  /**
   * 获取表格数据
   */
  async function getTableData() {
    try {
      loading.value = true
      const res = await api({ page: pagination.current, size: pagination.pageSize })

      // 处理多种数据格式：支持请求拦截器处理后的格式
      let data: T[] = []
      let total = 0

      if ('list' in res && 'total' in res) {
        // 格式1: { list: T[], total: number } - 已处理的数据
        data = res.list
        total = res.total
      } else if ('data' in res && res.data) {
        // 格式2: { data: { list: T[], total: number } } - 原始格式
        const resData = res.data as any
        data = resData.list
        total = resData.total
      }

      tableData.value = formatResult ? formatResult(data) : data
      setTotal(total)

      onSuccess?.()
      return tableData.value
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('message.loadFailed')
      if (autoErrorMessage) ElMessage.error(errorMsg)
      onError?.(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 是否立即触发数据加载
  if (immediate) {
    getTableData().catch(() => {})
  }

  // 选择的行 keys
  const selectedKeys = ref<(string | number)[]>([])
  const selectedRows = ref<T[]>([])

  /**
   * 选择行事件处理
   * @param selection 当前选中的行数据
   */
  const handleSelectionChange = (selection: T[]) => {
    selectedRows.value = selection
    selectedKeys.value = selection.map((row) => {
      if (typeof rowKey === 'function') {
        return rowKey(row)
      }
      return row[rowKey as keyof T] as string | number
    })
  }

  /**
   * 全选/取消全选事件处理
   * @param selection 所有选中的行数据
   */
  const handleSelectAll = (selection: T[]) => {
    selectedRows.value = selection
    selectedKeys.value = selection.map((row) => {
      if (typeof rowKey === 'function') {
        return rowKey(row)
      }
      return row[rowKey as keyof T] as string | number
    })
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedKeys.value = []
    selectedRows.value = []
  }

  /**
   * 搜索，重置分页到第一页
   */
  const search = () => {
    clearSelection()
    pagination.current = 1
    getTableData().catch(() => {})
  }

  /**
   * 刷新数据，保持当前页码
   */
  const refresh = () => {
    return getTableData()
  }

  /**
   * 重置到第一页并刷新
   */
  const reset = () => {
    clearSelection()
    pagination.current = 1
    return getTableData()
  }

  /**
   * 删除数据
   * @param deleteApi 删除接口
   * @param options 删除选项
   * @returns Promise<boolean> 删除是否成功
   */
  const handleDelete = async <R = any>(
    deleteApi: () => Promise<ApiRes<R>>,
    options?: {
      /** 标题 */
      title?: string
      /** 内容 */
      content?: string
      /** 成功提示 */
      successTip?: string
      /** 是否显示确认框 */
      showConfirm?: boolean
      /** 是否批量删除 */
      multiple?: boolean
      /** 自定义确认框内容 */
      confirmType?: 'warning' | 'error' | 'info'
      /** 删除前的额外检查函数 */
      beforeDelete?: () => boolean | Promise<boolean>
    }
  ): Promise<boolean> => {
    const {
      title = t('message.prompt'),
      content = t('message.confirmDelete'),
      successTip = t('message.deleteSuccess'),
      showConfirm = true,
      multiple = false,
      confirmType = 'warning',
      beforeDelete
    } = options || {}

    // 执行删除前的检查
    if (beforeDelete) {
      const canDelete = await beforeDelete()
      if (!canDelete) return false
    }

    const executeDelete = async (): Promise<boolean> => {
      try {
        const res = await deleteApi()
        if (res.success) {
          // 计算删除后的页码
          const deleteCount = multiple ? selectedKeys.value.length : 1
          const remainingCount = pagination.total - deleteCount
          const totalPage = Math.max(1, Math.ceil(remainingCount / pagination.pageSize))

          // 如果当前页码超出范围，调整到最后一页
          if (pagination.current > totalPage) {
            pagination.current = totalPage
          }

          // 清空选择
          if (multiple) {
            clearSelection()
          }

          ElMessage.success(successTip)
          await getTableData()
          return true
        } else {
          const errorMsg = res.msg || t('message.deleteFailed')
          ElMessage.error(errorMsg)
          return false
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : t('message.deleteFailed')
        ElMessage.error(errorMsg)
        return false
      }
    }

    // 如果不需要确认框，直接执行删除
    if (!showConfirm) {
      return executeDelete()
    }

    // 显示确认框
    const confirmContent = multiple
      ? `${t('message.selected')} ${selectedKeys.value.length} ${t('message.items')}，${t('message.confirmDelete')}？`
      : content

    try {
      await ElMessageBox.confirm(confirmContent, title, {
        type: confirmType as any,
        confirmButtonText: t('message.confirm'),
        cancelButtonText: t('message.cancel'),
        draggable: true
      })
      return await executeDelete()
    } catch {
      // 用户取消删除
      return false
    }
  }

  /**
   * 批量删除快捷方法
   * @param deleteApi 删除接口，接收 ids 参数
   * @param options 删除选项
   */
  const handleBatchDelete = async <R = any>(
    deleteApi: (ids: (string | number)[]) => Promise<ApiRes<R>>,
    options?: {
      title?: string
      successTip?: string
      confirmType?: 'warning' | 'error' | 'info'
      beforeDelete?: () => boolean | Promise<boolean>
    }
  ) => {
    if (selectedKeys.value.length === 0) {
      ElMessage.warning(t('message.selectDeleteData'))
      return false
    }

    return handleDelete(() => deleteApi(selectedKeys.value), {
      title: options?.title || t('message.batchDelete'),
      content: `${t('message.selected')} ${selectedKeys.value.length} ${t('message.items')}，${t('message.confirmDelete')}？`,
      successTip: options?.successTip || t('message.batchDeleteSuccess'),
      showConfirm: true,
      multiple: true,
      confirmType: options?.confirmType || 'warning',
      beforeDelete: options?.beforeDelete
    })
  }

  /**
   * 获取当前页码的第一条和最后一条数据的索引
   */
  const getPageRange = computed(() => {
    const start = (pagination.current - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.current * pagination.pageSize, pagination.total)
    return { start, end, total: pagination.total }
  })

  const { breakpoint } = useBreakpoint()

  /**
   * 表格操作列固定方向
   * @description 小屏幕下不固定在右侧，适配移动端
   */
  const fixed = computed(() => {
    if (['xs', 'sm'].includes(breakpoint.value)) return undefined
    return 'right'
  })

  /**
   * 判断是否为移动端
   */
  const isMobile = computed(() => ['xs', 'sm'].includes(breakpoint.value))

  /**
   * 获取表格选中的数据
   */
  const getSelectedRows = () => selectedRows.value

  /**
   * 设置表格选中数据
   * @param rows 选中的行数据
   */
  const setSelectedRows = (rows: T[]) => {
    selectedRows.value = rows
    selectedKeys.value = rows.map((row) => {
      if (typeof rowKey === 'function') {
        return rowKey(row)
      }
      return row[rowKey as keyof T] as string | number
    })
  }

  return {
    // 状态
    /** 表格加载状态 */
    loading,
    /** 表格数据 */
    tableData,
    /** 分页配置 */
    pagination,
    /** 选中的行 keys */
    selectedKeys,
    /** 选中的行数据 */
    selectedRows,
    /** 当前页数据范围 */
    pageRange: getPageRange,
    /** 是否为移动端 */
    isMobile,
    /** 操作列固定方向 */
    fixed,

    // 方法
    /** 获取表格数据 */
    getTableData,
    /** 搜索（重置到第一页） */
    search,
    /** 刷新（保持当前页码） */
    refresh,
    /** 重置（清空选择并回到第一页） */
    reset,
    /** 清空选择 */
    clearSelection,
    /** 处理选择变化 */
    handleSelectionChange,
    /** 处理全选变化 */
    handleSelectAll,
    /** 删除数据 */
    handleDelete,
    /** 批量删除 */
    handleBatchDelete,
    /** 获取选中的行数据 */
    getSelectedRows,
    /** 设置选中的行数据 */
    setSelectedRows
  }
}
