<template>
  <ElDialog
    v-model="dialogVisible"
    :title="title || t('components.tableSelector.title')"
    :width="width || '800px'"
    v-bind="$attrs"
    @close="handleCancel"
  >
    <!-- Search Bar -->
    <div v-if="showSearch" class="mb-4">
      <ElInput
        v-model="searchQuery"
        :placeholder="t('components.tableSelector.searchPlaceholder')"
        clearable
        class="w-full md:w-80"
        @input="handleSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </div>

    <!-- Table -->
    <ElTable
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :row-key="String(rowKey)"
      :height="400"
      class="w-full"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <!-- Selection Column -->
      <ElTableColumn v-if="multiple" type="selection" width="55" :reserve-selection="true" />

      <!-- Data Columns -->
      <ElTableColumn
        v-for="column in columns"
        :key="String(column.dataIndex)"
        :prop="String(column.dataIndex)"
        :label="column.title"
        :width="column.width"
        :align="column.align || 'left'"
      >
        <template #default="{ row }">
          <component v-if="column.render" :is="column.render(row)" />
          <span v-else>{{ row[column.dataIndex] }}</span>
        </template>
      </ElTableColumn>

      <!-- Empty State -->
      <template #empty>
        <div class="text-center py-8 text-gray-400">
          {{ t('components.tableSelector.noData') }}
        </div>
      </template>
    </ElTable>

    <!-- Pagination -->
    <div class="mt-4 flex justify-end">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSizeValue"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="flex-wrap"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- Selected Count -->
    <div v-if="multiple && selectedRows.length > 0" class="mt-4 text-sm text-gray-600">
      {{ t('components.tableSelector.selected', { count: selectedRows.length }) }}
    </div>

    <!-- Dialog Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <ElButton @click="handleCancel">
          {{ t('components.tableSelector.cancel') }}
        </ElButton>
        <ElButton type="primary" @click="handleConfirm">
          {{ t('components.tableSelector.confirm') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { Search } from '@element-plus/icons-vue'
  import { useDebounceFn } from '@vueuse/core'
  import {
    ElButton,
    ElDialog,
    ElIcon,
    ElInput,
    ElMessage,
    ElPagination,
    ElTable,
    ElTableColumn
  } from 'element-plus'
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { GiTableSelectorEmits, GiTableSelectorProps } from './types'

  defineOptions({
    name: 'GiTableSelector',
    inheritAttrs: false
  })

  const props = withDefaults(defineProps<GiTableSelectorProps<T>>(), {
    multiple: true,
    pageSize: 20,
    title: '',
    width: '800px',
    showSearch: true
  })

  const emit = defineEmits<GiTableSelectorEmits<T>>()

  const { t } = useI18n()

  // 对话框可见性
  const dialogVisible = defineModel<boolean>({ default: false })

  // 表格数据
  const tableRef = ref()
  const tableData = ref<T[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSizeValue = ref(props.pageSize)
  const total = ref(0)
  const searchQuery = ref('')

  // 选择状态跟踪（跨页）
  const selectedRows = ref<T[]>([])
  const selectedKeys = ref<Set<any>>(new Set())

  /**
   * 加载表格数据
   */
  const loadData = async () => {
    loading.value = true
    try {
      const result = await props.fetchData({
        page: currentPage.value,
        pageSize: pageSizeValue.value,
        query: searchQuery.value
      })

      tableData.value = result.data
      total.value = result.total

      emit('loadSuccess', result.data)

      // 恢复当前页的选择状态
      await nextTick()
      if (tableRef.value && props.multiple) {
        result.data.forEach((row) => {
          if (selectedKeys.value.has(row[props.rowKey])) {
            tableRef.value.toggleRowSelection(row, true)
          }
        })
      }
    } catch (error) {
      console.error('[GiTableSelector] Failed to load data:', error)
      ElMessage.error(t('components.select.loadError'))
      emit('loadError', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理选择项变化
   */
  const handleSelectionChange = (selection: T[]) => {
    // 更新选中的键
    const currentPageKeys = new Set(tableData.value.map((row) => (row as any)[props.rowKey]))

    // 从当前页移除未选中的项
    selectedKeys.value.forEach((key) => {
      if (currentPageKeys.has(key)) {
        const isStillSelected = selection.some((row) => (row as any)[props.rowKey] === key)
        if (!isStillSelected) {
          selectedKeys.value.delete(key)
        }
      }
    })

    // 添加新选中的项
    selection.forEach((row) => {
      selectedKeys.value.add((row as any)[props.rowKey])
    })

    // 更新选中的行数组
    selectedRows.value = Array.from(selectedKeys.value)
      .map((key) => {
        // 先尝试在当前页查找
        const currentRow = tableData.value.find((row) => (row as any)[props.rowKey] === key)
        if (currentRow) return currentRow

        // 否则在之前选中的行中查找
        return selectedRows.value.find((row) => (row as any)[props.rowKey] === key)
      })
      .filter(Boolean) as T[]
  }

  /**
   * 处理行点击（单选）
   */
  const handleRowClick = (row: T) => {
    if (!props.multiple) {
      selectedRows.value = [row]
      selectedKeys.value = new Set([(row as any)[props.rowKey]])
    }
  }

  /**
   * 处理搜索（带防抖）
   */
  const handleSearch = useDebounceFn(() => {
    currentPage.value = 1
    loadData()
  }, 300)

  /**
   * 处理页码变化
   */
  const handlePageChange = () => {
    loadData()
  }

  /**
   * 处理每页大小变化
   */
  const handleSizeChange = () => {
    currentPage.value = 1
    loadData()
  }

  /**
   * 处理确认
   */
  const handleConfirm = () => {
    emit('confirm', selectedRows.value as T[])
    dialogVisible.value = false
  }

  /**
   * 处理取消
   */
  const handleCancel = () => {
    emit('cancel')
    dialogVisible.value = false
  }

  /**
   * 重置选择
   */
  const clearSelection = () => {
    selectedRows.value = []
    selectedKeys.value.clear()
    tableRef.value?.clearSelection()
  }

  /**
   * 暴露方法
   */
  defineExpose({
    loadData,
    clearSelection,
    refresh: loadData
  })

  // 对话框打开时加载数据
  watch(dialogVisible, (visible) => {
    if (visible) {
      currentPage.value = 1
      searchQuery.value = ''
      loadData()
    }
  })
</script>

<style scoped>
  /* Responsive pagination */
  @media (width <= 768px) {
    :deep(.el-pagination) {
      justify-content: center;
    }
  }
</style>
