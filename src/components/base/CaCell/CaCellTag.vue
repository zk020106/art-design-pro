<template>
  <span v-if="!dictItem"></span>
  <span v-else-if="!dictItem.extra">{{ dictItem.label }}</span>
  <el-tag v-else-if="dictItem.extra === 'primary'" type="primary" size="small">{{
    dictItem.label
  }}</el-tag>
  <el-tag v-else-if="dictItem.extra === 'success'" type="success" size="small">{{
    dictItem.label
  }}</el-tag>
  <el-tag v-else-if="dictItem.extra === 'warning'" type="warning" size="small">{{
    dictItem.label
  }}</el-tag>
  <el-tag v-else-if="dictItem.extra === 'error'" type="danger" size="small">{{
    dictItem.label
  }}</el-tag>
  <el-tag v-else-if="dictItem.extra === 'default'" type="info" size="small">{{
    dictItem.label
  }}</el-tag>
  <span v-else>{{ dictItem.label }}</span>
</template>

<script setup lang="ts">
  import type { LabelValueState } from '@/types/global'
  import type { CaCellTagType } from './types'

  defineOptions({ name: 'CaCellTag' })

  const props = withDefaults(defineProps<Partial<CaCellTagType>>(), {
    dict: () => [],
    value: ''
  })

  const dictItem = computed((): LabelValueState => {
    try {
      return (
        props.dict.find(
          (d) => d.value === String(props.value) || d.value === Number(props.value)
        ) || { label: '', value: '' }
      )
    } catch {
      return { label: '', value: '' }
    }
  })
</script>

<style scoped lang="scss"></style>
