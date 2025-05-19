<template>
    <div>
        <h1 class="mb-4">vue3 script setup echarts</h1>
        <div
            v-for="(time, index) in timeRange"
            :ref="`chartRef${index}`"
            :id="`chartRef${index}`"
            class="chart-wrap w-[600px] h-[100px] p-4 rounded border"
        ></div>
    </div>
</template>
<script lang="ts" setup>
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
// import dayjs from "dayjs";

const props = defineProps({
    timeRange: {
        type: Array<string>,
        default: [],
    },
});

const chartList = ref<any>([]);
const symbolSize = 20;
// 为每个图表创建独立的数据存储
const chartDataMap = new Map();

// 图标资源
const startIcon = "https://img.icons8.com/material-outlined/24/000000/left2.png";
const endIcon = "https://img.icons8.com/material-outlined/24/000000/right2.png";

// 工具函数
const generateInitialPoints = (x1: number, x2: number) => {
    const points = [];
    for (let x = x1; x <= x2; x += 2) {
        points.push([x, 2]);
    }
    return points;
};

// 事件处理函数
const updatePosition = (chart: echarts.EChartsType) => {
    chart.setOption({
        graphic: chartDataMap.get(chart.id).map((item) => ({
            position: chart.convertToPixel("grid", item),
        })),
    });
};

const showTooltip = (chart: echarts.EChartsType, dataIndex: number) => {
    chart.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: dataIndex,
    });
};

const hideTooltip = (chart: echarts.EChartsType) => {
    chart.dispatchAction({
        type: "hideTip",
    });
};

const updateChartData = (chart: echarts.EChartsType) => {
    const chartData = chartDataMap.get(chart.id);
    const x1 = Math.min(chartData[0][0], chartData[1][0]);
    const x2 = Math.max(chartData[0][0], chartData[1][0]);
    const newSeriesData = generateInitialPoints(x1, x2);

    const point0X = chartData[0][0];
    const point1X = chartData[1][0];
    const isPoint0First = point0X < point1X;

    chart.setOption({
        series: [
            {
                id: "a",
                data: chartData,
            },
            {
                id: "b",
                data: newSeriesData,
                type: "line",
                areaStyle: {
                    color: "#d3d3d3",
                    origin: "start",
                },
                symbolSize: 0,
            },
        ],
    });

    chart.setOption({
        graphic: chartData.map((item, idx) => ({
            position: chart.convertToPixel("grid", item),
            type: "image",
            style: {
                image: (isPoint0First ? idx === 0 : idx === 1) ? startIcon : endIcon,
                width: symbolSize,
                height: symbolSize,
                x: -symbolSize / 2,
                y: -symbolSize / 2,
            },
            invisible: false,
            z: 100,
        })),
    });
};

const onDragEnd = (chart: echarts.EChartsType, dataIndex: number, pos: number[]) => {
    const chartData = chartDataMap.get(chart.id);
    const newPos = chart.convertFromPixel("grid", pos);
    newPos[0] = Math.round(Math.min(Math.max(newPos[0], 0), 24));
    newPos[1] = chartData[dataIndex][1];
    chartData[dataIndex] = newPos;
    updateChartData(chart);
};

const onPointDragging = (chart: echarts.EChartsType, dataIndex: number, pos: number[]) => {
    const chartData = chartDataMap.get(chart.id);
    const newPos = chart.convertFromPixel("grid", pos);
    newPos[0] = Math.min(Math.max(newPos[0], 0), 24);
    newPos[1] = chartData[dataIndex][1];
    chartData[dataIndex] = newPos;
    updateChartData(chart);
};

// 图表配置
const getChartOption = (chart: echarts.EChartsType): echarts.EChartsOption => {
    const chartData = chartDataMap.get(chart.id);
    const x1 = Math.min(chartData[0][0], chartData[1][0]);
    const x2 = Math.max(chartData[0][0], chartData[1][0]);
    const initialPoints = generateInitialPoints(x1, x2);

    const seriesData: echarts.SeriesOption[] = [
        {
            id: "b",
            type: "line",
            data: initialPoints,
            areaStyle: { color: "#d3d3d3", origin: "start" },
            symbolSize: 0,
        },
        {
            id: "c",
            type: "bar",
            data: [
                [2, 1],
                [6, 1],
                [10, 1],
                [14, 1],
                [18, 1],
                [20, 1],
                [22, 1],
            ],
            barWidth: 20,
            itemStyle: { color: "#91cc75" },
        },
    ];

    return {
        tooltip: {
            triggerOn: "none",
            formatter: function (params) {
                return "X: " + params.data[0].toFixed(2) + "<br>Y: " + params.data[1].toFixed(2);
            },
        },
        grid: { top: "40%", bottom: "40%" },
        xAxis: {
            min: 0,
            max: 24,
            interval: 4,
            type: "value",
            axisLine: { onZero: false },
            axisTick: { inside: true },
            splitLine: { show: false },
        },
        yAxis: {
            type: "value",
            axisLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
        },
        series: [
            {
                id: "a",
                type: "line",
                smooth: true,
                symbolSize: symbolSize,
                data: chartData,
                areaStyle: {},
            },
            ...seriesData,
        ],
    };
};

const onChartClick = (chart: echarts.EChartsType, index: number) => (params: any) => {
    console.log(index);
    console.log("Chart clicked:", params);
    // 获取点击的坐标
    const pointInPixel = [params.offsetX, params.offsetY];
    // 将像素坐标转换为数据坐标
    const pointInData = chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel);
    console.log("Clicked position in data:", pointInData);
    // 这里可以添加你的业务逻辑
    // 例如：添加新的数据点
    // data.value.push([pointInData[0], pointInData[1]]);
    // updateChartData(chart); // 更新图表
};

const setSingleChartOption = (chart: echarts.ECharts, index: number) => {
    // 为每个图表设置初始数据
    if (!chartDataMap.has(chart.id)) {
        chartDataMap.set(chart.id, [
            [10, 0],
            [20, 0],
        ]);
    }

    chart.setOption(getChartOption(chart));
    setTimeout(() => {
        const chartData = chartDataMap.get(chart.id);
        chart.setOption({
            graphic: chartData.map((item, dataIndex) => ({
                type: "image",
                position: chart.convertToPixel("grid", item),
                style: {
                    image: dataIndex === 0 ? startIcon : endIcon,
                    width: symbolSize,
                    height: symbolSize,
                    x: -symbolSize / 2,
                    y: -symbolSize / 2,
                },
                invisible: false,
                draggable: "horizontal",
                ondrag: function (dx, dy) {
                    onPointDragging(chart, dataIndex, [this.x, this.y]);
                },
                ondragend: function () {
                    onDragEnd(chart, dataIndex, [this.x, this.y]);
                },
                onmousemove: function () {
                    showTooltip(chart, dataIndex);
                },
                onmouseout: function () {
                    hideTooltip(chart);
                },
                z: 100,
            })),
        });
    }, 0);
    // 添加事件监听
    window.addEventListener("resize", () => updatePosition(chart));
    // 监听dataZoom事件
    // chart.on("dataZoom", () => updatePosition(chart));
    // 添加点击事件监听
    chart.getZr().on("click", onChartClick(chart, index));
};

// 初始化图表
onMounted(() => {
    props.timeRange.map((item, index) => {
        const chart = echarts.init(document.getElementById("chartRef" + index) as HTMLElement);
        setSingleChartOption(chart, index);
        chartList.value.push(chart);
    });

    console.log(chartList.value);
});
</script>
<style lang="less" scoped></style>
