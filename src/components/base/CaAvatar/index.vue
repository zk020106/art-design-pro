<script setup lang="ts">
  import { ElAvatar } from 'element-plus'
  import { computed } from 'vue'

  defineOptions({
    name: 'CaAvatar',
    inheritAttrs: true
  })

  /** 头像属性接口 */
  interface AvatarProps {
    /** 头像 URL */
    src?: string
    /** 用户名（用于生成默认头像） */
    name?: string
    /** 头像大小（px） */
    size?: number | 'large' | 'default' | 'small'
    /** 头像形状 */
    shape?: 'circle' | 'square'
    /** 自定义背景色 */
    color?: string
    /** 是否显示边框 */
    showBorder?: boolean
    /** 边框颜色 */
    borderColor?: string
    /** 悬停效果 */
    hoverable?: boolean
    /** 加载失败时显示默认头像 */
    fallbackSrc?: string
    /** 头像填充方式 */
    fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
    /** 自定义类名 */
    class?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
    /** 自定义样式 */
    style?: Record<string, string | number>
  }

  const props = withDefaults(defineProps<AvatarProps>(), {
    size: 40,
    shape: 'circle',
    showBorder: true,
    hoverable: true,
    fit: 'cover'
  })

  /** 头像事件接口 */
  interface AvatarEmits {
    /** 点击头像时 */
    click: [event: MouseEvent]
    /** 头像加载失败时 */
    error: [event: Event]
    /** 头像加载成功时 */
    load: [event: Event]
  }

  const emit = defineEmits<AvatarEmits>()

  /** 头像背景色调色板（适配项目主题） */
  const avatarColors = [
    'var(--art-blue)',
    'var(--art-cyan)',
    'var(--art-green)',
    'var(--art-yellow)',
    'var(--art-red)',
    'var(--art-purple)',
    'var(--art-pink)',
    'var(--art-indigo)',
    'var(--art-orange)',
    'var(--art-teal)',
    'var(--art-amber)',
    'var(--art-lime)',
    'var(--art-emerald)',
    'var(--art-violet)',
    'var(--art-rose)'
  ]

  /**
   * 生成默认头像的背景色
   * @param name 用户名
   * @returns 背景色
   */
  const generateColor = (name: string) => {
    if (!name) return 'var(--art-gray-500)'
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % avatarColors.length
    return avatarColors[index]
  }

  /**
   * 生成默认头像文本
   * @param name 用户名
   * @returns 显示文本
   */
  const generateText = (name: string) => {
    if (!name) return '?'
    // 提取中英文首字母
    const matches = name.match(/[a-zA-Z]+|[^\w\s]/g)
    if (!matches || matches.length === 0) return '?'
    const firstTwoChars = matches.slice(0, 2).join('')
    return firstTwoChars.substring(0, 2).toUpperCase()
  }

  /**
   * 处理头像点击事件
   * @param event 鼠标事件
   */
  const handleClick = (event: MouseEvent) => {
    emit('click', event)
  }

  /**
   * 处理头像加载失败
   * @param event 错误事件
   */
  const handleError = (event: Event) => {
    emit('error', event)
  }

  /**
   * 处理头像加载成功
   * @param event 加载事件
   */
  const handleLoad = (event: Event) => {
    emit('load', event)
  }

  /** 计算头像尺寸 */
  const sizeMap = {
    large: 80,
    default: 40,
    small: 24
  }
  const avatarSize = computed(() => {
    return typeof props.size === 'number' ? props.size : sizeMap[props.size as keyof typeof sizeMap]
  })

  /** 计算头像边框样式 */
  const avatarStyle = computed(() => {
    const style: Record<string, string | number> = {
      ...props.style
    }

    if (props.showBorder) {
      style.border = `2px solid ${props.borderColor}`
    }

    return style
  })

  /** 计算头像文本样式 */
  const textStyle = computed(() => ({
    backgroundColor: props.color || generateColor(props.name || '匿名用户'),
    fontWeight: 600,
    fontSize: `${Math.max(12, avatarSize.value * 0.35)}px`,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }))
</script>

<template>
  <el-avatar
    :src="src"
    :size="avatarSize"
    :shape="shape"
    :style="avatarStyle"
    :fit="fit"
    :class="[
      'ca-avatar',
      {
        'is-hoverable': hoverable
      },
      props.class
    ]"
    @click="handleClick"
    @error="handleError"
    @load="handleLoad"
  >
    <span v-if="!src || fallbackSrc" :style="textStyle">
      {{ generateText(name || '匿名用户') }}
    </span>
  </el-avatar>
</template>

<style scoped lang="scss">
  .ca-avatar {
    background-color: var(--art-card-bg);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    // 悬停效果（可控制）
    &.is-hoverable:hover {
      cursor: pointer;
      transform: translateY(-2px) scale(1.05);
    }

    // 悬停时移除阴影
    &:hover {
      box-shadow: none !important;
    }

    // 文字头像样式
    span {
      color: var(--el-text-color-primary);
    }
  }

  // 响应式设计
  @media screen and (width <= 768px) {
    .ca-avatar {
      &.is-hoverable:hover {
        transform: none;
      }
    }
  }

  // 高对比度模式支持
  @media (prefers-contrast: high) {
    .ca-avatar {
      border: 2px solid var(--art-text-color-primary);
    }
  }

  // 减少动画（用户偏好）
  @media (prefers-reduced-motion: reduce) {
    .ca-avatar {
      transition: none;

      &.is-hoverable:hover {
        transform: none;
      }
    }
  }
</style>
