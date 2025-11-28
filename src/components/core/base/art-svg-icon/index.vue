<template>
  <component :is="IconComponent" v-bind="attrs" class="art-svg-icon" :style="iconStyle" />
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, h, useAttrs, type CSSProperties } from 'vue'

  // Props
  interface Props {
    icon?: string
    size?: string | number
  }

  const props = withDefaults(defineProps<Props>(), {
    icon: '',
    size: '1em'
  })

  const attrs = useAttrs()

  // 计算图标样式
  const iconStyle = computed<CSSProperties>(() => {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
    return {
      '--icon-size': sizeValue,
      width: sizeValue,
      height: sizeValue
    }
  })

  // 自动扫描本地 SVG
  const localIcons = import.meta.glob<string>('@/assets/images/icons/*.svg', {
    eager: true,
    import: 'default'
  })

  // 建立映射
  const localIconMap = computed(() => {
    const map: Record<string, string> = {}
    Object.keys(localIcons).forEach((path) => {
      const name = path.split('/').pop()?.replace('.svg', '') || ''
      if (name) {
        map[name] = localIcons[path]
      }
    })
    return map
  })

  // 选择渲染组件
  const IconComponent = computed(() => {
    // 空图标返回占位符
    if (!props.icon) {
      return {
        render: () => h('span', { class: 'art-svg-icon-placeholder' })
      }
    }

    // 1. 本地 SVG（字符串）
    const localIcon = localIconMap.value[props.icon]
    if (localIcon) {
      try {
        const svgStr = decodeURIComponent(localIcon.split(',')[1])
        return {
          render: () =>
            h('span', {
              class: 'art-svg-icon-local',
              innerHTML: svgStr
            })
        }
      } catch (error) {
        console.warn(`Failed to decode local SVG icon: ${props.icon}`, error)
      }
    }

    // 2. Iconify 图标
    return {
      render: () =>
        h(Icon, {
          icon: props.icon,
          class: 'art-svg-icon-iconify',
          ...attrs
        })
    }
  })
</script>

<style scoped>
  .art-svg-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }

  .art-svg-icon :deep(svg) {
    width: var(--icon-size, 1em);
    height: var(--icon-size, 1em);
    fill: currentcolor;
  }

  .art-svg-icon-placeholder {
    display: inline-block;
  }

  .art-svg-icon-local,
  .art-svg-icon-iconify {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
