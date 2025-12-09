<template>
  <div class="ca-table">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="ca-table__toolbar">
      <!-- 左侧插槽 -->
      <div class="ca-table__toolbar-left">
        <slot name="toolbar-left" />
      </div>

      <!-- 右侧插槽和列设置 -->
      <div class="ca-table__toolbar-right">
        <slot name="toolbar-right" />
        <ColumnSetting
          v-if="showColumnSetting"
          :columns="props.columns"
          :disabled-keys="columnSettingDisabledKeys"
          :table-id="toolbarConfig.tableId"
          @update:columns="handleColumnsUpdate"
          @visible-columns-change="handleVisibleColumnsChange"
        />
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="ca-table__content">
      <ElTable
        v-bind="tableProps"
        ref="tableRef"
        :data="props.data as any[]"
        :columns="visibleColumns"
      >
        <TableColumn v-for="item in visibleColumns" :key="item.prop || item.label" :column="item">
          <!-- 将所有插槽传递给子组件 -->
          <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="scope">
            <slot :name="slotName" v-bind="scope" />
          </template>
        </TableColumn>
      </ElTable>
    </div>

    <!-- 分页 -->
    <ElRow v-if="showPagination" justify="end" class="ca-table-pagination">
      <ElPagination
        v-bind="paginationProps"
        v-model:current-page="paginationProps.currentPage"
        v-model:page-size="paginationProps.pageSize"
      />
    </ElRow>
  </div>
</template>

<script lang="ts" setup>
  import { ElPagination, ElRow, ElTable } from 'element-plus'
  import { computed, useAttrs, useTemplateRef } from 'vue'
  import TableColumn from './TableColumn.vue'
  import ColumnSetting from './components/ColumnSetting.vue'
  import type { TableProps } from './type'

  const props = withDefaults(defineProps<TableProps>(), {
    columns: () => [],
    pagination: () => ({}),
    toolbar: () => ({})
  })

  const attrs = useAttrs()
  const tableRef = useTemplateRef('tableRef')

  // 工具栏配置
  const toolbarConfig = computed(() => props.toolbar || {})
  const showToolbar = computed(() => toolbarConfig.value.show !== false)
  const showColumnSetting = computed(() => {
    return toolbarConfig.value.showColumnSetting !== false && hasColumns.value
  })
  const columnSettingDisabledKeys = computed(() => toolbarConfig.value.disabledColumnKeys || [])

  // 表格列
  const hasColumns = computed(() => props.columns && props.columns.length > 0)
  const visibleColumns = computed(() => {
    if (!hasColumns.value) return undefined
    return props.columns.filter((col) => col.show !== false)
  })

  const tableProps = computed(() => {
    return {
      ...attrs,
      ...props,
      columns: undefined,
      pagination: undefined,
      toolbar: undefined
    }
  })

  const showPagination = computed(() => {
    return props.pagination && Object.keys(props.pagination).length > 0
  })

  const paginationProps = computed(() => {
    return {
      background: true,
      layout: 'prev, pager, next, sizes, total',
      pageSizes: [10, 20, 50, 100],
      ...props.pagination
    }
  })

  // 处理列更新
  const handleColumnsUpdate = (columns: any[]) => {
    // 触发 update:columns 事件
    emit('update:columns', columns)
  }

  // 处理可见列变化
  const handleVisibleColumnsChange = (columns: any[]) => {
    emit('visible-columns-change', columns)
  }

  const emit = defineEmits<{
    (e: 'update:columns', columns: any[]): void
    (e: 'visible-columns-change', columns: any[]): void
  }>()

  defineExpose({
    tableRef
  })
</script>

<style lang="scss" scoped>
  :deep(.el-pagination__rightwrapper) {
    flex: auto;
  }

  .ca-table {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &__toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color-lighter);

      &-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    &__content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      :deep(.el-table) {
        flex: 1;
      }
    }
  }

  .ca-table-pagination {
    margin-top: 10px;
    padding: 12px 16px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
