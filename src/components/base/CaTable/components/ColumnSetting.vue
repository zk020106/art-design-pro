<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom-end"
    :width="260"
    trigger="click"
    @show="handleShow"
  >
    <template #reference>
      <el-button>
        <template #icon>
          <el-icon><Setting /></el-icon>
        </template>
      </el-button>
    </template>

    <div class="ca-table__setting">
      <!-- 顶部控制区域 -->
      <div class="ca-table__setting-header">
        <el-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          {{ t('table.selectAll') }}
        </el-checkbox>
        <el-link type="primary" @click="handleReset">{{ t('table.reset') }}</el-link>
      </div>

      <el-divider />

      <!-- 列拖拽排序区域 -->
      <div class="ca-table__draggable">
        <VueDraggable v-model="localColumns" :animation="150" @end="handleDragEnd">
          <div v-for="item in localColumns" :key="item.key" class="ca-table__draggable-item">
            <div class="ca-table__draggable-item-move">
              <el-icon><DArrowLeft /></el-icon>
            </div>
            <el-checkbox
              v-model="item.show"
              :disabled="item.disabled"
              @change="() => handleColumnChange(item)"
            >
              {{ item.label }}
            </el-checkbox>
            <div class="ca-table__draggable-item-fixed">
              <el-tooltip :content="t('table.pinLeft')">
                <el-icon
                  class="ca-table__fixed-icon"
                  :class="[
                    {
                      'ca-table__fixed-icon--active': item.fixed === 'left',
                      'ca-table__fixed-icon--disabled': !item.show
                    }
                  ]"
                  @click="handleFixedColumn(item, 'left')"
                >
                  <DArrowLeft />
                </el-icon>
              </el-tooltip>
              <el-tooltip :content="t('table.pinRight')">
                <el-icon
                  class="ca-table__fixed-icon"
                  :class="[
                    {
                      'ca-table__fixed-icon--active': item.fixed === 'right',
                      'ca-table__fixed-icon--disabled': !item.show
                    }
                  ]"
                  @click="handleFixedColumn(item, 'right')"
                >
                  <DArrowRight />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
        </VueDraggable>
      </div>

      <el-divider />

      <!-- 底部保存按钮 -->
      <el-button type="primary" style="width: 100%" @click="handleSave">{{
        t('table.save')
      }}</el-button>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
  import { DArrowLeft, DArrowRight, Setting } from '@element-plus/icons-vue'
  import {
    ElButton,
    ElCheckbox,
    ElDivider,
    ElIcon,
    ElLink,
    ElMessage,
    ElPopover,
    ElTooltip
  } from 'element-plus'
  import { computed, onMounted, ref, watch } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { TableColumnItem } from '../type'

  const props = defineProps<{
    columns: TableColumnItem[]
    disabledKeys: string[]
    tableId?: string
  }>()

  const emit = defineEmits<{
    (e: 'update:columns', columns: any[]): void
    (e: 'visible-columns-change', columns: any[]): void
  }>()

  const { t } = useI18n()
  const route = useRoute()
  const popoverVisible = ref(false)
  const localColumns = ref<TableColumnItem[]>([])
  const originalColumns = ref<any[]>([])

  // 提取列排序逻辑
  const sortColumnsByLocalOrder = (columns: any[]) => {
    const keyOrderMap = new Map(localColumns.value.map((col, index) => [col.key, index]))

    return columns.sort((a, b) => {
      const keyA = a.prop || (typeof a.title === 'string' ? a.title : '')
      const keyB = b.prop || (typeof b.title === 'string' ? b.title : '')
      const orderA = keyOrderMap.get(keyA) ?? 999
      const orderB = keyOrderMap.get(keyB) ?? 999
      return orderA - orderB
    })
  }

  // 更新列变化
  const emitColumnsChange = () => {
    const updatedColumns = props.columns.map((originalCol) => {
      const key =
        originalCol.prop || (typeof originalCol.label === 'string' ? originalCol.label : '')
      const localCol = localColumns.value.find((col) => col.key === key)

      if (localCol) {
        return {
          ...originalCol,
          show: localCol.show,
          fixed: localCol.fixed,
          width: localCol.width || originalCol.width
        }
      }
      return originalCol
    })

    const sortedColumns = sortColumnsByLocalOrder(updatedColumns)
    emit('update:columns', sortedColumns)
  }

  // 缓存可选列
  const selectableColumns = computed(() => {
    return localColumns.value.filter((col) => !col.disabled)
  })

  // 计算全选状态
  const isAllSelected = computed(() => {
    if (selectableColumns.value.length === 0) return false
    return selectableColumns.value.every((col) => col.show)
  })

  // 计算半选状态
  const isIndeterminate = computed(() => {
    if (selectableColumns.value.length === 0) return false
    const selectedCount = selectableColumns.value.filter((col) => col.show).length
    return selectedCount > 0 && selectedCount < selectableColumns.value.length
  })

  // 全选/取消全选处理
  const handleSelectAll = (checked: boolean | string | number) => {
    const isChecked = Boolean(checked)
    selectableColumns.value.forEach((col) => {
      col.show = isChecked
      if (!isChecked) {
        col.fixed = undefined
      }
    })
    emitColumnsChange()
  }

  /** 获取存储键 */
  const getStorageKey = computed(() => {
    const pathKey = route.path.replace(/\//g, ':')
    return props.tableId
      ? `table-columns-settings-${pathKey}:${props.tableId}`
      : `table-columns-settings-${pathKey}`
  })

  // 计算可见列
  const visibleColumns = computed(() => {
    const showColumns = props.columns
      .filter((col) => {
        const key = col.prop || (typeof col.label === 'string' ? col.label : '')
        const localCol = localColumns.value.find((item) => item.key === key)
        return localCol?.show !== false
      })
      .map((col) => {
        const key = col.prop || (typeof col.label === 'string' ? col.label : '')
        const localCol = localColumns.value.find((item) => item.key === key)

        if (localCol) {
          return {
            ...col,
            fixed: localCol.fixed,
            width: localCol.width || col.width
          }
        }
        return col
      })

    const sortedShowColumns = sortColumnsByLocalOrder(showColumns)

    const leftFixedColumns = sortedShowColumns.filter((col) => col.fixed === 'left')
    const unfixedColumns = sortedShowColumns.filter((col) => !col.fixed)
    const rightFixedColumns = sortedShowColumns.filter((col) => col.fixed === 'right')

    return [...leftFixedColumns, ...unfixedColumns, ...rightFixedColumns]
  })

  // 监听本地列变化，发出可见列变化事件
  watch(
    [localColumns],
    () => {
      if (localColumns.value.length > 0) {
        emit('visible-columns-change', visibleColumns.value)
      }
    },
    { immediate: true, deep: true }
  )

  // 将列转换为本地列格式
  const transformColumns = (columns = props.columns) => {
    if (!columns || columns.length === 0) {
      return []
    }

    const leftColumns: TableColumnItem[] = []
    const centerColumns: TableColumnItem[] = []
    const rightColumns: TableColumnItem[] = []

    columns.forEach((column) => {
      const key = column.prop || (typeof column.label === 'string' ? column.label : '')
      const item: TableColumnItem = {
        key,
        prop: column.prop as string,
        label: typeof column.label === 'string' ? column.label : String(key),
        show: column.show ?? true,
        disabled: props.disabledKeys.includes(key),
        fixed:
          typeof column.fixed === 'boolean'
            ? 'left'
            : (column.fixed as 'left' | 'right' | undefined),
        width: column.width as number
      }

      if (item.fixed === 'left') {
        leftColumns.push(item)
      } else if (item.fixed === 'right') {
        rightColumns.push(item)
      } else {
        centerColumns.push(item)
      }
    })

    return [...leftColumns, ...centerColumns, ...rightColumns]
  }

  // 从localStorage恢复设置
  const loadSettingsFromStorage = () => {
    try {
      const settingsJson = localStorage.getItem(getStorageKey.value)
      if (!settingsJson) return false

      const settings = JSON.parse(settingsJson)
      if (!settings || !settings.columns || !Array.isArray(settings.columns)) return false

      const columnsMap = new Map(
        props.columns.map((col) => [
          col.prop || (typeof col.label === 'string' ? col.label : ''),
          col
        ])
      )

      const leftColumns: TableColumnItem[] = []
      const centerColumns: TableColumnItem[] = []
      const rightColumns: TableColumnItem[] = []

      settings.columns.forEach((item: TableColumnItem) => {
        const originalColumn = columnsMap.get(item.key)
        if (originalColumn) {
          const newItem: TableColumnItem = {
            ...item,
            label:
              typeof originalColumn.label === 'string' ? originalColumn.label : String(item.key),
            prop: originalColumn.prop as string,
            disabled: props.disabledKeys.includes(item.key),
            width: item.width || (originalColumn.width as number)
          }

          if (newItem.fixed === 'left') {
            leftColumns.push(newItem)
          } else if (newItem.fixed === 'right') {
            rightColumns.push(newItem)
          } else {
            centerColumns.push(newItem)
          }
        }
      })

      localColumns.value = [...leftColumns, ...centerColumns, ...rightColumns]

      const existingKeys = new Set(localColumns.value.map((col) => col.key))
      const newColumns = props.columns
        .filter((col) => {
          const key = col.prop || (typeof col.label === 'string' ? col.label : '')
          return !existingKeys.has(key)
        })
        .map((col) => {
          const key = col.prop || (typeof col.label === 'string' ? col.label : '')
          return {
            key,
            prop: col.prop as string,
            label: typeof col.label === 'string' ? col.label : String(key),
            show: col.show ?? true,
            disabled: props.disabledKeys.includes(key),
            fixed:
              typeof col.fixed === 'boolean' ? 'left' : (col.fixed as 'left' | 'right' | undefined),
            width: col.width as number
          }
        })

      if (newColumns.length > 0) {
        localColumns.value = [...localColumns.value, ...newColumns]
      }

      emitColumnsChange()
      return true
    } catch (e) {
      console.error('Failed to load column settings from localStorage', e)
      return false
    }
  }

  // 初始化列表和原始列配置
  watch(
    () => props.columns,
    (newColumns) => {
      if (newColumns && newColumns.length > 0) {
        if (originalColumns.value.length === 0) {
          originalColumns.value = JSON.parse(JSON.stringify(newColumns))
        }

        if (localColumns.value.length === 0) {
          localColumns.value = transformColumns()
        }
      }
    },
    { immediate: true }
  )

  // 处理popover显示事件
  const handleShow = () => {
    if (!localColumns.value.length) {
      localColumns.value = transformColumns()
    }
  }

  // 处理拖拽结束
  const handleDragEnd = () => {
    emitColumnsChange()
  }

  // 处理单列变更
  const handleColumnChange = (item: TableColumnItem) => {
    if (!item.show) {
      item.fixed = undefined
    }
    emitColumnsChange()
  }

  // 处理列固定
  const handleFixedColumn = (item: TableColumnItem, position: 'left' | 'right') => {
    if (!item.show) return

    const isCurrentlyFixed = item.fixed === position
    item.fixed = isCurrentlyFixed ? undefined : position

    if (item.fixed && !item.width) {
      item.width = 100
    }

    emitColumnsChange()
  }

  // 重置
  const handleReset = () => {
    try {
      localStorage.removeItem(getStorageKey.value)

      if (originalColumns.value.length > 0) {
        const columnsToReset = JSON.parse(JSON.stringify(originalColumns.value))
        emit('update:columns', columnsToReset)
        localColumns.value = transformColumns(columnsToReset)
      } else {
        localColumns.value = transformColumns()
      }

      emitColumnsChange()
      ElMessage.success(t('table.resetSuccess'))
    } catch (e) {
      console.error('Failed to reset column settings', e)
      ElMessage.error(t('table.resetError'))
    }
  }

  // 保存
  const handleSave = () => {
    if (!getStorageKey.value) return
    try {
      const settings = {
        columns: localColumns.value
      }
      localStorage.setItem(getStorageKey.value, JSON.stringify(settings))
      popoverVisible.value = false
      ElMessage.success(t('table.saveSuccess'))
    } catch (e) {
      console.error('Failed to save column settings', e)
      ElMessage.error(t('table.saveError'))
    }
  }

  // 初始化时加载存储设置
  onMounted(() => {
    loadSettingsFromStorage()
  })

  // 导出供外部使用
  defineExpose({
    visibleColumns,
    resetColumns: handleReset,
    saveColumns: handleSave
  })
</script>

<style lang="scss" scoped>
  .ca-table {
    &__setting {
      &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        font-size: 14px;
      }
    }

    &__draggable {
      padding: 4px 0;
      max-height: 300px;
      box-sizing: border-box;
      overflow: hidden auto;
    }

    &__draggable-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 6px 0;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &-move {
        padding: 0 4px;
        cursor: move;
        color: var(--el-text-color-secondary);
      }

      &-fixed {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    &__fixed-icon {
      cursor: pointer;
      font-size: 16px;
      color: var(--el-text-color-placeholder);
      transition: all 0.2s ease;
      padding: 4px;
      border-radius: 2px;

      &--active {
        color: var(--el-color-primary);
      }

      &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:hover:not(&--disabled) {
        color: var(--el-color-primary);
        background-color: var(--el-fill-color-light);
      }
    }
  }

  :deep(.el-checkbox) {
    width: 100%;
    margin-right: 0;
  }

  :deep(.el-link) {
    font-size: 14px;
  }
</style>
