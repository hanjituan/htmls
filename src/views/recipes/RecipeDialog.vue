<template>
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新建配方' : '编辑配方'"
        width="800px"
        destroy-on-close
        class="recipe-dialog"
    >
        <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
            <el-row :gutter="20">
                <el-col :span="15">
                    <el-form-item label="配方名称" prop="name">
                        <el-input v-model="form.name" placeholder="请输入配方名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item label="状态">
                        <el-radio-group v-model="form.status">
                            <el-radio label="draft">草稿</el-radio>
                            <el-radio label="published">发布</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="描述" prop="description">
                <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入配方描述" />
            </el-form-item>

            <el-form-item label="标签" prop="tags">
                <el-select v-model="form.tags" multiple placeholder="请选择标签" class="w-full">
                    <el-option v-for="tag in tagOptions" :key="tag.value" :label="tag.label" :value="tag.value">
                        <el-tag
                            :type="tag.value === 'dessert' ? 'success' : tag.value === 'bread' ? 'warning' : 'info'"
                        >
                            {{ tag.label }}
                        </el-tag>
                    </el-option>
                </el-select>
            </el-form-item>

            <el-divider content-position="left">配料清单</el-divider>

            <div class="ingredients-section">
                <div
                    v-for="(ingredient, index) in form.ingredients"
                    :key="index"
                    class="ingredient-item bg-gray-50 p-4 rounded-lg mb-3"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-600 font-medium">配料 {{ index + 1 }}</span>
                        <el-button type="danger" link @click="removeIngredient(index)" class="!p-1">
                            <el-icon><Delete /></el-icon>
                        </el-button>
                    </div>
                    <el-row :gutter="20">
                        <el-col :span="14">
                            <el-select v-model="ingredient.id" placeholder="选择原料" class="w-full">
                                <el-option
                                    v-for="item in ingredientsList"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-col>
                        <el-col :span="10">
                            <el-input-number
                                v-model="ingredient.amount"
                                :min="0"
                                :precision="2"
                                class="w-full"
                                placeholder="用量"
                            />
                        </el-col>
                    </el-row>
                </div>

                <div class="text-center mt-4">
                    <el-button type="primary" plain @click="addIngredient" class="w-full">
                        <el-icon><Plus /></el-icon>
                        添加配料
                    </el-button>
                </div>
            </div>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="close">取消</el-button>
                <el-button type="primary" @click="save" :loading="loading">保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, defineEmits, watch, computed } from "vue";
import { Delete, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: "add",
    },
    initialData: {
        type: Object,
        default: () => ({}),
    },
    ingredientsList: {
        type: Array,
        default: () => [],
    },
    tagOptions: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:visible", "save"]);

const dialogType = computed(() => props.type);

const dialogVisible = ref(props.visible);
const formRef = ref(null);
const form = ref({
    name: "",
    description: "",
    tags: [],
    status: "draft",
    ingredients: [],
});

// 监听visible变化
watch(
    () => props.visible,
    (newVal) => {
        dialogVisible.value = newVal;
    }
);

// 监听dialogVisible变化
watch(
    () => dialogVisible.value,
    (newVal) => {
        emit("update:visible", newVal);
    }
);

// 表单验证规则
const rules = {
    name: [
        { required: true, message: "请输入配方名称", trigger: "blur" },
        { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
    ],
    description: [{ required: true, message: "请输入配方描述", trigger: "blur" }],
    tags: [{ required: true, message: "请选择至少一个标签", trigger: "change" }],
};

// 添加配料
const addIngredient = () => {
    form.value.ingredients.push({
        id: "",
        amount: 0,
    });
};

// 移除配料
const removeIngredient = (index) => {
    form.value.ingredients.splice(index, 1);
};

// 保存配方
const save = async () => {
    if (!formRef.value) return;

    await formRef.value.validate((valid, fields) => {
        if (valid) {
            emit("save", form.value);
        }
    });
};

// 关闭对话框
const close = () => {
    dialogVisible.value = false;
};

// 初始化表单数据
const initForm = () => {
    if (props.type === "edit" && props.initialData) {
        form.value = { ...props.initialData };
    } else {
        form.value = {
            name: "",
            description: "",
            tags: [],
            status: "draft",
            ingredients: [],
        };
    }
};

// 监听type和initialData变化
watch(
    [() => props.type, () => props.initialData],
    () => {
        initForm();
    },
    { immediate: true }
);
</script>

<style scoped>
.recipe-dialog {
    :deep(.el-dialog__body) {
        padding: 20px;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
    }

    :deep(.el-divider__text) {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
    }
}

.ingredients-section {
    background-color: var(--el-bg-color);
    border-radius: 8px;
    padding: 20px;
}

.ingredient-item {
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.3s ease;

    &:hover {
        border-color: var(--el-border-color);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    }

    .el-input-number {
        width: 100%;
    }

    .el-button {
        opacity: 0.8;
        &:hover {
            opacity: 1;
        }
    }
}

.ingredient-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.add-ingredient-btn {
    margin-top: 16px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
}
</style>
