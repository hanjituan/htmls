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

const chartRef = ref();
const timeRange = ref([dayjs().subtract(3, "day").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
// console.log(timeRange);

onMounted(() => {
    const myChart = echarts.init(chartRef.value as HTMLElement);
    const symbolSize = 20;
    const data = [
        [10, 0],
        [20, 0],
    ];
    // 获取初始两点的 x 坐标
    const x1 = Math.min(data[0][0], data[1][0]);
    const x2 = Math.max(data[0][0], data[1][0]);
    // 生成初始范围内的数据点
    const initialPoints = [];
    for (let x = x1; x <= x2; x += 2) {
        initialPoints.push([x, 2]);
    }

    const seriesData: echarts.SeriesOption[] = [
        {
            id: "b",
            type: "line",
            data: initialPoints, // 使用生成的点
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
            // z: 2, // 确保柱状图在其他图层上面
        },
    ];

    const option: echarts.EChartsOption = {
        title: {
            text: "Dragging  Points",
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
                data: data,
                areaStyle: {},
            },
            ...seriesData,
        ],
    };
    // 左侧图标（表示起点）
    const startIcon = "https://img.icons8.com/material-outlined/24/000000/left2.png";

    // 右侧图标（表示终点）
    const endIcon = "https://img.icons8.com/material-outlined/24/000000/right2.png";
    setTimeout(function () {
        // Add shadow circles (which is not visible) to enable drag.
        myChart.setOption({
            graphic: data.map(function (item, dataIndex) {
                return {
                    type: "image",
                    position: myChart.convertToPixel("grid", item),
                    // shape: {
                    //     cx: 0,
                    //     cy: 0,
                    //     r: symbolSize / 2,
                    // },
                    style: {
                        image:
                            dataIndex === 0
                                ? "https://img.icons8.com/material-outlined/24/000000/left2.png" // 起始点图标
                                : "https://img.icons8.com/material-outlined/24/000000/right2.png", // 结束点图标
                        width: symbolSize,
                        height: symbolSize,
                        // 图片居中显示
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
                        hideTooltip(dataIndex);
                    },
                    z: 100,
                };
            }),
        });
    }, 0);
    window.addEventListener("resize", updatePosition);
    myChart.on("dataZoom", updatePosition);
    function updatePosition() {
        myChart.setOption({
            graphic: data.map(function (item, dataIndex) {
                return {
                    position: myChart.convertToPixel("grid", item),
                };
            }),
        });
    }
    function showTooltip(dataIndex) {
        myChart.dispatchAction({
            type: "showTip",
            seriesIndex: 0,
            dataIndex: dataIndex,
        });
    }
    function hideTooltip(dataIndex) {
        myChart.dispatchAction({
            type: "hideTip",
        });
    }

    // 添加拖拽结束处理函数
    function onDragEnd(dataIndex, pos) {
        const newPos = myChart.convertFromPixel("grid", pos);
        // 四舍五入到最近的整数
        newPos[0] = Math.round(newPos[0]);
        // 限制范围
        newPos[0] = Math.min(Math.max(newPos[0], 0), 24);
        // 保持 y 值不变
        newPos[1] = data[dataIndex][1];

        // 更新数据点
        data[dataIndex] = newPos;

        // 更新图表
        updateChartData();
    }

    // 修改拖拽中的处理函数
    function onPointDragging(dataIndex, pos) {
        const newPos = myChart.convertFromPixel("grid", pos);

        // 只限制范围，不进行吸附
        newPos[0] = Math.min(Math.max(newPos[0], 0), 24);
        newPos[1] = data[dataIndex][1];

        // 更新数据点
        data[dataIndex] = newPos;

        // 更新图表
        updateChartData();
    }

    // 修改更新图表的公共函数
    function updateChartData() {
        const x1 = Math.min(data[0][0], data[1][0]);
        const x2 = Math.max(data[0][0], data[1][0]);

        const newSeriesData = [];
        for (let x = x1; x <= x2; x += 2) {
            newSeriesData.push([x, 2]);
        }

        myChart.setOption({
            series: [
                {
                    id: "a",
                    data: data,
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

        // 更新图片位置
        myChart.setOption({
            graphic: data.map(function (item, dataIndex) {
                return {
                    position: myChart.convertToPixel("grid", item),
                    type: "image",
                    style: {
                        image: dataIndex === 0 ? startIcon : endIcon,
                        width: symbolSize,
                        height: symbolSize,
                        x: -symbolSize / 2,
                        y: -symbolSize / 2,
                    },
                    invisible: false,
                    z: 100,
                };
            }),
        });
    }
    myChart.setOption(option);
});
</script>
<style lang="less" scoped></style>
