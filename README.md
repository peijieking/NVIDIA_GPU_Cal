添加一个Python tkinter ttk GPU算力计算器功能，实现对多种型号GPU算力的计算与可视化。
## 基本需求
- 将核心数据（cuda core/tensor core）存储在字典中，做到界面与数据分离。
- 支持A100、H100、H200、A40、A10、L40S、RTX 4090、A800这些GPU型号的算力计算。
- 能够计算FP32、FP64、FP16、BF16、INT8、INT4等计算精度下的算力，包含Hopper/Ampere架构Tensor Core混合精度算力。
## 优化需求
- 使用图表可视化方式，通过柱状图和雷达图来对比不同型号、不同精度下的GPU算力。
- 采用tkinter ttk库进行界面设计，确保界面简洁易用，符合用户操作习惯。 
