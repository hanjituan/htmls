<template>
    <el-container class="h-screen">
        <el-aside width="200px" class="bg-white border-r border-gray-200">
            <div class="logo">
                <el-icon class="logo-icon" :size="32">
                    <Bowl />
                </el-icon>
                <h1>配料大全</h1>
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
        <el-container class="flex-1">
            <el-header class="bg-white border-b border-gray-200 flex items-center justify-between px-5">
                <el-breadcrumb>
                    <el-breadcrumb-item>首页</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ currentMenu }}</el-breadcrumb-item>
                </el-breadcrumb>
                <div class="header-right">
                    <el-dropdown>
                        <span class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
                            <el-avatar :size="32"
                                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                            <span class="text-gray-700">管理员</span>
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
            <el-main class="bg-gray-50 p-5">
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
.logo {
    @apply h-15 flex items-center px-5 border-b border-gray-200;
}

.logo-icon {
    @apply text-blue-500;
}

.logo h1 {
    @apply m-0 ml-3 text-lg font-semibold text-gray-800;
}

.el-menu-item .el-icon,
.el-sub-menu .el-icon {
    @apply mr-2 w-4 h-4;
}

:deep(.el-menu-item.is-active) {
    @apply bg-blue-50;
}

:deep(.el-menu) {
    @apply border-none;
}
</style>