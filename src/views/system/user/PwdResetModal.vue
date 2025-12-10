<template>
  <ElDialog
    v-model="visible"
    title="重置密码"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="width >= 500 ? 500 : '100%'"
    @close="reset"
  >
    <CaForm ref="formRef" v-model="form" :columns="columns" />
    <template #footer>
      <CaButton type="cancel" @click="visible = false" />
      <CaButton type="confirm" @click="save" />
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { resetUserPwd } from '@/apis/system/user'
  import CaButton from '@/components/base/CaButton/index.vue'
  import CaForm from '@/components/base/CaForm/index.vue'
  import { FormColumnItem } from '@/components/base/CaForm/type'
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
  const formRef = useTemplateRef('formRef')

  const [form, resetForm] = useResetReactive({})

  const columns = reactive([
    {
      label: '密码',
      field: 'newPassword',
      type: 'input',
      span: 24,
      props: {
        type: 'password',
        max: 20,
        showPassword: true
      },
      required: true
    }
  ] as FormColumnItem[])

  // 重置
  const reset = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }

  // 保存
  const save = async () => {
    try {
      await formRef.value?.formRef?.validate()
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
