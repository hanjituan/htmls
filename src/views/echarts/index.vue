<template>
    <div>
        <h1 class="mb-4">vue3 script setup echarts</h1>
        <div ref="chartRef" class="chart-wrap w-[600px] h-[300px] p-4 rounded border"></div>
    </div>
</template>
<script lang="ts" setup>
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
import dayjs from "dayjs";

// 基础数据定义
const chartRef = ref();
const timeRange = ref([dayjs().subtract(3, "day").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
const symbolSize = 20;
const data = ref([
    [10, 0],
    [20, 0],
]);
let myChart: echarts.EChartsType;

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
const updatePosition = () => {
    myChart.setOption({
        graphic: data.value.map((item) => ({
            position: myChart.convertToPixel("grid", item),
        })),
    });
};

const showTooltip = (dataIndex: number) => {
    myChart.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: dataIndex,
    });
};

const hideTooltip = () => {
    myChart.dispatchAction({
        type: "hideTip",
    });
};

const updateChartData = () => {
    const x1 = Math.min(data.value[0][0], data.value[1][0]);
    const x2 = Math.max(data.value[0][0], data.value[1][0]);
    const newSeriesData = generateInitialPoints(x1, x2);

    // 判断两个点的相对位置
    const point0X = data.value[0][0];
    const point1X = data.value[1][0];
    const isPoint0First = point0X < point1X;

    myChart.setOption({
        series: [
            {
                id: "a",
                data: data.value,
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

    myChart.setOption({
        graphic: data.value.map((item, idx) => ({
            position: myChart.convertToPixel("grid", item),
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

const onDragEnd = (dataIndex: number, pos: number[]) => {
    const newPos = myChart.convertFromPixel("grid", pos);
    newPos[0] = Math.round(Math.min(Math.max(newPos[0], 0), 24));
    newPos[1] = data.value[dataIndex][1];
    data.value[dataIndex] = newPos;
    updateChartData();
};

const onPointDragging = (dataIndex: number, pos: number[]) => {
    const newPos = myChart.convertFromPixel("grid", pos);
    newPos[0] = Math.min(Math.max(newPos[0], 0), 24);
    newPos[1] = data.value[dataIndex][1];
    data.value[dataIndex] = newPos;
    updateChartData();
};

// 图表配置
const getChartOption = (): echarts.EChartsOption => {
    const x1 = Math.min(data.value[0][0], data.value[1][0]);
    const x2 = Math.max(data.value[0][0], data.value[1][0]);
    const initialPoints = generateInitialPoints(x1, x2);

    const seriesData: echarts.SeriesOption[] = [
        {
            id: "b",
            type: "line",
            data: initialPoints,
            areaStyle: {
                color: "#d3d3d3",
                origin: "start",
            },
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
                [22, 1],
            ],
            barWidth: 20,
            itemStyle: {
                color: "#91cc75",
            },
        },
    ];

    return {
        title: {
            text: "Dragging Points",
            left: "center",
        },
        tooltip: {
            triggerOn: "none",
            formatter: function (params) {
                return "X: " + params.data[0].toFixed(2) + "<br>Y: " + params.data[1].toFixed(2);
            },
        },
        grid: {
            top: "40%",
            bottom: "40%",
        },
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
                data: data.value,
                areaStyle: {},
            },
            ...seriesData,
        ],
    };
};

// 初始化图表
onMounted(() => {
    myChart = echarts.init(chartRef.value as HTMLElement);
    myChart.setOption(getChartOption());

    // 设置拖拽点
    setTimeout(() => {
        myChart.setOption({
            graphic: data.value.map((item, dataIndex) => ({
                type: "image",
                position: myChart.convertToPixel("grid", item),
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
                    onPointDragging(dataIndex, [this.x, this.y]);
                },
                ondragend: function () {
                    onDragEnd(dataIndex, [this.x, this.y]);
                },
                onmousemove: function () {
                    showTooltip(dataIndex);
                },
                onmouseout: function () {
                    hideTooltip();
                },
                z: 100,
            })),
        });
    }, 0);

    // 添加事件监听
    window.addEventListener("resize", updatePosition);
    myChart.on("dataZoom", updatePosition);
});
</script>
<style lang="less" scoped></style>
