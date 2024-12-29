<template>
    <div class="ingredients-container">
        <div class="page-header">
            <div class="header-left">
                <h2>原料管理</h2>
                <div class="stats-group">
                    <el-tag type="info" class="stat-item">
                        <el-icon>
                            <Box />
                        </el-icon>
                        <span>共 {{ filteredIngredients.length }} 种原料</span>
                    </el-tag>
                    <el-tag type="success" class="stat-item">
                        <el-icon>
                            <Goods />
                        </el-icon>
                        <span>库存充足 {{ stockSufficient }} 种</span>
                    </el-tag>
                    <el-tag type="warning" class="stat-item">
                        <el-icon>
                            <Warning />
                        </el-icon>
                        <span>库存不足 {{ stockInsufficient }} 种</span>
                    </el-tag>
                    <el-tag type="danger" class="stat-item">
                        <el-icon>
                            <CircleClose />
                        </el-icon>
                        <span>无库存 {{ stockEmpty }} 种</span>
                    </el-tag>
                </div>
            </div>
            <div class="header-right">
                <el-button-group>
                    <el-button type="primary" plain @click="showStockReport">
                        <el-icon>
                            <TrendCharts />
                        </el-icon>库存报表
                    </el-button>
                    <el-button type="success" plain @click="exportIngredients">
                        <el-icon>
                            <Download />
                        </el-icon>导出原料
                    </el-button>
                </el-button-group>
                <el-button type="primary" @click="showAddDialog">
                    <el-icon>
                        <Plus />
                    </el-icon>新增原料
                </el-button>
            </div>
        </div>

        <el-card class="table-card" :body-style="{ padding: 0 }">
            <div class="filter-section">
                <div class="filter-left">
                    <el-input v-model="searchText" placeholder="搜索原料名称" clearable class="search-input">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                    <div class="filter-group">
                        <el-select v-model="filterCategory" placeholder="分类" clearable class="filter-select">
                            <el-option label="全部" value="" />
                            <el-option v-for="category in categories" :key="category.value" :label="category.label"
                                :value="category.value">
                                <el-tag :type="getCategoryTagType(category.value)">{{ category.label }}</el-tag>
                            </el-option>
                        </el-select>
                        <el-select v-model="filterUnit" placeholder="单位" clearable class="filter-select">
                            <el-option label="全部" value="" />
                            <el-option v-for="unit in units" :key="unit.value" :label="unit.label"
                                :value="unit.value" />
                        </el-select>
                    </div>
                </div>
                <el-select v-model="pageSize" class="page-size-select">
                    <el-option label="10 条/页" :value="10" />
                    <el-option label="20 条/页" :value="20" />
                    <el-option label="50 条/页" :value="50" />
                </el-select>
            </div>

            <el-table v-loading="loading" :data="paginatedIngredients" border style="width: 100%" :height="tableHeight"
                @sort-change="handleSortChange" highlight-current-row row-key="createTime">
                <el-table-column prop="name" label="原料名称" min-width="150" sortable />
                <el-table-column prop="category" label="分类" width="120">
                    <template #default="{ row }">
                        <el-tag :type="getCategoryTagType(row.category)">
                            {{ categories.find(c => c.value === row.category)?.label }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="单价" width="150" sortable align="right">
                    <template #default="{ row }">
                        <span class="price">¥ {{ row.price.toFixed(2) }} / {{ row.unit }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="150" sortable align="right">
                    <template #default="{ row }">
                        <el-tag :type="getStockTagType(row.stock)">
                            {{ row.stock }} {{ row.unit }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" width="180" sortable>
                    <template #default="{ row }">
                        {{ new Date(row.updateTime).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="scope">
                        <el-button-group>
                            <el-button size="small" @click="adjustStock(scope.row)">
                                <el-icon>
                                    <Edit />
                                </el-icon>调整库存
                            </el-button>
                            <el-button size="small" type="primary" @click="editIngredient(scope.row)">
                                <el-icon>
                                    <Edit />
                                </el-icon>编辑
                            </el-button>
                            <el-button size="small" type="danger" @click="confirmDelete(scope.row)">
                                <el-icon>
                                    <Delete />
                                </el-icon>删除
                            </el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :total="filteredIngredients.length" :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next" background />
            </div>
        </el-card>

        <!-- 新增/编辑原料对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增原料' : '编辑原料'" width="550px"
            destroy-on-close class="ingredient-dialog">
            <el-form :model="ingredientForm" label-width="100px" ref="ingredientFormRef" :rules="rules">
                <el-form-item label="原料名称" prop="name">
                    <el-input v-model="ingredientForm.name" placeholder="请输入原料名称" />
                </el-form-item>
                <el-form-item label="分类" prop="category">
                    <el-select v-model="ingredientForm.category" placeholder="请选择分类">
                        <el-option v-for="category in categories" :key="category.value" :label="category.label"
                            :value="category.value">
                            <el-tag :type="getCategoryTagType(category.value)">{{ category.label }}</el-tag>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="单价" prop="price">
                    <el-input-number v-model="ingredientForm.price" :precision="2" :min="0" style="width: 160px;" />
                    <el-select v-model="ingredientForm.unit" placeholder="单位" style="margin-left: 10px; width: 100px;">
                        <el-option v-for="unit in units" :key="unit.value" :label="unit.label" :value="unit.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="库存" prop="stock">
                    <el-input-number v-model="ingredientForm.stock" :precision="2" :min="0" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="ingredientForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveIngredient" :loading="loading">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 调整库存对话框 -->
        <el-dialog v-model="stockDialogVisible" title="调整库存" width="400px">
            <el-form :model="stockForm" label-width="100px">
                <el-form-item label="当前库存">
                    <span>{{ stockForm.currentStock }} {{ stockForm.unit }}</span>
                </el-form-item>
                <el-form-item label="调整数量">
                    <el-input-number v-model="stockForm.adjustAmount" :precision="2" />
                    <el-radio-group v-model="stockForm.adjustType" style="margin-left: 10px">
                        <el-radio label="increase">增加</el-radio>
                        <el-radio label="decrease">减少</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="stockForm.remark" type="textarea" rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="stockDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmStockAdjust">确认</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Box, Plus, Edit, Delete, Search, Download, TrendCharts, Goods, Warning, CircleClose, InfoFilled } from '@element-plus/icons-vue'
import { getIngredients, addIngredient, updateIngredient, deleteIngredient } from '@/mock/ingredients'

const router = useRouter()

// 状态定义
const loading = ref(false)
const tableHeight = ref('calc(100vh - 240px)')
const searchText = ref('')
const ingredients = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const stockDialogVisible = ref(false)
const ingredientFormRef = ref(null)

// 分页和排序
const currentPage = ref(1)
const pageSize = ref(10)
const sortBy = ref('name')
const sortOrder = ref('ascending')

// 筛选
const filterCategory = ref('')
const filterUnit = ref('')

// 常量定义
const categories = [
    { value: 'main', label: '主料' },
    { value: 'sub', label: '辅料' },
    { value: 'seasoning', label: '调味料' },
    { value: 'other', label: '其他' }
]

const units = [
    { value: 'g', label: '克' },
    { value: 'kg', label: '千克' },
    { value: 'ml', label: '毫升' },
    { value: 'l', label: '升' },
    { value: 'piece', label: '个' }
]

// 表单对象
const ingredientForm = reactive({
    name: '',
    category: '',
    price: 0,
    unit: '',
    stock: 0,
    remark: '',
    createTime: '',
    updateTime: ''
})

const stockForm = reactive({
    currentStock: 0,
    adjustAmount: 0,
    adjustType: 'increase',
    unit: '',
    remark: ''
})

// 验证规则
const rules = {
    name: [
        { required: true, message: '请输入原料名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择分类', trigger: 'change' }
    ],
    price: [
        { required: true, message: '请输入单价', trigger: 'blur' }
    ],
    unit: [
        { required: true, message: '请选择单位', trigger: 'change' }
    ]
}

// 计算属性
const filteredIngredients = computed(() => {
    let result = ingredients.value.filter(ingredient => {
        const matchSearch = ingredient.name.toLowerCase().includes(searchText.value.toLowerCase())
        const matchCategory = !filterCategory.value || ingredient.category === filterCategory.value
        const matchUnit = !filterUnit.value || ingredient.unit === filterUnit.value
        return matchSearch && matchCategory && matchUnit
    })

    result.sort((a, b) => {
        const factor = sortOrder.value === 'ascending' ? 1 : -1
        return a[sortBy.value] > b[sortBy.value] ? factor : -factor
    })

    return result
})

const paginatedIngredients = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredIngredients.value.slice(start, start + pageSize.value)
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

const getStockTagType = (stock) => {
    if (stock <= 0) return 'danger'
    if (stock < 100) return 'warning'
    return 'success'
}

// 事件处理函数
const handleSortChange = ({ prop, order }) => {
    sortBy.value = prop
    sortOrder.value = order
}

const showAddDialog = () => {
    dialogType.value = 'add'
    Object.assign(ingredientForm, {
        name: '',
        category: '',
        price: 0,
        unit: '',
        stock: 0,
        remark: ''
    })
    dialogVisible.value = true
}

const editIngredient = (ingredient) => {
    dialogType.value = 'edit'
    Object.assign(ingredientForm, JSON.parse(JSON.stringify(ingredient)))
    dialogVisible.value = true
}

const confirmDelete = (ingredient) => {
    ElMessageBox.confirm(
        '确定要删除这个原料吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        deleteIngredient(ingredient)
    }).catch(() => { })
}

// const deleteIngredient = (ingredient) => {
//     ingredients.value = ingredients.value.filter(item => item !== ingredient)
//     ElMessage.success('删除成功')
// }

const saveIngredient = async () => {
    try {
        await ingredientFormRef.value?.validate()
        loading.value = true

        const now = new Date().toISOString()
        const ingredientData = {
            ...ingredientForm,
            updateTime: now,
            createTime: dialogType.value === 'add' ? now : ingredientForm.createTime
        }

        if (dialogType.value === 'add') {
            await addIngredient(ingredientData)
            ElMessage.success('添加成功')
        } else {
            await updateIngredient(ingredientForm.id, ingredientData)
            ElMessage.success('更新成功')
        }

        dialogVisible.value = false
        fetchIngredients()
    } catch (error) {
        ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
    } finally {
        loading.value = false
    }
}

const adjustStock = (ingredient) => {
    Object.assign(stockForm, {
        currentStock: ingredient.stock,
        adjustAmount: 0,
        adjustType: 'increase',
        unit: ingredient.unit,
        remark: ''
    })
    stockDialogVisible.value = true
}

const confirmStockAdjust = () => {
    const index = ingredients.value.findIndex(i => i.stock === stockForm.currentStock)
    if (index !== -1) {
        const adjustment = stockForm.adjustType === 'increase' ?
            stockForm.adjustAmount : -stockForm.adjustAmount
        ingredients.value[index].stock += adjustment
        ingredients.value[index].updateTime = new Date().toISOString()
        ElMessage.success('库存调整成功')
    }
    stockDialogVisible.value = false
}

const exportIngredients = () => {
    const data = filteredIngredients.value.map(ingredient => ({
        名称: ingredient.name,
        分类: categories.find(c => c.value === ingredient.category)?.label,
        单价: `¥${ingredient.price.toFixed(2)}/${ingredient.unit}`,
        库存: `${ingredient.stock}${ingredient.unit}`,
        更新时间: new Date(ingredient.updateTime).toLocaleString(),
        备注: ingredient.remark || '-'
    }))

    const csvContent = 'data:text/csv;charset=utf-8,' +
        Object.keys(data[0]).join(',') + '\n' +
        data.map(row => Object.values(row).join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `原料列表_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// 添加库存统计计算属性
const stockSufficient = computed(() => {
    return ingredients.value.filter(item => item.stock >= 100).length
})

const stockInsufficient = computed(() => {
    return ingredients.value.filter(item => item.stock > 0 && item.stock < 100).length
})

const stockEmpty = computed(() => {
    return ingredients.value.filter(item => item.stock <= 0).length
})

// 添加库存报表功能
const showStockReport = () => {
    // 这里可以添加库存报表的逻辑
    ElMessage.info('库存报表功能开发中...')
}

// 获取配料列表
const fetchIngredients = async () => {
    try {
        loading.value = true
        ingredients.value = await getIngredients()
    } catch (error) {
        ElMessage.error('获取配料列表失败')
    } finally {
        loading.value = false
    }
}

// 在组件挂载时获取数据
onMounted(() => {
    fetchIngredients()
})
</script>

<style scoped>
.ingredients-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-header h2 {
    margin: 0;
    font-size: 24px;
    color: #1f2f3d;
    font-weight: 500;
}

.table-card {
    background: white;
    border-radius: var(--border-radius-base);
    box-shadow: 0 1px 2px rgba(0, 21, 41, 0.03), 0 2px 6px rgba(0, 21, 41, 0.02);
    transition: box-shadow 0.3s ease;
}

.table-card:hover {
    box-shadow: 0 2px 4px rgba(0, 21, 41, 0.04), 0 4px 12px rgba(0, 21, 41, 0.03);
}

.header-left {
    display: flex;
    align-items: center;
}

.header-right {
    display: flex;
    gap: 12px;
    align-items: center;
}

.ingredient-count {
    font-size: 14px;
}

.pagination-container {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
    background-color: #fff;
    border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card) {
    border: none;
    border-radius: var(--border-radius-base);
    overflow: hidden;
}

:deep(.el-table) {
    --el-table-border-color: #ebeef5;
    --el-table-header-bg-color: #fafafa;
}

:deep(.el-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

:deep(.el-button-group) {
    display: inline-flex;
}

:deep(.el-button-group .el-button) {
    margin-left: -1px;
}

:deep(.el-button-group .el-button:first-child) {
    margin-left: 0;
}

:deep(.el-button-group .el-button:not(:first-child):not(:last-child)) {
    border-radius: 0;
}

:deep(.el-button-group .el-button:not(:last-child)) {
    border-right-color: var(--el-button-divide-border-color);
}

@media (max-width: 768px) {
    .ingredients-container {
        padding: 10px;
    }

    .header-right {
        flex-direction: column;
        width: 100%;
    }

    .header-right .el-button {
        width: 100%;
    }

    .filter-section {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .search-input,
    .filter-select {
        width: auto;
        flex: 1;
    }

    .page-size-select {
        width: 100%;
        margin-left: 0;
    }

    .filter-group {
        flex-wrap: wrap;
    }

    :deep(.el-button-group) {
        display: flex;
        width: 100%;
    }

    :deep(.el-button-group .el-button) {
        flex: 1;
    }
}

.filter-section {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
}

.filter-left {
    display: flex;
    gap: 16px;
    align-items: center;
    flex: 1;
    max-width: 800px;
}

.filter-group {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
}

.search-input {
    width: 240px;
    flex-shrink: 0;
}

.filter-select {
    width: 120px;
    flex-shrink: 0;
}

.page-size-select {
    width: 120px;
    margin-left: 16px;
    flex-shrink: 0;
}

@media (max-width: 1200px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
    }

    .stats-group {
        margin-left: 0;
        flex-wrap: wrap;
        width: 100%;
    }

    .stat-item {
        flex: 1;
        justify-content: center;
        min-width: 140px;
    }
}

@media (max-width: 768px) {
    .stats-group {
        flex-direction: column;
    }

    .stat-item {
        width: 100%;
    }

    .header-right {
        width: 100%;
        flex-direction: column;
    }

    .header-right .el-button-group {
        width: 100%;
        display: flex;
    }

    .header-right .el-button-group .el-button {
        flex: 1;
    }

    .header-right .el-button {
        width: 100%;
    }
}

.price {
    color: #f56c6c;
    font-weight: 500;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

:deep(.el-form-item__content) {
    display: flex;
    gap: 10px;
}

:deep(.el-input-number.is-without-controls .el-input__wrapper) {
    padding-left: 15px;
    padding-right: 15px;
}

.stats-group {
    display: flex;
    gap: 12px;
    margin-left: 16px;
}

.stat-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    height: 32px;
    line-height: 1;
}

.stat-item .el-icon {
    margin: 0;
    font-size: 14px;
    display: flex;
    align-items: center;
}

.stat-item span {
    line-height: 1;
    display: inline-flex;
    align-items: center;
}

:deep(.el-tag) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: 1px solid var(--el-border-color);
    padding: 0 8px;
    height: 24px;
}

:deep(.el-tag .el-icon) {
    display: flex;
    align-items: center;
    margin: 0;
}

:deep(.el-tag span) {
    display: inline-flex;
    align-items: center;
    line-height: 1;
}
</style>