<template>
    <div class="submit-aqi-container">
        <!-- 顶部导航栏 -->
        <header class="header">
            <div class="header-left">
                <h2 class="system-title">环保公众监督系统</h2>
            </div>
            <div class="header-right">
                <el-dropdown trigger="click" @command="handleCommand">
                    <div class="user-info">
                        <el-avatar :size="32" class="user-avatar">
                            {{
                                userInfo.real_name
                                    ? userInfo.real_name.substring(0, 1)
                                    : userInfo.gm_code.substring(0, 1)
                            }}
                        </el-avatar>
                        <span class="user-name">{{ userInfo.real_name || userInfo.gm_code }}</span>
                        <el-icon><ArrowDown /></el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="home">
                                <el-icon><House /></el-icon>返回首页
                            </el-dropdown-item>
                            <el-dropdown-item command="profile">
                                <el-icon><User /></el-icon>个人信息
                            </el-dropdown-item>
                            <el-dropdown-item command="logout">
                                <el-icon><SwitchButton /></el-icon>退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </header>

        <!-- 主内容区 -->
        <main class="main-content">
            <el-card class="aqi-form-card">
                <template #header>
                    <div class="card-header">
                        <h3>提交实测AQI数据</h3>
                        <el-button type="primary" @click="goBack">
                            <el-icon><Back /></el-icon>返回任务列表
                        </el-button>
                    </div>
                </template>

                <el-form
                    ref="formRef"
                    :model="formData"
                    :rules="rules"
                    label-width="120px"
                    class="aqi-form"
                    v-loading="loading"
                >
                    <!-- 如果是从任务详情页进入，显示任务信息 -->
                    <div v-if="feedbackInfo" class="feedback-info">
                        <el-alert
                            title="任务信息"
                            type="info"
                            :closable="false"
                            description=""
                        >
                            <template #default>
                                <p><strong>任务ID:</strong> {{ feedbackInfo.id || feedbackInfo.af_id }}</p>
                                <p><strong>地址:</strong> {{ feedbackInfo.address }}</p>
                                <p><strong>反馈信息:</strong> {{ feedbackInfo.information }}</p>
                                <p><strong>预估空气质量:</strong> {{ getEstimatedGrade(feedbackInfo) }}</p>
                            </template>
                        </el-alert>
                    </div>

                    <!-- 地理位置选择 -->
                    <el-form-item label="省份" prop="province_id">
                        <el-select
                            v-model="formData.province_id"
                            placeholder="请选择省份"
                            @change="handleProvinceChange"
                            style="width: 100%"
                        >
                            <el-option
                                v-for="item in provinces"
                                :key="item.province_id"
                                :label="item.province_name"
                                :value="item.province_id"
                            />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="城市" prop="city_id">
                        <el-select
                            v-model="formData.city_id"
                            placeholder="请选择城市"
                            style="width: 100%"
                            :disabled="!formData.province_id"
                        >
                            <el-option
                                v-for="item in cities"
                                :key="item.city_id"
                                :label="item.city_name"
                                :value="item.city_id"
                            />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="详细地址" prop="address">
                        <el-input
                            v-model="formData.address"
                            placeholder="请输入详细地址"
                        />
                    </el-form-item>

                    <!-- 污染物浓度值 -->
                    <el-divider content-position="left">污染物浓度值</el-divider>

                    <el-form-item label="二氧化硫(SO₂)" prop="so2_value">
                        <el-input-number
                            v-model="formData.so2_value"
                            :min="0"
                            :precision="0"
                            :step="10"
                            style="width: 100%"
                            placeholder="请输入二氧化硫浓度值"
                        />
                    </el-form-item>

                    <el-form-item label="一氧化碳(CO)" prop="co_value">
                        <el-input-number
                            v-model="formData.co_value"
                            :min="0"
                            :precision="0"
                            :step="10"
                            style="width: 100%"
                            placeholder="请输入一氧化碳浓度值"
                        />
                    </el-form-item>

                    <el-form-item label="悬浮颗粒物(SPM)" prop="spm_value">
                        <el-input-number
                            v-model="formData.spm_value"
                            :min="0"
                            :precision="0"
                            :step="10"
                            style="width: 100%"
                            placeholder="请输入悬浮颗粒物浓度值"
                        />
                    </el-form-item>

                    <!-- 其他信息 -->
                    <el-divider content-position="left">其他信息</el-divider>

                    <el-form-item label="信息描述" prop="information">
                        <el-input
                            v-model="formData.information"
                            type="textarea"
                            :rows="4"
                            placeholder="请输入信息描述"
                        />
                    </el-form-item>

                    <el-form-item label="反馈者手机号" prop="supervisor_tel" v-if="!feedbackInfo">
                        <el-input
                            v-model="formData.supervisor_tel"
                            placeholder="请输入反馈者手机号"
                        />
                    </el-form-item>

                    <!-- 提交按钮 -->
                    <el-form-item>
                        <el-button type="primary" @click="submitForm(formRef)">
                            提交数据
                        </el-button>
                        <el-button @click="resetForm(formRef)">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowDown, User, SwitchButton, House, Back } from '@element-plus/icons-vue'
import { getMemberInfo } from '../api/auth'
import { submitAQIMeasurement, getProvinces, getCities, getFeedbackList } from '../api/aqi'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 用户信息
const userInfo = reactive<any>({
    gm_id: '',
    gm_code: '',
    real_name: '',
    province_id: null,
    city_id: null,
})

// 表单数据
const formData = reactive({
    feedback_id: undefined as number | undefined,
    province_id: null as number | null,
    city_id: null as number | null,
    address: '',
    so2_value: 0,
    co_value: 0,
    spm_value: 0,
    information: '',
    supervisor_tel: '',
})

// 表单验证规则
const rules = reactive<FormRules>({
    province_id: [
        { required: true, message: '请选择省份', trigger: 'change' },
    ],
    city_id: [
        { required: true, message: '请选择城市', trigger: 'change' },
    ],
    address: [
        { required: true, message: '请输入详细地址', trigger: 'blur' },
    ],
    so2_value: [
        { required: true, message: '请输入二氧化硫浓度值', trigger: 'blur' },
        { type: 'number', min: 0, message: '浓度值必须大于等于0', trigger: 'blur' },
    ],
    co_value: [
        { required: true, message: '请输入一氧化碳浓度值', trigger: 'blur' },
        { type: 'number', min: 0, message: '浓度值必须大于等于0', trigger: 'blur' },
    ],
    spm_value: [
        { required: true, message: '请输入悬浮颗粒物浓度值', trigger: 'blur' },
        { type: 'number', min: 0, message: '浓度值必须大于等于0', trigger: 'blur' },
    ],
    information: [
        { required: true, message: '请输入信息描述', trigger: 'blur' },
    ],
    supervisor_tel: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
})

// 省份和城市数据
const provinces = ref<any[]>([])
const cities = ref<any[]>([])
const feedbackInfo = ref<any>(null)

// 加载用户信息
const loadUserInfo = async () => {
    try {
        // 先从本地存储获取
        const storedInfo = localStorage.getItem('grid_member_info')
        if (storedInfo && storedInfo !== 'undefined') {
            try {
                const parsedInfo = JSON.parse(storedInfo)
                if (parsedInfo) {
                    Object.assign(userInfo, parsedInfo)
                }
            } catch (e) {
                console.warn('解析本地存储的用户信息失败', e)
                // 删除无效的用户信息
                localStorage.removeItem('grid_member_info')
            }
        }

        // 从API获取最新信息
        const response = await getMemberInfo() as any
        if (response && response.data && response.data.grid_member) {
            Object.assign(userInfo, response.data.grid_member)
            localStorage.setItem('grid_member_info', JSON.stringify(response.data.grid_member))
        } else if (response && response.grid_member) {
            Object.assign(userInfo, response.grid_member)
            localStorage.setItem('grid_member_info', JSON.stringify(response.grid_member))
        } else if (response && response.data) {
            Object.assign(userInfo, response.data)
            localStorage.setItem('grid_member_info', JSON.stringify(response.data))
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败，请重新登录')
    }
}

// 加载省份数据
const loadProvinces = async () => {
    try {
        const res = await getProvinces()
        if (res.data) {
            provinces.value = res.data
        }
    } catch (error) {
        console.error('获取省份数据失败:', error)
        ElMessage.error('获取省份数据失败')
    }
}

// 处理省份变化
const handleProvinceChange = async (provinceId: number) => {
    formData.city_id = null
    cities.value = []
    if (!provinceId) return

    try {
        const res = await getCities(provinceId)
        if (res.data) {
            cities.value = res.data
            
            // 如果只有一个城市选项，自动选择该城市
            if (cities.value.length === 1) {
                formData.city_id = cities.value[0].city_id
                ElMessage.info(`已自动选择城市: ${cities.value[0].city_name}`)
            }
            // 如果有多个城市选项，但之前已经设置了city_id，尝试找到匹配的城市
            else if (formData.city_id) {
                const cityExists = cities.value.some(city => city.city_id === formData.city_id)
                if (!cityExists) {
                    formData.city_id = null // 如果之前的城市不在新的列表中，重置选择
                }
            }
        }
    } catch (error) {
        console.error('获取城市数据失败:', error)
        ElMessage.error('获取城市数据失败')
    }
}

// 获取预估空气质量显示文本
const getEstimatedGrade = (task: any) => {
    // 优先使用嵌套的estimated_grade对象
    if (task.estimated_grade && task.estimated_grade.name) {
        return task.estimated_grade.name
    }
    // 兼容旧数据结构
    return task.aqi_level || '未知'
}

// 加载反馈任务信息（如果有）
const loadFeedbackInfo = async () => {
    const feedbackId = Number(route.query.feedback_id)
    if (!feedbackId) return

    try {
        loading.value = true
        const res = await getFeedbackList()
        if (res.data && Array.isArray(res.data)) {
            // 支持两种可能的ID字段名：af_id或id
            const feedback = res.data.find((item: any) => 
                (item.af_id === feedbackId) || (item.id === feedbackId)
            )
            if (feedback) {
                feedbackInfo.value = feedback
                // 预填表单数据
                formData.feedback_id = feedback.af_id || feedback.id
                formData.province_id = feedback.province_id
                
                // 先不设置city_id，等handleProvinceChange加载城市列表后再设置
                // 这样可以确保city_id在城市列表中存在
                const cityId = feedback.city_id
                formData.address = feedback.address
                formData.information = feedback.information || ''
                
                // 如果有省份ID，加载对应的城市列表
                if (feedback.province_id) {
                    await handleProvinceChange(feedback.province_id)
                    
                    // 如果城市列表加载成功且有多个选项，设置之前保存的city_id
                    if (cities.value.length > 1 && cityId) {
                        // 检查cityId是否在加载的城市列表中
                        const cityExists = cities.value.some(city => city.city_id === cityId)
                        if (cityExists) {
                            formData.city_id = cityId
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('获取反馈任务信息失败:', error)
        ElMessage.error('获取反馈任务信息失败')
    } finally {
        loading.value = false
    }
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    
    await formEl.validate(async (valid) => {
        if (!valid) {
            ElMessage.error('请完善表单信息')
            return
        }
        
        try {
            loading.value = true
            
            // 准备提交数据
            const submitData = {
                feedback_id: formData.feedback_id,
                province_id: formData.province_id!,
                city_id: formData.city_id!,
                address: formData.address,
                so2_value: formData.so2_value,
                co_value: formData.co_value,
                spm_value: formData.spm_value,
                information: formData.information,
                supervisor_tel: feedbackInfo.value ? undefined : formData.supervisor_tel,
            }
            
            const res = await submitAQIMeasurement(submitData)
            
            ElMessage.success('AQI数据提交成功')
            
            // 显示结果
            ElMessageBox.alert(
                `
                <p><strong>二氧化硫(SO₂):</strong> ${res.data.so2_value} (级别: ${res.data.so2_level})</p>
                <p><strong>一氧化碳(CO):</strong> ${res.data.co_value} (级别: ${res.data.co_level})</p>
                <p><strong>悬浮颗粒物(SPM):</strong> ${res.data.spm_value} (级别: ${res.data.spm_level})</p>
                <p><strong>综合AQI级别:</strong> ${res.data.aqi_level}</p>
                <p><strong>提交时间:</strong> ${res.data.confirm_date} ${res.data.confirm_time}</p>
                `,
                'AQI数据提交结果',
                {
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: '确定',
                    callback: () => {
                        // 返回任务列表
                        router.push('/')
                    },
                }
            )
        } catch (error: any) {
            console.error('提交AQI数据失败:', error)
            ElMessage.error(error.response?.data?.error || '提交AQI数据失败')
        } finally {
            loading.value = false
        }
    })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    
    // 如果是从任务详情页进入，恢复预填的数据
    if (feedbackInfo.value) {
        formData.feedback_id = feedbackInfo.value.af_id || feedbackInfo.value.id
        formData.province_id = feedbackInfo.value.province_id
        formData.city_id = feedbackInfo.value.city_id
        formData.address = feedbackInfo.value.address
        formData.information = feedbackInfo.value.information || ''
    }
}

// 返回任务列表
const goBack = () => {
    router.push('/')
}

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
    if (command === 'home') {
        router.push('/')
    } else if (command === 'profile') {
        router.push('/profile')
    } else if (command === 'logout') {
        ElMessageBox.confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
            .then(() => {
                // 清除登录信息
                localStorage.removeItem('grid_member_token')
                localStorage.removeItem('grid_member_info')

                // 跳转到登录页
                router.push('/login')

                ElMessage({
                    message: '已退出登录',
                    type: 'success',
                })
            })
            .catch(() => {})
    }
}

// 页面加载时执行
onMounted(() => {
    loadUserInfo()
    loadProvinces()
    loadFeedbackInfo()
})
</script>

<style scoped>
.submit-aqi-container {
    min-height: 100vh;
    background-color: #f5f7fa;
}

/* 顶部导航栏 */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.system-title {
    margin: 0;
    font-size: 18px;
    color: #409eff;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.user-avatar {
    margin-right: 8px;
    background-color: #409eff;
    color: #fff;
}

.user-name {
    margin-right: 5px;
    font-size: 14px;
}

/* 主内容区 */
.main-content {
    padding: 20px;
}

.aqi-form-card {
    max-width: 800px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    margin: 0;
}

.aqi-form {
    margin-top: 20px;
}

.feedback-info {
    margin-bottom: 20px;
}
</style>
