import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/main.scss'
import axios from 'axios'

// 请求拦截器：自动加 token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())

app.use(ElementPlus)

app.use(router)

// 在开发环境下，屏蔽特定的 ECharts 警告
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('geo3D exists')) {
      return; // 发现特定警告，直接返回，不打印
    }
    originalWarn(...args); // 其他警告正常打印
  };
}

console.warn = () => {};

app.mount('#app') 