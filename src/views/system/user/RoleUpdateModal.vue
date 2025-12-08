<template>
  <ElDialog
    v-model="visible"
    title="分配角色"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="width >= 500 ? 500 : '100%'"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="save">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { getUser, updateUserRole } from '@/apis/system/user'
  import { useResetReactive } from '@/hooks'
  import { useRole } from '@/hooks/business'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import { GiForm } from 'gi-component'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()
  const dataId = ref('')
  const visible = ref(false)
  const formRef = ref<InstanceType<typeof GiForm>>()
  const { roleList, getRoleList } = useRole()

  const [form, resetForm] = useResetReactive({})

  const columns = reactive([
    {
      label: '角色',
      field: 'roleIds',
      type: 'select',
      span: 24,
      required: true,
      props: {
        options: roleList,
        multiple: true,
        clearable: true,
        placeholder: '请选择角色'
      }
    }
  ])

  // 重置
  const reset = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }

  // 保存
  const save = async () => {
    try {
      const isInvalid = await formRef.value?.formRef?.validate()
      if (isInvalid) return false
      await updateUserRole({ roleIds: form.roleIds }, dataId.value)
      ElMessage.success('分配成功')
      emit('save-success')
      visible.value = false
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // 初始化
  const onOpen = async (id: string) => {
    reset()
    dataId.value = id
    if (!roleList.value.length) {
      await getRoleList()
    }
    const data = await getUser(id)
    Object.assign(form, data)
    visible.value = true
  }

  defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
