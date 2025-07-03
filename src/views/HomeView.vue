<template>
    <div class="home-container">
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
            <!-- 数据概览卡片 -->
            <div class="dashboard-section">
                <div class="dashboard-header">
                    <h3>数据概览</h3>
                </div>
                <el-row :gutter="20">
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card shadow="hover" class="data-card">
                            <div class="data-card-content">
                                <el-icon class="card-icon" color="#409EFF"><Document /></el-icon>
                                <div class="card-info">
                                    <div class="card-value">{{ stats.totalTasks }}</div>
                                    <div class="card-label">总任务数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card shadow="hover" class="data-card">
                            <div class="data-card-content">
                                <el-icon class="card-icon" color="#67C23A"><Check /></el-icon>
                                <div class="card-info">
                                    <div class="card-value">{{ stats.completedTasks }}</div>
                                    <div class="card-label">已完成任务</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card shadow="hover" class="data-card">
                            <div class="data-card-content">
                                <el-icon class="card-icon" color="#E6A23C"><Timer /></el-icon>
                                <div class="card-info">
                                    <div class="card-value">{{ stats.pendingTasks }}</div>
                                    <div class="card-label">待处理任务</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6">
                        <el-card shadow="hover" class="data-card">
                            <div class="data-card-content">
                                <el-icon class="card-icon" color="#F56C6C"><Warning /></el-icon>
                                <div class="card-info">
                                    <div class="card-value">{{ stats.urgentTasks }}</div>
                                    <div class="card-label">紧急任务</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 任务列表 -->
            <div class="tasks-section">
                <el-card class="tasks-card">
                    <template #header>
                        <div class="card-header">
                            <h3>我的任务</h3>
                            <div class="header-actions">
                                <el-input
                                    v-model="searchQuery"
                                    placeholder="搜索任务"
                                    prefix-icon="el-icon-search"
                                    clearable
                                    class="search-input"
                                />
                                <el-select v-model="taskStatus" placeholder="任务状态" clearable>
                                    <el-option label="全部" value="" />
                                    <el-option label="待处理" value="pending" />
                                    <el-option label="处理中" value="processing" />
                                    <el-option label="已完成" value="completed" />
                                </el-select>
                            </div>
                        </div>
                    </template>

                    <el-table
                        :data="currentPageTasks()"
                        style="width: 100%"
                        v-loading="loading"
                        border
                        stripe
                        :header-cell-style="{ background: '#f5f7fa' }"
                        @row-click="viewTaskDetail"
                    >
                        <el-table-column prop="id" label="任务ID" width="80" />
                        <el-table-column prop="title" label="任务标题" min-width="180" />
                        <el-table-column prop="location" label="地点" min-width="150" />
                        <el-table-column prop="create_time" label="创建时间" width="160">
                            <template #default="scope">
                                {{ formatDate(scope.row.create_time) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100">
                            <template #default="scope">
                                <el-tag :type="getStatusType(scope.row.status)">
                                    {{ getStatusText(scope.row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="priority" label="优先级" width="100">
                            <template #default="scope">
                                <el-tag :type="getPriorityType(scope.row.priority)" effect="dark">
                                    {{ getPriorityText(scope.row.priority) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="150" fixed="right">
                            <template #default="scope">
                                <el-button
                                    type="primary"
                                    size="small"
                                    @click="viewTaskDetail(scope.row)"
                                >
                                    查看
                                </el-button>
                                <el-button
                                    v-if="scope.row.status !== 'completed'"
                                    type="success"
                                    size="small"
                                    @click="handleTask(scope.row)"
                                >
                                    {{ scope.row.status === 'pending' ? '处理' : '完成' }}
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="pagination-container">
                        <el-pagination
                            v-model:current-page="currentPage"
                            v-model:page-size="pageSize"
                            :page-sizes="[10, 20, 30, 50]"
                            :total="getFilteredTasks().length"
                            layout="total, sizes, prev, pager, next, jumper"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            background
                        />
                    </div>
                </el-card>
            </div>
        </main>
        
        <!-- 任务详情对话框 -->
        <TaskDetailDialog
            v-model:visible="taskDetailVisible"
            :task-data="currentTaskDetail"
            @process="handleTaskProcess"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Document,
    Check,
    Timer,
    Warning,
    ArrowDown,
    User,
    SwitchButton,
    Plus,
} from '@element-plus/icons-vue'
import TaskDetailDialog from '../components/TaskDetailDialog.vue'
import { getMemberInfo } from '../api/auth'
import { getFeedbackList } from '../api/aqi'

const router = useRouter()
const loading = ref(false)

// 用户信息
const userInfo = reactive({
    gm_code: '',
    real_name: '',
    grid_id: '',
    grid_name: '',
    tel_id: '',
})

// 统计数据
const stats = reactive({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    urgentTasks: 0,
})

// 定义任务类型接口
interface Task {
    id: number;
    title: string;
    address: string;
    date: string;
    status: string;
    priority: string;
    province_name?: string;
    city_name?: string;
    information?: string;
    aqi_level?: string;
    aqi_color?: string;
    supervisor_name?: string;
    supervisor_tel?: string;
    state?: number;
    raw?: any;
}

// 任务列表相关
const tasks = ref<Task[]>([])
const searchQuery = ref('')
const taskStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// 获取任务列表中的数据
const getFilteredTasks = () => {
    let filtered = [...tasks.value]

    // 搜索过滤
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
            (task) =>
                task.title.toLowerCase().includes(query) ||
                task.address.toLowerCase().includes(query)
        )
    }

    // 状态过滤
    if (taskStatus.value) {
        filtered = filtered.filter((task) => task.status === taskStatus.value)
    }

    return filtered
}

// 计算当前页面显示的任务
const currentPageTasks = () => {
    const filtered = getFilteredTasks()
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filtered.slice(start, end)
}

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
        const response = (await getMemberInfo()) as any
        if (response && response.data && response.data.grid_member) {
            Object.assign(userInfo, response.data.grid_member)
            localStorage.setItem('grid_member_info', JSON.stringify(response.data.grid_member))
        } else if (response && response.grid_member) {
            Object.assign(userInfo, response.grid_member)
            localStorage.setItem('grid_member_info', JSON.stringify(response.grid_member))
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败，请重新登录')
    }
}

// 加载任务数据
const loadTasksData = async () => {
    loading.value = true
    try {
        // 调用API获取网格员的反馈任务
        const res = await getFeedbackList()
        if (res.data && Array.isArray(res.data)) {
            // 将后端数据转换为前端任务格式
            const feedbackTasks = res.data.map((feedback: any) => {
                // 处理空气质量等级信息
                const estimatedGrade = feedback.estimated_grade || {};
                
                return {
                    id: feedback.id, // 使用后端返回的id
                    title: `空气质量反馈处理 - ${feedback.address || '未知地点'}`,
                    location: `${feedback.province_name || ''} ${feedback.city_name || ''} ${feedback.address || ''}`.trim(),
                    address: feedback.address,
                    create_time: `${feedback.af_date || ''} ${feedback.af_time || ''}`.trim(),
                    date: feedback.assign_date || feedback.af_date,
                    status: getTaskStatus(feedback.state),
                    priority: getFeedbackPriority(estimatedGrade.id),
                    province_name: feedback.province_name,
                    city_name: feedback.city_name,
                    information: feedback.information,
                    aqi_level: estimatedGrade.name,
                    aqi_color: estimatedGrade.color,
                    supervisor_name: feedback.supervisor_name,
                    supervisor_tel: feedback.tel_id,
                    state: feedback.state,
                    estimated_grade: estimatedGrade,
                    raw: feedback // 保存原始数据以便后续使用
                };
            })

            tasks.value = feedbackTasks
            totalItems.value = feedbackTasks.length
            
            // 更新统计数据
            stats.totalTasks = feedbackTasks.length
            stats.pendingTasks = feedbackTasks.filter((t: any) => t.status === 'pending').length
            stats.completedTasks = feedbackTasks.filter((t: any) => t.status === 'completed').length
            stats.urgentTasks = feedbackTasks.filter((t: any) => t.priority === 'urgent').length
        }
    } catch (error) {
        console.error('获取任务数据失败:', error)
        ElMessage.error('获取任务数据失败')
    } finally {
        loading.value = false
    }
}

// 格式化日期
const formatDate = (dateString: string) => {
    return dateString
}

// 获取状态对应的类型和文本
const getStatusType = (status: string) => {
    const types: Record<string, string> = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
    }
    return types[status] || 'info'
}

const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
    }
    return texts[status] || '未知'
}

// 将后端状态转换为前端状态
const getTaskStatus = (state: number) => {
    // 状态：0-未指派，1-已指派未确认，2-已确认
    switch (state) {
        case 1: return 'pending' // 已指派未确认
        case 2: return 'completed' // 已确认
        default: return 'pending'
    }
}

// 根据AQI级别确定任务优先级
const getFeedbackPriority = (aqiId: number) => {
    // AQI级别：1-优，2-良，3-轻度污染，4-中度污染，5-重度污染，6-严重污染
    switch (aqiId) {
        case 1: return 'low'
        case 2: return 'low'
        case 3: return 'normal'
        case 4: return 'high'
        case 5: return 'urgent'
        case 6: return 'urgent'
        default: return 'normal'
    }
}

// 获取优先级对应的类型和文本
const getPriorityType = (priority: string) => {
    const types: Record<string, string> = {
        low: 'info',
        normal: 'success',
        high: 'warning',
        urgent: 'danger',
    }
    return types[priority] || 'info'
}

const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
        low: '低',
        normal: '普通',
        high: '高',
        urgent: '紧急',
    }
    return texts[priority] || '未知'
}



// 处理任务
const handleTask = (task: any) => {
    // 如果任务是待处理状态，跳转到AQI提交页面
    if (task.status === 'pending') {
        router.push({
            path: '/submit-aqi',
            query: { feedback_id: task.id }
        })
    } else {
        // 如果任务已完成，显示详情对话框
        viewTaskDetail(task)
    }
}

// 跳转到AQI提交页面
const goToSubmitAQI = () => {
    router.push('/submit-aqi')
}

// 任务详情对话框
const taskDetailVisible = ref(false)
const currentTaskDetail = ref<any>(null)

// 查看任务详情
const viewTaskDetail = (task: any) => {
    currentTaskDetail.value = task
    taskDetailVisible.value = true
}

// 处理任务详情对话框中的处理按钮点击
const handleTaskProcess = (task: any) => {
    router.push({
        path: '/submit-aqi',
        query: { feedback_id: task.id }
    })
}

// 分页处理
const handleSizeChange = (val: number) => {
    pageSize.value = val
    // 实际项目中应该重新请求数据
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    // 实际项目中应该重新请求数据
}

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
    if (command === 'profile') {
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
    loadTasksData()
})
</script>

<style scoped>
.home-container {
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

/* 数据卡片 */
.dashboard-section {
    margin-bottom: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.dashboard-header h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
}

.data-card {
    margin-bottom: 20px;
}

.data-card-content {
    display: flex;
    align-items: center;
}

.card-icon {
    font-size: 48px;
    margin-right: 20px;
}

.card-info {
    flex: 1;
}

.card-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    line-height: 1;
    margin-bottom: 8px;
}

.card-label {
    font-size: 14px;
    color: #909399;
}

/* 任务列表 */
.tasks-section {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.search-input {
    width: 200px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
