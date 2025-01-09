<template>
    <div class="recipes-container">
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
                            :type="tag.value === 'dessert' ? 'success' : tag.value === 'bread' ? 'warning' : 'info'"
                        >
                            {{ tag.label }}
                        </el-tag>
                    </el-option>
                </el-select>
            </div>
        </div>

        <div class="table-container">
            <div class="mb-4 flex justify-between items-center">
                <el-tag type="info" class="recipe-count"> 共 {{ filteredRecipes.length }} 个配方 </el-tag>

                <div class="header-right">
                    <el-button type="success" plain @click="exportRecipes">
                        <el-icon> <Download /> </el-icon>导出配方
                    </el-button>
                    <el-button type="primary" @click="showAddDialog">
                        <el-icon> <Plus /> </el-icon>新建配方
                    </el-button>
                </div>
            </div>

            <el-table
                v-loading="loading"
                :data="paginatedRecipes"
                border
                style="width: 100%"
                :height="tableHeight"
                @sort-change="handleSortChange"
                highlight-current-row
                row-key="createTime"
            >
                <el-table-column type="expand" fixed="left">
                    <template #default="{ row }">
                        <div class="recipe-detail">
                            <el-table :data="row.ingredients" border size="small">
                                <el-table-column prop="name" label="原料名称" min-width="120">
                                    <template #default="{ row: ingredient }">
                                        {{ ingredientsList.value?.find((i) => i.id === ingredient.id)?.name }}
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
                <el-table-column label="标签">
                    <template #default="{ row }">
                        <el-tag
                            v-for="tag in row.tags"
                            :key="tag"
                            :type="tag === 'dessert' ? 'success' : tag === 'bread' ? 'warning' : 'info'"
                            class="mx-1"
                        >
                            {{ tagOptions.value?.find((t) => t.value === tag)?.label }}
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
                            {{ row.status === "published" ? "已发布" : "草稿" }}
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
                            <el-button class="!mr-4" size="small" type="primary" @click="editRecipe(scope.row)">
                                <el-icon> <Edit /> </el-icon>编辑
                            </el-button>
                            <el-button size="small" type="danger" @click="confirmDelete(scope.row)">
                                <el-icon> <Delete /> </el-icon>删除
                            </el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="filteredRecipes.length"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next"
                    background
                />
            </div>
        </div>

        <!-- 配方对话框 -->
        <recipe-dialog
            v-model:visible="dialogVisible"
            :type="dialogType"
            :initial-data="recipeForm"
            :ingredients-list="ingredientsList"
            :tag-options="tagOptions"
            :loading="loading"
            @save="saveRecipe"
        />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download, Plus, Search, Edit, Delete } from "@element-plus/icons-vue";
import RecipeDialog from "./RecipeDialog.vue";

// 状态定义
const loading = ref(false);
const tableHeight = ref("calc(100vh - 240px)");
const searchText = ref("");
const dialogVisible = ref(false);
const dialogType = ref("add");
const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref("name");
const sortOrder = ref("ascending");
const filterStatus = ref("");
const filterTag = ref("");

// 配方表单
const recipeForm = ref({
    name: "",
    description: "",
    tags: [],
    status: "draft",
    ingredients: [],
});

// 标签选项
const tagOptions = ref([
    { value: "dessert", label: "甜点" },
    { value: "bread", label: "面包" },
    { value: "cake", label: "蛋糕" },
    { value: "cookie", label: "饼干" },
]);

// 模拟的配料列表数据
const ingredientsList = ref([
    { id: 1, name: "面粉", price: 5, unit: "kg" },
    { id: 2, name: "糖", price: 8, unit: "kg" },
    { id: 3, name: "黄油", price: 40, unit: "kg" },
    { id: 4, name: "鸡蛋", price: 1, unit: "个" },
]);

// 模拟的配方列表数据
const recipes = ref([
    {
        id: 1,
        name: "巧克力蛋糕",
        description: "美味的巧克力蛋糕配方",
        tags: ["cake", "dessert"],
        status: "published",
        ingredients: [
            { id: 1, amount: 0.5, unit: "kg" },
            { id: 2, amount: 0.3, unit: "kg" },
            { id: 3, amount: 0.2, unit: "kg" },
        ],
        createTime: "2024-01-01T10:00:00",
        updateTime: "2024-01-01T10:00:00",
    },
]);

// 计算属性：过滤后的配方列表
const filteredRecipes = computed(() => {
    return recipes.value
        .filter((recipe) => {
            const matchSearch = (recipe.name + recipe.description)
                .toLowerCase()
                .includes(searchText.value.toLowerCase());
            const matchStatus = !filterStatus.value || recipe.status === filterStatus.value;
            const matchTag = !filterTag.value || recipe.tags.includes(filterTag.value);
            return matchSearch && matchStatus && matchTag;
        })
        .sort((a, b) => {
            const factor = sortOrder.value === "ascending" ? 1 : -1;
            if (typeof a[sortBy.value] === "string") {
                return factor * a[sortBy.value].localeCompare(b[sortBy.value]);
            }
            return factor * (a[sortBy.value] - b[sortBy.value]);
        });
});

// 计算属性：分页后的配方列表
const paginatedRecipes = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredRecipes.value.slice(start, start + pageSize.value);
});

// 排序变化处理
const handleSortChange = ({ prop, order }) => {
    sortBy.value = prop;
    sortOrder.value = order;
};

// 计算配料成本
const calculateIngredientCost = (ingredient) => {
    const ingredientInfo = ingredientsList.value?.find((i) => i.id === ingredient.id);
    if (!ingredientInfo) return 0;
    return ingredientInfo.price * ingredient.amount;
};

// 计算总成本
const calculateTotalCost = (ingredients) => {
    if (!ingredients) return 0;
    return ingredients.reduce((total, ingredient) => {
        return total + calculateIngredientCost(ingredient);
    }, 0);
};

// 显示新建对话框
const showAddDialog = () => {
    dialogType.value = "add";
    recipeForm.value = {
        name: "",
        description: "",
        tags: [],
        status: "draft",
        ingredients: [],
    };
    dialogVisible.value = true;
};

// 编辑配方
const editRecipe = (recipe) => {
    dialogType.value = "edit";
    recipeForm.value = { ...recipe };
    dialogVisible.value = true;
};

// 确认删除
const confirmDelete = (recipe) => {
    ElMessageBox.confirm("确定要删除这个配方吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(() => {
            deleteRecipe(recipe);
            ElMessage.success("删除成功");
        })
        .catch(() => {});
};

// 删除配方
const deleteRecipe = (recipe) => {
    const index = recipes.value.findIndex((item) => item.id === recipe.id);
    if (index > -1) {
        recipes.value.splice(index, 1);
    }
};

// 保存配方
const saveRecipe = async (formData) => {
    try {
        loading.value = true;
        const now = new Date().toISOString();

        if (dialogType.value === "add") {
            const newRecipe = {
                ...formData,
                id: Date.now(),
                createTime: now,
                updateTime: now,
            };
            recipes.value.push(newRecipe);
            ElMessage.success("添加成功");
        } else {
            const index = recipes.value.findIndex((item) => item.id === recipeForm.value.id);
            if (index > -1) {
                recipes.value[index] = {
                    ...recipes.value[index],
                    ...formData,
                    updateTime: now,
                };
            }
            ElMessage.success("更新成功");
        }

        dialogVisible.value = false;
    } catch (error) {
        ElMessage.error(dialogType.value === "add" ? "添加失败" : "更新失败");
    } finally {
        loading.value = false;
    }
};

// 导出配方
const exportRecipes = () => {
    const data = filteredRecipes.value.map((recipe) => ({
        名称: recipe.name,
        描述: recipe.description,
        标签: recipe.tags.map((tag) => tagOptions.value?.find((t) => t.value === tag)?.label).join(", "),
        状态: recipe.status === "published" ? "已发布" : "草稿",
        配料数: recipe.ingredients?.length || 0,
        预估成本: `¥${calculateTotalCost(recipe.ingredients).toFixed(2)}`,
        更新时间: new Date(recipe.updateTime).toLocaleString(),
    }));

    const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(data[0]).join(",") +
        "\n" +
        data.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `配方列表_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
</script>

<style scoped>
.recipes-container {
    min-height: 100%;
}

.header-left {
    @apply flex items-center gap-4;
}

.header-right {
    @apply flex gap-2;
}

.recipe-count {
    @apply text-sm;
}

.table-card {
    @apply mb-4;
}

.filter-section {
    @apply bg-white p-4 shadow-sm  mb-4 flex justify-between items-center rounded sticky -top-8 z-10;
}

.table-container {
    @apply bg-white mb-4  rounded p-4 shadow-sm;
}

.search-box {
    @apply flex items-center gap-4;
}

.search-input {
    width: 300px;
}

.filter-select {
    width: 150px;
}

.page-size-select {
    width: 120px;
}

.pagination-container {
    @apply p-4 flex justify-end;
}

.recipe-detail {
    padding: 20px;
}

.recipe-detail h4 {
    @apply text-lg font-medium mb-4;
}

.recipe-summary {
    @apply mt-4 text-right text-gray-600 font-medium;
}

:deep(.el-tag) {
    margin: 0 4px;
}

:deep(.el-button-group .el-button--small) {
    padding: 8px 12px;
}
</style>
