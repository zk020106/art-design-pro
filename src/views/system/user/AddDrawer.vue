<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 500 ? 500 : '100%'"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="save">确定</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { addUser, getUser, updateUser } from '@/apis/system/user'
  import { GenderList } from '@/constant/common'
  import { useResetReactive } from '@/hooks'
  import { useDept, useRole } from '@/hooks/business'
  import { EnableStatus, Gender } from '@/types/api/common'
  import { encryptByRsa } from '@/utils/encrypt'
  import { useWindowSize } from '@vueuse/core'
  import { FormColumnItem } from 'gi-component'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()

  const dataId = ref('')
  const visible = ref(false)
  const isUpdate = computed(() => !!dataId.value)
  const title = computed(() => (isUpdate.value ? '修改用户' : '新增用户'))
  const formRef = useTemplateRef('formRef')
  const { roleList, getRoleList } = useRole()
  const { deptList, getDeptList } = useDept()

  const [form, resetForm] = useResetReactive({
    gender: 1 as Gender,
    status: 1 as EnableStatus
  })

  const columns = reactive([
    {
      label: '昵称',
      field: 'nickname',
      type: 'input',
      span: 24,
      required: true,
      props: {
        maxLength: 30
      }
    },
    {
      label: '用户名',
      field: 'username',
      type: 'input',
      span: 24,
      required: true,
      props: {
        maxLength: 64
      }
    },
    {
      label: '密码',
      field: 'password',
      type: 'input-password',
      span: 24,
      required: true,
      props: {
        maxLength: 32,
        showWordLimit: true
      },
      hide: () => isUpdate.value
    },
    {
      label: '手机号码',
      field: 'phone',
      type: 'input',
      span: 24,
      props: {
        maxLength: 11
      }
    },
    {
      label: '邮箱',
      field: 'email',
      type: 'input',
      span: 24,
      props: {
        maxLength: 255
      }
    },
    {
      label: '性别',
      field: 'gender',
      type: 'radio-group',
      span: 24,
      props: {
        options: GenderList
      }
    },
    {
      label: '所属部门',
      field: 'deptId',
      type: 'tree-select',
      span: 24,
      required: true,
      props: {
        data: deptList,
        allowClear: true,
        allowSearch: true,
        fallbackOption: false,
        filterTreeNode(searchKey: string, nodeData: any) {
          if (nodeData.title) {
            return nodeData.title.toLowerCase().includes(searchKey.toLowerCase())
          }
          return false
        }
      }
    },
    {
      label: '角色',
      field: 'roleIds',
      type: 'select',
      span: 24,
      required: true,
      props: {
        options: roleList,
        multiple: true,
        allowClear: true,
        allowSearch: true
      }
    },
    {
      label: '描述',
      field: 'description',
      type: 'textarea',
      span: 24
    },
    {
      label: '状态',
      prop: 'status',
      type: 'switch',
      span: 24,
      props: {
        type: 'round',
        checkedValue: 1,
        uncheckedValue: 2,
        checkedText: '启用',
        uncheckedText: '禁用'
      }
    }
  ] as FormColumnItem[])

  // 重置
  const reset = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }

  // 保存
  const save = async () => {
    const rawPassword = form.password
    try {
      const isInvalid = await formRef.value?.formRef?.validate()
      if (isInvalid) return false
      if (isUpdate.value) {
        await updateUser(form, dataId.value)
        ElMessage.success('修改成功')
      } else {
        if (rawPassword) {
          form.password = encryptByRsa(rawPassword) || ''
        }
        await addUser(form)
        ElMessage.success('新增成功')
      }
      emit('save-success')
      visible.value = false
      return true
    } catch (err) {
      console.error(err)
      form.password = rawPassword
      return false
    }
  }

  // 新增
  const onAdd = async () => {
    reset()
    if (!deptList.value.length) {
      await getDeptList()
    }
    if (!roleList.value.length) {
      await getRoleList()
    }
    dataId.value = ''
    visible.value = true
  }

  // 修改
  const onUpdate = async (id: string) => {
    reset()
    dataId.value = id
    if (!deptList.value.length) {
      await getDeptList()
    }
    if (!roleList.value.length) {
      await getRoleList()
    }
    const data = await getUser(id)
    Object.assign(form, data)
    visible.value = true
  }

  defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
