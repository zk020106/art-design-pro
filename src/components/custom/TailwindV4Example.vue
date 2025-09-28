<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- 标题区域 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gradient mb-4"> Tailwind CSS v4 示例 </h1>
      <p class="text-gray-600 text-lg"> 展示 Tailwind CSS v4 在 Vue 项目中的使用 </p>
    </div>

    <!-- 卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- 卡片 1 -->
      <div class="card animate-fade-in">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">v4 新特性</h3>
            <p class="text-gray-600">全新的 CSS 配置方式</p>
          </div>
        </div>
        <p class="text-gray-700 mb-4">
          Tailwind CSS v4 使用 @theme 指令直接在 CSS 中配置主题，更加直观和灵活。
        </p>
        <button class="btn-primary w-full"> 了解更多 </button>
      </div>

      <!-- 卡片 2 -->
      <div class="card animate-fade-in" style="animation-delay: 0.1s">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">性能优化</h3>
            <p class="text-gray-600">更快的构建速度</p>
          </div>
        </div>
        <p class="text-gray-700 mb-4"> 使用 Rust 重写的引擎，构建速度提升 10 倍以上。 </p>
        <button class="btn-secondary w-full"> 查看性能 </button>
      </div>

      <!-- 卡片 3 -->
      <div class="card animate-fade-in" style="animation-delay: 0.2s">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Vite 集成</h3>
            <p class="text-gray-600">原生 Vite 插件支持</p>
          </div>
        </div>
        <p class="text-gray-700 mb-4"> 全新的 @tailwindcss/vite 插件，与 Vite 深度集成。 </p>
        <button class="btn-primary w-full"> 开始使用 </button>
      </div>
    </div>

    <!-- 表单示例 -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">表单示例</h2>
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> 用户名 </label>
          <input type="text" class="input-primary" placeholder="请输入用户名" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> 邮箱 </label>
          <input type="email" class="input-primary" placeholder="请输入邮箱地址" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> 消息 </label>
          <textarea class="input-primary h-24 resize-none" placeholder="请输入消息内容"></textarea>
        </div>
        <div class="flex space-x-4">
          <button type="submit" class="btn-primary flex-1"> 提交 </button>
          <button type="button" class="btn-secondary flex-1"> 重置 </button>
        </div>
      </form>
    </div>

    <!-- 响应式网格示例 -->
    <div class="card">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">响应式网格</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="i in 12"
          :key="i"
          class="bg-primary-100 hover:bg-primary-200 rounded-lg p-4 text-center transition-colors duration-200 cursor-pointer"
        >
          <div class="text-primary-600 font-semibold">{{ i }}</div>
        </div>
      </div>
    </div>

    <!-- v4 新特性展示 -->
    <div class="card mt-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">v4 新特性展示</h2>
      <div class="space-y-4">
        <div class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-2">CSS 配置</h3>
          <p class="text-gray-700 text-sm">
            使用 @theme 指令直接在 CSS 中配置主题变量，无需 JavaScript 配置文件。
          </p>
        </div>
        <div class="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-2">性能提升</h3>
          <p class="text-gray-700 text-sm">
            使用 Rust 重写的引擎，构建速度提升 10 倍以上，支持增量构建。
          </p>
        </div>
        <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-2">Vite 集成</h3>
          <p class="text-gray-700 text-sm">
            全新的 @tailwindcss/vite 插件，与 Vite 深度集成，支持 HMR。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 这里可以添加组件逻辑
</script>

<style scoped>
  /* 如果需要，可以在这里添加自定义样式 */
</style>
