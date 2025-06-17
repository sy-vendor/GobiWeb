<template>
  <div class="datasource-container">
    <div class="page-header">
      <h2>数据源管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建数据源
      </el-button>
    </div>
    <el-card class="datasource-list">
      <el-table :data="dataSources" style="width: 100%">
        <el-table-column prop="Name" label="名称" />
        <el-table-column prop="Type" label="类型" />
        <el-table-column prop="Host" label="主机" />
        <el-table-column prop="Port" label="端口" />
        <el-table-column prop="Username" label="用户名" />
        <el-table-column prop="Database" label="数据库名" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogType === 'create' ? '新建数据源' : '编辑数据源'" width="500px">
      <el-form ref="dsForm" :model="currentDS" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="currentDS.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="currentDS.type" style="width: 100%">
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgresql" />
            <el-option label="ClickHouse" value="clickhouse" />
          </el-select>
        </el-form-item>
        <el-form-item label="主机" prop="host">
          <el-input v-model="currentDS.host" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="currentDS.port" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentDS.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="currentDS.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="数据库名" prop="database">
          <el-input v-model="currentDS.database" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { da, lo } from 'element-plus/es/locales.mjs'

const dataSources = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const currentDS = reactive({
  id: null,
  name: '',
  type: 'mysql',
  host: '',
  port: '',
  username: '',
  password: '',
  database: ''
})
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  database: [{ required: true, message: '请输入数据库名', trigger: 'blur' }]
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
  Object.assign(currentDS, {
    id: null,
    name: '',
    type: 'mysql',
    host: '',
    port: '',
    username: '',
    password: '',
    database: ''
  })
  dialogVisible.value = true
}
const handleEdit = (ds) => {
  dialogType.value = 'edit'
  Object.assign(currentDS, {
    id: ds.ID,
    name: ds.Name,
    type: ds.Type,
    host: ds.Host,
    port: ds.Port,
    username: ds.Username,
    password: '',
    database: ds.Database
  })
  dialogVisible.value = true
}
const handleDelete = async (ds) => {
  try {
    await ElMessageBox.confirm('确定要删除这个数据源吗？', '警告', { type: 'warning' })
    await axios.delete(`/api/datasources/${ds.ID}`)
    ElMessage.success('删除成功')
    fetchDataSources()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}
const handleSave = async () => {
  try {
    const payload = { ...currentDS, port: Number(currentDS.port) }
    if (dialogType.value === 'create') {
      await axios.post('/api/datasources', payload)
      ElMessage.success('创建成功')
    } else {
      await axios.put(`/api/datasources/${currentDS.id}`, payload)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchDataSources()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
fetchDataSources()
</script>
<style lang="scss" scoped>
.datasource-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h2 { margin: 0; }
  }
  .datasource-list { margin-bottom: 20px; }
}
</style> 