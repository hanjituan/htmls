<template>
    <el-container class="layout-container">
        <el-aside width="200px" class="layout-aside">
            <div class="logo">
                <el-icon class="logo-icon" :size="32">
                    <Bowl />
                </el-icon>
                <h1>烘焙配料</h1>
            </div>
            <el-menu :default-active="activeMenu" router>
                <template v-for="item in menuItems" :key="item.route || item.label">
                    <!-- 有子菜单的情况 -->
                    <el-sub-menu v-if="item.children" :index="item.children[0].route">
                        <template #title>
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <span>{{ item.label }}</span>
                        </template>
                        <el-menu-item v-for="child in item.children" :key="child.route" :index="child.route">
                            {{ child.label }}
                        </el-menu-item>
                    </el-sub-menu>
                    <!-- 没有子菜单的情况 -->
                    <el-menu-item v-else :index="item.route">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.label }}</span>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-aside>
        <el-container class="layout-content">
            <el-header class="layout-header">
                <el-breadcrumb>
                    <el-breadcrumb-item>首页</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ currentMenu }}</el-breadcrumb-item>
                </el-breadcrumb>
                <div class="header-right">
                    <el-dropdown>
                        <span class="user-info">
                            <el-avatar :size="32"
                                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                            <span class="username">管理员</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>个人设置</el-dropdown-item>
                                <el-dropdown-item divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>
            <el-main class="layout-main">
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    Bowl,
    Box,
    InfoFilled,
    TrendCharts,
    Document,
    Plus
} from '@element-plus/icons-vue'

const route = useRoute()

// 菜单配置
const menuItems = [
    {
        icon: 'Bowl',
        label: '配方管理',
        route: '/recipes'
    },
    {
        icon: 'Box',
        label: '原料管理',
        route: '/ingredients'
    },
    {
        icon: 'InfoFilled',
        label: '配料说明',
        route: '/ingredients/effects'
    },
    {
        icon: 'TrendCharts',
        label: '数据报表',
        children: [
            {
                label: '库存报表',
                route: '/reports/stock'
            },
            {
                label: '成本报表',
                route: '/reports/cost'
            }
        ]
    }
]

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 计算当前菜单名称
const currentMenu = computed(() => {
    const currentItem = menuItems.find(item => {
        if (item.route === route.path) return true
        if (item.children) {
            return item.children.some(child => child.route === route.path)
        }
        return false
    })

    if (!currentItem) return ''

    if (currentItem.children) {
        const currentChild = currentItem.children.find(child => child.route === route.path)
        return `${currentItem.label} / ${currentChild.label}`
    }

    return currentItem.label
})
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.layout-aside {
    background-color: #fff;
    border-right: 1px solid var(--el-border-color-light);
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid var(--el-border-color-light);
}

.logo-icon {
    color: var(--el-color-primary);
}

.logo h1 {
    margin: 0 0 0 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.layout-header {
    background-color: #fff;
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 24px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--el-border-radius-base);
    transition: background-color 0.3s;
}

.user-info:hover {
    background-color: #f5f5f5;
}

.username {
    font-size: 14px;
    color: #333;
}

.layout-main {
    background-color: var(--el-bg-color-page);
    padding: 20px;
}

.el-menu-item .el-icon,
.el-sub-menu .el-icon {
    margin-right: 8px;
    width: 16px;
    height: 16px;
}

:deep(.el-menu-item.is-active) {
    background-color: var(--el-menu-hover-bg-color);
}

:deep(.el-menu) {
    border-right: none;
}
</style>