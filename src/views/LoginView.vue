<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <h2>环保公众监督系统</h2>
                <h3>网格员登录</h3>
            </div>

            <el-form
                ref="loginForm"
                :model="loginData"
                :rules="loginRules"
                label-width="0"
                class="login-form"
            >
                <el-form-item prop="gm_code">
                    <el-input
                        v-model="loginData.gm_code"
                        placeholder="网格员编号"
                        size="large"
                    >
                        <template #prefix>
                            <el-icon><User /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginData.password"
                        type="password"
                        placeholder="密码"
                        size="large"
                        show-password
                        @keyup.enter="handleLogin"
                    >
                        <template #prefix>
                            <el-icon><Lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        :loading="loading"
                        class="login-button"
                        @click="handleLogin"
                    >
                        {{ loading ? '登录中...' : '登录' }}
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="login-tips">
                <p>* 网格员账号由管理员创建，无法自行注册</p>
                <p>* 如忘记密码，请联系系统管理员</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api/auth'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const loginForm = ref<FormInstance | null>(null)

// 登录表单数据
const loginData = reactive({
    gm_code: '',
    password: '',
})

// 表单验证规则
const loginRules = {
    gm_code: [{ required: true, message: '请输入网格员编号', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 1, message: '密码不能为空', trigger: 'blur' },
    ],
}

// 处理登录
const handleLogin = async () => {
    try {
        // 表单验证
        if (!loginForm.value) return
        
        const valid = await loginForm.value.validate()
        if (!valid) {
            ElMessage.error('请填写正确的登录信息')
            return
        }
        
        loading.value = true
        
        // 调用登录API
        const response = await login(loginData) as any

        // 登录成功，保存token和用户信息
        localStorage.setItem('grid_member_token', response.token)
        localStorage.setItem('grid_member_info', JSON.stringify(response.grid_member))

        ElMessage({
            message: '登录成功',
            type: 'success'
        })

        // 跳转到首页
        router.push('/')
    } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage({
            message: error.response?.data?.error || '登录失败，请检查网格员编号和密码',
            type: 'error'
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}

.login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    font-size: 24px;
    color: #409eff;
    margin-bottom: 10px;
}

.login-header h3 {
    font-size: 18px;
    color: #606266;
    margin: 0;
}

.login-form {
    margin-bottom: 20px;
}

.login-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
}

.login-tips {
    font-size: 12px;
    color: #909399;
    text-align: center;
}

.login-tips p {
    margin: 5px 0;
}
</style>
