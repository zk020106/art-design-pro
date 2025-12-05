<template>
  <div class="pr-1">
    <div class="mb-1">
      <ElInput v-model="searchKey" :placeholder="t('components.tree.searchPlaceholder')" clearable>
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </div>
    <div>
      <div class="tree">
        <ElTree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          node-key="key"
          :current-node-key="currentNodeKey"
          :default-expand-all="true"
          :expand-on-click-node="false"
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node }">
            <span>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </ElTree>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDept } from '@/hooks/business'
  import type { DeptDictTreeNode } from '@/types/api/system'
  import { Search } from '@element-plus/icons-vue'
  import type { TreeInstance } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  defineOptions({ name: 'DeptTree' })
  const { t } = useI18n()

  const emit = defineEmits<{
    (e: 'node-click', key: string | number, data: DeptDictTreeNode): void
  }>()

  // Tree ref
  const treeRef = ref<TreeInstance>()

  // 当前选中节点
  const currentNodeKey = ref<string | number>()

  /**
   * 节点点击事件
   */
  const handleNodeClick = (data: DeptDictTreeNode) => {
    if (currentNodeKey.value === data.key) {
      return
    }
    currentNodeKey.value = data.key
    emit('node-click', data.key, data)
  }

  // Element Plus Tree props 配置
  const treeProps = {
    label: 'title', // 后端返回的是 title 字段
    children: 'children'
  }

  // 查询树列表
  const { deptList, getDeptList } = useDept({
    onSuccess: () => {
      nextTick(() => {
        // 默认选中第一个节点
        if (deptList.value.length > 0) {
          const firstNode = deptList.value[0]
          currentNodeKey.value = firstNode.key
          emit('node-click', firstNode.key, firstNode)
        }
      })
    }
  })

  // 过滤树
  const searchKey = ref('')

  /**
   * 递归过滤树节点
   */
  const filterTree = (keyword: string): DeptDictTreeNode[] => {
    const loop = (data: DeptDictTreeNode[]): DeptDictTreeNode[] => {
      const result: DeptDictTreeNode[] = []
      data.forEach((item) => {
        if (item.title?.toLowerCase().includes(keyword)) {
          result.push({ ...item })
        } else if (item.children) {
          const filterData = loop(item.children)
          if (filterData.length) {
            result.push({
              ...item,
              children: filterData
            })
          }
        }
      })
      return result
    }
    return loop(deptList.value)
  }

  const treeData = computed(() => {
    if (!searchKey.value) return deptList.value
    return filterTree(searchKey.value.toLowerCase())
  })

  onMounted(() => {
    getDeptList()
  })
</script>

<style scoped lang="scss">
  // // Element Plus Tree 样式定制
  // :deep(.el-tree-node__content) {
  //   height: 36px;
  //   line-height: 36px;
  //   border-radius: 6px;
  //   transition: all 0.2s;1

  //   &:hover {
  //     background-color: var(--el-fill-color-light);
  //   }
  // }

  // :deep(.el-tree-node.is-current > .el-tree-node__content) {
  //   font-weight: 600;
  //   background-color: var(--el-color-primary-light-9);
  //   color: var(--el-color-primary);

  //   &:hover {
  //     background-color: var(--el-color-primary-light-9);
  //   }
  // }

  // :deep(.el-tree-node__expand-icon) {
  //   font-size: 14px;
  //   color: var(--el-text-color-secondary);
  // }

  // .container {
  //   flex: 1;
  //   overflow: hidden;
  //   position: relative;
  //   display: flex;
  //   flex-direction: column;
  //   box-sizing: border-box;
  //   height: 100%;

  //   .search {
  //     margin-bottom: 16px;
  //   }

  //   .tree-wrapper {
  //     flex: 1;
  //     overflow: hidden;
  //     background-color: var(--el-bg-color);
  //     position: relative;
  //     height: 100%;
  //     border-radius: 6px;
  //     border: 1px solid var(--el-border-color-lighter);

  //     .tree {
  //       position: absolute;
  //       top: 0;
  //       bottom: 0;
  //       left: 0;
  //       right: 0;
  //       overflow: auto;
  //       padding: 8px;
  //     }
  //   }
  // }

  // .custom-tree-node {
  //   flex: 1;
  //   display: flex;
  //   align-items: center;
  //   justify-content: space-between;
  //   font-size: 14px;
  //   padding-right: 8px;

  //   .node-label {
  //     overflow: hidden;
  //     text-overflow: ellipsis;
  //     white-space: nowrap;
  //   }
  // }
</style>
