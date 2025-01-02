<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <el-loading v-model="loading" />
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
                <el-radio-group v-model="timeRange">
                    <el-radio-button label="week">本周</el-radio-button>
                    <el-radio-button label="month">本月</el-radio-button>
                    <el-radio-button label="quarter">本季度</el-radio-button>
                    <el-radio-button label="year">本年</el-radio-button>
                </el-radio-group>
            </div>

            <div class="flex gap-3 ml-auto">
                <el-button type="primary" plain @click="exportReport">
                    <el-icon>
                        <Download />
                    </el-icon>导出报表
                </el-button>
                <el-button type="success" plain @click="printReport">
                    <el-icon>
                        <Printer />
                    </el-icon>打印报表
                </el-button>
            </div>
        </div>

        <el-row :gutter="20" class="mb-6">
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>库存总价值</span>
                            <el-tag type="success">¥</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        <span class="block text-3xl font-bold text-gray-800">
                            {{ stats.totalValue.toLocaleString() }}
                        </span>
                        <div class="mt-2 text-sm">
                            <span :class="{ 'up': valueChange > 0, 'down': valueChange < 0 }">
                                <el-icon>
                                    <CaretTop v-if="valueChange > 0" />
                                    <CaretBottom v-else />
                                </el-icon>
                                {{ Math.abs(valueChange) }}%
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
                            <span>库存预警</span>
                            <el-tag type="warning">个</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        {{ stats.stockWarning }}
                    </div>
                    <div class="text-sm text-gray-500">库存不足原料数量</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>入库次数</span>
                            <el-tag type="info">次</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        {{ inStockCount }}
                    </div>
                    <div class="text-sm text-gray-500">本期入库操作次数</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="transform transition-all duration-300 hover:-translate-y-1">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>出库次数</span>
                            <el-tag type="info">次</el-tag>
                        </div>
                    </template>
                    <div class="text-center py-3">
                        {{ outStockCount }}
                    </div>
                    <div class="text-sm text-gray-500">本期出库操作次数</div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-6">
            <el-col :span="16">
                <el-card class="h-96">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>库存变化趋势</span>
                            <el-radio-group v-model="chartType" size="small">
                                <el-radio-button label="value">金额</el-radio-button>
                                <el-radio-button label="count">数量</el-radio-button>
                            </el-radio-group>
                        </div>
                    </template>
                    <div class="h-80">
                        <ECharts :options="trendChartOptions" />
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="h-96">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span>库存分布</span>
                        </div>
                    </template>
                    <div class="h-80">
                        <ECharts :options="distributionChartOptions" />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="overflow-hidden">
            <template #header>
                <div class="flex justify-between items-center">
                    <span>库存明细</span>
                    <div class="flex items-center gap-3">
                        <el-select v-model="filterCategory" placeholder="分类" clearable class="filter-select">
                            <el-option label="全部" value="" />
                            <el-option v-for="category in categories" :key="category.value" :label="category.label"
                                :value="category.value">
                                <el-tag :type="getCategoryTagType(category.value)">{{ category.label }}</el-tag>
                            </el-option>
                        </el-select>
                        <el-input v-model="searchText" placeholder="搜索原料" clearable class="search-input">
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                </div>
            </template>
            <el-table :data="filteredStockList" border style="width: 100%" v-loading="loading">
                <el-table-column prop="name" label="原料名称" min-width="150" />
                <el-table-column prop="category" label="分类" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="stock" label="当前库存" width="120" align="right">
                    <template #default="{ row }">
                        <el-tag :type="getStockTagType(row.stock)">
                            {{ row.stock }} {{ row.unit }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="库存价值" width="120" align="right">
                    <template #default="{ row }">
                        ¥ {{ (row.stock * row.price).toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="minStock" label="最低库存" width="120" align="right" />
                <el-table-column prop="maxStock" label="最高库存" width="120" align="right" />
                <el-table-column prop="updateTime" label="更新时间" width="180">
                    <template #default="{ row }">
                        {{ new Date(row.updateTime).toLocaleString() }}
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end p-4 bg-white border-t border-gray-200">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :total="filteredStockList.length" :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next" background />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import ECharts from '@/components/ECharts.vue'
import { getStockStats, getStockRecords, getIngredients } from '@/mock/ingredients'
import { ElMessage } from 'element-plus'

// 状态定义
const timeRange = ref('month')
const chartType = ref('value')
const searchText = ref('')
const filterCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const inStockCount = ref(0)
const outStockCount = ref(0)

// 图表配置
const trendChartOptions = ref({
    title: {
        text: '库存变化趋势'
    },
    tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>{a}: ¥{c}'
    },
    xAxis: {
        type: 'category',
        data: []
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '¥{value}'
        }
    },
    series: [
        {
            name: '库存总值',
            data: [],
            type: 'line',
            smooth: true,
            areaStyle: {
                opacity: 0.1
            }
        }
    ]
})

const distributionChartOptions = ref({
    title: {
        text: '库存分布'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
    },
    legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
    },
    series: [
        {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            data: []
        }
    ]
})

const stats = ref({
    totalValue: 0,
    stockWarning: 0,
    stockSufficient: 0,
    stockEmpty: 0,
    categoryDistribution: {},
    stockHistory: []
})
const stockRecords = ref([])
const ingredients = ref([])

// 计算属性
const valueChange = computed(() => {
    if (stats.value.stockHistory.length < 2) return 0
    const latest = stats.value.stockHistory[stats.value.stockHistory.length - 1].value
    const previous = stats.value.stockHistory[stats.value.stockHistory.length - 2].value
    return ((latest - previous) / previous * 100).toFixed(1)
})

const filteredStockList = computed(() => {
    let result = ingredients.value

    if (filterCategory.value) {
        result = result.filter(item => item.category === filterCategory.value)
    }

    if (searchText.value) {
        const keyword = searchText.value.toLowerCase()
        result = result.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.remark.toLowerCase().includes(keyword)
        )
    }

    return result
})

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        const [statsData, recordsData, ingredientsData] = await Promise.all([
            getStockStats(),
            getStockRecords(),
            getIngredients()
        ])
        stats.value = statsData
        stockRecords.value = recordsData
        ingredients.value = ingredientsData

        // 计算入库出库次数
        const todayRecords = stockRecords.value.reduce((acc, curr) => {
            const todayRecord = curr.records[curr.records.length - 1]
            acc.in += todayRecord.inStock
            acc.out += todayRecord.outStock
            return acc
        }, { in: 0, out: 0 })

        inStockCount.value = todayRecords.in
        outStockCount.value = todayRecords.out

        updateCharts()
    } catch (error) {
        ElMessage.error('获取数据失败')
    } finally {
        loading.value = false
    }
}

// 工具函数
const getCategoryType = (category) => {
    const types = {
        main: 'success',
        sub: 'warning',
        seasoning: 'info',
        other: ''
    }
    return types[category] || ''
}

const getStockTagType = (stock) => {
    if (stock <= 0) return 'danger'
    if (stock < 100) return 'warning'
    return 'success'
}

// 更新图表
const updateCharts = () => {
    // 更新趋势图表
    trendChartOptions.value = {
        ...trendChartOptions.value,
        xAxis: {
            ...trendChartOptions.value.xAxis,
            data: stats.value.stockHistory.map(item => item.date)
        },
        series: [
            {
                ...trendChartOptions.value.series[0],
                data: stats.value.stockHistory.map(item => item.value)
            }
        ]
    }

    // 更新分布图表
    distributionChartOptions.value = {
        ...distributionChartOptions.value,
        series: [
            {
                ...distributionChartOptions.value.series[0],
                data: [
                    { value: stats.value.categoryDistribution.main, name: '主料' },
                    { value: stats.value.categoryDistribution.sub, name: '辅料' },
                    { value: stats.value.categoryDistribution.seasoning, name: '调味料' },
                    { value: stats.value.categoryDistribution.other, name: '其他' }
                ]
            }
        ]
    }
}

// 监听时间范围变化
watch(timeRange, () => {
    fetchData()
})

// 组件挂载时获取数据
onMounted(() => {
    fetchData()
})

// 事件处理
const exportReport = () => {
    // 导出报表逻辑
}

const printReport = () => {
    // 打印报表逻辑
}
</script>

<style scoped>
.up {
    @apply text-green-500;
}

.down {
    @apply text-red-500;
}

.filter-select {
    @apply w-30;
}

.search-input {
    @apply w-60;
}

@media (max-width: 768px) {
    .header-actions {
        @apply flex-col items-stretch;
    }

    .filter-select,
    .search-input {
        @apply w-full;
    }
}
</style>