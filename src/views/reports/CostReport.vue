<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="page-header">
            <div class="space-y-4">
                <h2 class="text-2xl font-medium text-gray-800 m-0">成本分析</h2>
                <div class="flex items-center gap-3">
                    <el-radio-group v-model="timeRange" size="small">
                        <el-radio-button label="week">本周</el-radio-button>
                        <el-radio-button label="month">本月</el-radio-button>
                        <el-radio-button label="quarter">本季度</el-radio-button>
                        <el-radio-button label="year">本年</el-radio-button>
                    </el-radio-group>
                </div>
            </div>
            <div class="flex gap-3">
                <el-button type="primary" plain @click="exportReport">
                    <el-icon>
                        <Download />
                    </el-icon>导出报表
                </el-button>
            </div>
        </div>

        <el-row :gutter="20" class="mb-6">
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>总成本支出</span>
                            <el-tag type="danger">¥</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        <span class="block text-3xl font-bold text-gray-800">
                            {{ totalCost.toLocaleString() }}
                        </span>
                        <div class="mt-2 text-sm">
                            <span :class="{ 'up': costChange > 0, 'down': costChange < 0 }">
                                <el-icon>
                                    <CaretTop v-if="costChange > 0" />
                                    <CaretBottom v-else />
                                </el-icon>
                                {{ Math.abs(costChange) }}%
                            </span>
                            较上期
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>平均单品成本</span>
                            <el-tag type="warning">¥</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        <span class="block text-3xl font-bold text-gray-800">
                            {{ averageCost.toFixed(2) }}
                        </span>
                        <div class="mt-2 text-sm">
                            每个配方平均成本
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>配方数量</span>
                            <el-tag type="info">个</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        <span class="block text-3xl font-bold text-gray-800">
                            {{ recipeCount }}
                        </span>
                        <div class="mt-2 text-sm">
                            当前配方总数
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>原料数量</span>
                            <el-tag type="info">种</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        <span class="block text-3xl font-bold text-gray-800">
                            {{ ingredientCount }}
                        </span>
                        <div class="mt-2 text-sm">
                            使用中的原料数量
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-6">
            <el-col :span="12">
                <el-card class="h-96">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>成本构成分析</span>
                        </div>
                    </template>
                    <div class="h-80">
                        <ECharts :options="compositionChartOptions" />
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card class="h-96">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>成本趋势分析</span>
                        </div>
                    </template>
                    <div class="h-80">
                        <ECharts :options="trendChartOptions" />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="overflow-hidden">
            <template #header>
                <div class="flex justify-between items-center">
                    <span>配方成本排名</span>
                    <div class="flex items-center gap-3">
                        <el-input v-model="searchText" placeholder="搜索配方" clearable class="search-input">
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                </div>
            </template>
            <el-table :data="recipeList" border style="width: 100%">
                <el-table-column type="index" label="排名" width="80" align="center" />
                <el-table-column prop="name" label="配方名称" min-width="150" />
                <el-table-column prop="tags" label="标签" width="200">
                    <template #default="{ row }">
                        <el-tag v-for="tag in row.tags" :key="tag" :type="getTagType(tag)" class="mx-1">
                            {{ tag }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="ingredientCount" label="原料数" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag type="info">{{ row.ingredients.length }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="总成本" width="120" align="right" sortable>
                    <template #default="{ row }">
                        <span class="cost-value">¥ {{ calculateTotalCost(row).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="成本占比" width="120" align="right">
                    <template #default="{ row }">
                        <el-progress :percentage="calculateCostPercentage(row)"
                            :color="getCostProgressColor(calculateCostPercentage(row))" :show-text="false"
                            :stroke-width="8" />
                        <span>{{ calculateCostPercentage(row).toFixed(1) }}%</span>
                    </template>
                </el-table-column>
                <el-table-column label="成本分析" width="100" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="showCostDetail(row)">
                            <el-icon>
                                <View />
                            </el-icon>
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 成本详情对话框 -->
        <el-dialog v-model="detailVisible" title="成本详情分析" width="600px">
            <div class="cost-detail">
                <h4>{{ selectedRecipe?.name }}</h4>
                <el-table :data="selectedRecipe?.ingredients" border size="small">
                    <el-table-column prop="name" label="原料名称" min-width="120" />
                    <el-table-column prop="amount" label="用量" width="120" align="right">
                        <template #default="{ row }">
                            {{ row.amount }} {{ row.unit }}
                        </template>
                    </el-table-column>
                    <el-table-column label="单价" width="120" align="right">
                        <template #default="{ row }">
                            ¥ {{ row.price }} / {{ row.unit }}
                        </template>
                    </el-table-column>
                    <el-table-column label="成本" width="120" align="right">
                        <template #default="{ row }">
                            ¥ {{ (row.amount * row.price).toFixed(2) }}
                        </template>
                    </el-table-column>
                </el-table>
                <div class="cost-summary">
                    <span>总成本：¥ {{ selectedRecipeCost.toFixed(2) }}</span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ECharts from '@/components/ECharts.vue'

// 状态定义
const timeRange = ref('month')
const searchText = ref('')
const detailVisible = ref(false)
const selectedRecipe = ref(null)

// 模拟数据
const totalCost = ref(256890.75)
const costChange = ref(-5.2)
const averageCost = ref(85.63)
const recipeCount = ref(150)
const ingredientCount = ref(45)

// 模拟配方列表数据
const recipeList = ref([
    {
        id: 1,
        name: '提拉米苏',
        tags: ['甜点', '蛋糕'],
        ingredients: [
            { name: '马斯卡彭奶酪', amount: 500, unit: 'g', price: 0.08 },
            { name: '手指饼干', amount: 200, unit: 'g', price: 0.05 },
            { name: '咖啡', amount: 300, unit: 'ml', price: 0.02 }
        ]
    }
    // ... 更多数据
])

// 计算属性
const selectedRecipeCost = computed(() => {
    if (!selectedRecipe.value) return 0
    return selectedRecipe.value.ingredients.reduce((sum, item) => {
        return sum + item.amount * item.price
    }, 0)
})

// 工具函数
const getTagType = (tag) => {
    const types = {
        '甜点': 'success',
        '面包': 'warning',
        '蛋糕': 'danger'
    }
    return types[tag] || 'info'
}

const calculateTotalCost = (recipe) => {
    return recipe.ingredients.reduce((sum, item) => sum + item.amount * item.price, 0)
}

const calculateCostPercentage = (recipe) => {
    const cost = calculateTotalCost(recipe)
    return (cost / totalCost.value) * 100
}

const getCostProgressColor = (percentage) => {
    if (percentage > 15) return '#f56c6c'
    if (percentage > 10) return '#e6a23c'
    return '#67c23a'
}

// 事件处理
const showCostDetail = (recipe) => {
    selectedRecipe.value = recipe
    detailVisible.value = true
}

const exportReport = () => {
    // 导出报表逻辑
}

const compositionChartOptions = ref({
    title: {
        text: '成本构成分析'
    },
    tooltip: {
        trigger: 'item'
    },
    series: [
        {
            type: 'pie',
            radius: '50%',
            data: [
                { value: 1048, name: '甜点' },
                { value: 735, name: '面包' },
                { value: 580, name: '蛋糕' }
            ]
        }
    ]
})

const trendChartOptions = ref({
    title: {
        text: '成本趋势分析'
    },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line'
        }
    ]
})
</script>

<style scoped>
.up {
    @apply text-red-500;
}

.down {
    @apply text-green-500;
}

.search-input {
    @apply w-60;
}

.cost-value {
    @apply text-red-500 font-medium;
}

@media (max-width: 768px) {
    .header-actions {
        @apply flex-col items-stretch;
    }

    .search-input {
        @apply w-full;
    }
}
</style>