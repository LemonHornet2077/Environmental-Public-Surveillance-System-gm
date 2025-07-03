import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 创建Vue应用实例
const app = createApp(App)

// 使用路由和Element Plus
app.use(router)
app.use(ElementPlus, {
    locale: zhCn, // 使用中文
    size: 'default', // 默认组件大小
})

// 挂载应用
app.mount('#app')
