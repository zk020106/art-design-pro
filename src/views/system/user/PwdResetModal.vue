<template>
  <ElDialog
    v-model="visible"
    title="重置密码"
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
  import { resetUserPwd } from '@/apis/system/user'
  import { type ColumnItem, GiForm } from '@/components/GiForm'
  import { useResetReactive } from '@/hooks'
  import { encryptByRsa } from '@/utils/encrypt'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()
  const dataId = ref('')
  const visible = ref(false)
  const formRef = ref<InstanceType<typeof GiForm>>()

  const [form, resetForm] = useResetReactive({})

  const columns: ColumnItem[] = reactive([
    { label: '密码', field: 'newPassword', type: 'input-password', span: 24, required: true }
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
      await resetUserPwd({ newPassword: encryptByRsa(form.newPassword) || '' }, dataId.value)
      ElMessage.success('重置成功')
      emit('save-success')
      visible.value = false
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // 打开
  const onOpen = (id: string) => {
    reset()
    dataId.value = id
    visible.value = true
  }

  defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
