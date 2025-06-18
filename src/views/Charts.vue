<template>
  <div class="charts-container">
    <div class="page-header">
      <h2>图表管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建图表
      </el-button>
    </div>
    
    <el-row :gutter="20">
      <el-col
        v-for="chart in charts"
        :key="chart.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>{{ chart.Name }}</span>
              <el-dropdown>
                <el-button type="primary" link>
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEdit(chart)">
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handlePreview(chart)">
                      预览
                    </el-dropdown-item>
                    <el-dropdown-item
                      divided
                      type="danger"
                      @click="handleDelete(chart)"
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          
          <div class="chart-content">
            <div class="chart-description">{{ chart.Description }}</div>
            <div class="chart-type">
              <el-tag>{{ chart.Type }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新建图表' : '编辑图表'"
      width="60%"
    >
      <el-form
        ref="chartForm"
        :model="currentChart"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="图表名称" prop="name">
          <el-input v-model="currentChart.name" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentChart.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="图表类型" prop="type">
          <el-select v-model="currentChart.type" style="width: 100%">
            <el-option label="柱状图" value="bar" />
            <el-option label="折线图" value="line" />
            <el-option label="饼图" value="pie" />
            <el-option label="散点图" value="scatter" />
            <el-option label="雷达图" value="radar" />
            <el-option label="热力图" value="heatmap" />
            <el-option label="仪表盘" value="gauge" />
            <el-option label="漏斗图" value="funnel" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="数据查询" prop="queryID">
          <el-select
            v-model="currentChart.queryID"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in queries"
              :key="item.ID"
              :label="item.Name"
              :value="item.ID"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标题">
          <el-input v-model="currentChart.title" />
        </el-form-item>
        
        <el-form-item label="X字段" v-if="isXYType">
          <el-input v-model="currentChart.xField" />
        </el-form-item>
        
        <el-form-item label="Y字段" v-if="isXYType">
          <el-input v-model="currentChart.yField" />
        </el-form-item>
        
        <el-form-item label="分组字段" v-if="isXYType || isRadar">
          <el-input v-model="currentChart.seriesField" />
        </el-form-item>
        
        <el-form-item label="角度字段" v-if="isPie">
          <el-input v-model="currentChart.angleField" />
        </el-form-item>
        
        <el-form-item label="数值字段" v-if="isPie || isGauge || isRadar">
          <el-input v-model="currentChart.valueField" />
        </el-form-item>
        
        <el-form-item label="颜色">
          <el-input v-model="currentChart.color" placeholder="如 #5470C6,#91CC75,#FAC858" />
        </el-form-item>
        
        <el-form-item label="堆叠" v-if="isXYType">
          <el-switch v-model="currentChart.stack" />
        </el-form-item>
        
        <el-form-item label="半径" v-if="isPie || isRadar">
          <el-input v-model="currentChart.radius" placeholder="如 0.8" />
        </el-form-item>
        
        <el-form-item label="最小值" v-if="isGauge">
          <el-input v-model="currentChart.min" />
        </el-form-item>
        
        <el-form-item label="最大值" v-if="isGauge">
          <el-input v-model="currentChart.max" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 图表预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="图表预览"
      width="80%"
    >
      <div ref="chartRef" style="height:400px;width:100%"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { lo } from 'element-plus/es/locales.mjs'
import * as echarts from 'echarts'

const charts = ref([])
const queries = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const previewVisible = ref(false)
const chartRef = ref(null)
let chartInstance = null

const currentChart = reactive({
  id: null,
  name: '',
  description: '',
  type: 'bar',
  queryID: null,
  title: '',
  xField: '',
  yField: '',
  seriesField: '',
  angleField: '',
  valueField: '',
  color: '',
  stack: false,
  radius: '',
  min: '',
  max: ''
})

const rules = {
  name: [
    { required: true, message: '请输入图表名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择图表类型', trigger: 'change' }
  ],
  queryID: [
    { required: true, message: '请选择数据查询', trigger: 'change' }
  ],
  xField: [
    { required: true, message: '请输入X轴字段', trigger: 'blur' }
  ],
  yField: [
    { required: true, message: '请输入Y轴字段', trigger: 'blur' }
  ]
}

const isXYType = computed(() => ['bar', 'line', 'scatter', 'heatmap'].includes(currentChart.type))
const isPie = computed(() => currentChart.type === 'pie')
const isGauge = computed(() => currentChart.type === 'gauge')
const isRadar = computed(() => currentChart.type === 'radar')

const fetchCharts = async () => {
  try {
    const response = await axios.get('/api/charts')
    charts.value = response.data
  } catch (error) {
    ElMessage.error('获取图表列表失败')
  }
}

const fetchQueries = async () => {
  try {
    const response = await axios.get('/api/queries')
    queries.value = Array.isArray(response.data)
      ? response.data
      : (response.data.data || [])
  } catch (error) {
    ElMessage.error('获取查询列表失败')
    queries.value = []
  }
}

const handleCreate = () => {
  dialogType.value = 'create'
  currentChart.id = null
  currentChart.name = ''
  currentChart.description = ''
  currentChart.type = 'bar'
  currentChart.queryID = null
  currentChart.xField = ''
  currentChart.yField = ''
  currentChart.seriesField = ''
  currentChart.angleField = ''
  currentChart.valueField = ''
  currentChart.color = ''
  currentChart.stack = false
  currentChart.radius = ''
  currentChart.min = ''
  currentChart.max = ''
  currentChart.title = ''
  dialogVisible.value = true
}

const handleEdit = (chart) => {
  dialogType.value = 'edit'
  Object.assign(currentChart, {
    id: chart.ID,
    name: chart.Name,
    description: chart.description,
    type: chart.Type,
    queryID: chart.QueryID || chart.queryID || chart.query_id,
    title: '',
    xField: '',
    yField: '',
    seriesField: '',
    angleField: '',
    valueField: '',
    color: '',
    stack: false,
    radius: '',
    min: '',
    max: ''
  })
  try {
    const cfg = JSON.parse(chart.Config || '{}')
    if (cfg.title) currentChart.title = cfg.title
    if (cfg.xField) currentChart.xField = cfg.xField
    if (cfg.yField) currentChart.yField = cfg.yField
    if (cfg.seriesField) currentChart.seriesField = cfg.seriesField
    if (cfg.angleField) currentChart.angleField = cfg.angleField
    if (cfg.valueField) currentChart.valueField = cfg.valueField
    if (cfg.color) currentChart.color = Array.isArray(cfg.color) ? cfg.color.join(',') : cfg.color
    if (cfg.stack !== undefined) currentChart.stack = cfg.stack
    if (cfg.radius) currentChart.radius = cfg.radius
    if (cfg.min !== undefined) currentChart.min = cfg.min
    if (cfg.max !== undefined) currentChart.max = cfg.max
  } catch {}
  dialogVisible.value = true
}

const handleDelete = async (chart) => {
  try {
    await ElMessageBox.confirm('确定要删除这个图表吗？', '提示', {
      type: 'warning'
    })
    currentChart.id = chart.ID
    await axios.delete(`/api/charts/${currentChart.id}`)
    ElMessage.success('删除成功')
    fetchCharts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handlePreview = (chart) => {
  Object.assign(currentChart, {
    id: chart.ID,
    name: chart.Name,
    description: chart.description,
    type: chart.Type,
    queryID: chart.QueryID || chart.queryID || chart.query_id,
    config: chart.Config,
    title: '',
    xField: '',
    yField: '',
    seriesField: '',
    angleField: '',
    valueField: '',
    color: '',
    stack: false,
    radius: '',
    min: '',
    max: ''
  })
  try {
    const cfg = JSON.parse(chart.Config || '{}')
    if (cfg.title) currentChart.title = cfg.title
    if (cfg.xField) currentChart.xField = cfg.xField
    if (cfg.yField) currentChart.yField = cfg.yField
    if (cfg.seriesField) currentChart.seriesField = cfg.seriesField
    if (cfg.angleField) currentChart.angleField = cfg.angleField
    if (cfg.valueField) currentChart.valueField = cfg.valueField
    if (cfg.color) currentChart.color = Array.isArray(cfg.color) ? cfg.color.join(',') : cfg.color
    if (cfg.stack !== undefined) currentChart.stack = cfg.stack
    if (cfg.radius) currentChart.radius = cfg.radius
    if (cfg.min !== undefined) currentChart.min = cfg.min
    if (cfg.max !== undefined) currentChart.max = cfg.max
  } catch {}
  previewVisible.value = true
}

const handleSave = async () => {
  try {
    const config = buildConfig(currentChart, currentChart.type)
    const payload = {
      Name: currentChart.name,
      Description: currentChart.description,
      Type: currentChart.type,
      QueryID: currentChart.queryID,
      Config: JSON.stringify(config)
    }
    if (dialogType.value === 'create') {
      await axios.post('/api/charts', payload)
      ElMessage.success('创建成功')
    } else {
      await axios.put(`/api/charts/${currentChart.id}`, payload)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchCharts()
  } catch (error) {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
  }
}

function buildConfig(form, type) {
  const config = { title: form.title }
  if (form.color) config.color = form.color.split(',')
  if (isXYType.value) {
    config.xField = form.xField
    config.yField = form.yField
    config.seriesField = form.seriesField
    config.stack = form.stack
    config.xAxis = { name: form.xField, type: 'category' }
    config.yAxis = { name: form.yField, type: 'value' }
    config.legend = { show: true, position: 'top' }
    config.tooltip = { show: true, trigger: 'axis' }
    config.label = { show: true, position: 'top' }
  } else if (isPie.value) {
    config.angleField = form.angleField
    config.valueField = form.valueField
    config.radius = form.radius
    config.label = { show: true, position: 'outside' }
    config.legend = { show: true, position: 'top' }
  } else if (isGauge.value) {
    config.valueField = form.valueField
    config.min = form.min
    config.max = form.max
  } else if (isRadar.value) {
    config.seriesField = form.seriesField
    config.valueField = form.valueField
    config.radius = form.radius
  }
  return config
}

const getQueryData = async (queryID) => {
  if (!queryID) return []
  try {
    const res = await axios.post(`/api/queries/${queryID}/execute`)
    return res.data || []
  } catch {
    return []
  }
}

watch(previewVisible, async (val) => {
  if (val) {
    await nextTick()
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value)
    }
    try {
      const config = JSON.parse(currentChart.config || '{}')
      // 查询数据 
      const rawData = await getQueryData(currentChart.queryID)
      const data = Array.isArray(rawData) ? rawData : (rawData.data || [])
      const option = convertToEchartsOption(config, data)
      chartInstance.setOption(option)
    } catch (e) {
      chartInstance.clear()
    }
  }
})

function convertToEchartsOption(config, data = []) {
  const xField = config.xField || '月份'
  const yField = config.yField || '销售额'
  const seriesField = config.seriesField || '产品类别'

  // 1. 获取所有x轴（如月份）和分组（如产品类别）
  const xAxisData = [...new Set(data.map(d => d[xField]))]
  const groups = [...new Set(data.map(d => d[seriesField]))]

  // 2. 按分组生成 series
  const series = groups.map(group => ({
    name: group,
    type: currentChart.type,
    data: xAxisData.map(x =>
      (data.find(d => d[xField] === x && d[seriesField] === group) || {})[yField] || 0
    )
  }))

  return {
    title: { text: config.title || '' },
    tooltip: config.tooltip || {},
    legend: { data: groups },
    color: config.color || undefined,
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: config.yAxis || {},
    series
  }
}

onMounted(() => {
  fetchCharts()
  fetchQueries()
})
</script>

<style lang="scss" scoped>
.charts-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
    }
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chart-content {
      .chart-description {
        color: #666;
        margin-bottom: 10px;
        min-height: 40px;
      }
      
      .chart-type {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
  
  .chart-preview {
    height: 400px;
  }
}
</style> 