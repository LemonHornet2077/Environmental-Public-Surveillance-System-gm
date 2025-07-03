<template>
    <el-dialog
        v-model="dialogVisible"
        :title="title"
        width="600px"
        :before-close="handleClose"
        destroy-on-close
    >
        <div v-loading="loading" class="task-detail-content">
            <!-- 基本信息 -->
            <div class="detail-section">
                <h4 class="section-title">基本信息</h4>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="任务ID">{{ task.id || task.af_id }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="getStatusType(task.status)">
                            {{ getStatusText(task.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="优先级">
                        <el-tag :type="getPriorityType(task.priority)" effect="dark">
                            {{ getPriorityText(task.priority) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="提交日期">{{ task.date }}</el-descriptions-item>
                    <el-descriptions-item v-if="task.assign_date" label="指派日期">{{
                        task.assign_date
                    }}</el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 地理位置信息 -->
            <div class="detail-section">
                <h4 class="section-title">地理位置</h4>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="省份">{{
                        task.province_name
                    }}</el-descriptions-item>
                    <el-descriptions-item label="城市">{{ task.city_name }}</el-descriptions-item>
                    <el-descriptions-item label="详细地址">{{ task.address }}</el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 反馈信息 -->
            <div class="detail-section">
                <h4 class="section-title">反馈信息</h4>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="反馈者">{{
                        task.supervisor_name
                    }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{
                        task.supervisor_tel
                    }}</el-descriptions-item>
                    <el-descriptions-item label="预估空气质量">
                        <el-tag :color="task.estimated_grade?.color || task.aqi_color" style="color: #fff">
                            {{ task.estimated_grade?.name || task.aqi_level || '未知' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="反馈信息">
                        <div class="information-content">{{ task.information || '无' }}</div>
                    </el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 如果任务已完成，显示实测数据 -->
            <div v-if="task.status === 'completed' && aqiData" class="detail-section">
                <h4 class="section-title">实测AQI数据</h4>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="二氧化硫(SO₂)">
                        {{ aqiData.so2_value }} (级别: {{ aqiData.so2_level }})
                    </el-descriptions-item>
                    <el-descriptions-item label="一氧化碳(CO)">
                        {{ aqiData.co_value }} (级别: {{ aqiData.co_level }})
                    </el-descriptions-item>
                    <el-descriptions-item label="悬浮颗粒物(SPM)">
                        {{ aqiData.spm_value }} (级别: {{ aqiData.spm_level }})
                    </el-descriptions-item>
                    <el-descriptions-item label="综合AQI级别">
                        <el-tag :color="aqiData.aqi_color" style="color: #fff">
                            {{ aqiData.aqi_level }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="确认时间">
                        {{ aqiData.confirm_date }} {{ aqiData.confirm_time }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 备注信息 -->
            <div v-if="task.remarks" class="detail-section">
                <h4 class="section-title">备注</h4>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="备注信息">
                        <div class="information-content">{{ task.remarks }}</div>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">关闭</el-button>
                <el-button v-if="task.status === 'pending'" type="primary" @click="handleProcess">
                    处理任务
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义属性
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    taskData: {
        type: Object,
        default: () => ({}),
    },
})

// 定义事件
const emit = defineEmits(['update:visible', 'process'])

// 对话框可见性
const dialogVisible = ref(props.visible)

// 监听visible属性变化
watch(
    () => props.visible,
    (newVal) => {
        dialogVisible.value = newVal
    },
)

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
    emit('update:visible', newVal)
})

// 任务数据
const task = reactive<any>({})
const aqiData = ref<any>(null)
const loading = ref(false)
const title = ref('任务详情')

// 监听任务数据变化
watch(
    () => props.taskData,
    (newVal) => {
        if (newVal) {
            Object.assign(task, newVal)

            // 如果有原始数据，使用原始数据中的字段
            if (task.raw) {
                task.province_name = task.raw.province_name
                task.city_name = task.raw.city_name
                task.supervisor_name = task.raw.supervisor_name
                task.supervisor_tel = task.raw.tel_id
                task.aqi_level = task.raw.aqi_level
                task.aqi_color = task.raw.color
                task.assign_date = task.raw.assign_date
                task.remarks = task.raw.remarks
            }

            // 设置标题
            title.value = `任务详情 - ${task.title || '未命名任务'}`

            // 如果是已完成任务，可以在这里加载实测AQI数据
            // 实际项目中应该从API获取数据
            if (task.status === 'completed') {
                // 模拟AQI数据，实际项目中应该从API获取
                aqiData.value = {
                    so2_value: 125,
                    so2_level: 2,
                    co_value: 180,
                    co_level: 3,
                    spm_value: 210,
                    spm_level: 4,
                    aqi_id: 4,
                    aqi_level: '中度污染',
                    aqi_color: '#FF9900',
                    confirm_date: '2025-07-01',
                    confirm_time: '15:30:22',
                }
            } else {
                aqiData.value = null
            }
        }
    },
    { deep: true, immediate: true },
)

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}

// 处理任务
const handleProcess = () => {
    emit('process', task)
    handleClose()
}

// 获取状态对应的类型
const getStatusType = (status: string) => {
    const types: Record<string, string> = {
        pending: 'warning',
        processing: 'primary',
        completed: 'success',
    }
    return types[status] || 'info'
}

// 获取状态对应的文本
const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
    }
    return texts[status] || '未知'
}

// 获取优先级对应的类型
const getPriorityType = (priority: string) => {
    const types: Record<string, string> = {
        low: 'info',
        normal: 'success',
        high: 'warning',
        urgent: 'danger',
    }
    return types[priority] || 'info'
}

// 获取优先级对应的文本
const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
        low: '低',
        normal: '普通',
        high: '高',
        urgent: '紧急',
    }
    return texts[priority] || '未知'
}
</script>

<style scoped>
.task-detail-content {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 10px;
}

.detail-section {
    margin-bottom: 20px;
}

.section-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #303133;
    font-weight: 500;
}

.information-content {
    white-space: pre-wrap;
    line-height: 1.5;
}

/* 自定义滚动条样式 */
.task-detail-content::-webkit-scrollbar {
    width: 6px;
}

.task-detail-content::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
}

.task-detail-content::-webkit-scrollbar-track {
    background-color: #f5f7fa;
}
</style>
