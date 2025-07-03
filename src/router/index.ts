import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SubmitAQIView from '../views/SubmitAQIView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { requiresAuth: false }
        },
        {
            path: '/submit-aqi',
            name: 'submitAQI',
            component: SubmitAQIView,
            meta: { requiresAuth: true }
        },
    ],
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
    // 检查路由是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    // 检查用户是否已登录
    const isLoggedIn = localStorage.getItem('grid_member_token')

    if (requiresAuth && !isLoggedIn) {
        // 如果需要认证但用户未登录，重定向到登录页面
        next('/login')
    } else if (to.path === '/login' && isLoggedIn) {
        // 如果用户已登录但尝试访问登录页面，重定向到首页
        next('/')
    } else {
        // 其他情况正常导航
        next()
    }
})

export default router
