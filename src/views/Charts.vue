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
              <span>{{ chart.name }}</span>
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
            <div class="chart-description">{{ chart.description }}</div>
            <div class="chart-type">
              <el-tag>{{ chart.type }}</el-tag>
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
            <el-option label="折线图" value="line" />
            <el-option label="柱状图" value="bar" />
            <el-option label="饼图" value="pie" />
            <el-option label="散点图" value="scatter" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="数据查询" prop="queryId">
          <el-select
            v-model="currentChart.queryId"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="query in queries"
              :key="query.id"
              :label="query.name"
              :value="query.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="X轴字段" prop="xField">
          <el-input v-model="currentChart.xField" />
        </el-form-item>
        
        <el-form-item label="Y轴字段" prop="yField">
          <el-input v-model="currentChart.yField" />
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
      <div class="chart-preview">
        <!-- 这里将添加图表预览组件 -->
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const charts = ref([])
const queries = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const previewVisible = ref(false)

const currentChart = reactive({
  id: null,
  name: '',
  description: '',
  type: 'line',
  queryId: null,
  xField: '',
  yField: ''
})

const rules = {
  name: [
    { required: true, message: '请输入图表名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择图表类型', trigger: 'change' }
  ],
  queryId: [
    { required: true, message: '请选择数据查询', trigger: 'change' }
  ],
  xField: [
    { required: true, message: '请输入X轴字段', trigger: 'blur' }
  ],
  yField: [
    { required: true, message: '请输入Y轴字段', trigger: 'blur' }
  ]
}

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
    queries.value = response.data
  } catch (error) {
    ElMessage.error('获取查询列表失败')
  }
}

const handleCreate = () => {
  dialogType.value = 'create'
  currentChart.id = null
  currentChart.name = ''
  currentChart.description = ''
  currentChart.type = 'line'
  currentChart.queryId = null
  currentChart.xField = ''
  currentChart.yField = ''
  dialogVisible.value = true
}

const handleEdit = (chart) => {
  dialogType.value = 'edit'
  Object.assign(currentChart, chart)
  dialogVisible.value = true
}

const handleDelete = async (chart) => {
  try {
    await ElMessageBox.confirm('确定要删除这个图表吗？', '警告', {
      type: 'warning'
    })
    
    await axios.delete(`/api/charts/${chart.id}`)
    ElMessage.success('删除成功')
    fetchCharts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handlePreview = (chart) => {
  // TODO: 实现图表预览功能
  previewVisible.value = true
}

const handleSave = async () => {
  try {
    if (dialogType.value === 'create') {
      await axios.post('/api/charts', currentChart)
      ElMessage.success('创建成功')
    } else {
      await axios.put(`/api/charts/${currentChart.id}`, currentChart)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchCharts()
  } catch (error) {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
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