<template>
  <div class="email-login-form">
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

      <ElFormItem prop="email">
        <ElInput
          :placeholder="$t('login.email.placeholder[0]')"
          v-model.trim="formData.email"
          clearable
        >
          <template #prefix>
            <i class="iconfont-sys icon-email"></i>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem prop="captcha">
        <div class="captcha-wrapper">
          <ElInput
            :placeholder="$t('login.email.placeholder[1]')"
            v-model.trim="formData.captcha"
            clearable
          >
            <template #prefix>
              <i class="iconfont-sys icon-verify"></i>
            </template>
          </ElInput>
          <ElButton
            class="captcha-btn"
            :disabled="captchaDisabled"
            @click="sendCaptcha"
            :loading="sendingCaptcha"
          >
            {{ captchaButtonText }}
          </ElButton>
        </div>
      </ElFormItem>

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
  import { ref, reactive, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getEmailCaptcha } from '@/apis/common/captcha'
  import type { BehaviorCaptchaReq } from '@/apis/common/type'
  import { useAuthStore } from '@/store/modules/auth'
  import { useTenantStore } from '@/store/modules/tenant'

  const emit = defineEmits<{
    (e: 'login-success'): void
  }>()

  const { t } = useI18n()
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const sendingCaptcha = ref(false)
  const countdown = ref(0)

  const formData = reactive({
    email: '',
    captcha: '',
    tenantCode: ''
  })

  const rules = computed<FormRules>(() => ({
    email: [
      { required: true, message: () => t('login.email.placeholder[0]'), trigger: 'blur' },
      { type: 'email', message: () => t('login.email.invalid'), trigger: 'blur' }
    ],
    captcha: [{ required: true, message: () => t('login.email.placeholder[1]'), trigger: 'blur' }]
  }))

  // 验证码按钮状态
  const captchaDisabled = computed(() => {
    return !formData.email || !/\S+@\S+\.\S+/.test(formData.email) || countdown.value > 0
  })

  // 验证码按钮文本
  const captchaButtonText = computed(() => {
    return countdown.value > 0 ? `${countdown.value}s` : t('login.email.sendCaptcha')
  })

  // 倒计时
  const startCountdown = () => {
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }

  // 发送验证码
  const sendCaptcha = async () => {
    if (!formData.email) {
      ElMessage.warning(t('login.email.placeholder[0]'))
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      ElMessage.warning(t('login.email.invalid'))
      return
    }

    try {
      sendingCaptcha.value = true

      // 这里需要先获取图片验证码验证，简化处理
      const captchaReq: BehaviorCaptchaReq = {
        captchaType: 'EMAIL',
        captchaVerification: '' // 实际应该先验证图片验证码
      }

      const result = await getEmailCaptcha(formData.email, captchaReq)
      if (result) {
        ElMessage.success(t('login.email.captchaSent'))
        startCountdown()
      } else {
        ElMessage.error(t('login.email.captchaFailed'))
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      ElMessage.error(t('login.email.captchaFailed'))
    } finally {
      sendingCaptcha.value = false
    }
  }

  // 登录处理
  const handleLogin = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // 使用 auth store 进行登录，直接传递租户编码
      await authStore.loginWithEmail(
        {
          email: formData.email,
          captcha: formData.captcha
        },
        formData.tenantCode || undefined
      )

      // 通知父组件登录成功
      emit('login-success')
    } catch (error) {
      console.error('[EmailLogin] Login error:', error)
      ElMessage.error(t('login.email.loginError'))
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .email-login-form {
    .captcha-wrapper {
      display: flex;
      gap: 10px;
      align-items: center;

      .el-input {
        flex: 1;
      }

      .captcha-btn {
        width: 120px;
      }
    }

    .login-btn {
      margin-top: 20px;
    }
  }
</style>
