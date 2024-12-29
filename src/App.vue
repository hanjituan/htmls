<template>
    <el-config-provider :locale="zhCn">
        <Layout>
            <router-view></router-view>
        </Layout>
    </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Layout from './components/Layout.vue'
</script>

<style>
:root {
    --border-radius-base: 2px;
    --el-border-radius-base: 2px;
    --el-border-radius-small: 2px;
    --el-border-radius-round: 2px;
}
</style>