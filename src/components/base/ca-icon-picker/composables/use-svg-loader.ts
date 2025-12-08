/**
 * SVG 文件加载器
 * 用于扫描并加载指定文件夹下的 SVG 文件
 *
 * Vite 限制说明：
 * - import.meta.glob 的路径参数必须是字面量，不能是变量或拼接
 * - 因此这里直接写死路径，避免编译错误
 */

import { computed } from 'vue'

export interface SvgIcon {
  name: string
  svg: string
}

/**
 * 加载本地 SVG 图标
 * 固定扫描 @/assets/images/icons/*.svg 下的所有 SVG 文件
 */
export function useLocalSvgLoader() {
  const loadSvgs = () => {
    try {
      // 直接使用字面量路径
      const modules = import.meta.glob('@/assets/images/icons/*.svg', {
        eager: true,
        import: 'default'
      })

      const svgMap: Record<string, string> = {}
      Object.keys(modules).forEach((path) => {
        const name = path.split('/').pop()?.replace('.svg', '') || ''
        if (name) {
          svgMap[name] = modules[path] as string
        }
      })
      return svgMap
    } catch (error) {
      console.warn('Failed to load local SVG icons:', error)
      return {}
    }
  }

  const svgMap = computed(loadSvgs)

  /**
   * 解码 SVG 数据
   */
  const decodeSvg = (svgData: string) => {
    try {
      return decodeURIComponent(svgData.split(',')[1])
    } catch (error) {
      console.warn('Failed to decode SVG:', error)
      return svgData
    }
  }

  /**
   * 获取 SVG 列表
   */
  const svgList = computed<SvgIcon[]>(() => {
    return Object.keys(svgMap.value).map((name) => ({
      name,
      svg: svgMap.value[name]
    }))
  })

  /**
   * 搜索过滤 SVG
   */
  const filterSvgs = (query: string, list?: SvgIcon[]) => {
    const targetList = list || svgList.value
    if (!query) return targetList

    const lowerQuery = query.toLowerCase()
    return targetList.filter((item) => item.name.toLowerCase().includes(lowerQuery))
  }

  return {
    svgMap,
    svgList,
    decodeSvg,
    filterSvgs
  }
}
