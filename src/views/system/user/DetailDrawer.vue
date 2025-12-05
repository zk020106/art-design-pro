<template>
  <ElDrawer v-model="visible" title="用户详情" :size="width >= 500 ? 500 : '100%'">
    <ElDescriptions :column="2" size="large" border>
      <ElDescriptionsItem label="ID" :span="2">
        <ElText tag="span" copyable>{{ dataDetail?.id }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="用户名">{{ dataDetail?.username }}</ElDescriptionsItem>
      <ElDescriptionsItem label="昵称">{{ dataDetail?.nickname }}</ElDescriptionsItem>
      <ElDescriptionsItem label="性别">
        <span v-if="dataDetail?.gender === 1">男</span>
        <span v-else-if="dataDetail?.gender === 2">女</span>
        <span v-else>未知</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        <ElTag v-if="dataDetail?.status === 1" type="success">启用</ElTag>
        <ElTag v-else type="danger">禁用</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="手机号">{{ dataDetail?.phone || '暂无' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="邮箱">{{ dataDetail?.email || '暂无' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="所属部门">{{ dataDetail?.deptName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="角色">
        <GiCellTags :data="dataDetail?.roleNames" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="创建人">{{ dataDetail?.createUserString }}</ElDescriptionsItem>
      <ElDescriptionsItem label="创建时间">{{ dataDetail?.createTime }}</ElDescriptionsItem>
      <ElDescriptionsItem label="修改人">{{ dataDetail?.updateUserString }}</ElDescriptionsItem>
      <ElDescriptionsItem label="修改时间">{{ dataDetail?.updateTime }}</ElDescriptionsItem>
      <ElDescriptionsItem label="描述" :span="2">{{ dataDetail?.description }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { type UserDetailResp, getUser as getDetail } from '@/apis/system/user'
  import { useWindowSize } from '@vueuse/core'

  const { width } = useWindowSize()

  const dataId = ref('')
  const dataDetail = ref<UserDetailResp>()
  const visible = ref(false)

  // 查询详情
  const getDataDetail = async () => {
    const { data } = await getDetail(dataId.value)
    dataDetail.value = data
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
