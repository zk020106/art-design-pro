<template>
  <div class="ca-detail">
    <!-- 标题区域 -->
    <div v-if="props.showTitle !== false" class="ca-detail__header">
      <slot name="title">
        <ElText v-if="props.title" size="large" tag="h3">{{ props.title }}</ElText>
      </slot>
    </div>

    <!-- 描述列表 -->
    <ElDescriptions
      :column="props.column || 2"
      :size="props.size || 'large'"
      :label-width="props.labelWidth"
      :border="props.border !== false"
      class="ca-detail__descriptions"
    >
      <template v-for="field in visibleFields" :key="field.key">
        <ElDescriptionsItem :label="getFieldLabel(field)" :span="field.span || 1">
          <!-- 插槽渲染 -->
          <template v-if="field.type === 'slot'">
            <slot
              :name="`field-${field.key}`"
              :value="getFieldValue(field)"
              :data="props.data"
              :field="field"
            >
              {{ getFieldValue(field) }}
            </slot>
          </template>

          <!-- 自定义组件渲染 -->
          <template v-else-if="field.component">
            <component
              :is="field.component"
              v-bind="getComponentProps(field)"
              :value="getFieldValue(field)"
              :data="props.data"
            >
              <template
                v-for="(slotValue, slotKey) in field.slots || {}"
                :key="slotKey"
                #[slotKey]="scope"
              >
                <component :is="slotValue(scope)"></component>
              </template>
            </component>
          </template>

          <!-- 预设类型渲染 -->
          <template v-else>
            <div class="ca-detail__field-value" :style="field.valueStyle">
              <!-- 文本类型 -->
              <template v-if="field.type === 'text'">
                <ElText :copyable="field.copyable" :type="field.props?.type">
                  {{ formatValue(field) }}
                </ElText>
              </template>

              <!-- 标签类型 -->
              <template v-else-if="field.type === 'tag'">
                <ElTag :type="getTagType(field) as any">
                  {{ formatValue(field) }}
                </ElTag>
              </template>

              <!-- 布尔类型 -->
              <template v-else-if="field.type === 'boolean'">
                <ElTag :type="getFieldValue(field) ? 'success' : 'danger'">
                  {{ formatValue(field) }}
                </ElTag>
              </template>

              <!-- 枚举类型 -->
              <template v-else-if="field.type === 'enum'">
                <ElTag
                  v-if="getEnumValue(field)"
                  :type="(getEnumValue(field)?.type || 'info') as any"
                >
                  {{ getEnumValue(field)?.label }}
                </ElTag>
                <ElText v-else type="info">{{ field.emptyText || t('common.empty') }}</ElText>
              </template>

              <!-- 字典类型 -->
              <template v-else-if="field.type === 'dict'">
                <ElTag v-if="getDictValue(field)" :type="(field.props?.type || 'info') as any">
                  {{ getDictValue(field) }}
                </ElTag>
                <ElText v-else type="info">{{ field.emptyText || t('common.empty') }}</ElText>
              </template>

              <!-- 日期类型 -->
              <template v-else-if="field.type === 'date'">
                <ElText>{{ formatDate(field, 'YYYY-MM-DD') }}</ElText>
              </template>

              <!-- 日期时间类型 -->
              <template v-else-if="field.type === 'datetime'">
                <ElText>{{ formatDate(field, 'YYYY-MM-DD HH:mm:ss') }}</ElText>
              </template>

              <!-- 数字类型 -->
              <template v-else-if="field.type === 'number'">
                <ElText :type="field.props?.type">{{ formatValue(field) }}</ElText>
              </template>

              <!-- 图片类型 -->
              <template v-else-if="field.type === 'image'">
                <ElImage
                  v-if="getFieldValue(field)"
                  :src="getFieldValue(field)"
                  :preview-src-list="[getFieldValue(field)]"
                  :fit="field.props?.fit || 'contain'"
                  :style="{
                    width: field.props?.width || '100px',
                    height: field.props?.height || '100px'
                  }"
                />
                <ElText v-else type="info">{{ field.emptyText || t('common.empty') }}</ElText>
              </template>

              <!-- 默认渲染 -->
              <template v-else>
                <ElText>{{ formatValue(field) }}</ElText>
              </template>

              <!-- 提示信息 -->
              <ElTooltip v-if="field.tooltip" :content="field.tooltip">
                <ElIcon class="ca-detail__tooltip"><QuestionFilled /></ElIcon>
              </ElTooltip>
            </div>
          </template>
        </ElDescriptionsItem>
      </template>
    </ElDescriptions>
  </div>
</template>

<script lang="ts" setup>
  import { QuestionFilled } from '@element-plus/icons-vue'
  import * as El from 'element-plus'
  import {
    ElDescriptions,
    ElDescriptionsItem,
    ElIcon,
    ElImage,
    ElTag,
    ElText,
    ElTooltip
  } from 'element-plus'
  import { computed, getCurrentInstance, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { DetailField, DetailProps } from './type'

  const props = withDefaults(defineProps<DetailProps>(), {
    column: 2,
    labelWidth: 'auto',
    border: true,
    showTitle: false,
    size: 'large',
    responsive: () => ({})
  })

  const { t } = useI18n()
  const instance = getCurrentInstance()

  // 全局配置
  const globalConfig = instance?.appContext.config.globalProperties.$config
  const dictData = ref<Record<string, any[]>>({})

  // 可见字段过滤
  const visibleFields = computed(() => {
    return props.fields.filter((field) => {
      if (typeof field.show === 'function') {
        return field.show(props.data)
      }
      return field.show !== false
    })
  })

  /**
   * 获取字段标签
   */
  function getFieldLabel(field: DetailField): string {
    // 如果label包含点，视为i18n key
    if (field.label.includes('.')) {
      return t(field.label)
    }
    return field.label
  }

  /**
   * 获取字段值
   */
  function getFieldValue(field: DetailField): any {
    const value = props.data?.[field.key]
    if (value === undefined || value === null || value === '') {
      return field.defaultValue ?? ''
    }
    return value
  }

  /**
   * 格式化值
   */
  function formatValue(field: DetailField): any {
    const value = getFieldValue(field)

    // 空值处理
    if (value === '' || value === undefined || value === null) {
      return field.emptyText || t('common.empty')
    }

    // 自定义渲染
    if (field.render) {
      return field.render(value, props.data, field)
    }

    // 枚举渲染
    if (field.type === 'enum' && field.enum) {
      const enumItem = field.enum[value]
      return enumItem?.label || field.emptyText || t('common.empty')
    }

    // 字典渲染
    if (field.type === 'dict' && field.dictCode && dictData.value[field.dictCode]) {
      const dictItem = dictData.value[field.dictCode].find((item) => item.value == value)
      return dictItem?.label || field.emptyText || t('common.empty')
    }

    // 布尔值渲染
    if (field.type === 'boolean') {
      return value ? t('common.true') : t('common.false')
    }

    return value
  }

  /**
   * 获取枚举值
   */
  function getEnumValue(field: DetailField) {
    const value = getFieldValue(field)
    return field.enum?.[value]
  }

  /**
   * 获取字典值
   */
  function getDictValue(field: DetailField) {
    const value = getFieldValue(field)
    if (field.dictCode && dictData.value[field.dictCode]) {
      const dictItem = dictData.value[field.dictCode].find((item) => item.value == value)
      return dictItem?.label
    }
    return ''
  }

  /**
   * 获取标签类型
   */
  function getTagType(field: DetailField): string {
    const value = getFieldValue(field)
    if (field.enum?.[value]?.type) {
      return field.enum[value].type
    }
    if (field.props?.type) {
      return field.props.type
    }
    return 'info'
  }

  /**
   * 格式化日期
   */
  function formatDate(field: DetailField, format: string): string {
    const value = getFieldValue(field)
    if (!value) {
      return field.emptyText || t('common.empty')
    }

    // 获取当前语言
    const locale = instance?.appContext.config.globalProperties.$i18n?.locale || 'zh-CN'

    // 如果是时间戳或日期字符串
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return value
    }

    // 根据format参数格式化
    const options: Intl.DateTimeFormatOptions = {}

    if (format.includes('YYYY')) {
      options.year = 'numeric'
    }
    if (format.includes('MM')) {
      options.month = '2-digit'
    }
    if (format.includes('DD')) {
      options.day = '2-digit'
    }
    if (format.includes('HH')) {
      options.hour = '2-digit'
      options.hour12 = false
    }
    if (format.includes('mm')) {
      options.minute = '2-digit'
    }
    if (format.includes('ss')) {
      options.second = '2-digit'
    }

    // 如果format只包含日期部分，使用toLocaleDateString
    if (format === 'YYYY-MM-DD') {
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // 如果format包含时间部分，使用toLocaleString
    return date.toLocaleString(locale, options)
  }

  /**
   * 获取组件Props
   */
  function getComponentProps(field: DetailField) {
    return {
      ...field.props
    }
  }

  /**
   * 加载字典数据
   */
  const loadDictData = async () => {
    const dictCodes: string[] = []
    props.fields?.forEach((field) => {
      if (field.type === 'dict' && field.dictCode) {
        dictCodes.push(field.dictCode)
      }
    })

    if (!dictCodes.length) return
    if (!globalConfig?.dictRequest) {
      return El.ElMessage.error('请配置全局字典请求方法dictRequest')
    }

    try {
      const dictResponses = await Promise.all(
        dictCodes.map((code) =>
          globalConfig.dictRequest(code).then((response: any) => ({ code, response }))
        )
      )
      dictResponses.forEach(({ code, response }) => {
        dictData.value[code] = response
      })
    } catch (error) {
      console.error('获取字典数据失败:', error)
      El.ElMessage.error('获取字典数据失败')
    }
  }

  onMounted(() => {
    loadDictData()
  })
</script>

<style lang="scss" scoped>
  .ca-detail {
    width: 100%;

    &__header {
      margin-bottom: 16px;
    }

    &__descriptions {
      width: 100%;
    }

    &__field-value {
      display: flex;
      gap: 4px;
      align-items: center;
      min-height: 24px;
    }

    &__tooltip {
      margin-left: 4px;
      cursor: help;
    }
  }

  :deep(.el-descriptions__label) {
    font-weight: 500;
  }
</style>
