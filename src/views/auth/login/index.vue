<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="tenantCode">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.tenantCode')"
                v-model.trim="formData.tenantCode"
              />
            </ElFormItem>
            <ElFormItem prop="username">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.username')"
                v-model.trim="formData.username"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <!-- 图片验证 -->
            <ElFormItem prop="captcha" v-if="isCaptchaEnabled">
              <ElInput
                v-model="formData.captcha"
                placeholder="请输入验证码"
                :max-length="4"
                allow-clear
                style="flex: 1 1"
              />
              <div class="captcha-container" @click="getCaptcha">
                <img :src="captchaImgBase64" :alt="$t('login.captcha')" class="captcha" />
                <div v-if="formData.expired" class="overlay">
                  <p>{{ $t('login.expired') }}</p>
                </div>
              </div>
            </ElFormItem>

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                $t('login.forgetPwd')
              }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>{{ $t('login.noAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                $t('login.register')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getImageCaptcha } from '@/apis'
  import AppConfig from '@/config'
  import { useUserStore } from '@/store/modules/user'
  import { encryptByRsa } from '@/utils/encrypt'
  import { HttpError } from '@/utils/http/error'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()
  const captchaImgBase64 = ref<string>()
  const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()
  const isCaptchaEnabled = ref<boolean>(true)
  const formData = reactive({
    tenantCode: '',
    username: 'admin',
    password: 'admin123',
    captcha: '',
    uuid: '',
    expired: false,
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
  }))

  const loading = ref(false)
  // 获取验证码
  const getCaptcha = async () => {
    const { uuid, img, isEnabled } = await getImageCaptcha()
    isCaptchaEnabled.value = isEnabled
    // 确保 base64 图片有正确的前缀
    captchaImgBase64.value = img
    formData.uuid = uuid
    formData.expired = false
  }
  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // ... (中间代码保持不变)

      // 登录请求
      const { username, password, captcha, uuid, tenantCode } = formData

      // 密码加密
      const encryptedPassword = encryptByRsa(password)
      if (!encryptedPassword) {
        ElNotification.error(`${t('login.error.passwordEncrypt')}`)
        return
      }

      // 1. 登录获取 token
      await userStore.accountLogin(
        {
          username,
          password: encryptedPassword,
          captcha: isCaptchaEnabled.value ? captcha : undefined,
          uuid: isCaptchaEnabled.value ? uuid : undefined
        },
        tenantCode
      )

      // 登录成功处理
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // 验证码错误时刷新验证码
        if (isCaptchaEnabled.value) {
          getCaptcha()
        }
      } else {
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
    }
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${systemName}!`
      })
    }, 1000)
  }
  onMounted(() => {
    getCaptcha()
  })
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  :deep(.el-select__wrapper) {
    height: 40px !important;
  }
</style>
