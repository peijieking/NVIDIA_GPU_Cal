// GPU核心数据字典 - 界面与数据分离
const gpuData = {
    "A100": {
        name: "A100",
        architecture: "Ampere",
        cudaCores: 6912,
        tensorCores: 432,
        baseClock: 1.095, // GHz
        boostClock: 1.410, // GHz
        memory: "80GB HBM2e"
    },
    "H100": {
        name: "H100",
        architecture: "Hopper",
        cudaCores: 16896,
        tensorCores: 132,
        baseClock: 1.075, // GHz
        boostClock: 1.700, // GHz
        memory: "80GB HBM3"
    },
    "H200": {
        name: "H200",
        architecture: "Hopper",
        cudaCores: 16896,
        tensorCores: 132,
        baseClock: 1.075, // GHz
        boostClock: 1.700, // GHz
        memory: "141GB HBM3e"
    },
    "A40": {
        name: "A40",
        architecture: "Ampere",
        cudaCores: 10752,
        tensorCores: 336,
        baseClock: 1.305, // GHz
        boostClock: 1.740, // GHz
        memory: "48GB GDDR6"
    },
    "A10": {
        name: "A10",
        architecture: "Ampere",
        cudaCores: 6144,
        tensorCores: 192,
        baseClock: 1.140, // GHz
        boostClock: 1.700, // GHz
        memory: "24GB GDDR6"
    },
    "L40S": {
        name: "L40S",
        architecture: "Ada Lovelace",
        cudaCores: 18176,
        tensorCores: 568,
        baseClock: 1.335, // GHz
        boostClock: 2.235, // GHz
        memory: "48GB GDDR6"
    },
    "RTX 4090": {
        name: "RTX 4090",
        architecture: "Ada Lovelace",
        cudaCores: 16384,
        tensorCores: 512,
        baseClock: 2.230, // GHz
        boostClock: 2.520, // GHz
        memory: "24GB GDDR6X"
    },
    "A800": {
        name: "A800",
        architecture: "Ampere",
        cudaCores: 6912,
        tensorCores: 432,
        baseClock: 1.095, // GHz
        boostClock: 1.410, // GHz
        memory: "80GB HBM2e"
    }
};

// 算力计算函数
function calculatePerformance(gpuName, precision) {
    const gpu = gpuData[gpuName];
    if (!gpu) return null;

    const clock = gpu.boostClock; // 使用Boost频率
    const results = {};

    // FP32 (单精度)
    results.FP32 = (gpu.cudaCores * clock * 1e9) / 1e12; // TFLOPS

    // FP64 (双精度)
    if (gpu.architecture === "Ampere" || gpu.architecture === "Hopper") {
        // Ampere/Hopper: FP64 = FP32 / 2
        results.FP64 = results.FP32 / 2;
    } else {
        // 其他架构可能不同，这里简化处理
        results.FP64 = results.FP32 / 32;
    }

    // Tensor Core 算力计算
    if (gpu.tensorCores > 0) {
        let tensorFactor = 1;
        
        // 根据架构和精度确定Tensor Core的因子
        if (gpu.architecture === "Hopper") {
            // Hopper架构 Tensor Core 支持更多精度组合
            tensorFactor = {
                "FP16": 64,  // Hopper: 每个Tensor Core per cycle 64 FP16 operations
                "BF16": 64,  // 同上
                "INT8": 128, // Hopper: 每个Tensor Core per cycle 128 INT8 operations
                "INT4": 256  // Hopper: 每个Tensor Core per cycle 256 INT4 operations
            };
        } else if (gpu.architecture === "Ampere" || gpu.architecture === "Ada Lovelace") {
            // Ampere/Ada Lovelace架构
            tensorFactor = {
                "FP16": 32,  // Ampere: 每个Tensor Core per cycle 32 FP16 operations
                "BF16": 32,  // 同上
                "INT8": 64,  // Ampere: 每个Tensor Core per cycle 64 INT8 operations
                "INT4": 128  // Ampere: 每个Tensor Core per cycle 128 INT4 operations
            };
        }

        // 计算Tensor Core算力
        if (typeof tensorFactor === "object") {
            for (const prec in tensorFactor) {
                if (tensorFactor.hasOwnProperty(prec)) {
                    results[prec] = (gpu.tensorCores * clock * 1e9 * tensorFactor[prec]) / 1e12;
                }
            }
        }
    }

    // 如果只需要特定精度
    if (precision !== "all" && results[precision]) {
        return { [precision]: results[precision] };
    }

    return results;
}

// 图表对象
let barChart = null;

// 初始化图表
function initCharts() {
    // 柱状图
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'GPU算力对比 (TFLOPS/TOPS)'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '算力 (TFLOPS/TOPS)'
                    },
                    ticks: {
                        stepSize: 200,
                        callback: function(value) {
                            return value;
                        }
                    }
                }
            }
        }
    });
}

// 更新图表
function updateCharts(selectedGPUs, selectedPrecisions) {
    if (selectedGPUs.length === 0 || selectedPrecisions.length === 0) return;

    // 获取所有选中精度的算力数据
    const datasets = [];
    const colors = [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 71, 0.6)',
        'rgba(0, 128, 0, 0.6)'
    ];

    selectedGPUs.forEach((gpuName, index) => {
        const performance = calculatePerformance(gpuName, 'all');
        if (!performance) return;

        // 只保留选中的精度
        const filteredData = {};
        selectedPrecisions.forEach(prec => {
            if (performance[prec]) {
                filteredData[prec] = performance[prec];
            }
        });

        const values = Object.values(filteredData);
        datasets.push({
            label: gpuName,
            data: values,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.6', '1'),
            borderWidth: 2
        });
    });

    // 更新柱状图
    barChart.data.labels = selectedPrecisions;
    barChart.data.datasets = datasets;
    barChart.update();
}

// 更新结果表格
function updateResultsTable(selectedGPUs, selectedPrecisions) {
    if (selectedGPUs.length === 0 || selectedPrecisions.length === 0) return;

    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    selectedGPUs.forEach(gpuName => {
        const performance = calculatePerformance(gpuName, 'all');
        if (!performance) return;

        selectedPrecisions.forEach(prec => {
            if (performance[prec]) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${gpuName}</td>
                    <td><span class="precision-badge ${prec.toLowerCase()}">${prec}</span></td>
                    <td>${performance[prec].toFixed(2)} ${prec === 'INT8' || prec === 'INT4' ? 'TOPS' : 'TFLOPS'}</td>
                `;
                tbody.appendChild(row);
            }
        });
    });
}

// 计算按钮点击事件
function handleCalculate() {
    const gpuSelect = document.getElementById('gpuSelect');
    const precisionSelect = document.getElementById('precisionSelect');
    
    // 获取选中的GPU型号
    const selectedGPUs = Array.from(gpuSelect.selectedOptions).map(option => option.value);
    // 获取选中的计算精度
    const selectedPrecisions = Array.from(precisionSelect.selectedOptions).map(option => option.value);

    updateCharts(selectedGPUs, selectedPrecisions);
    updateResultsTable(selectedGPUs, selectedPrecisions);
}

// 初始化
function init() {
    initCharts();
    
    // 默认计算所有选中的GPU和精度
    handleCalculate();
    
    // 绑定事件
    document.getElementById('calculateBtn').addEventListener('click', handleCalculate);
    document.getElementById('gpuSelect').addEventListener('change', handleCalculate);
    document.getElementById('precisionSelect').addEventListener('change', handleCalculate);
}

// 页面加载完成后初始化
window.addEventListener('load', init);