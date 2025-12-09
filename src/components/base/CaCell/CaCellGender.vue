<template>
  <el-tag v-if="props.gender === 1" type="primary" size="small" round>
    <el-icon><User /></el-icon>
    <span>男</span>
  </el-tag>
  <el-tag v-else-if="props.gender === 2" type="danger" size="small" round>
    <el-icon><UserFilled /></el-icon>
    <span>女</span>
  </el-tag>
  <el-tag v-else type="info" size="small" round>
    <span>未知</span>
  </el-tag>
</template>

<script setup lang="ts">
  import { User, UserFilled } from '@element-plus/icons-vue'

  defineOptions({ name: 'CaCellGender' })

  const props = withDefaults(defineProps<Props>(), {
    gender: 1
  })

  interface Props {
    gender: 1 | 2 | 0
  }
</script>

<style scoped lang="scss">
  .el-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }
</style>
