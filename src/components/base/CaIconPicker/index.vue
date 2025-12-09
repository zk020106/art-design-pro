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
            <component v-if="isLocalSvg" :is="modelValue" />
            <component v-else :is="modelValue" />
          </ElIcon>
          <ElIcon v-else class="text-gray-400">
            <Grid />
          </ElIcon>
        </template>
      </ElInput>
    </template>

    <!-- Icon Picker Content -->
    <div class="icon-picker-content">
      <!-- Tabs -->
      <ElTabs v-model="activeTab" class="mb-3">
        <ElTabPane label="Element Plus" name="preset">
          <template #label>
            <span class="text-sm">Element Plus</span>
          </template>
        </ElTabPane>
        <ElTabPane label="SVG" name="local">
          <template #label>
            <span class="text-sm">SVG</span>
          </template>
        </ElTabPane>
      </ElTabs>

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
        <!-- Element Plus Icons -->
        <div v-if="activeTab === 'preset'">
          <div v-if="filteredElementIcons.length === 0" class="text-center py-8 text-gray-400">
            {{ t('components.iconPicker.noResult') }}
          </div>
          <div v-else class="icon-grid">
            <div
              v-for="icon in filteredElementIcons"
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

        <!-- Local SVG Icons -->
        <div v-else>
          <div v-if="filteredLocalSvgs.length === 0" class="text-center py-8 text-gray-400">
            {{ t('components.iconPicker.noResult') }}
          </div>
          <div v-else class="icon-grid">
            <div
              v-for="item in filteredLocalSvgs"
              :key="item.name"
              :class="['icon-item', { 'icon-item-selected': modelValue === item.name }]"
              :title="item.name"
              @click="handleSelectIcon(item.name)"
            >
              <ElIcon class="text-xl">
                <span class="svg-icon" v-html="decodeSvg(item.svg)"></span>
              </ElIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElPopover>
</template>

<script setup lang="ts">
  import * as ElementPlusIcons from '@element-plus/icons-vue'
  import { ElIcon, ElInput, ElPopover } from 'element-plus'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLocalSvgLoader } from './composables/use-svg-loader'
  import type { CaIconPickerProps } from './types'

  defineOptions({
    name: 'CaIconPicker',
    inheritAttrs: false
  })

  withDefaults(defineProps<CaIconPickerProps>(), {
    modelValue: '',
    placeholder: '',
    clearable: true,
    size: 'default',
    disabled: false,
    popoverWidth: 400
  })

  // 使用 SVG 加载器（无需参数，路径已写死）
  const { decodeSvg, filterSvgs } = useLocalSvgLoader()

  const emit = defineEmits<{
    (e: 'update:modelValue', icon: string): void
    (e: 'change', icon: string): void
    (e: 'clear'): void
  }>()

  const { t } = useI18n()

  // 导入图标
  const { Grid, Search } = ElementPlusIcons

  // 弹出框可见性
  const popoverVisible = ref(false)

  // 搜索查询
  const searchQuery = ref('')

  // 当前激活的标签页
  const activeTab = ref<'preset' | 'local'>('preset')

  // 获取所有 Element Plus 图标
  const allElementIcons = computed(() => Object.keys(ElementPlusIcons))

  // 过滤 Element Plus 图标
  const filteredElementIcons = computed(() => {
    if (!searchQuery.value) return allElementIcons.value
    const query = searchQuery.value.toLowerCase()
    return allElementIcons.value.filter((icon) => icon.toLowerCase().includes(query))
  })

  // 过滤本地 SVG
  const filteredLocalSvgs = computed(() => {
    return filterSvgs(searchQuery.value)
  })

  // 判断是否是本地 SVG
  const isLocalSvg = computed(() => {
    return activeTab.value === 'local'
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

  .svg-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .svg-icon :deep(svg) {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentcolor;
  }
</style>
