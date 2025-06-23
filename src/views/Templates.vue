<template>
  <div class="templates-container">
    <div class="page-header">
      <h2>模板管理</h2>
    </div>
    <el-card class="template-upload-card">
      <el-form label-width="100px">
        <el-form-item label="模板名">
          <el-input v-model="templateName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="templateDesc" />
        </el-form-item>
        <el-form-item label="选择文件">
          <input type="file" @change="onFileChange" accept=".xlsx,.xls" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleUpload">上传</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="template-list-card" style="margin-top: 24px;">
      <el-table :data="templateList" style="width: 100%">
        <el-table-column prop="Name" label="模板名" />
        <el-table-column prop="Description" label="描述" />
        <el-table-column prop="CreatedAt" label="上传时间" :formatter="formatDate" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../utils/axios'

const templateName = ref('')
const templateDesc = ref('')
const file = ref(null)
const templateList = ref([])

function onFileChange(e) {
  file.value = e.target.files[0]
}

async function handleUpload() {
  if (!file.value) return ElMessage.error('请选择文件')
  if (!templateName.value) return ElMessage.error('请输入模板名')
  
  const formData = new FormData()
  formData.append('template', file.value)
  formData.append('name', templateName.value)
  formData.append('description', templateDesc.value)
  
  try {
    await http.post('/templates', formData)
    ElMessage.success('上传成功')
    templateName.value = ''
    templateDesc.value = ''
    file.value = null
    fetchTemplateList()
  } catch (error) {
    console.error('上传失败:', error)
  }
}

const fetchTemplateList = async () => {
  try {
    const res = await http.get('/templates')
    let list = res.data.data || res.data || []
    if (Array.isArray(list)) {
      templateList.value = list.map(item => ({
        ...item,
        id: item.id || item.ID,
        ID: item.id || item.ID,
        Name: item.name || item.Name,
        Description: item.description || item.Description,
        CreatedAt: item.created_at || item.CreatedAt
      }))
    } else {
      templateList.value = []
    }
  } catch (error) {
    console.error('获取模板列表失败:', error)
  }
}

const handleDelete = async (row) => {
  try {
    const templateId = row.id || row.ID
    if (!templateId) {
      throw new Error('模板 ID 不存在')
    }

    await http.delete(`/templates/${templateId}`)
    ElMessage.success('删除成功')
    fetchTemplateList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleDownload = async (row) => {
  try {
    const res = await http.get(`/templates/${row.id || row.ID}/download`, {
      responseType: 'blob'
    })
    const fileName = row.Name || row.name || 'template.xlsx'
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
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
  fetchTemplateList()
})
</script>
<style lang="scss" scoped>
.templates-container {
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    h2 { margin: 0; }
  }
  .template-upload-card {
    max-width: 500px;
    margin: 0 auto;
  }
  .template-list-card {
    margin-top: 24px;
  }
}
</style> 