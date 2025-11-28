<template>
  <div class="gi-tree-container">
    <!-- 搜索输入框 -->
    <div v-if="searchable" class="mb-4">
      <ElInput
        v-model="filterText"
        :placeholder="t('components.tree.searchPlaceholder')"
        clearable
        class="w-full"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </div>

    <!-- 树形组件 -->
    <ElTree
      ref="treeRef"
      v-loading="loading"
      :data="treeData"
      :node-key="String(keyField)"
      :props="treeProps"
      :show-checkbox="showCheckbox || multiple"
      :check-strictly="checkStrictly"
      :default-expand-all="expandAll"
      :default-expanded-keys="defaultExpandedKeys"
      :default-checked-keys="defaultCheckedKeys"
      :lazy="lazy"
      :load="handleLazyLoad"
      :filter-node-method="filterNode"
      :highlight-current="!multiple"
      v-bind="$attrs"
      class="w-full overflow-auto"
      @node-click="handleNodeClick"
      @check="handleCheck"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义节点内容插槽 -->
      <template #default="{ node, data }">
        <slot name="node" :node="node" :data="data">
          <span class="flex-1 truncate">{{ data[labelField] }}</span>
        </slot>
      </template>
    </ElTree>

    <!-- 空状态 -->
    <div v-if="!loading && treeData.length === 0" class="text-center py-8 text-gray-400">
      {{ t('components.tree.noData') }}
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
  import { Search } from '@element-plus/icons-vue'
  import { ElIcon, ElInput, ElMessage, ElTree } from 'element-plus'
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { GiTreeEmits, GiTreeProps } from './types'

  defineOptions({
    name: 'GiTree',
    inheritAttrs: false
  })

  const props = withDefaults(defineProps<GiTreeProps<T>>(), {
    data: () => [],
    multiple: false,
    checkStrictly: false,
    expandAll: false,
    searchable: true,
    lazy: false,
    showCheckbox: false,
    defaultExpandedKeys: () => [],
    defaultCheckedKeys: () => []
  })

  const emit = defineEmits<GiTreeEmits<T>>()

  const { t } = useI18n()

  // 树形组件引用
  const treeRef = ref()

  // 本地状态
  const treeData = ref<T[]>(props.data || [])
  const loading = ref(false)
  const filterText = ref('')

  // 树形组件属性配置
  const treeProps = {
    children: 'children',
    label: String(props.labelField),
    isLeaf: 'isLeaf',
    disabled: 'disabled'
  }

  /**
   * 加载树形数据
   */
  const loadData = async () => {
    if (!props.fetchData) {
      treeData.value = props.data || []
      return
    }

    loading.value = true
    try {
      const data = await props.fetchData()
      treeData.value = data
      emit('loadSuccess', data)
    } catch (error) {
      console.error('[GiTree] Failed to load data:', error)
      ElMessage.error(t('components.tree.loadError'))
      emit('loadError', error)
      treeData.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理树形节点的懒加载
   */
  const handleLazyLoad = async (node: any, resolve: (data: T[]) => void) => {
    if (!props.fetchData) {
      resolve([])
      return
    }

    try {
      const data = await props.fetchData(node.data)
      resolve(data)
      emit('loadSuccess', data)
    } catch (error) {
      console.error('[GiTree] Failed to lazy load node:', error)
      ElMessage.error(t('components.tree.loadError'))
      emit('loadError', error)
      resolve([])
    }
  }

  /**
   * 过滤树形节点
   */
  const filterNode = (value: string, data: any) => {
    if (!value) return true
    const label = String(data[props.labelField])
    return label.toLowerCase().includes(value.toLowerCase())
  }

  /**
   * 处理节点点击
   */
  const handleNodeClick = (data: T) => {
    emit('nodeClick', data)
    if (!props.multiple) {
      emit('select', data)
    }
  }

  /**
   * 处理复选框变化（多选）
   */
  const handleCheck = () => {
    if (props.multiple) {
      const checkedNodes = treeRef.value?.getCheckedNodes() || []
      emit('check', checkedNodes)
    }
  }

  /**
   * 处理当前节点变化（单选）
   */
  const handleCurrentChange = (data: T) => {
    if (!props.multiple && data) {
      emit('select', data)
    }
  }

  /**
   * 获取选中的节点
   */
  const getCheckedNodes = () => {
    return treeRef.value?.getCheckedNodes() || []
  }

  /**
   * 获取选中的键
   */
  const getCheckedKeys = () => {
    return treeRef.value?.getCheckedKeys() || []
  }

  /**
   * 设置选中的节点
   */
  const setCheckedNodes = (nodes: T[]) => {
    treeRef.value?.setCheckedNodes(nodes)
  }

  /**
   * 设置选中的键
   */
  const setCheckedKeys = (keys: any[]) => {
    treeRef.value?.setCheckedKeys(keys)
  }

  /**
   * 获取当前节点
   */
  const getCurrentNode = () => {
    return treeRef.value?.getCurrentNode()
  }

  /**
   * 设置当前节点
   */
  const setCurrentNode = (node: T) => {
    treeRef.value?.setCurrentNode(node)
  }

  /**
   * 暴露方法
   */
  defineExpose({
    loadData,
    refresh: loadData,
    getCheckedNodes,
    getCheckedKeys,
    setCheckedNodes,
    setCheckedKeys,
    getCurrentNode,
    setCurrentNode,
    treeRef
  })

  // 监听过滤文本
  watch(filterText, (val) => {
    treeRef.value?.filter(val)
  })

  // 监听数据属性
  watch(
    () => props.data,
    (newData) => {
      if (newData) {
        treeData.value = newData
      }
    },
    { deep: true }
  )

  // 如果提供了 fetchData，在挂载时加载数据
  onMounted(() => {
    if (props.fetchData && !props.lazy) {
      loadData()
    }
  })
</script>
