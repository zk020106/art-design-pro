/**
 * Timer 类型定义
 * 提供跨平台兼容的定时器类型
 */

// 在浏览器环境中，setTimeout 返回一个数字
// 在 Node.js 环境中，setTimeout 返回一个 NodeJS.Timeout 对象
// 使用 ReturnType<typeof setTimeout> 可以自动适配不同环境

export type Timer = ReturnType<typeof setTimeout>

// 如果需要，也可以导出兼容的类型
export type Timeout = number // 浏览器环境
export type NodeTimeout = NodeJS.Timeout // Node.js 环境
