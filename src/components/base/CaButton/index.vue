<template>
  <ElButton class="ca-button" v-bind="bindProps" @click="(e: MouseEvent) => emit('click', e)">
    <slot>{{ btnText }}</slot>
  </ElButton>
</template>

<script setup lang="ts">
  import { Delete, Download, Edit, Plus, Printer, Search, Upload } from '@element-plus/icons-vue'
  import type { ButtonProps as ElButtonProps } from 'element-plus'
  import { ElButton } from 'element-plus'
  import { computed, useAttrs } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { ButtonProps } from './type'

  const props = withDefaults(defineProps<ButtonProps>(), {
    type: ''
  })

  const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
  }>()

  const { t } = useI18n()
  const attrs = useAttrs()

  const obj: Record<string, { btnProps: Partial<ButtonProps>; btnTextKey: string }> = {
    add: { btnProps: { icon: Plus, type: 'primary' }, btnTextKey: t('common.button.add') },
    edit: { btnProps: { icon: Edit, type: 'primary' }, btnTextKey: t('common.button.edit') },
    delete: { btnProps: { icon: Delete, type: 'danger' }, btnTextKey: t('common.button.delete') },
    search: { btnProps: { icon: Search, type: 'primary' }, btnTextKey: t('common.button.search') },
    reset: { btnProps: { type: undefined }, btnTextKey: t('common.button.reset') },
    upload: {
      btnProps: { icon: Upload, type: 'primary', plain: true },
      btnTextKey: t('common.button.upload')
    },
    download: {
      btnProps: { icon: Download, type: undefined, plain: true },
      btnTextKey: t('common.button.download')
    },
    export: {
      btnProps: { icon: Download, type: undefined, plain: true },
      btnTextKey: t('common.button.export')
    },
    import: {
      btnProps: { icon: Upload, type: undefined, plain: true },
      btnTextKey: t('common.button.import')
    },
    print: { btnProps: { icon: Printer, type: 'primary' }, btnTextKey: t('common.button.print') },
    cancel: { btnProps: { type: undefined }, btnTextKey: t('common.cancel') },
    confirm: { btnProps: { type: 'primary' }, btnTextKey: t('common.confirm') }
  }

  const bindProps = computed(() => {
    const btnProps = obj?.[props.type]?.btnProps || { type: props.type }
    return { ...attrs, ...props, ...btnProps } as Omit<ElButtonProps, 'type'>
  })

  const btnText = computed(() => {
    return obj[props.type].btnTextKey
  })
</script>

<style lang="scss" scoped></style>
