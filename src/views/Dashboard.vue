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
          <div class="card-value">{{ dashboardData.queryCount }}</div>
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
          <div class="card-value">{{ dashboardData.chartCount }}</div>
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
          <div class="card-value">{{ dashboardData.userCount }}</div>
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
          <div class="card-value">{{ dashboardData.todayQueryCount }}</div>
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
          <div class="chart-container">
            <!-- 这里将添加查询趋势图表 -->
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门查询</span>
            </div>
          </template>
          <el-table :data="popularQueries" style="width: 100%">
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

const dashboardData = ref({
  queryCount: 0,
  chartCount: 0,
  userCount: 0,
  todayQueryCount: 0,
  // 你可以根据实际接口字段补充其他默认值
})

const popularQueries = ref([])

const fetchDashboardData = async () => {
  try {
    const res = await axios.get('/api/dashboard/stats')
    dashboardData.value = res.data || {
      queryCount: 0,
      chartCount: 0,
      userCount: 0,
      todayQueryCount: 0,
    }
    popularQueries.value = res.data.popularQueries
  } catch (e) {
    dashboardData.value = {
      queryCount: 0,
      chartCount: 0,
      userCount: 0,
      todayQueryCount: 0,
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