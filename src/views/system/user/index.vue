<template>
  <GiPageLayout>
    <template #left>
      <DeptTree @node-click="handleSelectDept" />
    </template>
    <GiTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1500 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['nickname']"
      @refresh="search"
    >
      <template #top>
        <GiForm
          v-model="queryForm"
          search
          :columns="queryFormColumns"
          @search="search"
          @reset="reset"
        />
      </template>
      <template #toolbar-left>
        <ElButton type="primary" @click="onAdd">
          <ElIcon><Plus /></ElIcon>
          新增
        </ElButton>
        <ElButton @click="onImport">
          <ElIcon><Upload /></ElIcon>
          导入
        </ElButton>
      </template>
      <template #toolbar-right>
        <ElButton @click="onExport">
          <ElIcon><Download /></ElIcon>
          导出
        </ElButton>
      </template>
      <template #nickname="{ row }">
        <CaAvatar fit="cover" :src="row.avatar" :name="row.nickname" />
      </template>
      <template #gender="{ row }">
        <CaCellGender :gender="row.gender" />
      </template>
      <template #roleNames="{ row }">
        <CaCellTags :data="row.roleNames" />
      </template>
      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>
      <template #isSystem="{ row }">
        <ElTag v-if="row.isSystem" type="danger" size="small">是</ElTag>
        <ElTag v-else type="primary" size="small">否</ElTag>
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElLink type="primary" @click="onDetail(row)">详情</ElLink>
          <ElLink type="primary" @click="onUpdate(row)">修改</ElLink>
          <ElDropdown>
            <ElButton text>
              <ElIcon><MoreFilled /></ElIcon>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem @click="onResetPwd(row)">重置密码</ElDropdownItem>
                <ElDropdownItem :disabled="row.isSystem" @click="onUpdateRole(row)">
                  分配角色
                </ElDropdownItem>
                <ElDropdownItem :disabled="row.isSystem" @click="onDelete(row)">
                  <ElLink type="danger" :disabled="row.isSystem" :underline="false"> 删除 </ElLink>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
      </template>
    </GiTable>

    <AddDrawer ref="AddDrawerRef" @save-success="search" />
    <ImportDrawer ref="ImportDrawerRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
    <PwdResetModal ref="PwdResetModalRef" />
    <RoleUpdateModal ref="RoleUpdateModalRef" @save-success="search" />
  </GiPageLayout>
</template>

<script setup lang="ts">
  import { UserQuery, UserResp } from '@/apis'
  import { exportUser, listUser } from '@/apis/system/user'
  import { DisEnableStatusList } from '@/constant/common'
  import { useDevice, useDownload, useResetReactive, useTable } from '@/hooks'
  import { DeptDictTreeNode } from '@/types/api/system'
  import { Download, MoreFilled, Plus, Upload } from '@element-plus/icons-vue'
  import { FormColumnItem, TableColumnItem } from 'gi-component'
  import AddDrawer from './AddDrawer.vue'
  import DeptTree from './dept/index.vue'
  import DetailDrawer from './DetailDrawer.vue'
  import ImportDrawer from './ImportDrawer.vue'
  import PwdResetModal from './PwdResetModal.vue'
  import RoleUpdateModal from './RoleUpdateModal.vue'

  defineOptions({ name: 'SystemUser' })

  const { isMobile } = useDevice()

  const [queryForm, resetForm] = useResetReactive<UserQuery>({
    sort: ['t1.id,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: '用户名',
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: '用户名/昵称/描述'
          }
        },
        {
          type: 'select',
          label: '状态',
          field: 'status',
          gridItemProps: { span: { xs: 24, sm: 6, xxl: 8 } },
          props: {
            options: DisEnableStatusList,
            placeholder: '请选择状态'
          }
        },
        {
          type: 'date-picker',
          label: '创建时间',
          field: 'createTime',
          gridItemProps: { span: { xs: 24, sm: 10, xxl: 8 } },
          props: {
            type: 'daterange'
          }
        }
      ] as FormColumnItem<UserQuery>[]
  )

  const { tableData, loading, pagination, search } = useTable<UserResp>(
    (page) => listUser({ ...queryForm, ...page }),
    { immediate: false }
  )

  const columns: TableColumnItem[] = [
    {
      label: '序号',
      width: 66,
      align: 'center',
      render: ({ $index }) =>
        h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
      fixed: !isMobile.value ? 'left' : false
    },
    {
      label: '昵称',
      prop: 'nickname',
      slotName: 'nickname',
      minWidth: 140,
      showOverflowTooltip: true,
      fixed: !isMobile.value ? 'left' : false
    },
    {
      label: '用户名',
      prop: 'username',
      // slotName: 'username',
      minWidth: 140,
      showOverflowTooltip: true
    },
    { label: '状态', prop: 'status', slotName: 'status', align: 'center' },
    { label: '性别', prop: 'gender', slotName: 'gender', align: 'center' },
    { label: '所属部门', prop: 'deptName', minWidth: 180, showOverflowTooltip: true },
    { label: '角色', prop: 'roleNames', slotName: 'roleNames', minWidth: 165 },
    { label: '手机号', prop: 'phone', minWidth: 170, showOverflowTooltip: true },
    { label: '邮箱', prop: 'email', minWidth: 170, showOverflowTooltip: true },
    {
      label: '系统内置',
      prop: 'isSystem',
      slotName: 'isSystem',
      width: 100,
      align: 'center'
    },
    { label: '描述', prop: 'description', minWidth: 130, showOverflowTooltip: true },
    {
      label: '创建人',
      prop: 'createUserString',
      width: 140,
      showOverflowTooltip: true
    },
    { label: '创建时间', prop: 'createTime', width: 180 },

    // {
    //   label: '修改人',
    //   prop: 'updateUserString',
    //   width: 140,
    //   showOverflowTooltip: true,
    //   show: false
    // },
    // { label: '修改时间', prop: 'updateTime', width: 180, show: false },
    {
      label: '操作',
      prop: 'action',
      slotName: 'action',
      width: 160,
      align: 'center',
      fixed: !isMobile.value ? 'right' : false
    }
  ]

  // 重置
  const reset = () => {
    resetForm()
    search()
  }

  // 删除
  const onDelete = (record: UserResp) => {
    // return handleDelete(() => deleteUser(record.id), {
    //   content: `是否确定删除用户「${record.nickname}(${record.username})」？`,
    //   showModal: true
    // })
  }

  // 导出
  const onExport = () => {
    useDownload(() => exportUser(queryForm))
  }

  // 根据选中部门查询
  const handleSelectDept = (key: string | number, data: DeptDictTreeNode) => {
    queryForm.deptId = key
    search()
  }

  const ImportDrawerRef = ref<InstanceType<typeof ImportDrawer>>()
  // 导入
  const onImport = () => {
    ImportDrawerRef.value?.onOpen()
  }

  const AddDrawerRef = ref<InstanceType<typeof AddDrawer>>()
  // 新增
  const onAdd = () => {
    AddDrawerRef.value?.onAdd()
  }

  // 修改
  const onUpdate = (record: UserResp) => {
    AddDrawerRef.value?.onUpdate(record.id)
  }

  const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
  // 详情
  const onDetail = (record: UserResp) => {
    DetailDrawerRef.value?.onOpen(record.id)
  }

  const PwdResetModalRef = ref<InstanceType<typeof PwdResetModal>>()
  // 重置密码
  const onResetPwd = (record: UserResp) => {
    PwdResetModalRef.value?.onOpen(record.id)
  }

  const RoleUpdateModalRef = ref<InstanceType<typeof RoleUpdateModal>>()
  // 分配角色
  const onUpdateRole = (record: UserResp) => {
    RoleUpdateModalRef.value?.onOpen(record.id)
  }
</script>

<style scoped lang="scss"></style>
