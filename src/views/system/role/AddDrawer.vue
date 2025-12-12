<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 500 ? 500 : '100%'"
    @close="reset"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" size="default">
      <!-- 基础信息 -->
      <ElCard class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基础信息</span>
          </div>
        </template>

        <ElFormItem label="角色名称" prop="name">
          <ElInput
            v-model="form.name"
            placeholder="请输入角色名称"
            maxlength="30"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="角色编码" prop="code">
          <ElInput
            v-model="form.code"
            placeholder="请输入角色编码"
            maxlength="30"
            show-word-limit
            :disabled="isUpdate"
          />
        </ElFormItem>

        <ElFormItem label="排序" prop="sort">
          <ElInputNumber
            v-model="form.sort"
            placeholder="请输入排序"
            :min="0"
            :max="999"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>

        <ElFormItem label="状态" prop="status">
          <ElRadioGroup v-model="form.status">
            <ElRadio :label="1">启用</ElRadio>
            <ElRadio :label="0">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="备注" prop="remark">
          <ElInput
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
            :rows="3"
            resize="none"
          />
        </ElFormItem>
      </ElCard>

      <!-- 数据权限 -->
      <ElCard class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>数据权限</span>
          </div>
        </template>

        <ElFormItem label="数据权限" prop="dataScope">
          <ElSelect
            v-model="form.dataScope"
            placeholder="请选择数据权限"
            :disabled="form.isSystem"
            style="width: 100%"
          >
            <ElOption label="全部数据权限" :value="1" />
            <ElOption label="自定义数据权限" :value="2" />
            <ElOption label="本部门数据权限" :value="3" />
            <ElOption label="本部门及以下数据权限" :value="4" />
            <ElOption label="仅本人数据权限" :value="5" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem v-if="form.dataScope === 2" label="部门权限">
          <div class="dept-tree-container">
            <div class="dept-tree-actions">
              <ElCheckbox v-model="isDeptExpanded" @change="handleDeptExpand">
                展开/折叠
              </ElCheckbox>
              <ElCheckbox v-model="isDeptCheckAll" @change="handleDeptCheckAll">
                全选/全不选
              </ElCheckbox>
              <ElCheckbox v-model="form.deptCheckStrictly"> 父子联动 </ElCheckbox>
            </div>

            <ElTree
              ref="deptTreeRef"
              :data="deptList"
              :default-expand-all="isDeptExpanded"
              :check-strictly="!form.deptCheckStrictly"
              :props="{ label: 'name', children: 'children' }"
              show-checkbox
              node-key="id"
              class="dept-tree"
            />
          </div>
        </ElFormItem>
      </ElCard>
    </ElForm>

    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave"> 确定 </ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage, ElForm } from 'element-plus'
  import { useWindowSize } from '@vueuse/core'
  import { useResetReactive } from '@/hooks'
  import { useDept } from '@/hooks/business'
  import { addRole, getRole, updateRole } from '@/apis/system/role'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()

  const dataId = ref('')
  const visible = ref(false)
  const saving = ref(false)
  const isUpdate = computed(() => !!dataId.value)
  const title = computed(() => (isUpdate.value ? '修改角色' : '新增角色'))
  const formRef = useTemplateRef('formRef')
  const { deptList, getDeptList } = useDept()

  // 表单验证规则
  const rules = reactive({
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
    dataScope: [{ required: true, message: '请选择数据权限', trigger: 'change' }]
  })

  // 表单数据
  const [form, resetForm] = useResetReactive({
    name: '',
    code: '',
    sort: 0,
    status: 1,
    remark: '',
    dataScope: 4,
    deptCheckStrictly: true,
    isSystem: false
  })

  const deptTreeRef = ref()
  const isDeptExpanded = ref(true)
  const isDeptCheckAll = ref(false)

  // 重置表单
  const reset = () => {
    saving.value = false
    isDeptExpanded.value = true
    isDeptCheckAll.value = false
    resetForm()
    nextTick(() => {
      formRef.value?.resetFields()
      deptTreeRef.value?.setCheckedKeys([])
    })
  }

  // 展开/折叠部门树
  const handleDeptExpand = () => {
    const allKeys = getAllDeptKeys(deptList.value)
    if (isDeptExpanded.value) {
      allKeys.forEach((key) => {
        deptTreeRef.value?.store.nodesMap[key]?.expand()
      })
    } else {
      allKeys.forEach((key) => {
        deptTreeRef.value?.store.nodesMap[key]?.collapse()
      })
    }
  }

  // 全选/全不选部门
  const handleDeptCheckAll = () => {
    if (isDeptCheckAll.value) {
      const allKeys = getAllDeptKeys(deptList.value)
      deptTreeRef.value?.setCheckedKeys(allKeys)
    } else {
      deptTreeRef.value?.setCheckedKeys([])
    }
  }

  // 获取所有部门ID
  const getAllDeptKeys = (depts: any[]): string[] => {
    const keys: string[] = []
    depts.forEach((dept) => {
      keys.push(dept.id)
      if (dept.children && dept.children.length > 0) {
        keys.push(...getAllDeptKeys(dept.children))
      }
    })
    return keys
  }

  // 获取选中的部门
  const getCheckedDeptKeys = (): string[] => {
    if (!deptTreeRef.value) return []

    const checkedKeys = deptTreeRef.value.getCheckedKeys() as string[]
    const halfCheckedKeys = deptTreeRef.value.getHalfCheckedKeys() as string[]
    return [...checkedKeys, ...halfCheckedKeys]
  }

  // 保存
  const handleSave = async () => {
    if (saving.value) return

    try {
      const valid = await formRef.value?.validate()
      if (!valid) return

      saving.value = true

      const params = { ...form }
      if (form.dataScope === 2) {
        params.deptIds = getCheckedDeptKeys()
      }

      if (isUpdate.value) {
        await updateRole(dataId.value, params)
        ElMessage.success('修改成功')
      } else {
        await addRole(params)
        ElMessage.success('新增成功')
      }

      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('保存角色失败:', error)
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  }

  // 新增
  const onAdd = async () => {
    reset()
    if (deptList.value.length === 0) {
      await getDeptList()
    }
    dataId.value = ''
    visible.value = true
  }

  // 修改
  const onUpdate = async (id: string) => {
    reset()
    if (deptList.value.length === 0) {
      await getDeptList()
    }

    dataId.value = id
    try {
      const { data } = await getRole(id)
      Object.assign(form, data)

      // 如果有部门权限，设置选中的部门
      if (data.deptIds && data.deptIds.length > 0) {
        nextTick(() => {
          deptTreeRef.value?.setCheckedKeys(data.deptIds)
        })
      }
    } catch (error) {
      console.error('获取角色详情失败:', error)
      ElMessage.error('获取角色信息失败')
    }

    visible.value = true
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss">
  .form-card {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .card-header {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 0 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .dept-tree-container {
    width: 100%;
    padding: 12px;
    background-color: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);

    &-actions {
      display: flex;
      gap: 16px;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }

  .dept-tree {
    max-height: 300px;
    overflow-y: auto;

    :deep(.el-tree-node__content) {
      height: 32px;
    }
  }
</style>
