<template>
    <div class="dashboard-container">
        <div class="welcome-section">
            <h2>欢迎使用配料表管理系统</h2>
            <p class="welcome-text">快速管理您的配方和原料清单</p>
        </div>

        <div class="stats-cards">
            <el-card class="stat-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <span>配方总数</span>
                        <el-icon class="header-icon">
                            <Document />
                        </el-icon>
                    </div>
                </template>
                <div class="card-content">
                    <span class="number">0</span>
                    <span class="label">个配方</span>
                </div>
            </el-card>
            <!-- ... 其他卡片 ... -->
        </div>

        <div class="quick-actions">
            <h3>快速操作</h3>
            <div class="action-buttons">
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
/* ... 样式保持不变 ... */
</style>