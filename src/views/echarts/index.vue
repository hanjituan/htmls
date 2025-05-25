<template>
    <echarts :timeRange="timeRange" />
</template>
<script lang="ts" setup>
import echarts from "./echarts.vue";
import { ref } from "vue";
import dayjs from "dayjs";

const timeRange = ref([
    dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
]);
</script>
<style lang="less" scoped></style>
