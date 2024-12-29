<template>
    <div class="recipes-container">
        <div class="page-header">
            <div class="header-left">
                <h2>配方管理</h2>
                <el-tag type="info" class="recipe-count">共 {{ filteredRecipes.length }} 个配方</el-tag>
            </div>
            <div class="header-right">
                <el-button type="success" plain @click="exportRecipes">
                    <el-icon>
                        <Download />
                    </el-icon>导出配方
                </el-button>
                <el-button type="primary" @click="showAddDialog">
                    <el-icon>
                        <Plus />
                    </el-icon>新建配方
                </el-button>
            </div>
        </div>

        <el-card class="table-card" :body-style="{ padding: 0 }">
            <div class="filter-section">
                <div class="search-box">
                    <el-input v-model="searchText" placeholder="搜索配方名称或描述" clearable class="search-input">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                    <el-select v-model="filterStatus" placeholder="状态" clearable class="filter-select">
                        <el-option label="全部" value="" />
                        <el-option label="已发布" value="published" />
                        <el-option label="草稿" value="draft" />
                    </el-select>
                    <el-select v-model="filterTag" placeholder="标签" clearable class="filter-select">
                        <el-option label="全部" value="" />
                        <el-option v-for="tag in tagOptions" :key="tag.value" :label="tag.label" :value="tag.value">
                            <el-tag
                                :type="tag.value === 'dessert' ? 'success' : tag.value === 'bread' ? 'warning' : 'info'">
                                {{ tag.label }}
                            </el-tag>
                        </el-option>
                    </el-select>
                </div>
                <el-select v-model="pageSize" class="page-size-select">
                    <el-option label="10 条/页" :value="10" />
                    <el-option label="20 条/页" :value="20" />
                    <el-option label="50 条/页" :value="50" />
                </el-select>
            </div>

            <el-table v-loading="loading" :data="paginatedRecipes" border style="width: 100%" :height="tableHeight"
                @sort-change="handleSortChange" highlight-current-row row-key="createTime">
                <el-table-column type="expand">
                    <template #default="{ row }">
                        <div class="recipe-detail">
                            <h4>配料详情</h4>
                            <el-table :data="row.ingredients" border size="small">
                                <el-table-column prop="name" label="原料名称" min-width="120">
                                    <template #default="{ row: ingredient }">
                                        {{ ingredientsList.value.find(i => i.id === ingredient.id)?.name }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="amount" label="用量" width="120" align="right">
                                    <template #default="{ row: ingredient }">
                                        {{ ingredient.amount }} {{ ingredient.unit }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="成本" width="120" align="right">
                                    <template #default="{ row: ingredient }">
                                        ¥ {{ calculateIngredientCost(ingredient).toFixed(2) }}
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="recipe-summary">
                                <span>总成本：¥ {{ calculateTotalCost(row.ingredients).toFixed(2) }}</span>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="配方名称" min-width="150" sortable />
                <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
                <el-table-column label="标签" width="200">
                    <template #default="{ row }">
                        <el-tag v-for="tag in row.tags" :key="tag"
                            :type="tag === 'dessert' ? 'success' : tag === 'bread' ? 'warning' : 'info'" class="mx-1">
                            {{ tagOptions.value.find(t => t.value === tag)?.label }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="配料数" width="100" align="center" sortable>
                    <template #default="scope">
                        <el-tag type="info">{{ scope.row.ingredients?.length || 0 }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="预估成本" width="120" align="right" sortable>
                    <template #default="scope">
                        <span>¥ {{ calculateTotalCost(scope.row.ingredients).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
                            {{ row.status === 'published' ? '已发布' : '草稿' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" width="180" sortable>
                    <template #default="{ row }">
                        {{ new Date(row.updateTime).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button-group>
                            <el-button size="small" type="primary" @click="editRecipe(scope.row)">
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
                    :total="filteredRecipes.length" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
                    background />
            </div>
        </el-card>

        <!-- 新建/编辑配方对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新建配方' : '编辑配方'" width="700px"
            destroy-on-close>
            <el-form :model="recipeForm" label-width="100px" ref="recipeFormRef" :rules="rules">
                <el-form-item label="配方名称" prop="name">
                    <el-input v-model="recipeForm.name" placeholder="请输入配方名称" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="recipeForm.description" type="textarea" rows="3" placeholder="请输入配方描述" />
                </el-form-item>
                <el-form-item label="标签" prop="tags">
                    <el-select v-model="recipeForm.tags" multiple placeholder="请选择标签" class="tag-select">
                        <el-option v-for="tag in tagOptions" :key="tag.value" :label="tag.label" :value="tag.value">
                            <el-tag
                                :type="tag.value === 'dessert' ? 'success' : tag.value === 'bread' ? 'warning' : 'info'">
                                {{ tag.label }}
                            </el-tag>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="recipeForm.status">
                        <el-radio label="draft">草稿</el-radio>
                        <el-radio label="published">发布</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="配料">
                    <div class="ingredients-list">
                        <div v-for="(ingredient, index) in recipeForm.ingredients" :key="index" class="ingredient-item">
                            <el-select v-model="ingredient.id" placeholder="选择原料" class="ingredient-select">
                                <el-option v-for="item in ingredientsList" :key="item.id" :label="item.name"
                                    :value="item.id" />
                            </el-select>
                            <el-input-number v-model="ingredient.amount" :min="0" :precision="2" class="amount-input" />
                            <el-select v-model="ingredient.unit" placeholder="单位" class="unit-select">
                                <el-option label="克" value="g" />
                                <el-option label="千克" value="kg" />
                                <el-option label="毫升" value="ml" />
                            </el-select>
                            <el-button type="danger" circle @click="removeIngredient(index)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </div>
                        <el-button type="primary" plain @click="addIngredient" class="add-ingredient-btn">
                            <el-icon>
                                <Plus />
                            </el-icon>添加配料
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveRecipe" :loading="loading">保存</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

const searchText = ref('')
const recipes = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const recipeFormRef = ref(null)

const ingredientsList = ref([
    { id: 1, name: '面粉' },
    { id: 2, name: '糖' },
    { id: 3, name: '盐' },
])

const loading = ref(false)
const tableHeight = ref('calc(100vh - 240px)')

const sortBy = ref('name')
const sortOrder = ref('ascending')
const currentPage = ref(1)
const pageSize = ref(10)

const recipeForm = reactive({
    name: '',
    description: '',
    ingredients: [],
    createTime: '',
    updateTime: '',
    tags: [],
    status: 'draft' // draft, published
})

const tagOptions = ref([
    { value: 'dessert', label: '甜点' },
    { value: 'bread', label: '面包' },
    { value: 'cake', label: '蛋糕' },
    { value: 'drink', label: '饮品' }
])

const rules = {
    name: [
        { required: true, message: '请输入配方名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入配方描述', trigger: 'blur' },
        { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
    ],
    tags: [
        { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }
    ]
}

const filterStatus = ref('')
const filterTag = ref('')

const filteredRecipes = computed(() => {
    let result = recipes.value.filter(recipe => {
        const matchSearch = recipe.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchText.value.toLowerCase())
        const matchStatus = !filterStatus.value || recipe.status === filterStatus.value
        const matchTag = !filterTag.value || recipe.tags.includes(filterTag.value)
        return matchSearch && matchStatus && matchTag
    })

    // 排序
    result.sort((a, b) => {
        const factor = sortOrder.value === 'ascending' ? 1 : -1
        return a[sortBy.value] > b[sortBy.value] ? factor : -factor
    })

    return result
})

const paginatedRecipes = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredRecipes.value.slice(start, start + pageSize.value)
})

const handleSortChange = ({ prop, order }) => {
    sortBy.value = prop
    sortOrder.value = order
}

const calculateTotalCost = (ingredients) => {
    return ingredients.reduce((total, item) => {
        const ingredient = ingredientsList.value.find(i => i.id === item.id)
        if (!ingredient) return total
        return total + (ingredient.price * item.amount)
    }, 0)
}

const showAddDialog = () => {
    dialogType.value = 'add'
    Object.assign(recipeForm, {
        name: '',
        description: '',
        ingredients: []
    })
    dialogVisible.value = true
}

const editRecipe = (recipe) => {
    dialogType.value = 'edit'
    Object.assign(recipeForm, JSON.parse(JSON.stringify(recipe)))
    dialogVisible.value = true
}

const confirmDelete = (recipe) => {
    ElMessageBox.confirm(
        '确定要删除这个配方吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        deleteRecipe(recipe)
    }).catch(() => { })
}

const deleteRecipe = (recipe) => {
    recipes.value = recipes.value.filter(item => item !== recipe)
    ElMessage.success('删除成功')
}

const addIngredient = () => {
    recipeForm.ingredients.push({
        id: '',
        amount: 0,
        unit: 'g'
    })
}

const removeIngredient = (index) => {
    recipeForm.ingredients.splice(index, 1)
}

const saveRecipe = async () => {
    try {
        await recipeFormRef.value?.validate()
        loading.value = true

        const now = new Date().toISOString()
        const recipeData = {
            ...recipeForm,
            updateTime: now,
            createTime: dialogType.value === 'add' ? now : recipeForm.createTime
        }

        if (dialogType.value === 'add') {
            recipes.value.unshift(recipeData)
            ElMessage.success('配方创建成功')
        } else {
            const index = recipes.value.findIndex(r => r.createTime === recipeForm.createTime)
            if (index !== -1) {
                recipes.value[index] = recipeData
                ElMessage.success('配方更新成功')
            }
        }
        dialogVisible.value = false
    } catch (error) {
        ElMessage.error('请检查表单填写是否正确')
    } finally {
        loading.value = false
    }
}

const exportRecipes = () => {
    const data = filteredRecipes.value.map(recipe => ({
        名称: recipe.name,
        描述: recipe.description,
        标签: recipe.tags.map(tag => tagOptions.value.find(t => t.value === tag)?.label).join(', '),
        状态: recipe.status === 'published' ? '已发布' : '草稿',
        更新时间: new Date(recipe.updateTime).toLocaleString(),
        配料数: recipe.ingredients.length,
        总成本: calculateTotalCost(recipe.ingredients).toFixed(2)
    }))

    // 创建CSV内容
    const csvContent = 'data:text/csv;charset=utf-8,' +
        Object.keys(data[0]).join(',') + '\n' +
        data.map(row => Object.values(row).join(',')).join('\n')

    // 触发下载
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `配方列表_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const calculateIngredientCost = (ingredient) => {
    const ingredientInfo = ingredientsList.value.find(i => i.id === ingredient.id)
    if (!ingredientInfo) return 0
    return ingredientInfo.price * ingredient.amount
}

// 根据路由设置页面状态
if (route.path === '/recipes') {
    // 设置页面状态
}
</script>

<style scoped>
.recipes-container {
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

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-box {
    display: flex;
    gap: 10px;
}

.search-input {
    width: 300px;
}

.ingredients-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.ingredient-item {
    display: flex;
    gap: 10px;
    align-items: center;
}

.ingredient-select {
    flex: 2;
}

.amount-input {
    flex: 1;
}

.unit-select {
    width: 100px;
}

.add-ingredient-btn {
    margin-top: 10px;
    width: fit-content;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

:deep(.el-button-group) {
    display: flex;
    gap: 5px;
}

@media (max-width: 768px) {
    .recipes-container {
        padding: 10px;
    }

    .search-input {
        width: 100%;
    }

    .ingredient-item {
        flex-wrap: wrap;
    }

    .ingredient-select,
    .amount-input,
    .unit-select {
        width: 100%;
        flex: none;
    }
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.page-size-select {
    width: 120px;
}

.tag-select {
    width: 100%;
}

.mx-1 {
    margin: 0 4px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.recipe-count {
    font-size: 14px;
}

.header-right {
    display: flex;
    gap: 12px;
}

.filter-section {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, #fafafa, #ffffff);
}

.filter-select {
    width: 150px;
}

.recipe-detail {
    padding: 20px;
    background-color: #fafafa;
    border-radius: 4px;
    margin: 0 20px;
}

.recipe-detail h4 {
    margin: 0 0 16px 0;
    color: #606266;
}

.recipe-summary {
    margin-top: 16px;
    text-align: right;
    color: #606266;
    font-weight: bold;
}

.table-card {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.search-box {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.search-input {
    width: 300px;
}

@media (max-width: 768px) {
    .filter-section {
        flex-direction: column;
        gap: 12px;
    }

    .search-box {
        width: 100%;
    }

    .search-input,
    .filter-select,
    .page-size-select {
        width: 100%;
    }

    .header-right {
        flex-direction: column;
        width: 100%;
    }

    .header-right .el-button {
        width: 100%;
    }
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

:deep(.el-table__expanded-cell) {
    background-color: #fafcff;
}

:deep(.el-pagination) {
    padding: 16px;
    background-color: #fff;
    border-top: 1px solid var(--el-border-color-lighter);
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--border-radius-base);
    font-size: 13px;
}
</style>