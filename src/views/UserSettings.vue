<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="max-w-3xl mx-auto">
            <!-- 页面标题 -->
            <h2 class="text-2xl font-medium text-gray-800 mb-6">个人设置</h2>

            <el-card class="mb-6">
                <!-- 基本信息 -->
                <template #header>
                    <div class="flex items-center">
                        <span class="text-base font-medium">基本信息</span>
                    </div>
                </template>
                <el-form :model="userForm" label-width="100px">
                    <el-form-item label="头像">
                        <div class="flex items-center gap-4">
                            <el-avatar :size="80" :src="userForm.avatar" />
                            <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false"
                                :on-change="handleAvatarChange">
                                <el-button type="primary" plain>更换头像</el-button>
                            </el-upload>
                        </div>
                    </el-form-item>
                    <el-form-item label="用户名">
                        <el-input v-model="userForm.username" placeholder="请输入用户名" class="w-80" />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="userForm.email" placeholder="请输入邮箱" class="w-80" />
                    </el-form-item>
                </el-form>
            </el-card>

            <el-card class="mb-6">
                <!-- 安全设置 -->
                <template #header>
                    <div class="flex items-center">
                        <span class="text-base font-medium">安全设置</span>
                    </div>
                </template>
                <el-form :model="passwordForm" label-width="100px">
                    <el-form-item label="原密码">
                        <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" class="w-80"
                            show-password />
                    </el-form-item>
                    <el-form-item label="新密码">
                        <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" class="w-80"
                            show-password />
                    </el-form-item>
                    <el-form-item label="确认密码">
                        <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                            class="w-80" show-password />
                    </el-form-item>
                </el-form>
            </el-card>

            <el-card>
                <!-- 偏好设置 -->
                <template #header>
                    <div class="flex items-center">
                        <span class="text-base font-medium">偏好设置</span>
                    </div>
                </template>
                <el-form :model="preferenceForm" label-width="100px">
                    <el-form-item label="主题">
                        <el-radio-group v-model="preferenceForm.theme">
                            <el-radio label="light">浅色</el-radio>
                            <el-radio label="dark">深色</el-radio>
                            <el-radio label="system">跟随系统</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="语言">
                        <el-select v-model="preferenceForm.language" class="w-40">
                            <el-option label="简体中文" value="zh-CN" />
                            <el-option label="English" value="en-US" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="通知">
                        <el-switch v-model="preferenceForm.notifications" />
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 保存按钮 -->
            <div class="flex justify-end mt-6 gap-3">
                <el-button @click="resetForms">重置</el-button>
                <el-button type="primary" @click="saveSettings">保存更改</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useTheme, ThemeType } from '@/utils/theme'

const { initTheme, changeTheme, watchSystemTheme } = useTheme()

// 用户基本信息表单
const userForm = ref({
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '管理员',
    email: 'admin@example.com'
})

// 密码修改表单
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// 偏好设置表单
const preferenceForm = ref({
    theme: initTheme(),
    language: 'zh-CN',
    notifications: true
})

// 监听主题变化
watch(() => preferenceForm.value.theme, (newTheme) => {
    changeTheme(newTheme)
})

// 监听系统主题变化
let removeThemeWatcher
onMounted(() => {
    if (preferenceForm.value.theme === ThemeType.SYSTEM) {
        removeThemeWatcher = watchSystemTheme(() => {
            changeTheme(ThemeType.SYSTEM)
        })
    }
})

onUnmounted(() => {
    removeThemeWatcher?.()
})

// 处理头像更改
const handleAvatarChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        userForm.value.avatar = e.target.result
    }
    reader.readAsDataURL(file.raw)
}

// 重置表单
const resetForms = () => {
    // 这里应该重置为从服务器获取的初始值
    ElMessage.success('已重置所有设置')
}

// 保存设置
const saveSettings = () => {
    // 这里应该发送请求到服务器保存设置
    ElMessage.success('设置已保存')
}
</script>

<style scoped>
.avatar-uploader {
    display: inline-block;
}
</style>