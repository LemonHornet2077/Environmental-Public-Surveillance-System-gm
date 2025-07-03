import request from './auth'

// 获取网格员的反馈任务列表
export function getFeedbackList(params?: { state?: number }) {
    return request({
        url: '/member/feedback/list',
        method: 'get',
        params,
    })
}

// 提交实测AQI数据
export function submitAQIMeasurement(data: {
    feedback_id?: number
    province_id: number
    city_id: number
    address: string
    so2_value: number
    co_value: number
    spm_value: number
    information: string
    supervisor_tel?: string
}) {
    return request({
        url: '/member/aqi/submit',
        method: 'post',
        data,
    })
}

// 获取省份列表
export function getProvinces() {
    return request({
        url: '/public/location/provinces',
        method: 'get',
    })
}

// 获取城市列表
export function getCities(provinceId: number) {
    return request({
        url: `/public/location/cities/${provinceId}`,
        method: 'get',
    })
}

// 获取AQI级别列表
export function getAQILevels() {
    return request({
        url: '/public/aqi/list',
        method: 'get',
    })
}
