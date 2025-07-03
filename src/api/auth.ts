import axios from 'axios'

// 创建axios实例
const request = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 15000,
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 从localStorage获取token
        const token = localStorage.getItem('grid_member_token')
        // 如果有token，则在请求头中添加token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    },
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        console.error('响应错误:', error)
        return Promise.reject(error)
    },
)

// 网格员登录
export function login(data: { gm_code: string; password: string }) {
    return request({
        url: '/auth/member/login',
        method: 'post',
        data,
    })
}

// 获取当前网格员信息
export function getMemberInfo() {
    return request({
        url: '/member/info',
        method: 'get',
    })
}

export default request