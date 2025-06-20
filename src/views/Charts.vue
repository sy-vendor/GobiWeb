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
            <el-option label="3D柱状图" value="3d-bar" />
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
        
        <el-form-item label="X字段" v-if="isXYType || is3DBar">
          <el-input v-model="currentChart.xField" />
        </el-form-item>
        
        <el-form-item label="Y字段" v-if="isXYType || is3DBar">
          <el-input v-model="currentChart.yField" />
        </el-form-item>
        
        <el-form-item label="Z字段" v-if="is3DBar">
          <el-input v-model="currentChart.zField" />
        </el-form-item>
        
        <el-form-item label="分组字段" v-if="isXYType || isRadar || isFunnel">
          <el-input v-model="currentChart.seriesField" />
        </el-form-item>
        
        <el-form-item label="角度字段" v-if="isPie">
          <el-input v-model="currentChart.angleField" />
        </el-form-item>
        
        <el-form-item label="数值字段" v-if="isPie || isGauge || isRadar || isFunnel">
          <el-input v-model="currentChart.valueField" />
        </el-form-item>
        
        <el-form-item v-if="currentChart.type === 'pie'" label="饼图类型">
          <el-select v-model="currentChart.pieType" style="width: 100%">
            <el-option label="圆形" value="pie" />
            <el-option label="环形" value="doughnut" />
          </el-select>
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
      <template #header="{ close, titleId, titleClass }">
        <div class="preview-header">
          <span :id="titleId" :class="titleClass">图表预览</span>
          <div class="preview-actions">
            <el-button type="primary" @click="handleExportImage" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出图片
            </el-button>
            <el-button type="success" @click="handlePrint">
              <el-icon><Printer /></el-icon>
              打印
            </el-button>
          </div>
        </div>
      </template>
      <div ref="chartRef" style="height:500px;width:100%"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { lo } from 'element-plus/es/locales.mjs'
import * as echarts from 'echarts'
import 'echarts-gl'
import { Download, Printer } from '@element-plus/icons-vue'

const charts = ref([])
const queries = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const previewVisible = ref(false)
const chartRef = ref(null)
const exporting = ref(false)
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
  zField: '',
  seriesField: '',
  angleField: '',
  valueField: '',
  color: '',
  stack: false,
  radius: '',
  min: '',
  max: '',
  pieType: 'pie'
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
const is3DBar = computed(() => currentChart.type === '3d-bar')
const isPie = computed(() => currentChart.type === 'pie')
const isGauge = computed(() => currentChart.type === 'gauge')
const isRadar = computed(() => currentChart.type === 'radar')
const isFunnel = computed(() => currentChart.type === 'funnel')

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
  currentChart.title = ''
  currentChart.xField = ''
  currentChart.yField = ''
  currentChart.zField = ''
  currentChart.seriesField = ''
  currentChart.angleField = ''
  currentChart.valueField = ''
  currentChart.color = ''
  currentChart.stack = false
  currentChart.radius = ''
  currentChart.min = ''
  currentChart.max = ''
  currentChart.pieType = 'pie'
  dialogVisible.value = true
}

const handleEdit = (chart) => {
  dialogType.value = 'edit'
  // 先重置，避免旧数据干扰
  handleCreate()
  dialogType.value = 'edit'
  
  Object.assign(currentChart, {
    id: chart.ID,
    name: chart.Name,
    description: chart.description,
    type: chart.Type,
    queryID: chart.QueryID || chart.queryID || chart.query_id,
  })

  try {
    const cfg = JSON.parse(chart.Config || '{}')
    if (cfg.title) currentChart.title = cfg.title
    if (cfg.xField) currentChart.xField = cfg.xField
    if (cfg.yField) currentChart.yField = cfg.yField
    if (cfg.zField) currentChart.zField = cfg.zField
    if (cfg.seriesField) currentChart.seriesField = cfg.seriesField
    if (cfg.angleField) currentChart.angleField = cfg.angleField
    if (cfg.valueField) currentChart.valueField = cfg.valueField
    if (cfg.color) currentChart.color = Array.isArray(cfg.color) ? cfg.color.join(',') : cfg.color
    if (cfg.stack !== undefined) currentChart.stack = cfg.stack
    if (cfg.radius) currentChart.radius = cfg.radius
    if (cfg.min !== undefined) currentChart.min = cfg.min
    if (cfg.max !== undefined) currentChart.max = cfg.max
    if (cfg.pieType) currentChart.pieType = cfg.pieType
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
  // 使用一个干净的临时对象来预览，不污染 currentChart
  const previewChart = {
    id: chart.ID,
    name: chart.Name,
    description: chart.Description,
    type: chart.Type,
    queryID: chart.QueryID || chart.queryID || chart.query_id,
    config: chart.Config,
  };
  
  previewVisible.value = true
  
  // 异步渲染
  nextTick(async () => {
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value)
    } else {
      chartInstance.clear()
    }
    
    try {
      const config = JSON.parse(previewChart.config || '{}')
      const rawData = await getQueryData(previewChart.queryID)
      const data = Array.isArray(rawData) ? rawData : (rawData.data || [])
      const option = convertToEchartsOption(config, data)
      chartInstance.setOption(option)
      chartInstance.resize()
    } catch (e) {
      console.error("图表预览失败:", e)
      chartInstance.clear()
    }
  });
}

const handleSave = async () => {
  try {
    const config = buildConfig(currentChart, currentChart.type)
    const payload = {
      name: currentChart.name,
      type: currentChart.type,
      query_id: currentChart.queryID,
      config: JSON.stringify(config),
      description: currentChart.description
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
  config.type = type
  if (form.color) config.color = form.color.split(',').map(s => s.trim())
  if (type === 'pie') {
    if (form.pieType === 'doughnut') {
      config.radius = ['60%', '80%']
    } else {
      config.radius = '80%'
    }
  } else if (type === '3d-bar') {
    config.xField = form.xField || ''
    config.yField = form.yField || ''
    config.zField = form.zField || ''
    config.legend = { show: true }
    config.tooltip = { show: true }
    config.grid3D = {
      boxWidth: 100,
      boxHeight: 100,
      boxDepth: 100,
      viewControl: {
        alpha: 20,
        beta: 40,
        distance: 200
      }
    }
  } else if (type === 'heatmap') {
    config.xField = form.xField || ''
    config.yField = form.yField || ''
    config.seriesField = form.seriesField || ''
    config.stack = form.stack
    config.xAxis = { name: form.xField, type: 'category' }
    config.yAxis = { name: form.yField, type: 'value' }
    config.legend = { show: true, position: 'top' }
    config.tooltip = { show: true, trigger: 'axis' }
    config.label = { show: true, position: 'top' }
  } else if (type === 'gauge') {
    config.valueField = form.valueField || ''
    config.min = form.min
    config.max = form.max
  } else if (type === 'radar') {
    config.seriesField = form.seriesField || ''
    config.valueField = form.valueField || ''
    config.radius = form.radius
  } else if (type === 'funnel') {
    config.seriesField = form.seriesField || form.xField || ''
    config.valueField = form.valueField || form.yField || ''
    config.label = form.label
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
    } else {
      chartInstance.clear()
      chartInstance.resize()
    }
    try {
      const config = JSON.parse(currentChart.config || '{}')
      // 查询数据 
      const rawData = await getQueryData(currentChart.queryID)
      const data = Array.isArray(rawData) ? rawData : (rawData.data || [])
      const option = convertToEchartsOption(config, data)
      if ((config.type || currentChart.type) === 'gauge') {
        const valueField = config.valueField || Object.keys(data[0] || {})[0] || ''
        const value = data.length > 0 ? Number(data[0][valueField]) : 0
      }
      chartInstance.setOption(option)
    } catch (e) {
      chartInstance.clear()
    }
  }
})

function convertToEchartsOption(config, data = []) {
  console.log('--- Chart Conversion Start ---');
  console.log('Input Config:', JSON.parse(JSON.stringify(config)));
  console.log('Input Data:', JSON.parse(JSON.stringify(data)));

  const type = config.type || currentChart.type
  let option = {}; // Default to an empty object

  if (type === '3d-bar') {
    const xField = config.xField
    const yField = config.yField
    const zField = config.zField

    if (!xField || !yField || !zField || !data || data.length === 0) {
      return { title: { text: config.title || '数据或配置不完整' } }
    }

    const xData = [...new Set(data.map(item => item[xField]))]
    const yData = [...new Set(data.map(item => item[yField]))]
    
    const seriesData = data.map(item => [
      xData.indexOf(item[xField]),
      yData.indexOf(item[yField]),
      Number(item[zField]) || 0
    ])

    const maxZ = Math.max(...seriesData.map(item => item[2]), 0)

    option = {
      title: { text: config.title || '' },
      tooltip: {},
      visualMap: {
        max: maxZ,
        inRange: {
          color: config.color || ['#1890ff', '#2fc25b', '#facc14', '#f5222d', '#8d4eda']
        }
      },
      xAxis3D: { type: 'category', data: xData, name: xField },
      yAxis3D: { type: 'category', data: yData, name: yField },
      zAxis3D: { type: 'value', name: zField },
      grid3D: config.grid3D || {},
      series: [{
        type: 'bar3D',
        data: seriesData,
        shading: 'lambert',
        label: {
          show: !!config.label,
          fontSize: 16,
          borderWidth: 1
        },
        emphasis: {
          label: {
            show: !!config.label,
            fontSize: 20,
            fontWeight: 'bold'
          }
        }
      }]
    }
  }

  if (type === 'pie') {
    const keys = Object.keys(data[0] || {})
    const angleField = config.angleField || config.valueField || keys.find(k => typeof data[0][k] === 'number') || keys[1] || ''
    const colorField = config.colorField || config.seriesField || keys.find(k => k !== angleField) || keys[0] || ''
    const pieData = data.map(d => ({
      name: d[colorField],
      value: Number(d[angleField]) || 0
    }))
    const pieOption = {
      title: { text: config.title || '' },
      tooltip: config.tooltip || {},
      legend: { data: pieData.map(d => d.name), orient: 'vertical', right: 10, top: 20 },
      color: config.color || ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'],
      series: [{
        type: 'pie',
        radius: config.radius || ['60%', '80%'],
        label: config.label || { show: true, position: 'outside' },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: pieData
      }]
    }
    option = pieOption
  }
  if (type === 'heatmap') {
    const allKeys = Object.keys(data[0] || {})
    const xField = config.xField || allKeys[0] || ''
    const yField = config.yField || allKeys[1] || ''
    const valueField = config.seriesField || config.valueField || allKeys[2] || ''
    const xLabels = [...new Set(data.map(d => d[xField]))]
    const yLabels = [...new Set(data.map(d => d[yField]))]
    const heatmapData = data.map(d => [
      xLabels.indexOf(d[xField]),
      yLabels.indexOf(d[yField]),
      Number(d[valueField]) || 0
    ])
    const maxValue = Math.max(...heatmapData.map(d => d[2]), 10)
    const option = {
      title: { text: config.title || '' },
      tooltip: {},
      xAxis: { type: 'category', data: xLabels },
      yAxis: { type: 'category', data: yLabels },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: 'vertical',
        right: 0,
        top: 'center'
      },
      series: [{
        type: 'heatmap',
        data: heatmapData,
        label: { show: true }
      }]
    }
  }
  if (type === 'gauge') {
    const valueField = config.valueField || Object.keys(data[0] || {})[0] || ''
    const value = data.length > 0 ? Number(data[0][valueField]) : 0
    const maxValue = Math.ceil((value || 100) / 1000) * 1000
    const min = config.min !== undefined && !isNaN(Number(config.min)) ? Number(config.min) : 0
    const max = config.max !== undefined && !isNaN(Number(config.max)) ? Number(config.max) : maxValue
    const option = {
      title: { text: config.title || '' },
      series: [{
        type: 'gauge',
        min,
        max,
        data: [{ value }]
      }]
    }
  }
  if (type === 'radar') {
    const angleField = config.angleField || Object.keys(data[0] || {})[1] || ''
    const seriesField = config.seriesField || Object.keys(data[0] || {})[0] || ''
    const valueField = config.valueField || Object.keys(data[0] || {})[2] || ''
    const indicators = [...new Set(data.map(d => d[angleField]))].map(name => ({ name }))
    const groups = [...new Set(data.map(d => d[seriesField]))]
    const series = [{
      type: 'radar',
      data: groups.map(group => ({
        name: group,
        value: indicators.map(ind => {
          const found = data.find(d => d[seriesField] === group && d[angleField] === ind.name)
          return found ? Number(found[valueField]) : 0
        })
      }))
    }]
    option = {
      title: { text: config.title || '' },
      tooltip: config.tooltip || {},
      legend: { data: groups },
      color: config.color || ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'],
      radar: { indicator: indicators },
      series
    }
  }
  if (type === 'funnel') {
    const allKeys = Object.keys(data[0] || {})
    const nameField = config.seriesField || config.xField || allKeys[0] || ''
    const valueField = config.valueField || config.yField || allKeys[1] || ''
    const funnelData = data.map(d => ({
      name: d[nameField],
      value: Number(d[valueField]) || 0
    }))
    const maxValue = Math.max(...funnelData.map(d => d.value), 100)
    const option = {
      title: { text: config.title || '' },
      tooltip: {},
      color: config.color || ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'],
      series: [{
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: maxValue,
        sort: 'descending',
        gap: 2,
        label: config.label || { show: true, position: 'inside' },
        labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        emphasis: { label: { fontSize: 20 } },
        data: funnelData
      }]
    }
  }
  // 其他类型
  if (Object.keys(option).length === 0) {
    const allKeys = Object.keys(data[0] || {})
    const xField = config.xField || allKeys[0] || ''
    const yField = config.yField || allKeys[1] || ''
    let seriesField = config.seriesField
    if (!seriesField) {
      seriesField = allKeys.find(k => k !== xField && k !== yField) || ''
    }
    const xAxisData = [...new Set(data.map(d => d[xField]))]
    const groups = seriesField ? [...new Set(data.map(d => d[seriesField]))] : ['']
    const series = groups.map(group => ({
      name: group,
      type: currentChart.type,
      connectNulls: true,
      data: xAxisData.map(x => {
        const found = seriesField ? data.find(d => d[xField] === x && d[seriesField] === group) : data.find(d => d[xField] === x)
        return found ? found[yField] : null
      })
    }))
    option = {
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

  console.log('Output ECharts Option:', JSON.parse(JSON.stringify(option)));
  console.log('--- Chart Conversion End ---');
  return option;
}

// 导出图片功能
const handleExportImage = async () => {
  if (!chartInstance) {
    ElMessage.warning('图表未加载完成，请稍后再试')
    return
  }
  
  exporting.value = true
  try {
    // 使用 ECharts 的 getDataURL 方法导出图片
    const dataURL = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2, // 提高图片质量
      backgroundColor: '#fff'
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.download = `${currentChart.name || 'chart'}_${new Date().getTime()}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('图片导出成功')
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error('导出图片失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 打印功能
const handlePrint = () => {
  if (!chartInstance) {
    ElMessage.warning('图表未加载完成，请稍后再试')
    return
  }
  
  try {
    // 获取图表的图片数据
    const dataURL = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank')
    const chartTitle = currentChart.name || '图表'
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${chartTitle}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            .print-header {
              margin-bottom: 20px;
              font-size: 18px;
              font-weight: bold;
            }
            .chart-image {
              max-width: 100%;
              height: auto;
              border: 1px solid #ddd;
            }
            .print-footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 0; }
              .print-header { margin-bottom: 10px; }
              .print-footer { margin-top: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">${chartTitle}</div>
          <img src="${dataURL}" alt="${chartTitle}" class="chart-image" />
          <div class="print-footer">
            打印时间: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // 等待图片加载完成后打印
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
    
    ElMessage.success('正在打开打印窗口')
  } catch (error) {
    console.error('打印失败:', error)
    ElMessage.error('打印失败，请重试')
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
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .preview-actions {
      display: flex;
      gap: 10px;
    }
  }
} 
</style> 