<template>
  <div class="account-login-form">
    <ElForm ref="formRef" :model="formData" :rules="rules" @keyup.enter="handleLogin">
      <!-- 租户编码输入框 -->
      <ElFormItem v-if="tenantStore.needInputTenantCode" prop="tenantCode">
        <ElInput
          v-model="formData.tenantCode"
          :placeholder="$t('login.tenantCode.placeholder')"
          allow-clear
        >
          <template #prefix>
            <i class="iconfont-sys icon-domain"></i>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem prop="username">
        <ElInput
          :placeholder="$t('login.account.placeholder[0]')"
          v-model.trim="formData.username"
          clearable
        >
          <template #prefix>
            <i class="iconfont-sys icon-user"></i>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem prop="password">
        <ElInput
          :placeholder="$t('login.account.placeholder[1]')"
          v-model.trim="formData.password"
          type="password"
          show-password
          clearable
        >
          <template #prefix>
            <i class="iconfont-sys icon-lock"></i>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem prop="captcha" v-if="captchaEnabled">
        <div class="captcha-wrapper">
          <ElInput
            :placeholder="$t('login.account.placeholder[2]')"
            v-model.trim="formData.captcha"
            clearable
          >
            <template #prefix>
              <i class="iconfont-sys icon-verify"></i>
            </template>
          </ElInput>
          <div class="captcha-container">
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaImage" alt="captcha" v-if="captchaImage" />
              <div class="loading" v-else>
                <ElIcon><Loading /></ElIcon>
              </div>
            </div>
            <!-- 验证码过期遮罩 -->
            <div class="captcha-overlay" v-if="isCaptchaExpired" @click="refreshCaptcha">
              <div class="expired-text">{{ $t('login.captcha.expired') }}</div>
            </div>
          </div>
        </div>
      </ElFormItem>

      <div class="form-footer">
        <ElCheckbox v-model="formData.rememberPassword">
          {{ $t('login.rememberPwd') }}
        </ElCheckbox>
        <RouterLink :to="RoutesAlias.ForgetPassword" class="forget-link">
          {{ $t('login.forgetPwd') }}
        </RouterLink>
      </div>

      <ElButton
        class="login-btn"
        type="primary"
        @click="handleLogin"
        :loading="loading"
        v-ripple
        block
      >
        {{ $t('login.btnText') }}
      </ElButton>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { RoutesAlias } from '@/router/routesAlias'
  import { getImageCaptcha } from '@/apis/common/captcha'
  import type { ImageCaptchaResp } from '@/apis/common/type'
  import { useAuthStore } from '@/store/modules/auth'
  import { useTenantStore } from '@/store/modules/tenant'
  import { encryptLoginPassword } from '@/utils/encrypt'

  const emit = defineEmits<{
    (e: 'login-success'): void
  }>()

  const { t } = useI18n()
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const captchaEnabled = ref(true)
  const captchaImage = ref<string>('')
  const captchaUuid = ref<string>('')
  const captchaExpireTime = ref<number>(0)
  const isCaptchaExpired = ref(false)

  const formData = reactive({
    username: '',
    password: '',
    captcha: '',
    rememberPassword: true,
    tenantCode: ''
  })

  // 使用函数形式的验证规则，避免语言切换时重新计算整个规则对象
  const rules = computed<FormRules>(() => ({
    username: [
      {
        required: true,
        message: () => t('login.account.placeholder[0]'),
        trigger: 'blur'
      }
    ],
    password: [
      {
        required: true,
        message: () => t('login.account.placeholder[1]'),
        trigger: 'blur'
      }
    ],
    captcha: captchaEnabled.value
      ? [
          {
            required: true,
            message: () => t('login.account.placeholder[2]'),
            trigger: 'blur'
          }
        ]
      : []
  }))

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const res: ImageCaptchaResp = await getImageCaptcha()
      captchaImage.value = res.img
      captchaUuid.value = res.uuid
      captchaEnabled.value = res.isEnabled
      captchaExpireTime.value = res.expireTime
      isCaptchaExpired.value = false

      // 设置过期定时器
      if (res.expireTime) {
        const now = Date.now()
        const delay = res.expireTime - now
        if (delay > 0) {
          setTimeout(() => {
            isCaptchaExpired.value = true
          }, delay)
        } else {
          isCaptchaExpired.value = true
        }
      }
    } catch (error) {
      console.error('获取验证码失败:', error)
      ElMessage.error(t('login.captcha.fetchError'))
    }
  }

  // 刷新验证码
  const refreshCaptcha = () => {
    if (isCaptchaExpired.value) {
      isCaptchaExpired.value = false
    }
    fetchCaptcha()
  }

  // 登录处理
  const handleLogin = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // 使用 auth store 进行登录，直接传递租户编码
      await authStore.loginWithAccount(
        {
          username: formData.username,
          password: encryptLoginPassword(formData.password), // 对密码进行加密
          captcha: formData.captcha,
          uuid: captchaUuid.value
        },
        formData.tenantCode || undefined
      )

      // 通知父组件登录成功
      emit('login-success')
    } catch (error) {
      console.error('[AccountLogin] Login error:', error)
      ElMessage.error(t('login.account.loginError'))
      // 刷新验证码
      refreshCaptcha()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchCaptcha()
  })
</script>

<style lang="scss" scoped>
  .account-login-form {
    .captcha-wrapper {
      display: flex;
      gap: 10px;
      align-items: center;
      width: 100%;

      .el-input {
        flex: 1;
        min-width: 0;
      }

      .captcha-container {
        position: relative;
        flex-shrink: 0;
        width: 120px;
        height: 40px;

        .captcha-image {
          width: 100%;
          height: 100%;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--el-border-color);
          border-radius: 4px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background-color: var(--el-fill-color-light);
          }
        }

        .captcha-overlay {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          cursor: pointer;
          background-color: rgb(0 0 0 / 50%);
          border-radius: 4px;

          .expired-text {
            padding: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            text-align: center;
          }

          // 添加点击效果
          &:hover {
            background-color: rgb(0 0 0 / 60%);
          }

          &:active {
            background-color: rgb(0 0 0 / 70%);
          }
        }
      }
    }

    .form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      .forget-link {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .login-btn {
      width: 100%;
      margin-top: 10px;
    }
  }
</style>
