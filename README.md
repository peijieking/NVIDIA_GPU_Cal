# GPU算力计算器

一个基于HTML和JavaScript的GPU算力计算器，支持多种NVIDIA GPU型号在不同计算精度下的算力计算与可视化对比。

## 功能特性

### 核心功能
- **多GPU支持**：支持A100、H100、H200、A40、A10、L40S、RTX 4090、A800等主流NVIDIA GPU型号
- **多精度计算**：支持FP32、FP64、FP16、BF16、INT8、INT4等多种计算精度
- **架构优化**：针对Hopper、Ampere、Ada Lovelace架构的Tensor Core混合精度算力进行优化计算
- **数据分离**：核心GPU数据存储在独立字典中，实现界面与数据分离

### 可视化功能
- **柱状图**：直观对比不同计算精度下的算力差异
- **雷达图**：展示各精度算力的相对分布情况
- **数据表格**：详细列出所有计算结果

## 技术实现

### 前端技术栈
- **HTML5**：页面结构与布局
- **CSS3**：响应式设计与视觉美化
- **JavaScript (ES6+)**：核心逻辑与交互
- **Chart.js**：图表可视化库（CDN引入）

### 核心设计

#### 数据字典设计
```javascript
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
    // ... 其他GPU数据
};
```

#### 算力计算公式
- **FP32算力**：`CUDA核心数 × Boost频率 × 1e9 / 1e12`（TFLOPS）
- **FP64算力**：Ampere/Hopper架构为FP32的1/2，其他架构为1/32
- **Tensor Core算力**：根据架构和精度不同，每个Tensor Core每周期可执行的操作数不同
  - Hopper架构：FP16/BF16=64，INT8=128，INT4=256
  - Ampere/Ada架构：FP16/BF16=32，INT8=64，INT4=128

## 使用方法

### 快速开始
1. 直接在浏览器中打开 `index.html` 文件
2. 或使用本地服务器运行：
   ```bash
   python -m http.server 8000
   # 然后访问 http://localhost:8000
   ```

### 操作步骤
1. **选择GPU型号**：从多选列表中选择一个或多个要计算的GPU型号（按住Ctrl/Cmd可多选）
2. **选择计算精度**：从多选列表中选择一个或多个计算精度（按住Ctrl/Cmd可多选）
3. **点击计算**：系统会自动计算并更新图表和表格

## 界面说明

### 控制面板
- GPU型号选择：支持8种主流NVIDIA GPU
- 计算精度选择：支持6种计算精度
- 计算按钮：触发算力计算

### 可视化区域
- **柱状图**：对比显示多个GPU在不同精度下的绝对算力值

### 结果表格
- 详细列出GPU型号、计算精度和算力值
- 不同精度使用不同颜色标识
- 自动区分TFLOPS（浮点）和TOPS（整数）

## 响应式设计

- **桌面端**：双列图表布局，完整功能展示
- **平板端**：自适应布局调整
- **移动端**：单列布局，优化触控体验

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 数据更新

如需添加新的GPU型号或更新现有数据，请修改 `script.js` 中的 `gpuData` 字典：

```javascript
"新GPU型号": {
    name: "GPU名称",
    architecture: "架构名称",
    cudaCores: 核心数量,
    tensorCores: Tensor Core数量,
    baseClock: 基础频率(GHz),
    boostClock: Boost频率(GHz),
    memory: "内存配置"
}
```

## 性能优化

- 使用Chart.js的响应式配置
- 数据计算与DOM更新分离
- 事件委托与防抖处理
- CSS Grid和Flexbox布局优化

## License

MIT License

## 致谢

- [Chart.js](https://www.chartjs.org/) - 图表可视化库
- NVIDIA官方文档 - GPU技术参数参考
