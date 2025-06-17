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
        <el-table-column prop="name" label="查询名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const queries = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const resultDialogVisible = ref(false)
const queryResult = ref([])
const resultColumns = ref([])

const currentQuery = reactive({
  id: null,
  name: '',
  description: '',
  sql: ''
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

const handleCreate = () => {
  dialogType.value = 'create'
  currentQuery.id = null
  currentQuery.name = ''
  currentQuery.description = ''
  currentQuery.sql = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(currentQuery, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个查询吗？', '警告', {
      type: 'warning'
    })
    
    await axios.delete(`/api/queries/${row.id}`)
    ElMessage.success('删除成功')
    fetchQueries()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleExecute = async (row) => {
  try {
    const response = await axios.post(`/api/queries/${row.id}/execute`)
    queryResult.value = response.data.rows
    if (queryResult.value.length > 0) {
      resultColumns.value = Object.keys(queryResult.value[0])
    }
    resultDialogVisible.value = true
  } catch (error) {
    ElMessage.error('执行查询失败')
  }
}

const handleSave = async () => {
  try {
    if (dialogType.value === 'create') {
      await axios.post('/api/queries', currentQuery)
      ElMessage.success('创建成功')
    } else {
      await axios.put(`/api/queries/${currentQuery.id}`, currentQuery)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchQueries()
  } catch (error) {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
  }
}

// 初始化
fetchQueries()
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