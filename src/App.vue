<template>
    <div :class="{ 'dark': isDarkMode }">
        <el-config-provider :locale="zhCn">
            <Layout>
                <router-view></router-view>
            </Layout>
        </el-config-provider>
    </div>
</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Layout from './components/Layout.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme, ThemeType } from '@/utils/theme'

const isDarkMode = ref(false)
const { watchSystemTheme } = useTheme()

// 检查当前主题
const checkTheme = () => {
    const theme = localStorage.getItem('theme') || ThemeType.SYSTEM
    const actualTheme = theme === ThemeType.SYSTEM
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? ThemeType.DARK : ThemeType.LIGHT
        : theme
    isDarkMode.value = actualTheme === ThemeType.DARK
}

// 监听主题变化
let removeThemeWatcher
onMounted(() => {
    checkTheme()
    removeThemeWatcher = watchSystemTheme(checkTheme)

    // 监听本地存储变化
    window.addEventListener('storage', checkTheme)
})

onUnmounted(() => {
    removeThemeWatcher?.()
    window.removeEventListener('storage', checkTheme)
})
</script>

<style>
:root {
    --border-radius-base: 2px;
    --el-border-radius-base: 2px;
    --el-border-radius-small: 2px;
    --el-border-radius-round: 2px;
}

/* 亮色主题基础样式 */
body[el-theme="light"] {
    --el-bg-color: #ffffff;
    --el-bg-color-overlay: #ffffff;
    --el-text-color-primary: #303133;
    --el-border-color: #dcdfe6;
    --el-border-color-light: #e4e7ed;
    --el-fill-color-blank: #ffffff;
    background-color: #f5f7fa;
}

body[el-theme="light"] .el-aside,
body[el-theme="light"] .el-header {
    background-color: #ffffff;
    border-color: #dcdfe6;
}

body[el-theme="light"] .el-menu {
    background-color: #ffffff;
}

body[el-theme="light"] .el-menu-item {
    color: #303133;
}

body[el-theme="light"] .el-menu-item:hover {
    background-color: #f5f7fa;
}

body[el-theme="light"] .el-menu-item.is-active {
    background-color: #ecf5ff;
    color: #409eff;
}

/* 暗色模式样式 */
.dark {
    @apply bg-gray-900 text-gray-100 !important;
}

/* Element Plus 组件暗色模式样式 */
.dark .el-aside {
    @apply bg-gray-800 border-gray-700;
}

.dark .el-menu {
    @apply bg-gray-800 border-gray-700;
}

.dark .el-menu-item {
    @apply text-gray-300;
}

.dark .el-menu-item:hover {
    @apply bg-gray-700;
}

.dark .el-menu-item.is-active {
    @apply bg-gray-700 text-white;
}

.dark .el-header {
    @apply bg-gray-800 border-gray-700;
}

.dark .el-main {
    @apply bg-gray-900;
}

.dark .el-card {
    @apply bg-gray-800 border-gray-700;
}

.dark .el-card__header {
    @apply border-gray-700;
}

.dark .el-input__inner {
    @apply bg-gray-700 border-gray-600 text-gray-100;
}

.dark .el-button:not(.el-button--primary) {
    @apply bg-gray-700 border-gray-600 text-gray-300;
}

.dark .el-tag {
    @apply bg-gray-700 border-gray-600;
}

.dark .el-radio-button__inner {
    @apply bg-gray-700 border-gray-600 text-gray-300;
}

.dark .el-table {
    @apply bg-gray-800;
}

.dark .el-table th,
.dark .el-table tr {
    @apply bg-gray-800 text-gray-300;
}

.dark .el-table td {
    @apply border-gray-700;
}

.dark .el-table--border {
    @apply border-gray-700;
}

.dark .el-pagination {
    @apply text-gray-300;
}

.dark .el-pagination button {
    @apply bg-gray-700 border-gray-600 text-gray-300;
}

/* 滚动条样式 */
.dark ::-webkit-scrollbar {
    @apply w-2;
}

.dark ::-webkit-scrollbar-track {
    @apply bg-gray-800;
}

.dark ::-webkit-scrollbar-thumb {
    @apply bg-gray-600 rounded;
}

.dark ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500;
}

/* 子菜单样式 */
.dark .el-sub-menu__title {
    @apply text-gray-300 !important;
}

.dark .el-sub-menu__title:hover {
    @apply bg-gray-700 !important;
}

/* 面包屑样式 */
.dark .el-breadcrumb__item {
    @apply text-gray-400 !important;
}

.dark .el-breadcrumb__inner.is-link:hover {
    @apply text-white !important;
}

/* 下拉菜单样式 */
.dark .el-dropdown-menu {
    @apply bg-gray-800 border-gray-700 !important;
}

.dark .el-dropdown-menu__item {
    @apply text-gray-300 !important;
}

.dark .el-dropdown-menu__item:hover {
    @apply bg-gray-700 !important;
}

.dark .el-dropdown-menu__item:not(.is-disabled):hover {
    @apply text-white bg-gray-700 !important;
}

/* Logo 区域样式 */
.dark .logo {
    @apply bg-gray-800 border-gray-700 !important;
}

/* 分割线样式 */
.dark .el-divider {
    @apply border-gray-700 !important;
}

/* 弹出框样式 */
.dark .el-dialog {
    @apply bg-gray-800 !important;
}

.dark .el-dialog__header {
    @apply bg-gray-800 border-gray-700 !important;
}

.dark .el-dialog__title {
    @apply text-gray-300 !important;
}

.dark .el-dialog__body {
    @apply text-gray-300 !important;
}

/* Select 下拉框样式 */
.dark .el-select-dropdown {
    @apply bg-gray-800 border-gray-700 !important;
}

.dark .el-select-dropdown__item {
    @apply text-gray-300 !important;
}

.dark .el-select-dropdown__item.hover,
.dark .el-select-dropdown__item:hover {
    @apply bg-gray-700 !important;
}
</style>