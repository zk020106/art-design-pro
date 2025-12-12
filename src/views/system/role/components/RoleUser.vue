<template>
  <div class="role-user-container">
    <!-- 搜索区域 -->
    <div class="role-user-header">
      <CaForm
        v-model="searchForm"
        :columns="searchColumns"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #action>
          <ElButton type="primary" @click="handleAssign">
            <template #icon>
              <ElIcon><Plus /></ElIcon>
            </template>
            分配用户
          </ElButton>
          <ElButton type="danger" :disabled="selectedIds.length === 0" @click="handleBatchUnassign">
            <template #icon>
              <ElIcon><Delete /></ElIcon>
            </template>
            批量移除
          </ElButton>
        </template>
      </CaForm>
    </div>

    <!-- 表格区域 -->
    <div class="role-user-content">
      <CaTable
        ref="tableRef"
        v-model:selectedIds="selectedIds"
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @refresh="handleRefresh"
      >
        <template #status="{ row }">
          <ElTag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </ElTag>
        </template>

        <template #gender="{ row }">
          <span>{{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}</span>
        </template>

        <template #roleNames="{ row }">
          <ElTag v-for="role in row.roleNames" :key="role" size="small" style="margin-right: 4px">
            {{ role }}
          </ElTag>
        </template>

        <template #action="{ row }">
          <ElButton
            type="danger"
            size="small"
            link
            :disabled="row.disabled"
            :title="row.disabled ? '该用户为系统内置用户不能取消分配' : ''"
            @click="handleUnassign(row)"
          >
            取消分配
          </ElButton>
        </template>
      </CaTable>
    </div>

    <!-- 分配用户弹窗 -->
    <AssignModal ref="assignModalRef" @save-success="handleAssignSuccess" />
  </div>
</template>

<script setup lang="ts">
  import type { RoleUserResp } from '@/apis/system/role'
  import { listRoleUser, unassignFromUsers } from '@/apis/system/role'
  import CaForm from '@/components/base/CaForm/index.vue'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import CaTable from '@/components/base/CaTable/index.vue'
  import { useResetReactive } from '@/hooks'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  // import { useI18n } from 'vue-i18n'
  import AssignModal from '../AssignModal.vue'

  defineOptions({ name: 'RoleUser' })

  const props = defineProps<{
    roleId: string
  }>()

  // const { t } = useI18n()
  const tableRef = ref()
  const assignModalRef = ref()
  const tableData = ref<RoleUserResp[]>([])
  const selectedIds = ref<string[]>([])
  const loading = ref(false)

  // 搜索表单
  const [searchForm, resetSearchForm] = useResetReactive({
    nickname: '',
    username: '',
    description: ''
  })

  // 搜索列配置
  const searchColumns: FormColumnItem[] = [
    {
      label: '昵称',
      field: 'nickname',
      type: 'input',
      span: 6,
      props: {
        placeholder: '请输入昵称',
        clearable: true
      }
    },
    {
      label: '用户名',
      field: 'username',
      type: 'input',
      span: 6,
      props: {
        placeholder: '请输入用户名',
        clearable: true
      }
    },
    {
      label: '描述',
      field: 'description',
      type: 'input',
      span: 6,
      props: {
        placeholder: '请输入描述',
        clearable: true
      }
    }
  ]

  // 表格列配置
  const columns = [
    {
      type: 'selection',
      width: 55,
      align: 'center'
    },
    {
      prop: 'nickname',
      label: '昵称',
      width: 130,
      showOverflowTooltip: true,
      fixed: 'left'
    },
    {
      prop: 'username',
      label: '用户名',
      width: 120,
      showOverflowTooltip: true
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      slot: 'status'
    },
    {
      prop: 'gender',
      label: '性别',
      width: 80,
      align: 'center',
      slot: 'gender'
    },
    {
      prop: 'deptName',
      label: '所属部门',
      width: 140,
      showOverflowTooltip: true
    },
    {
      prop: 'roleNames',
      label: '角色',
      width: 180,
      slot: 'roleNames'
    },
    {
      prop: 'description',
      label: '描述',
      width: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'action',
      label: '操作',
      width: 100,
      align: 'center',
      fixed: 'right',
      slot: 'action'
    }
  ]

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 50, 100]
  })

  // 获取角色用户列表
  const getRoleUserList = async () => {
    if (!props.roleId) {
      tableData.value = []
      pagination.total = 0
      return
    }

    loading.value = true
    try {
      const query = {
        ...searchForm,
        sort: ['t1.id,desc'],
        current: pagination.current,
        size: pagination.pageSize
      }
      listRoleUser(props.roleId, query).then(({ data, total }) => {
        console.log('111', data, total)

        tableData.value = data
        pagination.total = total
      })
    } catch (error) {
      console.error('获取角色用户列表失败:', error)
      ElMessage.error('获取角色用户列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.current = 1
    getRoleUserList()
  }

  // 重置搜索
  const handleReset = () => {
    resetSearchForm()
    pagination.current = 1
    getRoleUserList()
  }

  // 分配用户
  const handleAssign = () => {
    if (!props.roleId) {
      ElMessage.warning('请先选择角色')
      return
    }
    assignModalRef.value?.onOpen(props.roleId)
  }

  // 批量移除用户
  const handleBatchUnassign = async () => {
    if (selectedIds.value.length === 0) {
      ElMessage.warning('请选择要移除的用户')
      return
    }

    try {
      await ElMessageBox.confirm(`确认移除选中的 ${selectedIds.value.length} 个用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await unassignFromUsers(selectedIds.value)

      ElMessage.success('移除成功')
      selectedIds.value = []
      getRoleUserList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量移除用户失败:', error)
        ElMessage.error('移除失败')
      }
    }
  }

  // 移除单个用户
  const handleUnassign = async (row: RoleUserResp) => {
    if (row.disabled) {
      return
    }

    try {
      await ElMessageBox.confirm(`确认移除用户"${row.nickname}(${row.username})"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await unassignFromUsers([row.id])

      ElMessage.success('移除成功')
      getRoleUserList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('移除用户失败:', error)
        ElMessage.error('移除失败')
      }
    }
  }

  // 选择变化
  const handleSelectionChange = (selection: RoleUserResp[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  // 分页大小变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.current = 1
    getRoleUserList()
  }

  // 当前页变化
  const handleCurrentChange = (current: number) => {
    pagination.current = current
    getRoleUserList()
  }

  // 刷新
  const handleRefresh = () => {
    getRoleUserList()
  }

  // 分配成功回调
  const handleAssignSuccess = () => {
    getRoleUserList()
  }

  // 监听角色ID变化
  watch(
    () => props.roleId,
    () => {
      pagination.current = 1
      selectedIds.value = []
      getRoleUserList()
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .role-user-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 4px;

    &-header {
      margin-bottom: 16px;
    }

    &-content {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
  }
</style>
