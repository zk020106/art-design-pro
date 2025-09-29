<template>
  <div class="login">
    <LoginLeftView></LoginLeftView>

    <div class="right-wrap">
      <div class="top-right-wrap">
        <div v-if="shouldShowThemeToggle" class="btn theme-btn" @click="themeAnimation">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <ElDropdown
          v-if="shouldShowLanguage"
          @command="changeLanguage"
          popper-class="langDropDownStyle"
        >
          <div class="btn language-btn">
            <i class="iconfont-sys icon-language">&#xe611;</i>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
                <ElDropdownItem
                  :command="lang.value"
                  :class="{ 'is-selected': locale === lang.value }"
                >
                  <span class="menu-txt">{{ lang.label }}</span>
                  <i v-if="locale === lang.value" class="iconfont-sys icon-check">&#xe621;</i>
                </ElDropdownItem>
              </div>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>

          <!-- 登录表单 -->
          <div v-if="loginType === 'main'">
            <!-- 账号/手机登录 Tab -->
            <ElTabs v-model="activeTab" class="login-tabs">
              <ElTabPane :label="$t('login.account.title')" name="account">
                <AccountLogin @login-success="handleLoginSuccess" />
              </ElTabPane>
              <ElTabPane :label="$t('login.phone.title')" name="phone">
                <PhoneLogin @login-success="handleLoginSuccess" />
              </ElTabPane>
            </ElTabs>

            <!-- 其他登录方式 -->
            <div class="other-login">
              <div class="divider">
                <span class="text">{{ $t('login.otherLogin') }}</span>
              </div>

              <div class="other-login-methods">
                <!-- 邮箱登录按钮 -->
                <div class="other-login-item">
                  <ElButton class="other-login-btn" round @click="switchToEmail">
                    <i class="iconfont-sys icon-email"></i>
                    {{ $t('login.email.title') }}
                  </ElButton>
                </div>

                <!-- 第三方登录 -->
                <div class="other-login-item">
                  <ElButton
                    class="other-login-btn svg-btn"
                    round
                    @click="handleSocialLogin('github')"
                  >
                    <SvgIcon name="github" color="#000" />
                  </ElButton>
                </div>

                <div class="other-login-item">
                  <ElButton
                    class="other-login-btn svg-btn"
                    round
                    @click="handleSocialLogin('gitee')"
                  >
                    <SvgIcon name="gitee" />
                  </ElButton>
                </div>

                <div class="other-login-item">
                  <ElButton
                    class="other-login-btn svg-btn"
                    round
                    @click="handleSocialLogin('gitcode')"
                  >
                    <SvgIcon name="gitcode" />
                  </ElButton>
                </div>
              </div>
            </div>
          </div>

          <!-- 邮箱登录表单 -->
          <div v-else-if="loginType === 'email'">
            <EmailLogin @login-success="handleLoginSuccess" />
            <div class="switch-login">
              <ElButton link type="primary" @click="switchToMain">
                {{ $t('login.switchToMain') }}
              </ElButton>
            </div>
          </div>

          <div class="footer">
            <p>
              {{ $t('login.noAccount') }}
              <RouterLink :to="RoutesAlias.Register">{{ $t('login.register') }}</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { useSettingStore } from '@/store/modules/setting'
  import { useTenantStore } from '@/store/modules/tenant'
  import { storeToRefs } from 'pinia'
  import { RoutesAlias } from '@/router/routesAlias'
  import { languageOptions } from '@/locales'
  import { LanguageEnum } from '@/enums/appEnum'
  import { themeAnimation } from '@/utils/theme/animation'
  import { useHeaderBar } from '@/composables/useHeaderBar'
  import AppConfig from '@/config'
  import { useRouter } from 'vue-router'
  import AccountLogin from './components/AccountLogin.vue'
  import PhoneLogin from './components/PhoneLogin.vue'
  import EmailLogin from './components/EmailLogin.vue'
  import SvgIcon from '@/components/core/media/svg-icon/index.vue'

  defineOptions({ name: 'Login' })

  const { t } = useI18n()
  const router = useRouter()
  const userStore = useUserStore()
  const settingStore = useSettingStore()
  const tenantStore = useTenantStore()
  const { isDark } = storeToRefs(settingStore)
  const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar()

  const activeTab = ref('account')
  const loginType = ref('main') // 'main' | 'email'
  const systemName = AppConfig.systemInfo.name

  // 页面加载时获取租户信息
  onMounted(() => {
    tenantStore.getTenantInfo()
  })

  // 切换到邮箱登录
  const switchToEmail = () => {
    loginType.value = 'email'
  }

  // 切换回主登录
  const switchToMain = () => {
    loginType.value = 'main'
  }

  // 切换语言
  const { locale } = useI18n()
  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  // 登录成功处理
  const handleLoginSuccess = () => {
    showLoginSuccessNotice()
    router.push('/')
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
    }, 150)
  }

  // 第三方登录
  const handleSocialLogin = (source: string) => {
    console.log('第三方登录:', source)
    // 这里应该调用实际的第三方登录接口
    // socialAuth(source).then(res => {
    //   window.location.href = res.authorizeUrl
    // })
  }
</script>

<style lang="scss" scoped>
  @use './index';

  .login-tabs {
    margin-top: 20px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }
  }

  .other-login {
    margin-top: 30px;

    .divider {
      position: relative;
      height: 1px;
      text-align: center;
      background-color: var(--el-border-color);

      .text {
        position: absolute;
        top: 50%;
        left: 50%;
        padding: 0 15px;
        font-size: 14px;
        color: var(--art-text-gray-500);
        background-color: var(--art-main-bg-color);
        transform: translate(-50%, -50%);
      }
    }

    .other-login-methods {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 20px;

      .other-login-item {
        .other-login-btn {
          &.svg-btn {
            width: 40px;
            height: 40px;
            padding: 0;

            .social-icon {
              width: 20px;
              height: 20px;
            }
          }
        }
      }
    }
  }

  .switch-login {
    margin-top: 20px;
    text-align: center;
  }

  .footer {
    margin-top: 30px;
    text-align: center;

    p {
      font-size: 14px;
      color: var(--art-text-gray-800);

      a {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
