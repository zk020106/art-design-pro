<template>
  <ElPopover
    :visible="popoverVisible"
    :width="popoverWidth"
    trigger="click"
    placement="bottom-start"
    @update:visible="handleVisibleChange"
  >
    <template #reference>
      <ElInput
        :model-value="modelValue"
        :placeholder="placeholder || t('components.iconPicker.selectIcon')"
        :size="size"
        :disabled="disabled"
        :clearable="clearable"
        readonly
        class="cursor-pointer"
        @clear="handleClear"
      >
        <template #prefix>
          <ElIcon v-if="modelValue" class="text-lg">
            <component :is="modelValue" />
          </ElIcon>
          <ElIcon v-else class="text-gray-400">
            <Grid />
          </ElIcon>
        </template>
      </ElInput>
    </template>

    <!-- Icon Picker Content -->
    <div class="icon-picker-content">
      <!-- Search -->
      <div class="mb-3">
        <ElInput
          v-model="searchQuery"
          :placeholder="t('components.iconPicker.searchPlaceholder')"
          clearable
          size="small"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
      </div>

      <!-- Icon Grid -->
      <div class="icon-grid-container">
        <div v-if="filteredIcons.length === 0" class="text-center py-8 text-gray-400">
          {{ t('components.iconPicker.noResult') }}
        </div>
        <div v-else class="icon-grid">
          <div
            v-for="icon in filteredIcons"
            :key="icon"
            :class="['icon-item', { 'icon-item-selected': modelValue === icon }]"
            :title="icon"
            @click="handleSelectIcon(icon)"
          >
            <ElIcon class="text-xl">
              <component :is="icon" />
            </ElIcon>
          </div>
        </div>
      </div>
    </div>
  </ElPopover>
</template>

<script setup lang="ts">
  import * as ElementPlusIcons from '@element-plus/icons-vue'
  import { ElIcon, ElInput, ElPopover } from 'element-plus'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { GiIconPickerEmits, GiIconPickerProps } from './types'

  defineOptions({
    name: 'GiIconPicker',
    inheritAttrs: false
  })

  const props = withDefaults(defineProps<GiIconPickerProps>(), {
    modelValue: '',
    iconSet: 'element',
    placeholder: '',
    clearable: true,
    size: 'default',
    disabled: false,
    popoverWidth: 400
  })

  const emit = defineEmits<GiIconPickerEmits>()

  const { t } = useI18n()

  // 导入 Grid 图标用于默认显示
  const { Grid, Search } = ElementPlusIcons

  // 弹出框可见性
  const popoverVisible = ref(false)

  // 搜索查询
  const searchQuery = ref('')

  // 获取所有 Element Plus 图标
  const allIcons = computed(() => {
    if (props.iconSet === 'element') {
      return Object.keys(ElementPlusIcons)
    }
    return []
  })

  // 根据搜索过滤图标
  const filteredIcons = computed(() => {
    if (!searchQuery.value) {
      return allIcons.value
    }

    const query = searchQuery.value.toLowerCase()
    return allIcons.value.filter((icon) => icon.toLowerCase().includes(query))
  })

  /**
   * 处理图标选择
   */
  const handleSelectIcon = (icon: string) => {
    emit('update:modelValue', icon)
    emit('change', icon)
    popoverVisible.value = false
    searchQuery.value = ''
  }

  /**
   * 处理清除
   */
  const handleClear = () => {
    emit('update:modelValue', '')
    emit('clear')
  }

  /**
   * 处理弹出框可见性变化
   */
  const handleVisibleChange = (visible: boolean) => {
    popoverVisible.value = visible
    if (!visible) {
      searchQuery.value = ''
    }
  }

  /**
   * 暴露方法
   */
  defineExpose({
    open: () => {
      popoverVisible.value = true
    },
    close: () => {
      popoverVisible.value = false
    }
  })
</script>

<style scoped>
  .icon-picker-content {
    width: 100%;
  }

  .icon-grid-container {
    max-height: 320px;
    overflow-y: auto;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.5rem;
  }

  @media (width <= 640px) {
    .icon-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }

  .icon-item:hover {
    background-color: #eff6ff;
    border-color: #3b82f6;
    transform: scale(1.1);
  }

  .icon-item-selected {
    background-color: #eff6ff;
    border-color: #3b82f6;
  }
</style>
