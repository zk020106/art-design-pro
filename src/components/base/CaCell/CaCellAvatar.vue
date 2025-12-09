<template>
  <el-space fill>
    <el-avatar :src="props.avatar" :size="24">
      {{ props.name?.charAt(0) }}
    </el-avatar>
    <el-link v-if="props.isLink" @click="emit('click')" :underline="false">
      <span class="link-text" :title="props.name">
        {{ props.name }}
      </span>
    </el-link>
    <span v-else :title="props.name">
      {{ props.name }}
    </span>
  </el-space>
</template>

<script setup lang="ts">
  defineOptions({ name: 'CaCellAvatar' })

  const props = withDefaults(defineProps<Props>(), {
    avatar: '',
    name: '',
    isLink: false
  })
  console.log(props)

  const emit = defineEmits<{
    (e: 'click'): void
  }>()

  interface Props {
    avatar?: string
    name: string
    isLink?: boolean
  }
</script>

<style scoped lang="scss">
  .link-text {
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
