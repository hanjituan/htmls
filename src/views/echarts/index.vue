<template>
    父组件 timeRange: {{ timeRange }}
    <echarts :timeList="timeList" v-model:timeRange="timeRange" />
</template>
<script lang="ts" setup>
import echarts from "./echarts.vue";
import { ref } from "vue";
import dayjs from "dayjs";

const timeRange = ref([]);
const timeList = ref([
    dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
]);
</script>
<style lang="less" scoped></style>
