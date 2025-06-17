<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>总查询数</span>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ dashboardData.totalQueries }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>总图表数</span>
              <el-icon><PieChart /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ dashboardData.totalCharts }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>用户数</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ dashboardData.totalUsers }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>今日查询</span>
              <el-icon><Timer /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ dashboardData.todayQueries }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>查询趋势</span>
            </div>
          </template>
          <el-table :data="dashboardData.queryTrends || []" style="width: 100%">
            <el-table-column prop="date" label="日期" />
            <el-table-column prop="count" label="查询次数" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门查询</span>
            </div>
          </template>
          <el-table :data="dashboardData.hotQueries || []" style="width: 100%">
            <el-table-column prop="name" label="查询名称" />
            <el-table-column prop="count" label="执行次数" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { lo } from 'element-plus/es/locales.mjs'

const dashboardData = ref({
  totalQueries: 0,
  totalCharts: 0,
  totalUsers: 0,
  todayQueries: 0,
  queryTrends: [],
  hotQueries: []
})

const fetchDashboardData = async () => {
  try {
    const res = await axios.get('/api/dashboard/stats')
    dashboardData.value = { ...(res.data || {
      totalQueries: 0,
      totalCharts: 0,
      totalUsers: 0,
      todayQueries: 0,
      queryTrends: [],
      hotQueries: []
    }) }
  } catch (e) {
    dashboardData.value = {
      totalQueries: 0,
      totalCharts: 0,
      totalUsers: 0,
      todayQueries: 0,
      queryTrends: [],
      hotQueries: []
    }
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      text-align: center;
      margin: 10px 0;
    }
  }
  
  .chart-row {
    margin-top: 20px;
    
    .chart-container {
      height: 300px;
    }
  }
}
</style> 