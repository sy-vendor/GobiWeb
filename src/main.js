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

// 屏蔽 Element Plus 的"was accessed during render but is not defined on instance"警告
if (import.meta.env.MODE === 'development') {
  const warn = console.warn
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('was accessed during render but is not defined on instance')
    ) {
      return
    }
    warn(...args)
  }
}

app.mount('#app') 