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
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const templateName = ref('')
const templateDesc = ref('')
const file = ref(null)

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
    await axios.post('/api/templates', formData)
    ElMessage.success('上传成功')
    templateName.value = ''
    templateDesc.value = ''
    file.value = null
  } catch (e) {
    ElMessage.error('上传失败')
  }
}
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
}
</style> 