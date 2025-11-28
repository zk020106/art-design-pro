<template>
  <ElSelect
    v-model="selectedValue"
    :placeholder="placeholder || t('components.select.placeholder')"
    :disabled="disabled"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleRemoteSearch"
    :loading="isLoading"
    :clearable="clearable"
    :multiple="multiple"
    :size="size"
    v-bind="$attrs"
    class="w-full"
    @change="handleChange"
    @clear="handleClear"
  >
    <template v-if="!isLoading && options.length === 0">
      <ElOption disabled :value="''" :label="t('components.select.noData')" />
    </template>
    <template v-else>
      <ElOption
        v-for="item in options"
        :key="item[keyField]"
        :label="String(item[valueField])"
        :value="item[keyField]"
      >
        <slot name="option" :item="item">
          {{ item[valueField] }}
        </slot>
      </ElOption>
    </template>

    <!-- Forward all Element Plus slots -->
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>
  </ElSelect>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { useDebounceFn } from '@vueuse/core'
  import { ElMessage, ElOption, ElSelect } from 'element-plus'
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { GiSelectEmits, GiSelectProps } from './types'

  defineOptions({
    name: 'GiSelect',
    inheritAttrs: false
  })

  const props = withDefaults(defineProps<GiSelectProps<T>>(), {
    multiple: false,
    placeholder: '',
    disabled: false,
    filterable: true,
    remote: false,
    clearable: true,
    size: 'default',
    loading: false
  })

  const emit = defineEmits<GiSelectEmits<T>>()

  const { t } = useI18n()

  // 模型值
  const selectedValue = defineModel<any>('modelValue')

  // 本地状态
  const options = ref<T[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')

  /**
   * 从 fetchData 函数加载数据
   */
  const loadData = async (params?: any) => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const data = await props.fetchData(params)
      options.value = data
      emit('loadSuccess', data)
    } catch (error) {
      console.error('[GiSelect] Failed to load data:', error)
      ElMessage.error(t('components.select.loadError'))
      emit('loadError', error)
      options.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 处理带防抖的远程搜索
   */
  const handleRemoteSearch = useDebounceFn((query: string) => {
    searchQuery.value = query
    if (props.remoteMethod) {
      props.remoteMethod(query)
    } else {
      loadData({ query })
    }
  }, 300)

  /**
   * 处理选择项变化
   */
  const handleChange = (value: any) => {
    let selectedItem
    if (props.multiple) {
      selectedItem = options.value.filter((item) =>
        value.includes((item as any)[props.keyField])
      ) as T[]
    } else {
      selectedItem = options.value.find((item) => (item as any)[props.keyField] === value) as T
    }

    emit('change', selectedItem)
  }

  /**
   * 处理清除
   */
  const handleClear = () => {
    emit('change', undefined)
  }

  /**
   * 向父组件暴露方法
   */
  defineExpose({
    loadData,
    refresh: loadData
  })

  // 组件挂载时加载数据
  onMounted(() => {
    loadData()
  })

  // 监听外部 loading 属性变化
  watch(
    () => props.loading,
    (newVal) => {
      if (newVal !== undefined) {
        isLoading.value = newVal
      }
    }
  )
</script>

<style scoped>
  /* Component-specific styles if needed */
</style>
