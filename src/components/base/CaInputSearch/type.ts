import InputSearch from './index.vue'
export interface InputSearchProps {
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  disabledHideButton?: boolean // 禁用的时候隐藏按钮
}
export type InputSearchInstance = InstanceType<typeof InputSearch>
