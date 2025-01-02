<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-2xl mx-auto text-center mb-8">
            <div class="mb-4 flex justify-center gap-2">
                <el-input v-model="searchText" placeholder="搜索配料名称或功效..." clearable class="w-90">
                    <template #prefix>
                        <el-icon class="text-gray-400">
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
                <el-button type="primary" plain @click="toggleAllImages">
                    <el-icon class="mr-1">
                        <component :is="showAllImages ? 'Document' : 'Picture'" />
                    </el-icon>
                    {{ showAllImages ? '显示内容' : '显示图片' }}
                </el-button>
            </div>
            <div class="flex justify-center gap-2">
                <el-tag v-for="category in categories" :key="category.value" :type="getCategoryTagType(category.value)"
                    :effect="filterCategory === category.value ? 'dark' : 'light'" class="cursor-pointer text-sm"
                    @click="toggleCategory(category.value)">
                    {{ category.label }}
                </el-tag>
            </div>
        </div>

        <!-- 卡片展示区域 -->
        <el-row :gutter="20">
            <el-col v-for="item in filteredEffects" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <el-card class="mb-5 h-[450px] relative overflow-hidden">
                    <!-- 标题部分 -->
                    <div class="card-header flex justify-between items-center p-4 border-b">
                        <span class="text-base font-medium">
                            {{ item.name }}
                        </span>
                        <el-tag :type="getCategoryTagType(item.category)" size="small">
                            {{ categories.find(c => c.value === item.category)?.label }}
                        </el-tag>
                    </div>

                    <!-- 内容区域 -->
                    <div class="relative h-[320px] overflow-hidden">
                        <!-- 切换按钮 -->
                        <div class="absolute right-0 top-1/3 -translate-y-1/2 z-10">
                            <el-button circle size="small" @click="toggleImage(item.id)">
                                <el-icon>
                                    <Picture v-if="!showImage[item.id]" />
                                    <Document v-else />
                                </el-icon>
                            </el-button>
                        </div>

                        <div class="flex transition-transform duration-300 w-[200%] h-full"
                            style="transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
                            :style="{ transform: `translateX(${showImage[item.id] ? '-50%' : '0'})` }">
                            <!-- 正面内容 -->
                            <div class="w-1/2 flex-shrink-0">
                                <div
                                    class="h-[330px] overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div class="space-y-2">
                                        <h4 class="text-sm text-gray-600 font-medium">主要作用</h4>
                                        <p class="text-gray-600 leading-relaxed">{{ item.mainEffect }}</p>
                                    </div>
                                    <div class="space-y-2">
                                        <h4 class="text-sm text-gray-600 font-medium">使用建议</h4>
                                        <p class="text-gray-600 leading-relaxed">{{ item.usage }}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- 背面内容 -->
                            <div class="w-1/2 flex-shrink-0">
                                <div class="relative h-full">
                                    <img :src="item.image || defaultImage" :alt="item.name"
                                        @error="e => e.target.src = defaultImage" class="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 安全剂量部分 -->
                    <div class="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                        <div class="space-y-2">
                            <h4 class="text-sm text-gray-600 font-medium">安全剂量</h4>
                            <el-progress :percentage="item.safetyLevel" :status="getSafetyStatus(item.safetyLevel)"
                                :stroke-width="8" :format="formatSafetyLevel" />
                            <p class="text-gray-600 text-sm truncate" :class="getSafetyClass(item.safetyLevel)"
                                :title="item.safetyNote">
                                {{ item.safetyNote }}
                            </p>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Picture, Document } from '@element-plus/icons-vue'
import { getIngredientEffects } from '@/mock/ingredientEffects'

// 搜索文本
const searchText = ref('')
const filterCategory = ref('')
const effectsData = ref([])
const loading = ref(false)

// 分类定义
const categories = [
    { value: 'main', label: '主料' },
    { value: 'sub', label: '辅料' },
    { value: 'seasoning', label: '调味料' },
    { value: 'other', label: '其他' }
]

// 默认图片
const defaultImage = 'https://img1.baidu.com/it/u=2641428390,54275400&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1069'

// 过滤后的配料列表
const filteredEffects = computed(() => {
    let result = effectsData.value

    if (filterCategory.value) {
        result = result.filter(item => item.category === filterCategory.value)
    }

    if (searchText.value) {
        const keyword = searchText.value.toLowerCase()
        result = result.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.mainEffect.toLowerCase().includes(keyword) ||
            item.usage.toLowerCase().includes(keyword)
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
    if (level >= 80) return 'text-green-500'
    if (level >= 60) return 'text-yellow-500'
    return 'text-red-500'
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

// 获取数据
const fetchData = async () => {
    try {
        loading.value = true
        effectsData.value = await getIngredientEffects()
    } catch (error) {
        console.error('获取配料数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 组件挂载时获取数据
onMounted(() => {
    fetchData()
})

// 切换分类
const toggleCategory = (category) => {
    filterCategory.value = filterCategory.value === category ? '' : category
}

// 卡片翻转状态
const showImage = ref({})

// 翻转卡片
const toggleImage = (id) => {
    showImage.value[id] = !showImage.value[id]
}

// 全局显示图片状态
const showAllImages = ref(false)

// 切换所有卡片的图片显示状态
const toggleAllImages = () => {
    showAllImages.value = !showAllImages.value
    // 更新所有卡片的状态
    filteredEffects.value.forEach(item => {
        showImage.value[item.id] = showAllImages.value
    })
}
</script>

<style scoped>
.card-container {
    perspective: 1000px;
    transform-style: preserve-3d;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.card-container.is-flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front,
.card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.card-front {
    transform: rotateY(0deg);
}

.card-back {
    transform: rotateY(180deg);
}
</style>