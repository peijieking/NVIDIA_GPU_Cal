# GPU算力计算器

一个基于HTML、JavaScript和Chart.js的GPU算力计算器，支持多种NVIDIA GPU型号在不同计算精度下的算力计算和可视化对比。

## 功能特性

### 核心功能
- **多GPU型号支持**：支持A100、H100、H200、A40、A10、L40S、RTX 4090、A800等主流GPU型号
- **多精度计算**：支持FP32、FP64、FP16、BF16、INT8、INT4等多种计算精度
- **Tensor Core支持**：包含Hopper/Ampere架构Tensor Core混合精度算力计算
- **数据与界面分离**：核心数据存储在独立的JSON结构中，便于维护和扩展

### 可视化功能
- **柱状图对比**：直观对比不同GPU在相同精度下的算力差异
- **雷达图对比**：全面展示单GPU在不同精度下的算力分布
- **交互式图表**：支持鼠标悬停查看详细数据，图表可缩放和响应式调整

### 用户体验
- **简洁界面**：现代化设计，符合用户操作习惯
- **批量计算**：支持同时选择多个GPU型号进行对比
- **灵活选择**：可自由选择需要查看的计算精度类型
- **响应式布局**：适配桌面、平板和移动设备

## 技术栈

- **HTML5**：页面结构和语义化标签
- **CSS3**：现代化样式设计和动画效果
- **JavaScript ES6+**：核心逻辑和交互功能
- **Chart.js**：图表可视化库（v4.4.0）
- **Chart.js Radar Plugin**：雷达图扩展

## 项目结构

```
NVIDIA_GPU_Cal/
├── index.html          # 主页面文件
├── gpu-data.js         # GPU核心数据存储
├── gpu-calculator.js   # 算力计算核心逻辑
├── styles.css          # 界面样式文件
└── README.md           # 项目说明文档
```

## 使用方法

### 本地运行

1. **直接打开**：下载项目文件后，直接在浏览器中打开 `index.html` 文件
2. **本地服务器**：推荐使用本地服务器运行以获得最佳体验
   ```bash
   # 使用Python 3
   python -m http.server 8000
   
   # 使用Node.js
   npx serve .
   
   # 使用PHP
   php -S localhost:8000
   ```

### 操作步骤

1. **选择GPU型号**：在左侧多选框中选择一个或多个要比较的GPU型号
2. **选择计算精度**：在中间多选框中选择要查看的计算精度类型
3. **计算算力**：点击「计算算力」按钮，系统将自动计算并显示结果
4. **查看可视化**：在页面下方查看柱状图和雷达图对比
5. **重置**：点击「重置」按钮恢复默认设置

## GPU数据说明

### 数据结构

每个GPU型号包含以下核心参数：
- `name`: GPU显示名称
- `architecture`: GPU架构（Hopper/Ampere/Ada Lovelace）
- `cudaCores`: CUDA核心数量
- `tensorCores`: Tensor核心数量
- `baseClock`: 基础频率（GHz）
- `boostClock`: 加速频率（GHz）
- `memory`: 内存容量
- `memoryBandwidth`: 内存带宽（GB/s）

### 算力计算公式

#### 基础算力
- **FP32**: `(CUDA Cores × Boost Clock × 2) / 1000`
- **FP64**: 根据架构不同，为FP32的1/2、1/4或1/8
- **FP16/BF16**: 根据架构不同，为FP32的2倍、4倍或8倍
- **INT8**: 根据架构不同，为FP32的4倍、8倍或16倍
- **INT4**: 根据架构不同，为FP32的8倍、16倍或32倍

#### Tensor Core算力
- **Hopper架构**: 每个Tensor Core周期处理2048个FP16/BF16操作
- **Ada Lovelace架构**: 每个Tensor Core周期处理1024个FP16/BF16操作
- **Ampere架构**: 每个Tensor Core周期处理1024个FP16/BF16操作

## 支持的GPU型号

| GPU型号 | 架构 | CUDA Cores | Tensor Cores | 内存 | 内存带宽 |
|---------|------|------------|--------------|------|----------|
| A100 | Ampere | 6912 | 432 | 80GB HBM2e | 2039 GB/s |
| H100 | Hopper | 16896 | 132 | 80GB HBM3 | 3350 GB/s |
| H200 | Hopper | 16896 | 132 | 160GB HBM3e | 4800 GB/s |
| A40 | Ampere | 10752 | 672 | 48GB GDDR6 | 696 GB/s |
| A10 | Ampere | 6144 | 384 | 24GB GDDR6 | 600 GB/s |
| L40S | Ada Lovelace | 18176 | 568 | 48GB GDDR6 | 1330 GB/s |
| RTX 4090 | Ada Lovelace | 16384 | 512 | 24GB GDDR6X | 1008 GB/s |
| A800 | Ampere | 6912 | 432 | 80GB HBM2e | 2039 GB/s |

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 扩展功能

### 添加新GPU型号

在 `gpu-data.js` 文件中添加新的GPU数据：

```javascript
"NEW_GPU": {
    name: "NVIDIA New GPU",
    architecture: "Ampere",
    cudaCores: 10000,
    tensorCores: 500,
    baseClock: 1.500,
    boostClock: 2.000,
    memory: "48GB GDDR6",
    memoryBandwidth: 1000
}
```

### 自定义颜色主题

在 `gpu-calculator.js` 文件中修改 `getPrecisionColor()` 和 `getGPUColor()` 函数来调整颜色方案。

## 许可证

MIT License - 可自由使用、修改和分发。

## 注意事项

1. 算力结果为理论峰值性能，实际性能可能因应用程序和系统配置而有所不同
2. Tensor Core算力需要软件支持才能发挥最佳性能
3. 建议使用最新版本的浏览器以获得最佳体验
4. 项目数据可能需要定期更新以反映最新GPU型号和技术参数

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue到项目仓库
- 发送邮件至开发者邮箱

---

**更新日期**: 2024年1月
**版本**: v1.0.0