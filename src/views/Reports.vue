<template>
  <div class="reports-container">
    <div class="page-header">
      <h2>报告管理</h2>
      <el-button type="primary" @click="onCreateSchedule">
        <el-icon><Plus /></el-icon>
        创建报告计划
      </el-button>
    </div>

    <!-- 报告计划列表 -->
    <el-card class="schedule-card">
      <template #header>
        <div class="card-header">
          <span>报告计划</span>
          <el-button @click="fetchScheduleList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="scheduleList" v-loading="loading" style="width: 100%">
        <el-table-column prop="Name" label="报告名称" min-width="150" />
        <el-table-column prop="Type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.Type)">{{ getTypeLabel(row.Type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="CronPattern" label="执行时间" width="150" />
        <el-table-column prop="NextRun" label="下次执行" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.NextRun) }}
          </template>
        </el-table-column>
        <el-table-column prop="LastRun" label="上次执行" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.LastRun) }}
          </template>
        </el-table-column>
        <el-table-column prop="Active" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.Active"
              @change="toggleScheduleStatus(row)"
              :loading="row.statusLoading"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editSchedule(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteSchedule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 报告历史记录 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>报告历史</span>
          <el-button @click="fetchReportList" :loading="historyLoading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="reportList" v-loading="historyLoading" style="width: 100%">
        <el-table-column prop="Name" label="报告名称" min-width="150" />
        <el-table-column prop="Type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.Type)">{{ getTypeLabel(row.Type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="GeneratedAt" label="生成时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.GeneratedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="Status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.Status)">
              {{ getStatusLabel(row.Status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Error" label="错误信息" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              @click="downloadReport(row)"
              :disabled="row.Status !== 'success'"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑报告计划对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingSchedule ? '编辑报告计划' : '创建报告计划'"
      width="600px"
    >
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="120px">
        <el-form-item label="报告名称" prop="name">
          <el-input v-model="scheduleForm.name" placeholder="请输入报告名称" />
        </el-form-item>
        
        <el-form-item label="报告类型" prop="type">
          <el-select v-model="scheduleForm.type" placeholder="请选择报告类型" style="width: 100%">
            <el-option :label="'日报'" :value="'daily'" />
            <el-option :label="'周报'" :value="'weekly'" />
            <el-option :label="'月报'" :value="'monthly'" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="查询" prop="query_ids">
          <el-select
            v-model="scheduleForm.query_ids"
            multiple
            placeholder="请选择要包含的查询"
            style="width: 100%"
          >
            <el-option
              v-for="query in queryList"
              :key="query.ID"
              :label="query.Name || ''"
              :value="query.ID || ''"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="图表" prop="chart_ids">
          <el-select
            v-model="scheduleForm.chart_ids"
            multiple
            placeholder="请选择要包含的图表"
            style="width: 100%"
          >
            <el-option
              v-for="chart in chartList"
              :key="chart.ID"
              :label="chart.Name || ''"
              :value="chart.ID || ''"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模板" prop="template_ids">
          <el-select
            v-model="scheduleForm.template_ids"
            multiple
            placeholder="请选择要使用的模板"
            style="width: 100%"
          >
            <el-option
              v-for="template in templateList"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Cron表达式" prop="cron_pattern">
          <el-input v-model="scheduleForm.cron_pattern" placeholder="例如: 0 8 * * *" />
          <div class="cron-help">
            <p>常用表达式：</p>
            <ul>
              <li>0 8 * * * - 每天早上8点</li>
              <li>0 0 * * 1 - 每周一凌晨</li>
              <li>0 0 1 * * - 每月1号凌晨</li>
            </ul>
          </div>
        </el-form-item>
        
        <el-form-item label="是否激活">
          <el-switch v-model="scheduleForm.active" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule" :loading="saving">
          {{ editingSchedule ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const historyLoading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingSchedule = ref(null)
const scheduleList = ref([])
const reportList = ref([])
const queryList = ref([])
const chartList = ref([])
const templateList = ref([])
const scheduleFormRef = ref()

// 表单数据
const scheduleForm = reactive({
  name: '',
  type: 'daily',
  query_ids: [],
  chart_ids: [],
  template_ids: [],
  cron_pattern: '',
  active: true
})

// 表单验证规则
const scheduleRules = {
  name: [
    { required: true, message: '请输入报告名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择报告类型', trigger: 'change' }
  ],
  query_ids: [
    { type: 'array', required: true, message: '请选择至少一个查询', trigger: 'change' }
  ],
  template_ids: [
    { type: 'array', required: true, message: '请选择至少一个模板', trigger: 'change' }
  ],
  cron_pattern: [
    { required: true, message: '请输入Cron表达式', trigger: 'blur' },
    { pattern: /^(\S+\s+){4}\S+$/, message: 'Cron表达式格式不正确', trigger: 'blur' }
  ]
}

// 监听对话框显示状态
watch(showCreateDialog, async (newVal) => {
  if (newVal) {
    // 当对话框打开时，加载所需数据
    await Promise.all([
      fetchQueryList(),
      fetchChartList(),
      fetchTemplateList()
    ])
  }
})

// 获取报告计划列表
const fetchScheduleList = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/reports/schedules', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      scheduleList.value = data
    } else {
      ElMessage.error('获取报告计划列表失败')
    }
  } catch (error) {
    console.error('获取报告计划列表错误:', error)
    ElMessage.error('获取报告计划列表失败')
  } finally {
    loading.value = false
  }
}

// 获取报告列表
const fetchReportList = async () => {
  historyLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/reports', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      reportList.value = data
    } else {
      ElMessage.error('获取报告列表失败')
    }
  } catch (error) {
    console.error('获取报告列表错误:', error)
    ElMessage.error('获取报告列表失败')
  } finally {
    historyLoading.value = false
  }
}

// 获取查询列表
const fetchQueryList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/queries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      queryList.value = data
    }
  } catch (error) {
    console.error('获取查询列表错误:', error)
  }
}

// 获取图表列表
const fetchChartList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/charts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      chartList.value = data
    }
  } catch (error) {
    console.error('获取图表列表错误:', error)
  }
}

// 获取模板列表
const fetchTemplateList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/templates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      templateList.value = data
    } else {
      const errorData = await response.json()
      console.error('获取模板列表失败:', errorData)
      ElMessage.error('获取模板列表失败')
    }
  } catch (error) {
    console.error('获取模板列表错误:', error)
    ElMessage.error('获取模板列表失败')
  }
}

// 保存报告计划
const saveSchedule = async () => {
  try {
    await scheduleFormRef.value.validate()
    
    saving.value = true
    const token = localStorage.getItem('token')
    const url = editingSchedule.value 
      ? `/api/reports/schedules/${editingSchedule.value.ID}`
      : '/api/reports/schedules'
    
    const method = editingSchedule.value ? 'PUT' : 'POST'
    
    // 构造请求数据
    const requestData = {
      name: scheduleForm.name,
      type: scheduleForm.type,
      query_ids: scheduleForm.query_ids,
      chart_ids: scheduleForm.chart_ids,
      template_ids: scheduleForm.template_ids,
      cron_pattern: scheduleForm.cron_pattern,
      active: scheduleForm.active
    }
        
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    })
    
    if (response.ok) {
      ElMessage.success(editingSchedule.value ? '报告计划更新成功' : '报告计划创建成功')
      showCreateDialog.value = false
      resetForm()
      fetchScheduleList()
    } else {
      const errorData = await response.json()
      ElMessage.error(errorData.message || '操作失败')
    }
  } catch (error) {
    console.error('保存报告计划错误:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    saving.value = false
  }
}

// 编辑报告计划
const editSchedule = (schedule) => {
  editingSchedule.value = schedule
  Object.assign(scheduleForm, {
    name: schedule.Name || '',
    type: schedule.Type || 'daily',
    query_ids: Array.isArray(schedule.Queries) ? schedule.Queries : JSON.parse(schedule.Queries || '[]').map(q => q.id),
    chart_ids: Array.isArray(schedule.Charts) ? schedule.Charts : JSON.parse(schedule.Charts || '[]').map(c => c.id),
    template_ids: Array.isArray(schedule.Templates) ? schedule.Templates : JSON.parse(schedule.Templates || '[]').map(t => t.id),
    cron_pattern: schedule.CronPattern || '',
    active: schedule.Active || false
  })
  showCreateDialog.value = true
}

// 删除报告计划
const deleteSchedule = async (schedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告计划"${schedule.Name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/reports/schedules/${schedule.ID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      ElMessage.success('删除成功')
      fetchScheduleList()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除报告计划错误:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 切换报告计划状态
const toggleScheduleStatus = async (schedule) => {
  schedule.statusLoading = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/reports/schedules/${schedule.ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        active: schedule.Active
      })
    })
    
    if (response.ok) {
      ElMessage.success('状态更新成功')
    } else {
      schedule.Active = !schedule.Active // 恢复原状态
      ElMessage.error('状态更新失败')
    }
  } catch (error) {
    schedule.Active = !schedule.Active // 恢复原状态
    console.error('切换状态错误:', error)
    ElMessage.error('状态更新失败')
  } finally {
    schedule.statusLoading = false
  }
}

// 下载报告
const downloadReport = async (report) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/reports/${report.ID}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.Name}_${formatDate(report.GeneratedAt)}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      ElMessage.success('下载成功')
    } else {
      ElMessage.error('下载失败')
    }
  } catch (error) {
    console.error('下载报告错误:', error)
    ElMessage.error('下载失败')
  }
}

// 重置表单
const resetForm = () => {
  editingSchedule.value = null
  Object.assign(scheduleForm, {
    name: '',
    type: 'daily',
    query_ids: [],
    chart_ids: [],
    template_ids: [],
    cron_pattern: '',
    active: true
  })
  nextTick(() => {
    scheduleFormRef.value?.resetFields()
  })
}

// 工具函数
const getTypeLabel = (type) => {
  const typeMap = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type) => {
  const typeMap = {
    daily: 'primary',
    weekly: 'success',
    monthly: 'warning'
  }
  return typeMap[type] || 'info'
}

const getStatusLabel = (status) => {
  const statusMap = {
    pending: '生成中',
    success: '成功',
    failed: '失败'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const statusMap = {
    pending: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

const formatDateTime = (dateStr) => {
  if (!dateStr || dateStr === '0001-01-01T00:00:00Z') {
    return '-'
  }
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().split('T')[0]
}

// 初始化
onMounted(() => {
  fetchScheduleList()
  fetchReportList()
  fetchQueryList()
  fetchChartList()
  fetchTemplateList()
})

const onCreateSchedule = () => {
  resetForm()
  showCreateDialog.value = true
}
</script>

<style lang="scss" scoped>
.reports-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      color: #303133;
    }
  }
  
  .schedule-card {
    margin-bottom: 20px;
  }
  
  .history-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .cron-help {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    
    p {
      margin: 0 0 4px 0;
    }
    
    ul {
      margin: 0;
      padding-left: 16px;
      
      li {
        margin-bottom: 2px;
      }
    }
  }
}
</style> 