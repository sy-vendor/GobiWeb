import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      const { data, status } = error.response
      const message = data?.message || ''

      // 优先处理后端返回的特定错误消息
      const tokenErrors = ['Token expired', 'Invalid token', 'Authorization header is required']
      if (tokenErrors.includes(message)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // 避免在登录页重复跳转
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
        
        let tip = '登录状态异常，请重新登录'
        if (message === 'Token expired') tip = 'Token已过期，请重新登录'
        if (message === 'Invalid token') tip = 'Token无效，请重新登录'
        if (message === 'Authorization header is required') tip = '需要认证，请登录'
        
        ElMessage.error(tip)
        return Promise.reject(error)
      }

      // 按状态码进行通用处理
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
          ElMessage.error('登录认证失败，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限执行此操作')
          break
        case 404:
          ElMessage.error('请求的资源未找到')
          break
        case 500:
          ElMessage.error(message || '服务器内部错误')
          break
        default:
          ElMessage.error(message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接错误，请检查网络')
    } else {
      ElMessage.error('请求发送失败')
    }
    return Promise.reject(error)
  }
)

export default instance 