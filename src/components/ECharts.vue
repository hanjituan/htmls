<template>
    <div ref="chart" :style="{ width: '100%', height: '100%' }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    options: Object
})

const chart = ref(null)
let chartInstance = null

const initChart = () => {
    if (chart.value) {
        chartInstance = echarts.init(chart.value)
        chartInstance.setOption(props.options)
    }
}

onMounted(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose()
    }
    window.removeEventListener('resize', resizeChart)
})

const resizeChart = () => {
    if (chartInstance) {
        chartInstance.resize()
    }
}

watch(() => props.options, (newOptions) => {
    if (chartInstance) {
        chartInstance.setOption(newOptions)
    }
})
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
</style>