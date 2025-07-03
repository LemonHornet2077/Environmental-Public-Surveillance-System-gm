<template>
    <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* 全局样式 */
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family:
        'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
        '微软雅黑', Arial, sans-serif;
}

#app {
    height: 100%;
}

/* 修复Element Plus图标显示问题 */
.el-icon {
    vertical-align: middle;
}
</style>
