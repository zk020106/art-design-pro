/**
 * 国际化 Hook
 * @description 基于 element-plus 的国际化方案
 */

import { useI18n } from 'vue-i18n'

/**
 * 使用国际化
 * @returns t 翻译函数
 */
export function useLocale() {
  const { t } = useI18n()

  return {
    t,
    locale: t
  }
}
