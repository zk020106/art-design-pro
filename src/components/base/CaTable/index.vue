<template>
  <div ref="tableContainer" class="ca-table" :class="{ 'ca-table--fullscreen': isFullscreen }">
    <ElRow v-if="props.title" justify="space-between" align="middle" class="ca-table-header">
      <ElSpace :wrap="true">
        <slot name="title">
          <div class="ca-table__header-title">{{ props.title }}</div>
        </slot>
      </ElSpace>
    </ElRow>
    <ElRow>
      <slot name="top"></slot>
    </ElRow>
    <ElRow v-if="showToolbar" justify="space-between" align="middle" class="ca-table__toolbar">
      <ElSpace :wrap="true" :size="[8, 8]">
        <slot name="toolbar-left"></slot>
      </ElSpace>
      <ElSpace wrap class="ca-table__toolbar-right" :size="[8, 8]">
        <slot name="toolbar-right"></slot>
        <ElTooltip placement="top" :content="t('table.refresh')">
          <ElButton v-if="props.toolbar?.showRefresh !== false" @click="handleRefresh">
            <template #icon>
              <ArtSvgIcon icon="ep:refresh" />
            </template>
          </ElButton>
        </ElTooltip>

        <ElTooltip
          placement="top"
          v-if="props.toolbar?.showSize !== false"
          :content="t('table.size')"
        >
          <ElDropdown trigger="click" @command="handleSizeChange">
            <ElButton>
              <template #icon>
                <ArtSvgIcon icon="ep:grid" />
              </template>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="item in sizeOptions"
                  :key="item.value"
                  :command="item.value"
                  :class="{ 'is-active': tableSize === item.value }"
                >
                  {{ t(item.labelKey) }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElTooltip>

        <ElTooltip
          placement="top"
          :content="isFullscreen ? t('table.exitFullscreen') : t('table.fullscreen')"
        >
          <ElButton v-if="props.toolbar?.showFullscreen !== false" @click="toggleFullscreen">
            <ArtSvgIcon :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'" />
          </ElButton>
        </ElTooltip>

        <ElTooltip
          placement="top"
          v-if="props.toolbar?.showColumnSetting !== false"
          :content="t('table.columnSettings')"
        >
          <ElButton :disabled="props.toolbar?.columnSettingDisabled">
            <template #icon>
              <ArtSvgIcon icon="ep:setting" />
            </template>
          </ElButton>
        </ElTooltip>
      </ElSpace>
    </ElRow>

    <ElTable
      v-bind="tableProps"
      ref="tableRef"
      :data="props.data as any[]"
      :size="tableSize"
      :height="isFullscreen ? fullscreenHeight : undefined"
    >
      <TableColumn v-for="item in props.columns" :key="item.prop || item.label" :column="item">
        <!-- 将所有插槽传递给子组件 -->
        <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="scope">
          <slot :name="slotName" v-bind="scope" />
        </template>
      </TableColumn>

      <!-- 操作列 -->
      <ElTableColumn
        v-if="props.actions && props.actions.buttons && props.actions.buttons.length > 0"
        :label="props.actions.label || t('table.action')"
        :width="props.actions.width"
        :fixed="props.actions.fixed"
        align="center"
      >
        <template #default="scope">
          <ElSpace :wrap="true" :size="[4, 4]">
            <ElButton
              v-for="(button, index) in props.actions!.buttons"
              :key="index"
              v-show="!button.show || button.show(scope)"
              :type="button.type"
              :size="button.size || 'small'"
              :disabled="button.disabled && button.disabled(scope)"
              @click="button.onClick && button.onClick(scope)"
            >
              {{ button.label }}
            </ElButton>
          </ElSpace>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElRow justify="end" class="ca-table-pagination">
      <ElPagination
        v-bind="paginationProps"
        v-model:current-page="paginationProps.currentPage"
        v-model:page-size="paginationProps.pageSize"
      />
    </ElRow>
  </div>
</template>

<script lang="ts" setup>
  import {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElPagination,
    ElRow,
    ElSpace,
    ElTable,
    ElTableColumn,
    ElTooltip
  } from 'element-plus'
  import { computed, ref, useTemplateRef, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import TableColumn from './TableColumn.vue'
  import type { TableProps } from './type'

  const props = withDefaults(defineProps<TableProps>(), {
    columns: () => [],
    pagination: () => ({}),
    toolbar: () => ({})
  })

  const { t } = useI18n()

  const attrs = useAttrs()
  const tableRef = useTemplateRef('tableRef')
  const tableContainer = useTemplateRef('tableContainer')

  // 全屏状态
  const isFullscreen = ref(false)
  const fullscreenHeight = ref(0)

  // 表格尺寸
  const tableSize = ref<'default' | 'large' | 'small'>('small')

  // 密度选项
  const sizeOptions = computed(() => {
    return (
      props.toolbar?.sizeOptions || [
        { labelKey: 'table.sizeOptions.default', value: 'default' },
        { labelKey: 'table.sizeOptions.small', value: 'small' },
        { labelKey: 'table.sizeOptions.large', value: 'large' }
      ]
    )
  })

  // 是否显示工具栏
  const showToolbar = computed(() => {
    return (
      props.toolbar?.show !== false &&
      (props.toolbar?.showRefresh !== false ||
        props.toolbar?.showSize !== false ||
        props.toolbar?.showFullscreen !== false ||
        props.toolbar?.showColumnSetting !== false)
    )
  })

  const tableProps = computed(() => {
    return {
      ...attrs,
      ...props,
      columns: undefined,
      pagination: undefined,
      toolbar: undefined,
      actions: undefined
    }
  })

  const paginationProps = computed(() => {
    return {
      background: true,
      layout: 'prev, pager, next, sizes, total',
      pageSizes: [10, 20, 50, 100],
      ...props.pagination
    }
  })

  // 刷新处理
  const handleRefresh = async () => {
    if (props.toolbar?.onRefresh) {
      await props.toolbar.onRefresh()
    }
  }

  // 尺寸变更处理
  const handleSizeChange = (size: 'default' | 'large' | 'small') => {
    tableSize.value = size
  }

  // 全屏切换
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
    if (isFullscreen.value) {
      // 计算全屏高度（减去工具栏和分页的高度）
      fullscreenHeight.value = window.innerHeight - 200
    }
  }

  // 监听全屏状态变化
  watch(isFullscreen, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })

  defineExpose({
    tableRef,
    tableContainer,
    isFullscreen,
    toggleFullscreen
  })
</script>

<style lang="scss" scoped>
  :deep(.el-pagination__rightwrapper) {
    flex: auto;
  }

  .ca-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-radius: 4px;

    &.ca-table--fullscreen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      padding: 20px;
    }

    :deep(.el-table) {
      flex: 1;
    }

    &__toolbar {
      padding: 10px 0;

      &-right {
        .el-dropdown {
          .el-button.is-circle {
            cursor: pointer;
          }
        }

        .el-dropdown-menu__item {
          &.is-active {
            color: var(--el-color-primary);
          }
        }
      }
    }

    &__header-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .ca-table-header {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .ca-table-pagination {
    margin-top: 10px;
  }
</style>
