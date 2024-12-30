<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="mb-8 text-center">
            <h2 class="text-3xl font-medium text-gray-800 mb-2">欢迎使用配料表管理系统</h2>
            <p class="text-gray-600">快速管理您的配方和原料清单</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                <template #header>
                    <div class="flex justify-between items-center">
                        <span>配方总数</span>
                        <el-icon class="header-icon">
                            <Document />
                        </el-icon>
                    </div>
                </template>
                <div class="text-center">
                    <span class="block text-3xl font-bold text-gray-800">0</span>
                    <span class="text-gray-500">个配方</span>
                </div>
            </el-card>
            <!-- ... 其他卡片 ... -->
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm">
            <h3 class="text-lg font-medium text-gray-800 mb-4">快速操作</h3>
            <div class="flex gap-4">
                <el-button type="primary" @click="$router.push('/recipes')">
                    <el-icon>
                        <Plus />
                    </el-icon>新建配方
                </el-button>
                <el-button type="success" @click="$router.push('/ingredients')">
                    <el-icon>
                        <Plus />
                    </el-icon>添加原料
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Document, Box, TrendCharts, Plus } from '@element-plus/icons-vue'
</script>

<style scoped>
@media (max-width: 768px) {
    .action-buttons button {
        @apply w-full;
    }
}
</style>