<template>
  <ElDrawer
    v-model="visible"
    :title="t('user.page.title.detail')"
    :size="width >= 800 ? 800 : '100%'"
  >
    <CaDetail
      v-if="dataDetail"
      :data="dataDetail"
      :fields="userDetailFields"
      :column="2"
      size="large"
      :border="true"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import { UserDetailResp } from '@/apis'
  import { getUser as getDetail } from '@/apis/system/user'
  import { CaCellTags } from '@/components/base/CaCell'
  import CaDetail from '@/components/base/CaDetail/index.vue'
  import { DetailField } from '@/components/base/CaDetail/type'
  import { useWindowSize } from '@vueuse/core'
  import { useI18n } from 'vue-i18n'

  const { width } = useWindowSize()
  const { t } = useI18n()

  const dataId = ref('')
  const dataDetail = ref<UserDetailResp>()
  const visible = ref(false)

  /**
   * 用户详情字段配置
   */
  const userDetailFields = computed(
    () =>
      [
        {
          key: 'id',
          label: t('user.field.id'),
          type: 'text',
          span: 2,
          copyable: true
        },
        {
          key: 'username',
          label: t('user.field.username'),
          type: 'text'
        },
        {
          key: 'nickname',
          label: t('user.field.nickname'),
          type: 'text'
        },
        {
          key: 'gender',
          label: t('user.field.gender'),
          type: 'enum',
          enum: {
            '1': { label: '男', type: 'primary' },
            '2': { label: '女', type: 'success' },
            other: { label: '未知', type: 'info' }
          }
        },
        {
          key: 'status',
          label: t('user.field.status'),
          type: 'enum',
          enum: {
            '1': { label: '启用', type: 'success' },
            '0': { label: '禁用', type: 'danger' }
          }
        },
        {
          key: 'phone',
          label: t('user.field.phone'),
          type: 'text'
        },
        {
          key: 'email',
          label: t('user.field.email'),
          type: 'text'
        },
        {
          key: 'deptName',
          label: t('user.field.dept'),
          type: 'text'
        },
        {
          key: 'roleNames',
          label: t('user.field.role'),
          type: 'component',
          component: CaCellTags,
          props: {
            data: dataDetail.value?.roleNames,
            max: 3
          }
        },
        {
          key: 'createUserString',
          label: t('user.field.createUser'),
          type: 'text'
        },
        {
          key: 'createTime',
          label: t('user.field.createTime'),
          type: 'datetime'
        },
        {
          key: 'updateUserString',
          label: t('user.field.updateUser'),
          type: 'text'
        },
        {
          key: 'updateTime',
          label: t('user.field.updateTime'),
          type: 'datetime'
        },
        {
          key: 'description',
          label: t('user.field.description'),
          type: 'text',
          span: 2
        }
      ] as DetailField[]
  )

  // 查询详情
  const getDataDetail = async () => {
    dataDetail.value = await getDetail(dataId.value)
  }

  // 打开
  const onOpen = async (id: string) => {
    dataId.value = id
    await getDataDetail()
    visible.value = true
  }

  defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
