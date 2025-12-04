<template>
  <GiPageLayout :size="240">
    <template #left>
      <DeptTree @node-click="handleSelectDept" />
    </template>

    <div class="p-4">
      <h2>用户管理页面</h2>
      <p>基本布局已加载，部门树组件正常工作</p>
      <!-- 暂时注释掉复杂内容，先看基本效果 -->
    </div>
  </GiPageLayout>
</template>

<script setup lang="ts">
  import { DeptDictTreeNode } from '@/types/api/system'
  import DeptTree from './dept/index.vue'
  // import { useI18n } from 'vue-i18n'

  // const { t } = useI18n()

  /**
   * 根据选中部门查询
   */
  const handleSelectDept = (key: string | number, data: DeptDictTreeNode) => {
    console.log('选中部门:', key, data)
  }
</script>

<style scoped lang="scss">
  .p-4 {
    padding: 16px;
  }
</style>
