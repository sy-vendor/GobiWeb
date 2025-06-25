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
      <draggable
        v-model="charts"
        item-key="id"
        :animation="200"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        @end="onDragEnd"
        :tag="'el-row'"
        :gutter="20"
      >
        <template #item="{ element: chart }">
          <el-col
            class="chart-col"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :key="chart.id"
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
        </template>
      </draggable>
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
            <el-option label="树形图" value="tree" />
            <el-option label="旭日图" value="sunburst" />
            <el-option label="箱线图" value="boxplot" />
            <el-option label="蜡烛图" value="candlestick" />
            <el-option label="词云" value="wordcloud" />
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
        
        <el-form-item label="X字段" v-if="isXYType || is3DType || isBoxplot || isCandlestick">
          <el-input v-model="currentChart.xField" />
        </el-form-item>

        <el-form-item label="Y字段" v-if="isXYType || is3DType || isBoxplot">
          <el-input v-model="currentChart.yField" />
        </el-form-item>

        <el-form-item label="Z字段" v-if="is3DType">
          <el-input v-model="currentChart.zField" />
        </el-form-item>

        <el-form-item label="颜色字段" v-if="is3DScatter || isTreemap || isSunburst || isWordcloud">
          <el-input v-model="currentChart.colorField" placeholder="用于区分颜色的数据列名" />
        </el-form-item>

        <el-form-item label="大小字段" v-if="is3DScatter">
          <el-input v-model="currentChart.sizeField" placeholder="决定散点大小的数据列名" />
        </el-form-item>

        <el-form-item label="分组字段" v-if="isXYType || isRadar || isFunnel || isArea || isBoxplot">
          <el-input v-model="currentChart.seriesField" />
        </el-form-item>

        <el-form-item label="角度字段" v-if="isPie">
          <el-input v-model="currentChart.angleField" />
        </el-form-item>

        <el-form-item label="数值字段" v-if="isPie || isGauge || isRadar || isFunnel || isTreemap || isSunburst || isTree">
          <el-input v-model="currentChart.valueField" />
        </el-form-item>

        <el-form-item v-if="currentChart.type === 'pie'" label="饼图类型">
          <el-select v-model="currentChart.pieType" style="width: 100%">
            <el-option label="圆形" value="pie" />
            <el-option label="环形" value="doughnut" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="开始值字段" v-if="isCandlestick">
          <el-input v-model="currentChart.openField" />
        </el-form-item>
        
        <el-form-item label="最大值字段" v-if="isCandlestick">
          <el-input v-model="currentChart.highField" />
        </el-form-item>
        
        <el-form-item label="最小值字段" v-if="isCandlestick">
          <el-input v-model="currentChart.lowField" />
        </el-form-item>
        
        <el-form-item label="结束值字段" v-if="isCandlestick">
          <el-input v-model="currentChart.closeField" />
        </el-form-item>
        
        <el-form-item label="柱状图数值字段" v-if="isCandlestick">
          <el-input v-model="currentChart.volumeField" />
        </el-form-item>
        
        <el-form-item label="颜色" v-if="isArea || isBoxplot || isCandlestick || isWordcloud || is3DType">
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
        <el-form-item label="显示提示框" v-if="isArea || isBoxplot">
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
        
        <el-form-item label="数据字段" v-if="isTreemap || isSunburst">
          <el-input v-model="currentChart.dataField" placeholder="如 name" />
        </el-form-item>

        <el-form-item label="ID字段" v-if="isTree">
          <el-input v-model="currentChart.idField" placeholder="如 id" />
        </el-form-item>
        <el-form-item label="父ID字段" v-if="isTree">
          <el-input v-model="currentChart.parentField" placeholder="如 parent_id" />
        </el-form-item>
        <el-form-item label="名称字段" v-if="isTree">
          <el-input v-model="currentChart.nameField" placeholder="如 name" />
        </el-form-item>
        <el-form-item label="箱体描边色" v-if="isBoxplot">
          <el-input v-model="currentChart.boxStroke" placeholder="#545454" />
        </el-form-item>
        <el-form-item label="箱体填充色" v-if="isBoxplot">
          <el-input v-model="currentChart.boxFill" placeholder="#f6f6f6" />
        </el-form-item>
        <el-form-item label="异常值填充色" v-if="isBoxplot">
          <el-input v-model="currentChart.outlierFill" placeholder="#f5222d" />
        </el-form-item>
        <el-form-item label="异常值描边色" v-if="isBoxplot">
          <el-input v-model="currentChart.outlierStroke" placeholder="#f5222d" />
        </el-form-item>
        <el-form-item label="蜡烛线描边色" v-if="isCandlestick">
          <el-input v-model="currentChart.candlestickStroke" placeholder="#000000" />
        </el-form-item>
        <el-form-item label="蜡烛线线宽" v-if="isCandlestick">
          <el-input-number v-model="currentChart.candlestickLineWidth" :min="1" :max="5" />
        </el-form-item>
        <el-form-item label="柱状图填充色" v-if="isCandlestick">
          <el-input v-model="currentChart.volumeFill" placeholder="#1890ff" />
        </el-form-item>
        <el-form-item label="柱状图透明度" v-if="isCandlestick">
          <el-input-number v-model="currentChart.volumeOpacity" :min="0" :max="1" :step="0.1" />
        </el-form-item>
        <el-form-item label="词字段" v-if="isWordcloud">
          <el-input v-model="currentChart.wordField" />
        </el-form-item>
        <el-form-item label="权重字段" v-if="isWordcloud">
          <el-input v-model="currentChart.weightField" />
        </el-form-item>
        <el-form-item label="字体大小范围" v-if="isWordcloud">
          <el-input v-model="currentChart.fontSize" placeholder="如 12,60" />
        </el-form-item>
        <el-form-item label="旋转角度范围" v-if="isWordcloud">
          <el-input v-model="currentChart.rotation" placeholder="如 -90,90" />
        </el-form-item>
        <el-form-item label="螺旋类型" v-if="isWordcloud">
          <el-select v-model="currentChart.spiral" style="width: 100%">
            <el-option label="archimedean" value="archimedean" />
            <el-option label="rectangular" value="rectangular" />
          </el-select>
        </el-form-item>
        <el-form-item label="形状" v-if="isWordcloud">
          <el-select v-model="currentChart.shape" style="width: 100%">
            <el-option label="circle" value="circle" />
            <el-option label="cardioid" value="cardioid" />
            <el-option label="diamond" value="diamond" />
            <el-option label="triangle-forward" value="triangle-forward" />
            <el-option label="triangle" value="triangle" />
            <el-option label="pentagon" value="pentagon" />
            <el-option label="star" value="star" />
          </el-select>
        </el-form-item>
        <el-form-item label="子标题" v-if="isWordcloud">
          <el-input v-model="currentChart.subtitle" />
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
import 'echarts-wordcloud'
import { Download, Printer } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

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
  idField: '',
  parentField: '',
  nameField: '',
  boxStroke: '',
  boxFill: '',
  outlierFill: '',
  outlierStroke: '',
  openField: '',
  highField: '',
  lowField: '',
  closeField: '',
  volumeField: '',
  candlestickStroke: '',
  candlestickLineWidth: 1,
  volumeFill: '',
  volumeOpacity: 0.6,
  wordField: '',
  weightField: '',
  fontSize: '',
  rotation: '',
  spiral: 'archimedean',
  shape: 'circle',
  subtitle: '',
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
const isSunburst = computed(() => currentChart.type === 'sunburst')
const isTree = computed(() => currentChart.type === 'tree')
const isBoxplot = computed(() => currentChart.type === 'boxplot')
const isCandlestick = computed(() => currentChart.type === 'candlestick')
const isWordcloud = computed(() => currentChart.type === 'wordcloud')

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
    idField: '',
    parentField: '',
    nameField: '',
    boxStroke: '',
    boxFill: '',
    outlierFill: '',
    outlierStroke: '',
    openField: '',
    highField: '',
    lowField: '',
    closeField: '',
    volumeField: '',
    candlestickStroke: '',
    candlestickLineWidth: 1,
    volumeFill: '',
    volumeOpacity: 0.6,
    wordField: '',
    weightField: '',
    fontSize: '',
    rotation: '',
    spiral: 'archimedean',
    shape: 'circle',
    subtitle: '',
  })
}

const fetchCharts = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/charts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    let data = response.data
    // 读取本地顺序
    const order = JSON.parse(localStorage.getItem('chartsOrder') || '[]')
    if (order.length) {
      // 按本地顺序排序，未包含的追加在后面
      data = order
        .map(id => data.find(c => c.id === id || c.ID === id))
        .filter(Boolean)
        .concat(data.filter(c => !order.includes(c.id || c.ID)))
    }
    charts.value = data
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
      idField: config.idField || '',
      parentField: config.parentField || '',
      nameField: config.nameField || '',
      boxStroke: (config.boxStyle && config.boxStyle.stroke) || config.boxStroke || '',
      boxFill: (config.boxStyle && config.boxStyle.fill) || config.boxFill || '',
      outlierFill: (config.outlierStyle && config.outlierStyle.fill) || config.outlierFill || '',
      outlierStroke: (config.outlierStyle && config.outlierStyle.stroke) || config.outlierStroke || '',
      openField: config.openField || '',
      highField: config.highField || '',
      lowField: config.lowField || '',
      closeField: config.closeField || '',
      volumeField: config.volumeField || '',
      candlestickStroke: (config.candlestickStyle && config.candlestickStyle.stroke) || '',
      candlestickLineWidth: (config.candlestickStyle && config.candlestickStyle.lineWidth) || 1,
      volumeFill: (config.volumeStyle && config.volumeStyle.fill) || '',
      volumeOpacity: (config.volumeStyle && config.volumeStyle.opacity) || 0.6,
      wordField: config.wordField || '',
      weightField: config.weightField || '',
      fontSize: Array.isArray(config.fontSize) ? config.fontSize.join(',') : (config.fontSize || ''),
      rotation: Array.isArray(config.rotation) ? config.rotation.join(',') : (config.rotation || ''),
      spiral: config.spiral || 'archimedean',
      shape: config.shape || 'circle',
      subtitle: config.subtitle || '',
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
        config.seriesField = chartModel.seriesField
        config.valueField = chartModel.valueField
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

      if (type === 'sunburst') {
        config.dataField = chartModel.dataField
        config.valueField = chartModel.valueField
        config.colorField = chartModel.colorField
      }

      if (type === 'tree') {
        config.idField = chartModel.idField
        config.parentField = chartModel.parentField
        config.nameField = chartModel.nameField
        config.valueField = chartModel.valueField
      }
      
      if (type === 'boxplot') {
        config.xField = chartModel.xField
        config.yField = chartModel.yField
        config.seriesField = chartModel.seriesField
        config.boxStyle = {
          stroke: chartModel.boxStroke,
          fill: chartModel.boxFill
        }
        config.outlierStyle = {
          fill: chartModel.outlierFill,
          stroke: chartModel.outlierStroke
        }
      }
      
      if (type === 'candlestick') {
        config.xField = chartModel.xField
        config.openField = chartModel.openField
        config.highField = chartModel.highField
        config.lowField = chartModel.lowField
        config.closeField = chartModel.closeField
        config.volumeField = chartModel.volumeField
        config.candlestickStyle = {
          stroke: chartModel.candlestickStroke,
          lineWidth: Number(chartModel.candlestickLineWidth)
        }
        config.volumeStyle = {
          fill: chartModel.volumeFill,
          opacity: Number(chartModel.volumeOpacity)
        }
      }
      
      if (type === 'wordcloud') {
        config.wordField = chartModel.wordField
        config.weightField = chartModel.weightField
        config.colorField = chartModel.colorField || ''
        config.fontSize = chartModel.fontSize ? chartModel.fontSize.split(',').map(s => Number(s.trim())) : [12, 60]
        config.rotation = chartModel.rotation ? chartModel.rotation.split(',').map(s => Number(s.trim())) : [-90, 90]
        config.spiral = chartModel.spiral || 'archimedean'
        config.shape = chartModel.shape || 'circle'
        config.subtitle = chartModel.subtitle || ''
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
    const dataField = config.dataField
    const valueField = config.valueField
    const colorField = config.colorField
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

  if (type === 'sunburst') {
    const dataField = config.dataField
    const valueField = config.valueField
    const colorField = config.colorField
  // 假设 data 已经是树结构
    option = {
      title: { text: config.title || '' },
      tooltip: { show: true },
      series: [{
        type: 'sunburst',
        data: data, // 这里需要保证 data 是树形结构
        label: { show: true, formatter: '{b}' }
      }]
    }
  }

  if (type === 'tree') {
    const idField = config.idField
    const parentField = config.parentField
    const nameField = config.nameField
    const valueField = config.valueField
    // 需要将平面数据转为树结构
    const treeData = flatToTree(data, idField, parentField, nameField, valueField)
    option = {
      title: { text: config.title || '' },
      tooltip: { show: true },
      series: [{
        type: 'tree',
        data: treeData,
        label: { position: 'left', verticalAlign: 'middle', align: 'right' },
        leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }]
    }
  }

  if (type === 'boxplot') {
    // 箱线图数据转换
    const xField = config.xField
    const yField = config.yField
    const seriesField = config.seriesField
    const tooltip = config.tooltip !== false;
    const color = config.color || ['#1890ff', '#2fc25b', '#facc14', '#f5222d']
    // 分组
    const groups = seriesField ? [...new Set(data.map(d => d[seriesField]))] : ['']
    const xAxisData = [...new Set(data.map(d => d[xField]))]
    // 计算每组每x的五数分位
    function getBoxData(arr, yField) {
      const values = arr.map(d => Number(d[yField])).filter(v => !isNaN(v)).sort((a, b) => a - b)
      if (!values.length) return [0, 0, 0, 0, 0]
      const q1 = quantile(values, 0.25)
      const q2 = quantile(values, 0.5)
      const q3 = quantile(values, 0.75)
      const min = values[0]
      const max = values[values.length - 1]
      return [min, q1, q2, q3, max]
    }
    function quantile(arr, q) {
      const pos = (arr.length - 1) * q
      const base = Math.floor(pos)
      const rest = pos - base
      if (arr[base + 1] !== undefined) {
        return arr[base] + rest * (arr[base + 1] - arr[base])
      } else {
        return arr[base]
      }
    }
    const boxStyle = config.boxStyle || {}
    const outlierStyle = config.outlierStyle || {}
    const legendRich = {}
    color.forEach((c, i) => {
      legendRich[`color${i}`] = {
        color: c,
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        padding: [0, 4, 0, 0]
      }
    })
    const series = groups.map((group, idx) => {
      const boxData = xAxisData.map(x => {
        const arr = data.filter(d => d[xField] === x && (seriesField ? d[seriesField] === group : true))
        return getBoxData(arr, yField)
      })
      return {
        name: group,
        type: 'boxplot',
        data: boxData,
        itemStyle: {
          color: color[idx % color.length],
          borderColor: boxStyle.stroke || '#545454',
          borderWidth: 1,
        },
        boxWidth: [15, 30],
        emphasis: {
          itemStyle: {
            borderColor: boxStyle.stroke || '#545454',
            color: boxStyle.fill || '#f6f6f6',
          }
        },
        outlierStyle: {
          color: outlierStyle.fill || '#f5222d',
          borderColor: outlierStyle.stroke || '#f5222d'
        }
      }
    })
    option = {
      title: { text: config.title || '' },
      tooltip: config.tooltip !== false ? { trigger: 'item', axisPointer: { type: 'shadow' } } : undefined,
      legend: {
        data: groups.filter(g => g),
        icon: 'none',
        formatter: function(name) {
          const idx = groups.indexOf(name)
          return `{color${idx}|■} ` + name
        },
        textStyle: {
          rich: legendRich
        }
      },
      color,
      xAxis: { type: 'category', data: xAxisData },
      yAxis: { type: 'value' },
      series
    }
  }

  if (type === 'candlestick') {
    const xField = config.xField
    const openField = config.openField
    const highField = config.highField
    const lowField = config.lowField
    const closeField = config.closeField
    const volumeField = config.volumeField
    const colorArr = config.color || ['#f5222d', '#52c41a']
    const xAxisData = []
    const values = []
    const volumes = []
    data.forEach(d => {
      // 检查所有字段都存在且为数字
      const open = Number(d[openField])
      const close = Number(d[closeField])
      const low = Number(d[lowField])
      const high = Number(d[highField])
      const x = d[xField]
      if (
        x !== undefined &&
        !isNaN(open) && !isNaN(close) && !isNaN(low) && !isNaN(high)
      ) {
        xAxisData.push(x)
        values.push([open, close, low, high])
        if (volumeField && d[volumeField] !== undefined && !isNaN(Number(d[volumeField]))) {
          volumes.push(Number(d[volumeField]))
        } else if (volumeField) {
          volumes.push(null)
        }
      }
    })
    // K线主图和成交量分上下两图
    const hasVolume = volumeField && volumes.length > 0
    option = {
      title: { text: config.title || '' },
      tooltip: config.tooltip !== false ? { trigger: 'axis', axisPointer: { type: 'cross' } } : undefined,
      legend: { data: ['蜡烛图', ...(hasVolume ? ['柱状图'] : [])] },
      color: colorArr,
      grid: hasVolume ? [
        { left: '10%', right: '10%', top: 60, height: '50%' }, // 主图
        { left: '10%', right: '10%', top: '68%', height: '16%' } // 副图
      ] : { left: '10%', right: '10%', bottom: 60 },
      xAxis: hasVolume ? [
        { type: 'category', data: xAxisData, scale: true, boundaryGap: false, axisLine: { onZero: false }, splitLine: { show: false }, min: 'dataMin', max: 'dataMax', gridIndex: 0 },
        { type: 'category', data: xAxisData, scale: true, boundaryGap: false, axisLine: { onZero: false }, splitLine: { show: false }, min: 'dataMin', max: 'dataMax', gridIndex: 1, show: false }
      ] : [
        { type: 'category', data: xAxisData, scale: true, boundaryGap: false, axisLine: { onZero: false }, splitLine: { show: false }, min: 'dataMin', max: 'dataMax' }
      ],
      yAxis: hasVolume ? [
        { scale: true, splitArea: { show: true }, gridIndex: 0 },
        { scale: true, gridIndex: 1, splitLine: { show: false }, axisLabel: { show: true } }
      ] : [
        { scale: true, splitArea: { show: true } }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: hasVolume ? [0, 1] : [0], start: 50, end: 100 },
        { show: true, type: 'slider', xAxisIndex: hasVolume ? [0, 1] : [0], top: hasVolume ? '90%' : '90%', start: 50, end: 100 }
      ],
      series: [
        {
          name: '蜡烛图',
          type: 'candlestick',
          data: values,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: colorArr[0],
            color0: colorArr[1],
            borderColor: config.candlestickStyle?.stroke || colorArr[0],
            borderColor0: config.candlestickStyle?.stroke || colorArr[1],
            borderWidth: config.candlestickStyle?.lineWidth || 1
          }
        },
        ...(hasVolume ? [{
          name: '柱状图',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes,
          itemStyle: {
            color: config.volumeStyle?.fill || '#1890ff',
            opacity: config.volumeStyle?.opacity || 0.6
          }
        }] : [])
      ]
    }
  }

  if (type === 'wordcloud') {
    const wordField = config.wordField
    const weightField = config.weightField
    const colorField = config.colorField || ''
    const fontSize = config.fontSize || [12, 60]
    const rotation = config.rotation || [-90, 90]
    const spiral = config.spiral || 'archimedean'
    const shape = config.shape || 'circle'
    const subtitle = config.subtitle || ''
    const colorArr = config.color || ['#1890ff', '#2fc25b', '#facc14', '#f5222d', '#722ed1']
    let wcData = []
    if (colorField) {
      const categories = [...new Set(data.map(d => d[colorField]))]
      const categoryColorMap = {}
      categories.forEach((cat, idx) => {
        categoryColorMap[cat] = colorArr[idx % colorArr.length]
      })
      wcData = data.map(d => ({
        name: d[wordField],
        value: Number(d[weightField]),
        category: d[colorField]
      })).filter(d => d.name && !isNaN(d.value))
      option = {
        title: {
          text: config.title || '',
          subtext: config.subtitle || '',
          left: 'center'
        },
        tooltip: config.tooltip !== false ? {} : undefined,
        legend: config.legend ? { show: true } : undefined,
        series: [{
          type: 'wordCloud',
          shape,
          spiral,
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          sizeRange: fontSize,
          rotationRange: rotation,
          textStyle: {
            color: function(params) {
              return categoryColorMap[params.data.category] || colorArr[0]
            }
          },
          data: wcData
        }]
      }
    } else {
      wcData = data.map(d => ({
        name: d[wordField],
        value: Number(d[weightField])
      })).filter(d => d.name && !isNaN(d.value))
      option = {
        title: {
          text: config.title || '',
          subtext: config.subtitle || '',
          left: 'center'
        },
        tooltip: config.tooltip !== false ? {} : undefined,
        legend: config.legend ? { show: true } : undefined,
        series: [{
          type: 'wordCloud',
          shape,
          spiral,
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          sizeRange: fontSize,
          rotationRange: rotation,
          textStyle: {
            color: colorArr
          },
          data: wcData
        }]
      }
    }
  }

  return option;
}

function flatToTree(data, idField, parentField, nameField, valueField) {
  const idMap = {}
  data.forEach(item => {
    idMap[item[idField]] = { ...item, name: item[nameField], value: item[valueField], children: [] }
  })
  const tree = []
  data.forEach(item => {
    const node = idMap[item[idField]]
    if (item[parentField] && idMap[item[parentField]]) {
      idMap[item[parentField]].children.push(node)
    } else {
      tree.push(node)
    }
  })
  return tree
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

const onDragEnd = () => {
  const ids = charts.value.map(c => c.id || c.ID)
  localStorage.setItem('chartsOrder', JSON.stringify(ids))
  ElMessage.success('排序已更新')
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

.drag-ghost {
  opacity: 0.5;
}
.drag-chosen {
  border: 2px dashed #409EFF;
}

.chart-col {
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
}
</style> 