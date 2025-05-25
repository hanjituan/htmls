<template>
    <div>
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

const props = defineProps({
    timeRange: {
        type: Array<string>,
        default: [],
    },
});
const chartList: any = ref([]);
const activeIndex = ref(0);
const symbolSize = 20;
const yValue = 2; // y轴固定值
// 为每个图表创建独立的数据存储
const chartDataMap = new Map();

// 图标资源
const startIcon = "https://img.icons8.com/material-outlined/24/000000/left2.png";
const endIcon = "https://img.icons8.com/material-outlined/24/000000/right2.png";

const getChartById = (id) => {
    const chartData = chartDataMap.get(id);
    return chartData;
};

// 工具函数
const generateInitialPoints = (x1: number, x2: number) => {
    const points = [];
    for (let x = x1; x <= x2; x += 2) {
        points.push([x, yValue]);
    }
    return points;
};

// 事件处理函数
const updatePosition = (chart: echarts.EChartsType) => {
    const { dragPoints, symbolSizes } = getChartById(chart.id);
    chart.setOption({
        graphic: dragPoints.map((item) => ({
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

// 点击后更新位置
const updatePostion = (position, chartData, pointNumber) => {
    // 获取点击位置对应的x坐标, 比较两个点 x 坐标, 差值较小的一个座位替换点
    if (Array.isArray(position)) {
        const x = position[0];
        const point0X = chartData[0][0];
        const point1X = chartData[1][0];
        const isPoint0First = Math.abs(x - point0X) < Math.abs(x - point1X);
        const dataIndex = isPoint0First ? 0 : 1;
        chartData[dataIndex] = [x, 0];
    }
};

const updateChartData = (chart: echarts.EChartsType, clickEvent = { params: {}, position: {} }) => {
    const { dragPoints, symbolSizes, pointNumber } = getChartById(chart.id);
    const { position } = clickEvent;
    updatePostion(position, dragPoints, pointNumber);

    const x1 = Math.min(dragPoints[0][0], dragPoints[1][0]);
    const x2 = Math.max(dragPoints[0][0], dragPoints[1][0]);
    const newSeriesData = generateInitialPoints(x1, x2);

    const point0X = dragPoints[0][0];
    const point1X = dragPoints[1][0];
    const isPoint0First = point0X < point1X;
    chart.setOption({
        series: [
            // 拖拽点
            {
                id: "a",
                type: "line",
                smooth: true,
                symbolSize: (value, params) => {
                    return symbolSizes[params.dataIndex];
                }, // TODO: 拖拽点的 icon 大小
                data: dragPoints,
                areaStyle: {},
            },
            // 折线图 (阴影部分)
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
        graphic: dragPoints.map((item, idx) => ({
            position: chart.convertToPixel("grid", item),
            type: "image",
            style: {
                image: (isPoint0First ? idx === 0 : idx === 1) ? startIcon : endIcon,
                width: symbolSizes[idx],
                height: symbolSizes[idx],
                x: -symbolSizes[idx] / 2,
                y: -symbolSizes[idx] / 2,
            },
            invisible: false,
            z: 100,
        })),
    });
};

const onDragEnd = (chart: echarts.EChartsType, dataIndex: number, pos: number[]) => {
    const { dragPoints, symbolSizes } = getChartById(chart.id);
    const newPos = chart.convertFromPixel("grid", pos);
    newPos[0] = Math.round(Math.min(Math.max(newPos[0], 0), 24));
    newPos[1] = dragPoints[dataIndex][1];
    dragPoints[dataIndex] = newPos;
    updateChartData(chart);
};

const onPointDragging = (chart: echarts.EChartsType, dataIndex: number, pos: number[]) => {
    const { dragPoints, symbolSizes } = getChartById(chart.id);
    const newPos = chart.convertFromPixel("grid", pos);
    newPos[0] = Math.min(Math.max(newPos[0], 0), 24);
    newPos[1] = dragPoints[dataIndex][1];
    dragPoints[dataIndex] = newPos;
    updateChartData(chart);
};

// 设置多组 echarts 实例, 初始化的数据
const setChartInstance = (chart: echarts.EChartsType, index: number) => {
    // 拖拽点起始位置
    let dragPoints = [
        [0, 0],
        [0, 0],
    ];
    // 第一个点, 第二个点
    let symbolSizes = [0, 0];
    let pointNumber = 0;

    if (index === 0) {
        dragPoints = [
            [0, 0],
            [12, 0],
        ];
        symbolSizes = [symbolSize, symbolSize];
        pointNumber = 2;
    }
    if (!chartDataMap.has(chart.id)) {
        chartDataMap.set(chart.id, { dragPoints, symbolSizes, pointNumber });
    }
};

// 初始图表配置
const getChartOption = (chart: echarts.EChartsType, index: number): echarts.EChartsOption => {
    const { dragPoints, symbolSizes } = getChartById(chart.id);
    const x1 = Math.min(dragPoints[0][0], dragPoints[1][0]);
    const x2 = Math.max(dragPoints[0][0], dragPoints[1][0]);
    const initialPoints = generateInitialPoints(x1, x2);

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
                symbolSize: (value, params) => {
                    return symbolSizes[params.dataIndex];
                },
                data: dragPoints,
                areaStyle: {},
            },
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
        ],
    };
};

const onChartClick = (chart: echarts.EChartsType, index: number) => (params: any) => {
    activeIndex.value = index;
    // 获取点击的坐标
    const pointInPixel = [params.offsetX, params.offsetY];
    // 将像素坐标转换为数据坐标
    const pointInData = chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel);
    // console.log("Clicked position in data:", pointInData);

    /**
     * 如果点击的是第一组, 则不处理,
     * 点击的是第二组, 则将第一组第二个拖拽点设置位置设置到最后(24), 且拖拽点大小设置为 0
     * 点击的是第三组, 重复第二点的逻辑, 且将第二组第一个拖拽点位置设置为开始 0 ,第二个拖拽点设置位置设置到最后(24), 两个且拖拽点大小设置为 0
     */
    const currentData = getChartById(chart.id);

    if (index === 1) {
        const chart0 = chartList.value[index - 1];
        const chartData1 = getChartById(chart0.id);
        chartData1.dragPoints[1] = [24, 0]; // 第一组第二个拖拽点设置到最后(24)
        chartData1.symbolSizes[1] = 0; // 拖拽点大小设置为 0
        currentData.symbolSizes = [0, 20]; // 第二组第一个拖拽点设置为开始(0)

        updateChartData(chart0, { params, position: [24, 0] }); // 更新图表
    } else if (index === 2) {
        currentData.dragPoints[1] = [24, 0]; // 第一组第二个拖拽点设置到最后(24)
        currentData.symbolSizes[1] = 0; // 拖拽点大小设置为 0
        currentData.dragPoints[0] = [0, 0]; // 第二组第一个拖拽点设置为开始(0)
        currentData.dragPoints[1] = [24, 0]; // 第二组第二个拖拽点设置到最后(24)
        currentData.symbolSizes[0] = 0; // 两个拖拽点大小设置为 0
        currentData.symbolSizes[1] = 0;
    }

    updateChartData(chart, { params, position: pointInData }); // 更新图表
};

const setSingleChartOption = (chart: echarts.ECharts, index: number) => {
    setChartInstance(chart, index);
    const option = getChartOption(chart, index);
    chart.setOption(option);
    window.addEventListener("resize", () => updatePosition(chart));
    chart.getZr().on("click", onChartClick(chart, index));

    setTimeout(() => {
        setDragPointer(chart, index);
    }, 0);
};

// 设置拖拽点, 以及拖拽事件
const setDragPointer = (chart: echarts.ECharts, index: number) => {
    const { dragPoints, symbolSizes: size } = getChartById(chart.id);
    // console.log(dragPoints);

    try {
        // if (index != 0) return;
        chart.setOption({
            graphic: dragPoints.map((item, dataIndex) => ({
                type: "image",
                position: chart.convertToPixel("grid", item),
                style: {
                    image: dataIndex === 0 ? startIcon : endIcon,
                    width: size[dataIndex],
                    height: size[dataIndex],
                    x: -size[dataIndex] / 2,
                    y: -size[dataIndex] / 2,
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
    } catch (error) {
        console.log(error);
    }
};

// 直接将额外数据挂载 echarts 实例上
// const setExtraData = (chart: echarts.ECharts, index: number) => {
//     // 第一组默认拖拽点是 [0, 0] 和 [12, 0], 其他都是 [0,0] 和 [0, 0]
//     const dragPoints =
//         index === 0
//             ? [
//                   [0, 0],
//                   [12, 0],
//               ]
//             : [
//                   [0, 0],
//                   [0, 0],
//               ];
//     const symbolSizes = index === 0 ? [symbolSize, symbolSize] : [0, 0];
//     chart.extraData = {
//         dragPoints,
//         symbolSizes,
//     };
// };

// 初始化图表
onMounted(() => {
    props.timeRange.map((item, index) => {
        const chart = echarts.init(document.getElementById("chartRef" + index) as HTMLElement);
        // setExtraData(chart, index);
        setSingleChartOption(chart, index);
        chartList.value.push(chart);
    });
});
</script>
