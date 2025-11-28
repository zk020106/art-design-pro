<template>
  <ElUpload
    ref="uploadRef"
    v-model:file-list="fileList"
    :multiple="multiple"
    :accept="accept"
    :limit="limit"
    :disabled="disabled"
    :drag="drag"
    :list-type="listType"
    :http-request="handleUpload"
    :before-upload="beforeUpload"
    :on-remove="handleRemove"
    :on-exceed="handleExceed"
    :on-change="handleChange"
    v-bind="$attrs"
    class="w-full"
  >
    <template v-if="drag">
      <div class="flex flex-col items-center justify-center py-8">
        <ElIcon class="text-4xl text-gray-400 mb-2">
          <UploadFilled />
        </ElIcon>
        <div class="text-gray-600">
          {{ t('components.upload.dragHint') }}
        </div>
      </div>
    </template>
    <template v-else-if="listType === 'picture-card'">
      <ElIcon><Plus /></ElIcon>
    </template>
    <template v-else>
      <ElButton type="primary">
        <ElIcon class="mr-1"><Upload /></ElIcon>
        {{ t('components.upload.clickHint') }}
      </ElButton>
    </template>

    <!-- Tip slot -->
    <template v-if="$slots.tip" #tip>
      <slot name="tip" />
    </template>
    <template v-else-if="maxSize" #tip>
      <div class="text-xs text-gray-500 mt-2">
        {{ t('components.upload.fileSizeExceeded', { size: maxSize }) }}
      </div>
    </template>

    <!-- File slot -->
    <template v-if="$slots.file" #file="{ file }">
      <slot name="file" :file="file" />
    </template>
  </ElUpload>
</template>

<script setup lang="ts" generic="T = any">
  import { Plus, Upload, UploadFilled } from '@element-plus/icons-vue'
  import {
    ElButton,
    ElIcon,
    ElMessage,
    ElUpload,
    type UploadFile,
    type UploadRawFile,
    type UploadRequestOptions
  } from 'element-plus'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { GiUploadEmits, GiUploadProps } from './types'

  defineOptions({
    name: 'GiUpload',
    inheritAttrs: false
  })

  const props = withDefaults(defineProps<GiUploadProps<T>>(), {
    multiple: false,
    maxSize: 10,
    accept: '*',
    headers: () => ({}),
    showProgress: true,
    withCredentials: false,
    limit: undefined,
    drag: false,
    listType: 'text',
    disabled: false
  })

  const emit = defineEmits<GiUploadEmits<T>>()

  const { t } = useI18n()

  // 上传组件引用
  const uploadRef = ref()

  // 文件列表
  const fileList = ref<UploadFile[]>([])

  /**
   * 上传前验证文件
   */
  const beforeUpload = (rawFile: UploadRawFile) => {
    // 检查文件大小
    if (props.maxSize) {
      const sizeMB = rawFile.size / 1024 / 1024
      if (sizeMB > props.maxSize) {
        ElMessage.error(t('components.upload.fileSizeExceeded', { size: props.maxSize }))
        return false
      }
    }

    // 检查文件类型
    if (props.accept && props.accept !== '*') {
      const acceptTypes = props.accept.split(',').map((type) => type.trim())
      const fileType = rawFile.type
      const fileName = rawFile.name
      const fileExt = '.' + fileName.split('.').pop()

      const isAccepted = acceptTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExt === type
        }
        return fileType.match(new RegExp(type.replace('*', '.*')))
      })

      if (!isAccepted) {
        ElMessage.error(t('components.upload.fileTypeError'))
        return false
      }
    }

    return true
  }

  /**
   * 处理文件上传
   */
  const handleUpload = async (options: UploadRequestOptions) => {
    const { file, onSuccess, onError } = options

    try {
      // 调用自定义上传函数
      const response = await props.uploadFn(file as File)

      // 更新文件状态
      onSuccess(response)

      // 触发成功事件
      emit('success', file as File, response)

      ElMessage.success(t('components.upload.uploadSuccess'))
    } catch (error) {
      console.error('[GiUpload] Upload failed:', error)

      // 更新文件状态
      onError(error as any)

      // 触发错误事件
      emit('error', file as File, error)

      ElMessage.error(t('components.upload.uploadFailed'))
    }
  }

  /**
   * 处理文件移除
   */
  const handleRemove = (file: UploadFile) => {
    emit('remove', file)
  }

  /**
   * 处理文件列表变化
   */
  const handleChange = (file: UploadFile, files: UploadFile[]) => {
    emit('change', files)
  }

  /**
   * 处理超过限制
   */
  const handleExceed = (files: File[]) => {
    ElMessage.warning(`最多只能上传 ${props.limit} 个文件，本次选择了 ${files.length} 个文件`)
    emit('exceed', files)
  }

  /**
   * 清空文件列表
   */
  const clearFiles = () => {
    uploadRef.value?.clearFiles()
    fileList.value = []
  }

  /**
   * 手动提交上传
   */
  const submit = () => {
    uploadRef.value?.submit()
  }

  /**
   * 取消上传
   */
  const abort = () => {
    uploadRef.value?.abort()
  }

  /**
   * 暴露方法
   */
  defineExpose({
    clearFiles,
    submit,
    abort,
    uploadRef
  })
</script>
