import { ref, type Ref } from 'vue'

/**
 * 类似 React 的 useState,支持 TypeScript 泛型
 *
 * @param initialValue - 初始值
 * @returns [state, setState] - 状态和设置状态的函数
 *
 * @example
 * ```ts
 * const [count, setCount] = useState(0)
 * const [user, setUser] = useState<User>({ name: 'John', age: 30 })
 * const [list, setList] = useState<string[]>([])
 *
 * // 直接设置值
 * setCount(10)
 *
 * // 使用函数更新
 * setCount(prev => prev + 1)
 *
 * // 设置对象
 * setUser({ name: 'Jane', age: 25 })
 * ```
 */
export function useState<T>(initialValue: T): [Ref<T>, (value: T | ((prev: T) => T)) => void] {
  const state = ref<T>(initialValue) as Ref<T>

  const setState = (value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      state.value = (value as (prev: T) => T)(state.value)
    } else {
      state.value = value
    }
  }

  return [state, setState]
}

/**
 * 带重置功能的 useState
 * 类似 React 的 useState,但额外提供重置功能
 *
 * @param initialValue - 初始值
 * @returns [state, setState, resetState] - 状态、设置状态的函数和重置函数
 *
 * @example
 * ```ts
 * const [form, setForm, resetForm] = useResetState({ name: '', age: 0 })
 *
 * setForm({ name: 'John', age: 30 })
 * resetForm() // 重置为初始值 { name: '', age: 0 }
 * ```
 */
export function useResetState<T>(
  initialValue: T
): [Ref<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  const state = ref<T>(initialValue) as Ref<T>
  // 深拷贝初始值以避免引用问题
  const initial = JSON.parse(JSON.stringify(initialValue))

  const setState = (value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      state.value = (value as (prev: T) => T)(state.value)
    } else {
      state.value = value
    }
  }

  const resetState = () => {
    state.value = JSON.parse(JSON.stringify(initial))
  }

  return [state, setState, resetState]
}
