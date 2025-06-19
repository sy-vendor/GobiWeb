<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        :router="true"
        :collapse="isCollapse"
      >
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/queries">
          <el-icon><Document /></el-icon>
          <span>查询管理</span>
        </el-menu-item>
        <el-menu-item index="/charts">
          <el-icon><PieChart /></el-icon>
          <span>图表管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/datasources">
          <el-icon><Connection /></el-icon>
          <span>数据源管理</span>
        </el-menu-item>
        <el-menu-item index="/templates">
          <el-icon><DocumentAdd /></el-icon>
          <span>模板管理</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon><DocumentCopy /></el-icon>
          <span>报告管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-left">
          <el-button @click="toggleCollapse">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-dropdown">
              {{ username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  DataLine, 
  Document, 
  PieChart, 
  User, 
  Connection, 
  DocumentAdd, 
  DocumentCopy,
  Fold,
  Expand,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const userStr = localStorage.getItem('user')
let user = {}
try {
  user = userStr ? JSON.parse(userStr) : {}
} catch {
  user = {}
}
const username = ref(user.username || '用户')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100%;
  
  .el-aside {
    background-color: transparent;
    padding: 0;
    border-right: none;
    
    .el-menu {
      background-color: #304156;
      color: #fff;
      border-right: none;
      min-height: 100vh;
      transition: width 0.2s;
      
      .el-menu-item {
        color: #fff;
        &:hover, &.is-active {
          background-color: #263445;
          color: #409eff;
        }
      }
      .el-sub-menu__title {
        color: #fff;
      }
      .el-icon {
        color: #fff;
      }
    }
  }
  
  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    
    .header-right {
      .user-dropdown {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
  
  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}
</style> 