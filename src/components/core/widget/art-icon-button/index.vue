<!-- 按钮组件 -->
<template>
  <div
    class="inline-flex flex-cc c-p text-g-600 dark:text-g-800 text-xl rounded tad-300 hover:bg-hover-color"
    :class="{ 'rounded-full': circle }"
  >
    <ArtSvgIcon :size="size" :icon="icon"></ArtSvgIcon>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  defineOptions({ name: 'ArtIconButton' })

  interface Props {
    /** 图标名称 */
    icon: string
    /** 圆角按钮 */
    circle?: boolean
    /** 大小 */
    size?: string | number
  }

  withDefaults(defineProps<Props>(), {})
</script>
