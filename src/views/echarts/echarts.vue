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
import dayjs from "dayjs";

const props = defineProps({
    timeRange: {
        type: Array<string>,
        default: [],
    },
});
const dateRange = ref<any>([]); // 当前时间范围
const activeTime = ref<any>(null); // 当前激活(点击)的时间点
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
    // const { dragPoints, symbolSizes } = getChartById(chart.id);
    // chart.setOption({
    //     graphic: dragPoints.map((item) => ({
    //         position: chart.convertToPixel("grid", item),
    //     })),
    // });
    setDragPointer(chart);
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
const updatePostion = (position, dragPoints) => {
    // 判断 activeTime 和dateRange时间比较 差值较小的一个作为替换点
    if (Array.isArray(position)) {
        const x = position[0];
        const point0X = dayjs(dateRange.value[0]).valueOf();
        const point1X = dayjs(dateRange.value[1]).valueOf();
        const isPoint0First =
            Math.abs(dayjs(activeTime.value).valueOf() - point0X) <
            Math.abs(dayjs(activeTime.value).valueOf() - point1X);
        const dataIndex = isPoint0First ? 0 : 1;
        dragPoints[dataIndex] = [x, 0];
    }
};

const updateRange = () => {
    // 更新时间范围, 判断 activeTime 和 dateRange 中的时间差值, 哪个差值小则更换 dateRange 中的时间
    const point0X = dayjs(dateRange.value[0]).valueOf();
    const point1X = dayjs(dateRange.value[1]).valueOf();
    const isPoint0First =
        Math.abs(dayjs(activeTime.value).valueOf() - point0X) < Math.abs(dayjs(activeTime.value).valueOf() - point1X);

    if (isPoint0First) {
        dateRange.value[0] = dayjs(activeTime.value).format("YYYY-MM-DD HH:mm:ss");
    } else {
        dateRange.value[1] = dayjs(activeTime.value).format("YYYY-MM-DD HH:mm:ss");
    }
};

const updateChartData = (chart: echarts.EChartsType, clickEvent = { params: {}, position: {} }) => {
    const { dragPoints, symbolSizes } = getChartById(chart.id);
    const { position } = clickEvent;
    updatePostion(position, dragPoints);
    updateRange();

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
                symbolSize: (value, params) => {
                    return symbolSizes[params.dataIndex];
                },
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
    setDragPointer(chart);
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
    const hour = newPos[0].toFixed(0);
    if (hour < 24) {
        // 拖拽的时候, 只更新小时
        updateActiveTime(dayjs(activeTime.value).set("hour", hour).format("YYYY-MM-DD HH:mm:ss"));
    }
    updateChartData(chart);
};

const updateActiveTime = (time: string) => {
    activeTime.value = time;
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
    const times = [dayjs(props.timeRange[0]).startOf("day"), dayjs(props.timeRange[0]).startOf("day")];
    activeTime.value = dayjs(props.timeRange[0]).startOf("day").add(12, "hour").format("YYYY-MM-DD HH:mm:ss");
    if (index === 0) {
        dragPoints = [
            [0, 0],
            [12, 0],
        ];
        symbolSizes = [symbolSize, symbolSize];
        // 设置为 0 点到 12 点
        times[0] = dayjs(props.timeRange[0]).startOf("day");
        times[1] = dayjs(props.timeRange[0]).startOf("day").add(12, "hour");
    }
    setTimeRange(times.map((item) => item.format("YYYY-MM-DD HH:mm:ss")));
    if (!chartDataMap.has(chart.id)) {
        chartDataMap.set(chart.id, { dragPoints, symbolSizes });
    }
};

// 设置时间
const setTimeRange = (timeRange: string[] | Date[]) => {
    dateRange.value = timeRange;
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
    const pointInData = chart.convertFromPixel({ gridIndex: 0 }, pointInPixel);
    // console.log(pointInData);

    if (!pointInData) {
        console.error("pointInData is undefined", params);
        return;
    }
    if (pointInData[0] < 0 || pointInData[0] > 24) {
        console.log("点击位置不在有效范围内");
        return; // 点击位置不在有效范围内
    }
    pointInData[0] = Math.round(pointInData[0]); // 确保 x 坐标是整数
    // 获取对应的点击点的时间
    // activeTime.value = dayjs(props.timeRange[index]).set("hour", pointInData[0]).format("YYYY-MM-DD HH:mm:ss");
    activeTime.value =
        pointInData[0] === 24
            ? dayjs(props.timeRange[index]).endOf("day").format("YYYY-MM-DD HH:mm:ss")
            : dayjs(props.timeRange[index]).set("hour", pointInData[0]).format("YYYY-MM-DD HH:mm:ss");
    /**
     *
     * 点击的是第二组, 则将第一组第二个拖拽点设置位置设置到最后(24), 且拖拽点大小设置为 0
     * 点击的是第三组, 重复第二点的逻辑, 且将第二组第一个拖拽点位置设置为开始 0 ,第二个拖拽点设置位置设置到最后(24), 两个且拖拽点大小设置为 0
     */

    /**
     * 统一处理逻辑
     *  点击的某一组, 判断当前点击的日期activeTime, 和目前激活的一组日期dateRange 是否一致,
     *  - 一致的话, 判断差值更新差值更小的拖拽点位置
     *  - 不一致, 更新差值较小的拖拽点位置,
     */
    const timeDiff0 = dayjs(activeTime.value).diff(dayjs(dateRange.value[0]));
    const timeDiff1 = dayjs(activeTime.value).diff(dayjs(dateRange.value[1]));
    const diffIndex = Math.abs(timeDiff0) < Math.abs(timeDiff1) ? 0 : 1;
    dateRange.value[diffIndex] = activeTime.value;
    console.log(activeTime.value, dateRange.value);
    // 判断dateRange 的日期是否为同一天
    if (dayjs(dateRange.value[0]).isSame(dateRange.value[1], "day")) {
        // 如果是同一天, 将其他组的拖拽点大小设置为 0, 且拖拽点位置设置为 0
        chartList.value.forEach((chart, i) => {
            const chartData = getChartById(chart.id);
            if (i === activeIndex.value) {
                // 判断 pointInData[0] 距离 dragPoints[0] 和 dragPoints[1] 的距离, 更新距离更小的拖拽点位置
                if (
                    Math.abs(pointInData[0] - chartData.dragPoints[0][0]) <
                    Math.abs(pointInData[0] - chartData.dragPoints[1][0])
                ) {
                    chartData.dragPoints[0] = [pointInData[0], 0];
                } else {
                    chartData.dragPoints[1] = [pointInData[0], 0];
                }
                chartData.symbolSizes = [20, 20];
                updateChartData(chart, { params, position: pointInData });
            } else {
                chartData.dragPoints[0] = [0, 0];
                chartData.dragPoints[1] = [0, 0];
                chartData.symbolSizes = [0, 0];
                updateChartData(chart, { params, position: [0, 0] });
            }
        });
        updateChartData(chartList.value[activeIndex.value], { params, position: pointInData }); // 更新图表
    } else {
        const startIndex = props.timeRange.findIndex((time) => dayjs(time).isSame(dateRange.value[0], "day"));
        const endIndex = props.timeRange.findIndex((time) => dayjs(time).isSame(dateRange.value[1], "day"));
        console.log(startIndex, endIndex);

        chartList.value.forEach((chart, i) => {
            const chartData = getChartById(chart.id);
            if (startIndex === i) {
                chartData.dragPoints[1] = [24, 0];
                chartData.symbolSizes = [20, 0];
                updateChartData(chart, { params, position: [24, 0] });
            } else if (endIndex === i) {
                chartData.dragPoints[0] = [0, 0];
                chartData.dragPoints[1] = [pointInData[0], 0];
                chartData.symbolSizes = [0, 20];
                updateChartData(chart, { params, position: [pointInData[0], , 0] });
            } else {
                chartData.dragPoints[0] = [0, 0];
                chartData.dragPoints[1] = [0, 0];
                chartData.symbolSizes = [0, 0];
                updateChartData(chart, { params, position: [0, 0] });
            }
        });
        chartList.value.forEach((chart, i) => {
            const chartData = getChartById(chart.id);
            console.log(chartData);
        });

        // 先全部重置, 后续测试看看有没有问题
        // chartList.value.forEach((chart, i) => {
        //     const { dragPoints, symbolSizes } = getChartById(chart.id);
        //     console.log(dragPoints, symbolSizes);
        //     dragPoints[0] = [0, 0];
        //     dragPoints[1] = [0, 0];
        //     symbolSizes[0] = 0;
        //     symbolSizes[1] = 0;
        //     updateChartData(chart);
        // });

        // console.log(props.timeRange);
        // const startIndex = props.timeRange.findIndex((time) => dayjs(time).isSame(dateRange.value[0], "day"));
        // const endIndex = props.timeRange.findIndex((time) => dayjs(time).isSame(dateRange.value[1], "day"));
        // console.log(startIndex, endIndex);
        // if (startIndex === -1 || endIndex === -1) {
        //     console.log("时间有问题啊");
        //     return;
        // }

        // const startData = getChartById(chartList.value[startIndex].id);
        // const endData = getChartById(chartList.value[endIndex].id);
        // console.log(startData, endData);

        // // startData.dragPoints[0] = [pointInData[0], 0];
        // // startData.dragPoints[1] = [pointInData[0], 0];
        // // endData.dragPoints[1] = [pointInData[0], 0];
        // // startData.symbolSizes[1] = 20;
        // // endData.symbolSizes[0] = 20;

        // updateChartData(chartList.value[startIndex], { params, position: [0, 0] });
        // updateChartData(chartList.value[endIndex], { params, position: [0, 0] });
    }

    // if (index === 0) {
    //     // 如果点击的是第一组, 将其余组的拖拽点设置为 0, 且拖拽点大小设置为 0, 第一组的拖拽点大小设置为 20
    //     currentData.symbolSizes = [20, 20];
    //     // 找到其余组的 echart 实例
    //     const chart1 = chartList.value[index + 1];
    //     const chartData1 = getChartById(chart1.id);
    //     chartData1.dragPoints[0] = [0, 0]; // 第一组第一个拖拽点设置到开始(0)
    //     chartData1.dragPoints[1] = [0, 0]; // 第一组第二个拖拽点设置到最后(24)
    //     chartData1.symbolSizes = [0, 0]; // 拖拽点大小设置为 0
    //     updateChartData(chart1, { params, position: [0, 0] }); // 更新图表
    // } else if (index === 1) {
    //     const chart0 = chartList.value[index - 1];
    //     const chartData1 = getChartById(chart0.id);
    //     chartData1.dragPoints[1] = [24, 0]; // 第一组第二个拖拽点设置到最后(24)
    //     chartData1.symbolSizes[1] = 0; // 拖拽点大小设置为 0
    //     currentData.symbolSizes = [0, 20]; // 第二组第一个拖拽点设置为开始(0)
    //     updateChartData(chart0, { params, position: [24, 0] }); // 更新图表
    // } else if (index === 2) {
    //     // const chartX = chartList.value[index - 1];
    //     // const chartDataX = getChartById(chartX.id);
    //     // chartDataX.dragPoints[1] = [24, 0]; // 第一组第二个拖拽点设置到最后(24)
    //     // chartDataX.symbolSizes[1] = 0; // 拖拽点大小设置为 0
    //     // currentData.dragPoints[0] = [0, 0]; // 第二组第一个拖拽点设置为开始(0)
    //     // currentData.dragPoints[1] = [24, 0]; // 第二组第二个拖拽点设置到最后(24)
    // }
    // updateChartData(chart, { params, position: pointInData }); // 更新图表
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
const setDragPointer = (chart: echarts.ECharts) => {
    const { dragPoints, symbolSizes } = getChartById(chart.id);
    try {
        chart.setOption({
            graphic: dragPoints.map((item, dataIndex) => ({
                type: "image",
                position: chart.convertToPixel("grid", item),
                style: {
                    image: symbolSizes[dataIndex] !== 0 ? (dataIndex === 0 ? startIcon : endIcon) : "",
                    width: symbolSizes[dataIndex],
                    height: symbolSizes[dataIndex],
                    x: -symbolSizes[dataIndex] / 2,
                    y: -symbolSizes[dataIndex] / 2,
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
