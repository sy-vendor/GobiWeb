<template>
  <div class="users-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建用户
      </el-button>
    </div>
    
    <el-card class="user-list">
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="Username" label="用户名" />
        <el-table-column prop="Email" label="邮箱" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="CreatedAt" label="创建时间" width="180" :formatter="formatDate" />
        <el-table-column prop="last_login" label="最后登录" width="180" :formatter="formatDate" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-button
                type="danger"
                link
                :disabled="row.role === 'admin'"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新建用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userForm"
        :model="currentUser"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="currentUser.username"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="currentUser.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        
        <el-form-item
          v-if="dialogType === 'create'"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="currentUser.password"
            type="password"
            show-password
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
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        ref="resetPasswordForm"
        :model="resetPasswordData"
        :rules="resetPasswordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="resetPasswordData.password"
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPasswordData.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResetPasswordSave">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const users = ref([])
const dialogVisible = ref(false)
const dialogType = ref('create')
const resetPasswordVisible = ref(false)

const currentUser = reactive({
  id: null,
  username: '',
  email: '',
  role: 'user',
  password: ''
})

const resetPasswordData = reactive({
  userId: null,
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetPasswordData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' }
  ]
}

const resetPasswordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/users')
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const handleCreate = () => {
  dialogType.value = 'create'
  currentUser.id = null
  currentUser.username = ''
  currentUser.email = ''
  currentUser.role = 'user'
  currentUser.password = ''
  dialogVisible.value = true
}

const handleEdit = (user) => {
  dialogType.value = 'edit'
  Object.assign(currentUser, user)
  dialogVisible.value = true
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用户吗？', '警告', {
      type: 'warning'
    })
    
    await axios.delete(`/api/users/${user.id}`)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleResetPassword = (user) => {
  resetPasswordData.userId = user.id
  resetPasswordData.password = ''
  resetPasswordData.confirmPassword = ''
  resetPasswordVisible.value = true
}

const handleResetPasswordSave = async () => {
  try {
    await axios.post(`/api/users/${resetPasswordData.userId}/reset-password`, {
      password: resetPasswordData.password
    })
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    ElMessage.error('密码重置失败')
  }
}

const handleSave = async () => {
  try {
    if (dialogType.value === 'create') {
      await axios.post('/api/auth/register', {
        username: currentUser.username,
        password: currentUser.password,
        email: currentUser.email,
        is_admin: currentUser.role === 'admin'
      })
      ElMessage.success('创建成功')
    } else {
      await axios.put(`/api/users/${currentUser.id}`, currentUser)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
  }
}

function formatDate(row, column, cellValue) {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  if (isNaN(date.getTime())) return cellValue
  const pad = n => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

// 初始化
fetchUsers()
</script>

<style lang="scss" scoped>
.users-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
    }
  }
  
  .user-list {
    margin-bottom: 20px;
  }
}
</style> 