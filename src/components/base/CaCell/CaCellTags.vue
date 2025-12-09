<template>
  <div v-if="data && data.length" class="tag-container">
    <el-tag v-for="(item, index) in visibleTags" :key="index" size="small" class="tag-item">
      {{ item }}
    </el-tag>
    <el-tooltip v-if="overflowCount > 0" :content="overflowContent" placement="top">
      <el-tag type="primary" size="small" class="tag-item">+{{ overflowCount }}</el-tag>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'CaCellTags' })

  const props = withDefaults(defineProps<Props>(), {
    data: () => []
  })

  interface Props {
    data: string[] | undefined
  }

  // 显示的标签数量
  const maxVisible = 3

  const visibleTags = computed(() => {
    return props.data.slice(0, maxVisible)
  })

  const overflowCount = computed(() => {
    return Math.max(0, props.data.length - maxVisible)
  })

  const overflowContent = computed(() => {
    return props.data.slice(maxVisible).join(', ')
  })
</script>

<style scoped lang="scss">
  .tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag-item {
    margin: 0;
  }
</style>
