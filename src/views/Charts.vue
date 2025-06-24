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
            <el-option label="3D散点图" value="3d-scatter" />
            <el-option label="折线图" value="line" />
            <el-option label="饼图" value="pie" />
            <el-option label="散点图" value="scatter" />
            <el-option label="雷达图" value="radar" />
            <el-option label="热力图" value="heatmap" />
            <el-option label="仪表盘" value="gauge" />
            <el-option label="漏斗图" value="funnel" />
            <el-option label="3D曲面图" value="3d-surface" />
            <el-option label="3D气泡图" value="3d-bubble" />
            <el-option label="面积图" value="area" />
            <el-option label="矩形树状图" value="treemap" />
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
        
        <el-form-item label="X字段" v-if="isXYType || is3DType">
          <el-input v-model="currentChart.xField" />
        </el-form-item>
        
        <el-form-item label="Y字段" v-if="isXYType || is3DType">
          <el-input v-model="currentChart.yField" />
        </el-form-item>
        
        <el-form-item label="Z字段" v-if="is3DType">
          <el-input v-model="currentChart.zField" />
        </el-form-item>
        
        <el-form-item label="颜色字段" v-if="is3DScatter || isTreemap">
          <el-input v-model="currentChart.colorField" placeholder="用于区分颜色的数据列名" />
        </el-form-item>
        
        <el-form-item label="大小字段" v-if="is3DScatter">
          <el-input v-model="currentChart.sizeField" placeholder="决定散点大小的数据列名" />
        </el-form-item>
        
        <el-form-item label="分组字段" v-if="isXYType || isRadar || isFunnel || isArea">
          <el-input v-model="currentChart.seriesField" />
        </el-form-item>
        
        <el-form-item label="角度字段" v-if="isPie">
          <el-input v-model="currentChart.angleField" />
        </el-form-item>
        
        <el-form-item label="数值字段" v-if="isPie || isGauge || isRadar || isFunnel || isTreemap">
          <el-input v-model="currentChart.valueField" />
        </el-form-item>
        
        <el-form-item v-if="currentChart.type === 'pie'" label="饼图类型">
          <el-select v-model="currentChart.pieType" style="width: 100%">
            <el-option label="圆形" value="pie" />
            <el-option label="环形" value="doughnut" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="颜色" v-if="isArea">
          <el-input v-model="currentChart.color" placeholder="如 #1890ff,#2fc25b,#facc14" />
        </el-form-item>
        <el-form-item label="堆叠" v-if="isXYType">
          <el-switch v-model="currentChart.stack" />
        </el-form-item>
        <el-form-item label="平滑曲线" v-if="isArea">
          <el-switch v-model="currentChart.smooth" />
        </el-form-item>
        <el-form-item label="填充透明度" v-if="isArea">
          <el-input-number v-model="currentChart.fillOpacity" :min="0" :max="1" :step="0.1" />
        </el-form-item>
        <el-form-item label="显示图例" v-if="isArea">
          <el-switch v-model="currentChart.legend" />
        </el-form-item>
        <el-form-item label="显示提示框" v-if="isArea">
          <el-switch v-model="currentChart.tooltip" />
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
        
        <el-form-item label="数据字段" v-if="isTreemap">
          <el-input v-model="currentChart.dataField" placeholder="如 name" />
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
const chartForm = ref(null)

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
  colorField: '',
  sizeField: '',
  seriesField: '',
  angleField: '',
  valueField: '',
  color: '',
  stack: false,
  radius: '',
  min: '',
  max: '',
  pieType: 'pie',
  smooth: true,
  fillOpacity: 0.6,
  legend: true,
  tooltip: true,
  dataField: '',
})

const rules = {
  name: [
    { required: true, message: '请输入图表名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择图表类型', trigger: 'change' }
  ],
  queryID: [
    { required: true, message: '请选择一个查询', trigger: 'change' }
  ]
}

const isXYType = computed(() =>
  ['bar', 'line', 'scatter', 'heatmap', 'area'].includes(currentChart.type)
)
const isPie = computed(() => currentChart.type === 'pie')
const isGauge = computed(() => currentChart.type === 'gauge')
const isRadar = computed(() => currentChart.type === 'radar')
const isFunnel = computed(() => currentChart.type === 'funnel')
const is3DType = computed(() => ['3d-bar', '3d-scatter', '3d-surface', '3d-bubble'].includes(currentChart.type))
const is3DScatter = computed(() => currentChart.type === '3d-scatter' || currentChart.type === '3d-bubble')
const is3DBubble = computed(() => currentChart.type === '3d-bubble')
const isArea = computed(() => currentChart.type === 'area')
const isTreemap = computed(() => currentChart.type === 'treemap')

const resetForm = () => {
  nextTick(() => {
    if (chartForm.value) {
      chartForm.value.resetFields()
    }
  })
  Object.assign(currentChart, {
    id: null,
    name: '',
    description: '',
    type: 'bar',
    queryID: null,
    title: '',
    xField: '',
    yField: '',
    zField: '',
    colorField: '',
    sizeField: '',
    seriesField: '',
    angleField: '',
    valueField: '',
    color: '',
    stack: false,
    radius: '',
    min: '',
    max: '',
    pieType: 'pie',
    smooth: true,
    fillOpacity: 0.6,
    legend: true,
    tooltip: true,
    dataField: '',
  })
}

const fetchCharts = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/charts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    charts.value = response.data
  } catch (error) {
    ElMessage.error('获取图表列表失败')
    console.error(error)
  }
}

const fetchQueries = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/queries', {
      headers: { Authorization: `Bearer ${token}` }
    })
    queries.value = response.data
  } catch (error) {
    ElMessage.error('获取查询列表失败')
  }
}

const handleCreate = () => {
  resetForm()
  dialogType.value = 'create'
  dialogVisible.value = true
}

const handleEdit = chartToEdit => {
  resetForm()
  dialogType.value = 'edit'
  
  nextTick(() => {
    const { ID, Name, description, Type, QueryID, Config } = chartToEdit
    let config = {}
    try {
      config = JSON.parse(Config || '{}')
    } catch (e) {
      console.error('解析图表配置失败', e)
    }

    const newChartState = {
      id: ID,
      name: Name,
      description: description,
      type: Type,
      queryID: QueryID,
      title: config.title || '',
      color: Array.isArray(config.color) ? config.color.join(',') : (config.color || ''),
      xField: config.xField || '',
      yField: config.yField || '',
      zField: config.zField || '',
      colorField: config.colorField || '',
      sizeField: config.sizeField || '',
      seriesField: config.seriesField || '',
      angleField: config.angleField || '',
      valueField: config.valueField || '',
      stack: config.stack || false,
      radius: config.radius || '',
      min: config.min || '',
      max: config.max || '',
      pieType: config.pieType || 'pie',
      smooth: config.smooth !== undefined ? config.smooth : true,
      fillOpacity: config.fillOpacity !== undefined ? config.fillOpacity : 0.6,
      legend: config.legend !== undefined ? config.legend : true,
      tooltip: config.tooltip !== undefined ? config.tooltip : true,
      dataField: config.dataField || '',
      colorField: config.colorField || '',
      valueField: config.valueField || ''
    };

    Object.assign(currentChart, newChartState);

    dialogVisible.value = true
  })
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
      config.type = previewChart.type
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
  if (!chartForm.value) return
  await chartForm.value.validate(async (valid) => {
    if (valid) {
      // 创建 currentChart 的一个非响应式快照，确保数据在保存过程中不变
      const chartModel = JSON.parse(JSON.stringify(currentChart));
      const type = chartModel.type;

      const config = {
        title: chartModel.title,
        color: chartModel.color ? chartModel.color.split(',').filter(c => c.trim()) : [],
        legend: chartModel.legend,
        tooltip: chartModel.tooltip
      }
      
      if (["bar", "line", "scatter", "heatmap", "area"].includes(type)) {
        config.xField = chartModel.xField
        config.yField = chartModel.yField
        config.seriesField = chartModel.seriesField
        config.stack = chartModel.stack
      }
      // 面积图专属配置
      if (type === 'area') {
        config.smooth = chartModel.smooth
        config.fillOpacity = chartModel.fillOpacity
      }

      if (['3d-bar', '3d-scatter', '3d-surface', '3d-bubble'].includes(type)) {
        config.xField = chartModel.xField
        config.yField = chartModel.yField
        config.zField = chartModel.zField
        if (type === '3d-scatter' || type === '3d-bar' || type === '3d-bubble') {
          config.colorField = chartModel.colorField
          config.sizeField = chartModel.sizeField
        }
      }
      
      if (type === 'pie') {
        config.angleField = chartModel.angleField
        config.valueField = chartModel.valueField
        config.radius = chartModel.radius
        config.pieType = chartModel.pieType
      }
      
      if (type === 'gauge') {
        config.valueField = chartModel.valueField
        config.min = chartModel.min
        config.max = chartModel.max
      }

      if (type === 'radar') {
        config.valueField = chartModel.valueField
        config.seriesField = chartModel.seriesField
        config.radius = chartModel.radius
      }
      
      if (type === 'funnel') {
        config.valueField = chartModel.valueField
        config.seriesField = chartModel.seriesField
      }
      
      if (type === 'treemap') {
        config.dataField = chartModel.dataField
        config.valueField = chartModel.valueField
        config.colorField = chartModel.colorField
      }
      
      const chartData = {
        name: chartModel.name,
        description: chartModel.description,
        type: chartModel.type,
        queryID: chartModel.queryID,
        config: JSON.stringify(config)
      }
      
      try {
        if (dialogType.value === 'create') {
          await axios.post('/api/charts', chartData)
          ElMessage.success('图表创建成功')
        } else {
          await axios.put(`/api/charts/${chartModel.id}`, chartData)
          ElMessage.success('图表更新成功')
        }
        dialogVisible.value = false
        fetchCharts()
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '图表创建失败' : '图表更新失败')
        console.error(error)
      }
    }
  })
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
  } else if (type === '3d-scatter') {
    config.xField = form.xField || ''
    config.yField = form.yField || ''
    config.zField = form.zField || ''
    config.colorField = form.colorField || ''
    config.sizeField = form.sizeField || ''
    config.legend = { show: true }
    config.tooltip = { show: true }
    config.grid3D = {
      boxWidth: 100,
      boxHeight: 100,
      boxDepth: 100,
      viewControl: {
        alpha: 20,
        beta: 40,
        distance: 200,
        autoRotate: false,
        autoRotateSpeed: 10
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
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
  } else if (type === '3d-surface') {
    config.xField = form.xField || ''
    config.yField = form.yField || ''
    config.zField = form.zField || ''
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
      // 这里不需要处理，因为handlePreview已经处理了
      // 这个watch主要是为了确保图表实例正确初始化
    } catch (e) {
      console.error("图表初始化失败:", e)
      chartInstance.clear()
    }
  }
})

function convertToEchartsOption(config, data = []) {

  const type = config.type || currentChart.type
  let option = {}; // Default to an empty object

  if (type === '3d-bubble' || type === '3d-scatter') {
    const xField = config.xField;
    const yField = config.yField;
    const zField = config.zField;
    const colorField = config.colorField;
    const sizeField = config.sizeField;

    if (!xField || !yField || !zField || !data || data.length === 0) {
      return { title: { text: config.title || '数据或配置不完整' } };
    }

    const series = [];
    const legendData = [];
    const colors = config.color || [
      '#1890ff', '#facc14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911',
      '#faad14', '#bfbfbf', '#d3adf7', '#ff85c0', '#ffd666', '#fffb8f', '#d9f7be', '#e6fffb'
    ];

    if (colorField) {
      const groups = [...new Set(data.map(item => item[colorField]))];
      legendData.push(...groups);

      groups.forEach((group, index) => {
        const groupData = data.filter(item => item[colorField] === group);
        series.push({
          name: group,
          type: 'scatter3D',
          data: groupData.map(item => {
            const point = {
              value: [
                Number(item[xField]) || 0,
                Number(item[yField]) || 0,
                Number(item[zField]) || 0
              ],
              itemStyle: {
                color: colors[index % colors.length]
              }
            };
            if (sizeField && item[sizeField]) {
              point.symbolSize = Math.max(5, Math.min(50, Number(item[sizeField]) || 10));
            }
            return point;
          }),
          symbolSize: sizeField ? undefined : 10,
          itemStyle: { opacity: 0.8 },
          emphasis: { itemStyle: { opacity: 1 } }
        });
      });
    } else {
      series.push({
        type: 'scatter3D',
        data: data.map(item => {
          const point = {
            value: [
              Number(item[xField]) || 0,
              Number(item[yField]) || 0,
              Number(item[zField]) || 0
            ]
          };
          if (sizeField && item[sizeField]) {
            point.symbolSize = Math.max(5, Math.min(50, Number(item[sizeField]) || 10));
          }
          return point;
        }),
        symbolSize: sizeField ? undefined : 10,
        itemStyle: { color: colors[0], opacity: 0.8 }
      });
    }

    const allX = data.map(item => Number(item[xField]) || 0);
    const allY = data.map(item => Number(item[yField]) || 0);
    const allZ = data.map(item => Number(item[zField]) || 0);

    option = {
      title: { text: config.title || (type === '3d-bubble' ? '3D气泡图' : '3D散点图') },
      tooltip: {
        formatter: function(params) {
          const data = params.data;
          let tooltip = (params.seriesName ? `${params.seriesName}<br/>` : '') +
            `${xField}: ${data.value[0]}<br/>` +
            `${yField}: ${data.value[1]}<br/>` +
            `${zField}: ${data.value[2]}`;
          if (sizeField && data.symbolSize) {
            tooltip += `<br/>${sizeField}: ${data.symbolSize}`;
          }
          return tooltip;
        }
      },
      legend: { data: legendData, orient: 'vertical', right: 10, top: 20 },
      grid3D: {
        boxWidth: 100,
        boxHeight: 100,
        boxDepth: 100,
        viewControl: { alpha: 20, beta: 40, distance: 200, autoRotate: false, autoRotateSpeed: 10 },
        light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } }
      },
      xAxis3D: { type: 'value', name: xField, min: Math.min(...allX), max: Math.max(...allX) },
      yAxis3D: { type: 'value', name: yField, min: Math.min(...allY), max: Math.max(...allY) },
      zAxis3D: { type: 'value', name: zField, min: Math.min(...allZ), max: Math.max(...allZ) },
      series: series
    };
  }

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
    option = {
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
    let valueField = config.valueField;
    if (!valueField && data.length > 0 && data[0]) {
      // If a valueField is not configured, try to find the first field that contains a number.
      valueField = Object.keys(data[0]).find(key => typeof data[0][key] === 'number');
    }
    // If no numeric field is found, fall back to the first field.
    if (!valueField && data.length > 0 && data[0]) {
      valueField = Object.keys(data[0])[0];
    }
    valueField = valueField || '';

    const rawValue = data.length > 0 && data[0] ? data[0][valueField] : 0;
    const value = Number(rawValue);

    const min = (config.min !== undefined && !isNaN(Number(config.min))) ? Number(config.min) : 0;
    
    let max = 100;
    if (config.max !== undefined && !isNaN(Number(config.max))) {
      max = Number(config.max);
    } else if (!isNaN(value)) {
      if (value > 1000) {
        max = Math.ceil(value / 1000) * 1000;
      } else if (value > 100) {
        max = Math.ceil(value / 100) * 100;
      } else {
        max = 100;
      }
    }

    option = {
      title: { text: config.title || '' },
      series: [{
        type: 'gauge',
        min,
        max,
        data: [{ value: isNaN(value) ? 0 : value }],
        detail: {
          formatter: '{value}'
        }
      }]
    };
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
    })).sort((a, b) => b.value - a.value);

    const maxValue = Math.max(...funnelData.map(d => d.value), 100);
    const legendData = funnelData.map(d => d.name);

    option = {
      title: { text: config.title || '' },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c}"
      },
      legend: {
        data: legendData
      },
      color: config.color || ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'],
      series: [{
        name: config.title || '漏斗图',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: maxValue,
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData
      }]
    }
  }
  if (type === '3d-surface') {
    const xField = config.xField;
    const yField = config.yField;
    const zField = config.zField;
    if (!xField || !yField || !zField || !data || data.length === 0) {
      return { title: { text: config.title || '数据或配置不完整' } };
    }

    // 自动离散化x/y到2位小数
    function round2(val) {
      return Math.round(Number(val) * 100) / 100;
    }
    // 归一化x/y到从0开始
    const minX = Math.min(...data.map(item => Number(item[xField])));
    const minY = Math.min(...data.map(item => Number(item[yField])));
    const pointData = data.map(item => [
      round2(item[xField]) - minX,
      round2(item[yField]) - minY,
      Number(item[zField])
    ]);


    option = {
      title: { text: config.title || '' },
      tooltip: { show: true },
      visualMap: {
        min: Math.min(...pointData.map(p => p[2])),
        max: Math.max(...pointData.map(p => p[2])),
        calculable: true,
        realtime: false,
        inRange: {
          color: config.color || [
            '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
            '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
          ]
        }
      },
      xAxis3D: { type: 'value', name: xField },
      yAxis3D: { type: 'value', name: yField },
      zAxis3D: { type: 'value', name: zField },
      grid3D: config.grid3D || {
        boxWidth: 100,
        boxHeight: 100,
        boxDepth: 100,
        viewControl: { alpha: 20, beta: 40, distance: 200 }
      },
      series: [{
        type: 'surface',
        wireframe: { show: true },
        shading: 'color',
        data: pointData
      }]
    };
  }
  // 面积图专用逻辑
  if (type === 'area') {
    const xField = config.xField;
    const yField = config.yField;
    const seriesField = config.seriesField;
    const stack = config.stack;
    const smooth = config.smooth !== undefined ? config.smooth : true;
    const fillOpacity = config.fillOpacity !== undefined ? config.fillOpacity : 0.6;
    const color = config.color || ['#1890ff', '#2fc25b', '#facc14'];
    const legend = config.legend !== false;
    const tooltip = config.tooltip !== false;
    
    const xAxisData = [...new Set(data.map(d => d[xField]))];
    const groups = seriesField ? [...new Set(data.map(d => d[seriesField]))] : [''];
    const series = groups.map((group, idx) => ({
      name: group,
      type: 'line',
      stack: stack ? 'Total' : undefined,
      smooth,
      areaStyle: { opacity: fillOpacity },
      itemStyle: { color: color[idx % color.length] },
      connectNulls: true,
      data: xAxisData.map(x => {
        const found = seriesField ? data.find(d => d[xField] === x && d[seriesField] === group) : data.find(d => d[xField] === x)
        return found ? found[yField] : null
      })
    }));
    option = {
      title: { text: config.title || '' },
      tooltip: tooltip ? { trigger: 'axis' } : undefined,
      legend: legend ? { data: groups.filter(g => g) } : undefined,
      color,
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: { type: 'value' },
      series
    };
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
      type: type,
      connectNulls: true,
      data: xAxisData.map(x => {
        const found = seriesField ? data.find(d => d[xField] === x && d[seriesField] === group) : data.find(d => d[xField] === x)
        return found ? found[yField] : null
      })
    }))
    option = {
      title: { text: config.title || '' },
      tooltip: config.tooltip || {},
      legend: { data: groups.filter(g => g) },
      color: config.color || undefined,
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: config.yAxis || {},
      series
    }
  }

  if (type === 'treemap') {
    const dataField = config.dataField || 'name'
    const valueField = config.valueField || 'value'
    const colorField = config.colorField || 'category'
    // 假设 data 已经是树形结构
    option = {
      title: { text: config.title || '' },
      tooltip: { show: true },
      series: [{
        type: 'treemap',
        data: data, // 这里需要保证 data 是树形结构
        label: { show: true, formatter: '{b}' }
      }]
    }
  }

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