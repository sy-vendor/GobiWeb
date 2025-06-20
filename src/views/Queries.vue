<template>
  <div class="queries-container">
    <div class="page-header">
      <h2>查询管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建查询
      </el-button>
    </div>
    
    <el-card class="query-list">
      <el-table :data="queries" style="width: 100%">
        <el-table-column prop="Name" label="查询名称" />
        <el-table-column prop="Description" label="描述" />
        <el-table-column prop="CreatedAt" label="创建时间" width="180" :formatter="formatDate" />
        <el-table-column prop="UpdatedAt" label="更新时间" width="180" :formatter="formatDate" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleExecute(row)">
                执行
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 查询编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新建查询' : '编辑查询'"
      width="60%"
    >
      <el-form
        ref="queryForm"
        :model="currentQuery"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="查询名称" prop="name">
          <el-input v-model="currentQuery.name" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentQuery.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="SQL查询" prop="sql">
          <el-input
            v-model="currentQuery.sql"
            type="textarea"
            :rows="6"
            placeholder="请输入SQL查询语句"
          />
        </el-form-item>
        
        <el-form-item label="数据源" prop="data_source_id">
          <el-select v-model="currentQuery.data_source_id" style="width: 100%" placeholder="请选择数据源">
            <el-option v-for="ds in dataSources" :key="ds.ID" :label="ds.Name" :value="ds.ID" />
          </el-select>
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
    
    <!-- 查询结果对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="查询结果"
      width="80%"
    >
      <el-table :data="queryResult" style="width: 100%">
        <el-table-column
          v-for="column in resultColumns"
          :key="column"
          :prop="column"
          :label="column"
        />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { lo } from 'element-plus/es/locales.mjs'

const queries = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const resultDialogVisible = ref(false)
const queryResult = ref([])
const resultColumns = ref([])
const dataSources = ref([])

const currentQuery = reactive({
  id: null,
  name: '',
  description: '',
  sql: '',
  data_source_id: null
})

const rules = {
  name: [
    { required: true, message: '请输入查询名称', trigger: 'blur' }
  ],
  sql: [
    { required: true, message: '请输入SQL查询语句', trigger: 'blur' }
  ]
}

const fetchQueries = async () => {
  try {
    const response = await axios.get('/api/queries')
    queries.value = response.data
  } catch (error) {
    ElMessage.error('获取查询列表失败')
  }
}

const fetchDataSources = async () => {
  try {
    const res = await axios.get('/api/datasources')
    dataSources.value = res.data
  } catch (e) {
    ElMessage.error('获取数据源失败')
  }
}

const handleCreate = () => {
  dialogType.value = 'create'
  Object.assign(currentQuery, {
    id: null,
    name: '',
    description: '',
    sql: '',
    data_source_id: null
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(currentQuery, {
    id: row.ID,
    name: row.Name,
    description: row.Description,
    sql: row.SQL,
    data_source_id: row.DataSourceID
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个查询吗？', '警告', { type: 'warning' })
    await axios.delete(`/api/queries/${row.ID}`)
    ElMessage.success('删除成功')
    fetchQueries()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleExecute = async (row) => {
  try {
    const res = await axios.post(`/api/queries/${row.ID}/execute`)
    queryResult.value = res.data.data
    if (queryResult.value && queryResult.value.length > 0) {
      resultColumns.value = Object.keys(queryResult.value[0])
    }
    resultDialogVisible.value = true
    ElMessage.success('执行成功')
  } catch (e) {
    ElMessage.error('执行失败')
  }
}

const handleSave = async () => {
  try {
    const payload = {
      name: currentQuery.name,
      description: currentQuery.description,
      sql: currentQuery.sql,
      data_source_id: currentQuery.data_source_id
    }
    if (dialogType.value === 'create') {
      await axios.post('/api/queries', payload)
      ElMessage.success('创建成功')
    } else {
      await axios.put(`/api/queries/${currentQuery.id}`, payload)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchQueries()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

function formatDate(row, column, cellValue) {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  if (isNaN(date.getTime())) return cellValue
  const pad = n => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

onMounted(() => {
fetchQueries()
  fetchDataSources()
})
</script>

<style lang="scss" scoped>
.queries-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
    }
  }
  
  .query-list {
    margin-bottom: 20px;
  }
}
</style> 