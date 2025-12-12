<template>
  <div class="permission-container">
    <div class="permission-header">
      <ElButton type="primary" :disabled="disabled" @click="save">
        <template #icon>
          <ElIcon><Check /></ElIcon>
        </template>
        保存权限
      </ElButton>

      <div class="permission-controls">
        <ElRadioGroup v-model="isCascade" :disabled="disabled">
          <ElRadioButton :value="true">节点关联</ElRadioButton>
          <ElRadioButton :value="false">节点独立</ElRadioButton>
        </ElRadioGroup>

        <ElButton @click="onExpanded">
          <template #icon>
            <ElIcon><component :is="isExpanded ? 'Fold' : 'Expand'" /></ElIcon>
          </template>
          {{ isExpanded ? '折叠' : '展开' }}
        </ElButton>
      </div>
    </div>

    <div class="permission-content">
      <ElScrollbar height="calc(100vh - 240px)">
        <ElTree
          ref="treeRef"
          :data="menuTree"
          :props="treeProps"
          :default-checked-keys="checkedKeys"
          :default-expand-all="isExpanded"
          :check-strictly="!isCascade"
          :show-checkbox="!disabled"
          node-key="id"
          class="permission-tree"
          @check="handleCheck"
        >
          <template #default="{ node, data }">
            <div class="permission-node">
              <div class="permission-node-info">
                <ElIcon v-if="data.icon" class="permission-node-icon">
                  <component :is="data.icon" />
                </ElIcon>
                <span class="permission-node-label">{{ node.label }}</span>
                <ElTag v-if="data.type === 'button'" size="small" type="info"> 按钮 </ElTag>
              </div>

              <!-- 权限按钮组 -->
              <div
                v-if="data.type === 'menu' && data.permissions?.length"
                class="permission-node-actions"
              >
                <ElCheckboxGroup
                  v-model="data.checkedPermissions"
                  :disabled="disabled"
                  @change="(val) => handlePermissionChange(data, val)"
                >
                  <ElCheckbox
                    v-for="permission in data.permissions"
                    :key="permission.id"
                    :value="permission.id"
                    :label="permission.title"
                  />
                </ElCheckboxGroup>
              </div>
            </div>
          </template>
        </ElTree>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { RolePermissionResp } from '@/apis/system/role'
  import { getRole, listRolePermissionTree, updateRolePermission } from '@/apis/system/role'
  import { Check } from '@element-plus/icons-vue'
  import { ElMessage, ElTree } from 'element-plus'

  defineOptions({ name: 'Permission' })

  const props = defineProps<{
    roleId: string
  }>()

  const treeRef = ref<InstanceType<typeof ElTree>>()
  const menuTree = ref<RolePermissionResp[]>([])
  const checkedKeys = ref<string[]>([])
  const isCascade = ref(true)
  const isExpanded = ref(true)
  const disabled = ref(false)

  // 树形配置
  const treeProps = {
    label: 'title',
    children: 'children'
  }

  // 获取菜单权限树
  const getMenuTree = async () => {
    try {
      const data = await listRolePermissionTree()
      console.log(data)

      menuTree.value = transformMenu(data)
    } catch (error) {
      console.error('获取菜单树失败:', error)
      ElMessage.error('获取菜单树失败')
    }
  }

  // 转换菜单数据
  const transformMenu = (menus: RolePermissionResp[]): RolePermissionResp[] => {
    return menus.map((item) => {
      const transformed = { ...item }

      if (item.children && item.children.length > 0) {
        // 分离权限项和子菜单
        const permissions = item.children.filter((child) => child.type === 'button')
        const children = item.children.filter((child) => child.type !== 'button')

        if (permissions.length > 0) {
          ;(transformed as any).permissions = permissions
        }

        if (children.length > 0) {
          transformed.children = transformMenu(children)
        } else {
          delete transformed.children
        }
      }

      return transformed
    })
  }

  // 获取角色权限
  const getRolePermissions = async () => {
    if (!props.roleId) return

    try {
      const { data } = await getRole(props.roleId)
      checkedKeys.value = data.menuIds?.map((id) => String(id)) || []
      isCascade.value = data.menuCheckStrictly ?? true

      // 处理权限按钮的选中状态
      updatePermissionCheckedState(menuTree.value, checkedKeys.value)
    } catch (error) {
      console.error('获取角色权限失败:', error)
    }
  }

  // 更新权限按钮选中状态
  const updatePermissionCheckedState = (tree: RolePermissionResp[], checkedIds: string[]) => {
    tree.forEach((item) => {
      if (item.permissions) {
        ;(item as any).checkedPermissions = item.permissions
          .filter((p) => checkedIds.includes(p.id))
          .map((p) => p.id)
      }

      if (item.children) {
        updatePermissionCheckedState(item.children, checkedIds)
      }
    })
  }

  // 展开/折叠
  const onExpanded = () => {
    isExpanded.value = !isExpanded.value
    const allKeys = getAllNodeKeys(menuTree.value)
    if (isExpanded.value) {
      allKeys.forEach((key) => {
        treeRef.value?.store.nodesMap[key]?.expand()
      })
    } else {
      allKeys.forEach((key) => {
        treeRef.value?.store.nodesMap[key]?.collapse()
      })
    }
  }

  // 获取所有节点key
  const getAllNodeKeys = (tree: RolePermissionResp[]): string[] => {
    const keys: string[] = []
    tree.forEach((item) => {
      keys.push(item.id)
      if (item.children) {
        keys.push(...getAllNodeKeys(item.children))
      }
    })
    return keys
  }

  // 处理树节点选中
  const handleCheck = (data: any, checkState: any) => {
    // 如果启用了节点关联，同步更新权限按钮状态
    if (isCascade.value && data.permissions) {
      if (checkState.checkedKeys.includes(data.id)) {
        // 选中菜单，选中所有权限
        ;(data as any).checkedPermissions = data.permissions.map((p: any) => p.id)
      } else {
        // 取消选中菜单，清空权限
        ;(data as any).checkedPermissions = []
      }
    }
  }

  // 处理权限按钮变化
  const handlePermissionChange = (node: any, checkedValues: string[]) => {
    if (!isCascade.value) return

    // 根据权限选中状态更新菜单节点
    if (checkedValues.length > 0 && !checkedKeys.value.includes(node.id)) {
      // 有权限被选中，但菜单未选中，则选中菜单
      checkedKeys.value.push(node.id)
    } else if (checkedValues.length === 0 && checkedKeys.value.includes(node.id)) {
      // 所有权限都取消选中，移除菜单选中
      const index = checkedKeys.value.indexOf(node.id)
      if (index > -1) {
        checkedKeys.value.splice(index, 1)
      }
    }
  }

  // 获取所有选中的权限ID
  const getAllCheckedPermissions = (): string[] => {
    const permissions: string[] = []

    const collectPermissions = (tree: RolePermissionResp[]) => {
      tree.forEach((item) => {
        if ((item as any).checkedPermissions) {
          permissions.push(...(item as any).checkedPermissions)
        }
        if (item.children) {
          collectPermissions(item.children)
        }
      })
    }

    collectPermissions(menuTree.value)
    return [...new Set(permissions)]
  }

  // 保存权限
  const save = async () => {
    if (!props.roleId) {
      ElMessage.warning('请先选择角色')
      return
    }

    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
    const permissionIds = getAllCheckedPermissions()
    const allCheckedIds = [...checkedKeys, ...halfCheckedKeys, ...permissionIds]

    try {
      await updateRolePermission(props.roleId, {
        menuIds: allCheckedIds.map((id) => Number(id)),
        menuCheckStrictly: isCascade.value
      })

      ElMessage.success('保存成功')
    } catch (error) {
      console.error('保存角色权限失败:', error)
      ElMessage.error('保存失败')
    }
  }

  // 监听角色ID变化
  watch(
    () => props.roleId,
    async (val) => {
      if (val) {
        await getRolePermissions()
      } else {
        checkedKeys.value = []
        disabled.value = false
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    getMenuTree()
  })
</script>

<style scoped lang="scss">
  .permission-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 4px;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    &-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    &-content {
      flex: 1;
    }

    .permission-tree {
      :deep(.el-tree-node__content) {
        height: auto;
        min-height: 40px;
        padding: 8px 0;

        &:hover {
          background-color: var(--el-fill-color-light);
        }
      }

      :deep(.el-tree-node__expand-icon) {
        padding: 6px;
      }
    }

    .permission-node {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      padding-right: 8px;

      &-info {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      &-icon {
        font-size: 16px;
        color: var(--el-text-color-regular);
      }

      &-label {
        font-size: 14px;
        font-weight: 500;
      }

      &-actions {
        display: flex;
        gap: 12px;
      }
    }

    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    :deep(.el-checkbox) {
      margin-right: 0;
    }
  }
</style>
