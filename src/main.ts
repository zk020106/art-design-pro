import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import '@styles/core/tailwind.css'; // tailwind
import '@styles/index.scss'; // 样式
import '@utils/sys/console.ts'; // 控制台输出内容
import ElementPlus from 'element-plus';
import 'gi-component/dist/gi.css';


import GiComponent, { Dialog } from 'gi-component';
import { createApp } from 'vue';
import App from './App.vue';
import { setupGlobDirectives } from './directives';
import language from './locales'; // 国际化
import { initRouter } from './router'; // Router
import { initStore } from './store'; // Store
import { setupErrorHandle } from './utils/sys/error-handle';

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
Dialog._context = app._context // 继承主应用的上下文

initStore(app)
initRouter(app)
setupGlobDirectives(app)
setupErrorHandle(app)
app.use(ElementPlus)
app.use(language)
app.use(GiComponent)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')