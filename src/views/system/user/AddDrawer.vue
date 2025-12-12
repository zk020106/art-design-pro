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
      <CaButton type="cancel" @click="visible = false" />
      <CaButton type="confirm" @click="save" />
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { addUser, getUser, updateUser } from '@/apis/system/user'
  import CaButton from '@/components/base/CaButton/index.vue'
  import { GenderList } from '@/constant/common'
  import { useResetReactive } from '@/hooks'
  import { useDept, useRole } from '@/hooks/business'
  import { EnableStatus, Gender } from '@/types/api/common'
  import { encryptByRsa } from '@/utils/encrypt'
  import { useWindowSize } from '@vueuse/core'
  import { FormColumnItem } from 'gi-component'
  import { useI18n } from 'vue-i18n'

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
  const { t } = useI18n()
  const columns = reactive([
    {
      label: t('user.field.nickname'),
      field: 'nickname',
      type: 'input',
      span: 24,
      required: true,
      props: {
        maxLength: 30
      }
    },
    {
      label: t('user.field.username'),
      field: 'username',
      type: 'input',
      span: 24,
      required: true,
      props: {
        maxLength: 64
      }
    },
    {
      label: t('user.field.password'),
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
      label: t('user.field.phone'),
      field: 'phone',
      type: 'input',
      span: 24,
      props: {
        maxLength: 11
      }
    },
    {
      label: t('user.field.email'),
      field: 'email',
      type: 'input',
      span: 24,
      props: {
        maxLength: 255
      }
    },
    {
      label: t('user.field.gender'),
      field: 'gender',
      type: 'radio-group',
      span: 24,
      props: {
        options: GenderList
      }
    },
    {
      label: t('user.field.dept'),
      field: 'deptId',
      type: 'tree-select',
      span: 24,
      required: true,
      props: {
        data: deptList,
        props: {
          children: 'children',
          label: 'title',
          value: 'key'
        },
        nodeKey: 'key',
        checkStrictly: true
      }
    },
    {
      label: t('user.field.role'),
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
      label: t('user.field.description'),
      field: 'description',
      type: 'textarea',
      span: 24
    },
    {
      label: t('user.field.status'),
      field: 'status',
      type: 'switch',
      span: 24,
      props: {
        type: 'round',
        activeValue: 1,
        inactiveValue: 2,
        activeText: '启用',
        inactiveText: '禁用'
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
      await formRef.value?.formRef?.validate()
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
