<template>
    <div class="min-h-screen bg-gray-50">
        <div class="page-header">
            <div class="flex flex-col gap-4">
                <h2 class="text-2xl font-medium text-gray-800 m-0">配料作用说明</h2>
                <div class="flex items-center gap-3">
                    <el-select v-model="filterCategory" placeholder="分类" clearable class="filter-select">
                        <el-option label="全部" value="" />
                        <el-option v-for="category in categories" :key="category.value" :label="category.label"
                            :value="category.value">
                            <el-tag :type="getCategoryTagType(category.value)">{{ category.label }}</el-tag>
                        </el-option>
                    </el-select>
                    <el-input v-model="searchText" placeholder="搜索配料" clearable class="search-input">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                </div>
            </div>
        </div>

        <el-row :gutter="20">
            <el-col v-for="item in filteredEffects" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <el-card class="mb-5 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span class="text-base font-medium">{{ item.name }}</span>
                            <el-tag :type="getCategoryTagType(item.category)" size="small">
                                {{ categories.find(c => c.value === item.category)?.label }}
                            </el-tag>
                        </div>
                    </template>
                    <div class="flex flex-col gap-4">
                        <div class="space-y-2">
                            <h4 class="text-sm text-gray-600 font-medium">主要作用</h4>
                            <p class="text-gray-600 leading-relaxed">{{ item.mainEffect }}</p>
                        </div>
                        <div class="effect-section">
                            <h4>使用建议</h4>
                            <p>{{ item.usage }}</p>
                        </div>
                        <div class="effect-section">
                            <h4>安全剂量</h4>
                            <el-progress :percentage="item.safetyLevel" :status="getSafetyStatus(item.safetyLevel)"
                                :stroke-width="8" :format="formatSafetyLevel" />
                            <p class="safety-note" :class="getSafetyClass(item.safetyLevel)">
                                {{ item.safetyNote }}
                            </p>
                        </div>
                        <div class="effect-section" v-if="item.warnings">
                            <h4>注意事项</h4>
                            <ul class="warning-list">
                                <li v-for="(warning, index) in item.warnings" :key="index">
                                    {{ warning }}
                                </li>
                            </ul>
                        </div>
                        <div class="effect-section" v-if="item.nutrition">
                            <h4>营养成分</h4>
                            <div class="nutrition-info">
                                <div v-for="(value, key) in item.nutrition" :key="key" class="nutrition-item">
                                    <span class="label">{{ getNutritionLabel(key) }}</span>
                                    <span class="value">{{ value }}{{ getNutritionUnit(key) }}</span>
                                </div>
                            </div>
                            <p class="daily-value" v-if="item.dailyValue">{{ item.dailyValue }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 状态定义
const searchText = ref('')
const filterCategory = ref('')

// 分类定义
const categories = [
    { value: 'main', label: '主料' },
    { value: 'sub', label: '辅料' },
    { value: 'seasoning', label: '调味料' },
    { value: 'other', label: '其他' }
]

// 模拟数据
const effectsData = [
    {
        id: 1,
        name: '高筋面粉',
        category: 'main',
        mainEffect: '富含蛋白质，能形成面团的筋力，是面包等发酵面点的主要原料。',
        usage: '适量使用，根据配方比例添加。',
        safetyLevel: 95,
        safetyNote: '安全食材，一般人群可放心使用。',
        nutrition: {
            protein: 12.5,
            fat: 1.3,
            carbs: 74.2,
            fiber: 2.8
        },
        dailyValue: '每100g面粉含热量348千卡',
        warnings: [
            '麸质过敏者慎用',
            '糖尿病人请控制用量'
        ]
    },
    {
        id: 2,
        name: '酵母',
        category: 'sub',
        mainEffect: '使面团发酵，产生二氧化碳，使面包蓬松。',
        usage: '按配方比例少量使用，过量会影响口感。',
        safetyLevel: 85,
        safetyNote: '适量使用安全，过量可能引起胀气。',
        warnings: [
            '对酵母过敏者禁用',
            '建议每100g面粉使用1-2g干酵母'
        ]
    },
    {
        id: 3,
        name: '香草精',
        category: 'seasoning',
        mainEffect: '增添香草风味，提升烘焙产品的香气。',
        usage: '少量使用，过量会影响口感。',
        safetyLevel: 60,
        safetyNote: '建议适量使用，注意用量控制。',
        warnings: [
            '含有酒精成分，特殊人群慎用',
            '建议每100g面粉使用不超过2ml'
        ]
    },
    {
        id: 4,
        name: '黄油',
        category: 'main',
        mainEffect: '提供油脂，增加产品的香浓度和口感，使烘焙制品更加松软可口。',
        usage: '常温软化后使用，避免高温导致油脂分离。',
        safetyLevel: 75,
        safetyNote: '适量食用，注意控制用量。',
        nutrition: {
            protein: 0.9,
            fat: 81.1,
            carbs: 0.1,
            fiber: 0
        },
        dailyValue: '每100g含热量717千卡',
        warnings: [
            '高血脂患者慎用',
            '建议冷藏保存',
            '避免过度加热'
        ]
    },
    {
        id: 5,
        name: '泡打粉',
        category: 'sub',
        mainEffect: '化学发酵剂，使面团膨松，提供蓬松的口感。',
        usage: '少量使用，过量会影响口感和健康。',
        safetyLevel: 70,
        safetyNote: '建议严格按配方用量使用。',
        nutrition: {
            sodium: 1200, // 每100g含钠量（mg）
        },
        dailyValue: '每次使用不超过3g/500g面粉',
        warnings: [
            '高血压患者慎用',
            '避免与酸性配料同时使用',
            '建议密封保存'
        ]
    },
    // ... 更多数据
]

const effects = ref(effectsData)

// 计算属性
const filteredEffects = computed(() => {
    let result = effects.value

    if (filterCategory.value) {
        result = result.filter(item => item.category === filterCategory.value)
    }

    if (searchText.value) {
        const keyword = searchText.value.toLowerCase()
        result = result.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.mainEffect.toLowerCase().includes(keyword)
        )
    }

    return result
})

// 工具函数
const getCategoryTagType = (category) => {
    const types = {
        main: 'success',
        sub: 'warning',
        seasoning: 'info',
        other: ''
    }
    return types[category] || ''
}

const getSafetyStatus = (level) => {
    if (level >= 80) return 'success'
    if (level >= 60) return 'warning'
    return 'exception'
}

const getSafetyClass = (level) => {
    if (level >= 80) return 'safe'
    if (level >= 60) return 'warning'
    return 'danger'
}

const formatSafetyLevel = (percentage) => {
    const levels = {
        high: '安全',
        medium: '适量',
        low: '慎用'
    }
    if (percentage >= 80) return levels.high
    if (percentage >= 60) return levels.medium
    return levels.low
}

// 营养成分标签
const getNutritionLabel = (key) => {
    const labels = {
        protein: '蛋白质',
        fat: '脂肪',
        carbs: '碳水化合物',
        fiber: '膳食纤维',
        sodium: '钠'
    }
    return labels[key] || key
}

// 营养成分单位
const getNutritionUnit = (key) => {
    return key === 'sodium' ? 'mg' : 'g'
}
</script>

<style scoped>
.filter-select {
    @apply w-30;
}

.search-input {
    @apply w-60;
}

.nutrition-info {
    @apply bg-gray-50 rounded p-3 mt-2;
}

.nutrition-item {
    @apply flex justify-between items-center py-1 border-b border-dashed border-gray-200;
}

.nutrition-item:last-child {
    @apply border-none;
}

.nutrition-item .label {
    @apply text-gray-600 text-sm;
}

.nutrition-item .value {
    @apply text-blue-500 font-medium text-sm;
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

.daily-value {
    @apply mt-2 text-gray-500 text-sm italic;
}
</style>