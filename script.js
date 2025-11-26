// GPU核心数据字典
const gpuData = {
    'A100': {
        name: 'NVIDIA A100',
        architecture: 'Ampere',
        cudaCores: 6912,
        tensorCores: 432,
        baseClock: '1.41GHz',
        boostClock: '1.76GHz',
        memoryBandwidth: '1555 GB/s'
    },
    'H100': {
        name: 'NVIDIA H100',
        architecture: 'Hopper',
        cudaCores: 16896,
        tensorCores: 132,
        baseClock: '1.35GHz',
        boostClock: '1.85GHz',
        memoryBandwidth: '3350 GB/s'
    },
    'H200': {
        name: 'NVIDIA H200',
        architecture: 'Hopper',
        cudaCores: 16896,
        tensorCores: 132,
        baseClock: '1.35GHz',
        boostClock: '1.85GHz',
        memoryBandwidth: '4800 GB/s'
    },
    'A40': {
        name: 'NVIDIA A40',
        architecture: 'Ampere',
        cudaCores: 10752,
        tensorCores: 336,
        baseClock: '1.35GHz',
        boostClock: '1.74GHz',
        memoryBandwidth: '696 GB/s'
    },
    'A10': {
        name: 'NVIDIA A10',
        architecture: 'Ampere',
        cudaCores: 6144,
        tensorCores: 192,
        baseClock: '1.35GHz',
        boostClock: '1.72GHz',
        memoryBandwidth: '336 GB/s'
    },
    'L40S': {
        name: 'NVIDIA L40S',
        architecture: 'Ada Lovelace',
        cudaCores: 18176,
        tensorCores: 568,
        baseClock: '1.9GHz',
        boostClock: '2.52GHz',
        memoryBandwidth: '864 GB/s'
    },
    'RTX 4090': {
        name: 'NVIDIA RTX 4090',
        architecture: 'Ada Lovelace',
        cudaCores: 16384,
        tensorCores: 512,
        baseClock: '2.23GHz',
        boostClock: '2.52GHz',
        memoryBandwidth: '1008 GB/s'
    },
    'A800': {
        name: 'NVIDIA A800',
        architecture: 'Ampere',
        cudaCores: 6912,
        tensorCores: 432,
        baseClock: '1.41GHz',
        boostClock: '1.76GHz',
        memoryBandwidth: '1555 GB/s'
    }
};

// 对比列表
let compareList = [];

// DOM元素
const gpuSelect = document.getElementById('gpu-select');
const precisionSelect = document.getElementById('precision-select');
const calculateBtn = document.getElementById('calculate-btn');
const compareBtn = document.getElementById('compare-btn');
const clearCompareBtn = document.getElementById('clear-compare-btn');
const currentResult = document.getElementById('current-result');
const compareItems = document.getElementById('compare-items');

// 图表实例
let barChart = null;
let radarChart = null;

// 初始化GPU选择下拉框
function initGpuSelect() {
    Object.keys(gpuData).forEach(gpuKey => {
        const option = document.createElement('option');
        option.value = gpuKey;
        option.textContent = gpuData[gpuKey].name;
        gpuSelect.appendChild(option);
    });
}

// 计算算力
function calculatePerformance(gpuKey, precision) {
    const gpu = gpuData[gpuKey];
    const clockSpeed = parseFloat(gpu.boostClock.replace('GHz', ''));
    let performance = 0;

    switch (precision) {
        case 'FP32':
            performance = gpu.cudaCores * clockSpeed * 2;
            break;
        case 'FP64':
            if (gpu.architecture === 'Hopper') {
                performance = gpu.cudaCores * clockSpeed * 2 * 0.25;
            } else {
                performance = gpu.cudaCores * clockSpeed * 2 * 0.125;
            }
            break;
        case 'FP16':
        case 'BF16':
            if (gpu.architecture === 'Hopper') {
                performance = gpu.tensorCores * clockSpeed * 128;
            } else {
                performance = gpu.tensorCores * clockSpeed * 64;
            }
            break;
        case 'INT8':
            if (gpu.architecture === 'Hopper') {
                performance = gpu.tensorCores * clockSpeed * 256;
            } else {
                performance = gpu.tensorCores * clockSpeed * 128;
            }
            break;
        case 'INT4':
            if (gpu.architecture === 'Hopper') {
                performance = gpu.tensorCores * clockSpeed * 512;
            } else if (gpu.architecture === 'Ada Lovelace') {
                performance = gpu.tensorCores * clockSpeed * 256;
            } else {
                performance = gpu.tensorCores * clockSpeed * 128;
            }
            break;
    }

    const unit = precision.includes('INT') ? 'TOPS' : 'TFLOPS';
    return { value: performance.toFixed(2), unit };
}

// 更新当前结果
function updateCurrentResult() {
    const selectedGpu = gpuSelect.value;
    const selectedPrecision = precisionSelect.value;
    const gpu = gpuData[selectedGpu];
    const performance = calculatePerformance(selectedGpu, selectedPrecision);

    currentResult.innerHTML = `
        <h3>${gpu.name}</h3>
        <p><strong>架构:</strong> ${gpu.architecture}</p>
        <p><strong>CUDA Cores:</strong> ${gpu.cudaCores}</p>
        <p><strong>Tensor Cores:</strong> ${gpu.tensorCores}</p>
        <p><strong>Boost Clock:</strong> ${gpu.boostClock}</p>
        <p><strong>内存带宽:</strong> ${gpu.memoryBandwidth}</p>
        <p style="color: #667eea; font-size: 1.2rem; margin-top: 15px;">
            <strong>${selectedPrecision} 算力:</strong> ${performance.value} ${performance.unit}
        </p>
    `;
}

// 添加到对比列表
function addToCompareList() {
    const selectedGpu = gpuSelect.value;
    const selectedPrecision = precisionSelect.value;
    const gpu = gpuData[selectedGpu];
    const performance = calculatePerformance(selectedGpu, selectedPrecision);

    const existingIndex = compareList.findIndex(item => item.gpuKey === selectedGpu);
    if (existingIndex !== -1) {
        compareList[existingIndex] = {
            gpuKey: selectedGpu,
            gpuName: gpu.name,
            precision: selectedPrecision,
            performance: performance
        };
    } else {
        compareList.push({
            gpuKey: selectedGpu,
            gpuName: gpu.name,
            precision: selectedPrecision,
            performance: performance
        });
    }

    updateCompareListDisplay();
    updateCharts();
}

// 更新对比列表显示
function updateCompareListDisplay() {
    if (compareList.length === 0) {
        compareItems.innerHTML = '<p>暂无对比项，请添加GPU进行对比</p>';
        return;
    }

    compareItems.innerHTML = compareList.map((item, index) => `
        <div class="compare-item">
            <h3>${item.gpuName}</h3>
            <p><strong>精度:</strong> ${item.precision}</p>
            <p><strong>算力:</strong> ${item.performance.value} ${item.performance.unit}</p>
            <button onclick="removeFromCompareList(${index})" style="margin-top: 10px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                移除
            </button>
        </div>
    `).join('');
}

// 从对比列表移除
function removeFromCompareList(index) {
    compareList.splice(index, 1);
    updateCompareListDisplay();
    updateCharts();
}

// 清除对比列表
function clearCompareList() {
    compareList = [];
    updateCompareListDisplay();
    updateCharts();
}

// 更新图表
function updateCharts() {
    updateBarChart();
    updateRadarChart();
}

// 更新柱状图
function updateBarChart() {
    const ctx = document.getElementById('bar-chart').getContext('2d');
    const labels = compareList.map(item => item.gpuName);
    const data = compareList.map(item => parseFloat(item.performance.value));
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#f0932b'];

    if (barChart) {
        barChart.destroy();
    }

    if (labels.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `算力 (${compareList[0].performance.unit})`,
                data: data,
                backgroundColor: colors.slice(0, compareList.length),
                borderColor: colors.slice(0, compareList.length).map(c => c.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            maxBarThickness: 60,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '算力 (1000 TFLOPS/1000 TOPS)'
                    },
                    ticks: {
                        stepSize: 1000,
                        callback: function(value) {
                            return (value / 1000).toFixed(1);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'GPU型号'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: false,
                        callback: function(value) {
                            // 缩短过长的GPU型号名称
                            const maxLength = 15;
                            return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = compareList[context.dataIndex];
                            return `${item.gpuName} (${item.precision}): ${context.parsed.y} ${item.performance.unit}`;
                        }
                    }
                }
            }
        }
    });
}

// 更新雷达图
function updateRadarChart() {
    const ctx = document.getElementById('radar-chart').getContext('2d');
    const precisions = ['FP32', 'FP64', 'FP16', 'BF16', 'INT8', 'INT4'];

    const datasets = compareList.map((item, index) => {
        const gpuKey = item.gpuKey;
        const data = precisions.map(precision => {
            const perf = calculatePerformance(gpuKey, precision);
            return parseFloat(perf.value);
        });

        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#f0932b'];
        const color = colors[index % colors.length];

        return {
            label: item.gpuName,
            data: data,
            backgroundColor: color + '20',
            borderColor: color,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: color
        };
    });

    if (radarChart) {
        radarChart.destroy();
    }

    if (datasets.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: precisions,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '算力 (TFLOPS/TOPS)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// 事件监听
function initEventListeners() {
    calculateBtn.addEventListener('click', updateCurrentResult);
    compareBtn.addEventListener('click', addToCompareList);
    clearCompareBtn.addEventListener('click', clearCompareList);
    gpuSelect.addEventListener('change', updateCurrentResult);
    precisionSelect.addEventListener('change', updateCurrentResult);
}

// 初始化
function init() {
    initGpuSelect();
    initEventListeners();
    updateCurrentResult();
}

// 页面加载完成后初始化
window.addEventListener('load', init);
