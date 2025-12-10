<template>
  <ElDialog
    v-model="visible"
    title="分配角色"
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
  import { getUser, updateUserRole } from '@/apis/system/user'
  import CaButton from '@/components/base/CaButton/index.vue'
  import CaForm from '@/components/base/CaForm/index.vue'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import { useResetReactive } from '@/hooks'
  import { useRole } from '@/hooks/business'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()
  const dataId = ref('')
  const visible = ref(false)
  const formRef = useTemplateRef('formRef')
  const { roleList, getRoleList } = useRole()

  const [form, resetForm] = useResetReactive({})

  const columns = computed(
    () =>
      [
        {
          label: '角色',
          field: 'roleIds',
          type: 'select',
          span: 24,
          required: true,
          props: {
            options: roleList.value,
            multiple: true,
            clearable: true,
            placeholder: '请选择角色'
          }
        }
      ] as FormColumnItem[]
  )

  // 重置
  const reset = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }

  // 保存
  const save = async () => {
    try {
      await formRef.value?.formRef?.validate()

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
