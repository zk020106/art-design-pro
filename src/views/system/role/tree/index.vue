<template>
  <div class="container">
    <div class="search">
      <ElInput v-model="searchKey" placeholder="搜索名称/编码" clearable>
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
      <ElButton type="primary" @click="onAdd">
        <template #icon>
          <ElIcon><Plus /></ElIcon>
        </template>
      </ElButton>
    </div>
    <div class="tree-wrapper">
      <div class="tree">
        <ElTree
          ref="treeRef"
          :data="treeData as unknown as any[]"
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          :default-expanded-keys="expandedKeys"
          @node-click="select"
        >
          <template #default="{ data }">
            <div class="tree-node">
              <ElTooltip :content="`${data.name} (${data.code})`" placement="top">
                <span class="tree-node-label"> {{ data.name }} ({{ data.code }}) </span>
              </ElTooltip>
              <ElDropdown
                v-auth="['system:role:update', 'system:role:delete']"
                trigger="click"
                @command="(command) => onMenuItemClick(command, data)"
              >
                <ElIcon class="action"><MoreFilled /></ElIcon>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem v-auth="'system:role:update'" command="update">
                      修改
                    </ElDropdownItem>
                    <ElDropdownItem
                      v-auth="'system:role:delete'"
                      command="delete"
                      :disabled="data.isSystem"
                    >
                      <span class="danger">删除</span>
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>
          </template>
        </ElTree>
      </div>
    </div>

    <AddDrawer ref="AddDrawerRef" @save-success="getTreeData" />
  </div>
</template>

<script setup lang="ts">
  import { type RoleResp, deleteRole, listRole } from '@/apis/system/role'
  import { MoreFilled, Plus, Search } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { mapTree } from 'xe-utils'
  import AddDrawer from '../AddDrawer.vue'

  const emit = defineEmits<{
    (e: 'node-click', keys: Array<any>): void
  }>()

  const treeRef = ref()
  const selectedKeys = ref()
  const expandedKeys = ref<string[]>([])

  // 选中节点
  const select = (data: any) => {
    if (selectedKeys.value && selectedKeys.value[0] === data.id) {
      return
    }
    selectedKeys.value = [data.id]
    emit('node-click', [data.id])
  }

  interface TreeItem extends RoleResp {
    popupVisible: boolean
  }
  const dataList = ref<TreeItem[]>([])
  const loading = ref(false)

  // 查询树列表
  const getTreeData = async () => {
    try {
      loading.value = true
      const data = await listRole({ sort: ['sort,asc'] })
      dataList.value = mapTree(data, (i) => ({
        ...i,
        popupVisible: false
      }))

      // 展开所有节点
      const getAllNodeIds = (items: TreeItem[]): string[] => {
        const ids: string[] = []
        items.forEach((item) => {
          ids.push(item.id)
          if (item.children && item.children.length > 0) {
            ids.push(...getAllNodeIds(item.children as TreeItem[]))
          }
        })
        return ids
      }
      expandedKeys.value = getAllNodeIds(dataList.value)

      await nextTick(() => {
        if (dataList.value.length > 0) {
          select([dataList.value[0]?.id])
        }
      })
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 过滤树
  const searchKey = ref('')
  const search = (keyword: string) => {
    const loop = (data: TreeItem[]) => {
      const result = [] as TreeItem[]
      data.forEach((item: TreeItem) => {
        if (
          item.name?.toLowerCase().includes(keyword) ||
          item.code?.toLowerCase().includes(keyword)
        ) {
          result.push({ ...item })
        }
      })
      return result
    }
    return loop(dataList.value)
  }

  const treeData = computed(() => {
    if (!searchKey.value) return dataList.value
    return search(searchKey.value.toLowerCase())
  })

  const AddDrawerRef = ref<InstanceType<typeof AddDrawer>>()
  // 新增
  const onAdd = () => {
    AddDrawerRef.value?.onAdd()
  }

  // 点击菜单项
  const onMenuItemClick = async (command: string, node: RoleResp) => {
    if (command === 'update') {
      AddDrawerRef.value?.onUpdate(node.id)
    } else if (command === 'delete') {
      try {
        await ElMessageBox.confirm(`是否确定删除角色「${node.name}」？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await deleteRole(node.id)
        if (res.success) {
          ElMessage.success('删除成功')
          await getTreeData()
        }
      } catch {
        // 用户取消或其他错误
      }
    }
  }

  onMounted(() => {
    getTreeData()
  })
</script>

<style scoped lang="scss">
  :deep(.el-tree-node) {
    margin: 5px 0;
    line-height: normal;
    border-radius: var(--el-border-radius-base);

    .action {
      padding: 4px;
      margin-right: 8px;
      cursor: pointer;
      border-radius: 8px;
      opacity: 0;
      transition: all 0.25s;

      &:hover {
        background-color: var(--el-fill-color);
      }
    }

    &:hover {
      background-color: var(--el-fill-color-light);

      .action {
        opacity: 1;
      }
    }

    .el-tree-node__expand-icon {
      padding: 6px;
    }
  }

  :deep(.el-tree-node.is-current) {
    font-weight: bold;

    .action {
      opacity: 1;
    }
  }

  .container {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .search {
      display: flex;
      justify-content: start;
      margin-bottom: 10px;

      .el-button {
        padding: 0 15px;
        margin-left: 8px;
      }
    }

    .tree-wrapper {
      position: relative;
      flex: 1;
      height: 100%;
      overflow: hidden;
      background-color: var(--el-bg-color);

      .tree {
        position: absolute;
        inset: 0;
        overflow: auto;
      }
    }
  }

  .tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 8px;

    &-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .danger {
    color: var(--el-color-danger);
  }
</style>
