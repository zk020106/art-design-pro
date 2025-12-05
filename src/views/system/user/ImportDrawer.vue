<template>
  <ElDrawer
    v-model="visible"
    title="导入用户"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 600 ? 600 : '100%'"
    @close="reset"
  >
    <ElForm ref="formRef" :model="form" size="large" label-width="auto">
      <ElAlert v-if="!form.disabled" type="info" :closable="false" style="margin-bottom: 15px">
        <template #title> 请按照模板要求填写数据，填写完毕后，请先上传并进行解析。 </template>
        <template #default>
          <ElLink type="primary" @click="downloadTemplate">
            <ElIcon><Document /></ElIcon>
            下载模板
          </ElLink>
        </template>
      </ElAlert>

      <fieldset>
        <legend>1.解析数据</legend>
        <div class="file-box">
          <ElUpload
            drag
            :http-request="handleUpload"
            :limit="1"
            :show-file-list="true"
            :file-list="uploadFile"
            accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          >
            <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
            <div class="el-upload__text"> 将文件拖到此处，或<em>点击上传</em> </div>
            <template #tip>
              <div class="el-upload__tip">仅支持xls、xlsx格式</div>
            </template>
          </ElUpload>
        </div>
        <div v-if="dataResult.importKey">
          <div class="file-box">
            <ElSpace :size="20">
              <ElStatistic title="总计行数" :value="dataResult.totalRows" />
              <ElStatistic title="正常行数" :value="dataResult.validRows" />
            </ElSpace>
          </div>
          <div class="file-box">
            <ElSpace :size="20">
              <ElStatistic title="已存在用户" :value="dataResult.duplicateUserRows" />
              <ElStatistic title="已存在邮箱" :value="dataResult.duplicateEmailRows" />
              <ElStatistic title="已存在手机" :value="dataResult.duplicatePhoneRows" />
            </ElSpace>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>2.导入策略</legend>
        <ElFormItem label="用户已存在">
          <ElRadioGroup v-model="form.duplicateUser">
            <ElRadioButton :value="1">跳过该行</ElRadioButton>
            <ElRadioButton :value="3">停止导入</ElRadioButton>
            <ElRadioButton :value="2">修改数据</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="邮箱已存在">
          <ElRadioGroup v-model="form.duplicateEmail">
            <ElRadioButton :value="1">跳过该行</ElRadioButton>
            <ElRadioButton :value="3">停止导入</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="手机已存在">
          <ElRadioGroup v-model="form.duplicatePhone">
            <ElRadioButton :value="1">跳过该行</ElRadioButton>
            <ElRadioButton :value="3">停止导入</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="默认状态">
          <ElSwitch
            v-model="form.defaultStatus"
            :active-value="1"
            :inactive-value="2"
            active-text="启用"
            inactive-text="禁用"
          />
        </ElFormItem>
      </fieldset>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消导入</ElButton>
      <ElButton type="primary" @click="save">确认导入</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import {
    type UserImportResp,
    downloadUserImportTemplate,
    importUser,
    parseImportUser
  } from '@/apis/system/user'
  import { useDownload, useResetReactive } from '@/hooks'
  import { Document, UploadFilled } from '@element-plus/icons-vue'
  import { useWindowSize } from '@vueuse/core'
  import type { FormInstance, UploadRequestOptions } from 'element-plus'
  import { ElMessage } from 'element-plus'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()

  const visible = ref(false)
  const formRef = ref<FormInstance>()
  const uploadFile = ref([])

  const [form, resetForm] = useResetReactive({
    errorPolicy: 1,
    duplicateUser: 1,
    duplicateEmail: 1,
    duplicatePhone: 1,
    defaultStatus: 1
  })

  const dataResult = ref<UserImportResp>({
    importKey: '',
    totalRows: 0,
    validRows: 0,
    duplicateUserRows: 0,
    duplicateEmailRows: 0,
    duplicatePhoneRows: 0
  })

  // 重置
  const reset = () => {
    formRef.value?.resetFields()
    dataResult.value.importKey = ''
    uploadFile.value = []
    resetForm()
  }

  // 下载模板
  const downloadTemplate = () => {
    useDownload(() => downloadUserImportTemplate())
  }

  // 上传解析导入数据
  const handleUpload = (options: UploadRequestOptions) => {
    const { onProgress, onError, onSuccess, file } = options
    onProgress({ percent: 20 })
    const formData = new FormData()
    formData.append('file', file)

    parseImportUser(formData)
      .then((res) => {
        dataResult.value = res.data
        ElMessage.success('上传解析成功')
        onSuccess(res)
      })
      .catch((error) => {
        onError(error)
      })
  }

  // 执行导入
  const save = async () => {
    try {
      if (!dataResult.value.importKey) {
        ElMessage.warning('请先上传文件，解析导入数据')
        return false
      }
      form.importKey = dataResult.value.importKey
      const res = await importUser(form)
      ElMessage.success(`导入成功! 新增${res.data.insertRows}, 修改${res.data.updateRows}`)
      emit('save-success')
      visible.value = false
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // 打开
  const onOpen = () => {
    reset()
    visible.value = true
  }

  defineExpose({ onOpen })
</script>

<style scoped lang="scss">
  fieldset {
    padding: 15px 15px 0;
    margin-bottom: 15px;
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
  }

  fieldset legend {
    padding: 2px 5px;
    color: var(--el-text-color-primary);
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
  }

  .file-box {
    margin-bottom: 20px;
    margin-left: 10px;
  }
</style>
