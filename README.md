# dbGIST Shiny 应用运行指南

## 系统要求
- R (建议版本 4.0 或更高)
- RStudio (可选，但推荐)

## 安装步骤

### 1. 安装依赖包

在 R 控制台中运行以下命令安装所有依赖：

```r
source("install_dependencies.R")
```

这个脚本会自动安装所有需要的包。安装过程可能需要 10-20 分钟，取决于您的网络速度。

### 2. 可能遇到的问题

如果某些包安装失败，可以尝试：

- **对于 CRAN 包**：
  ```r
  # 更换镜像源
  options(repos = c(CRAN = "https://mirrors.tuna.tsinghua.edu.cn/CRAN/"))
  ```

- **对于 Bioconductor 包**：
  ```r
  # 设置 Bioconductor 镜像
  options(BioC_mirror = "https://mirrors.tuna.tsinghua.edu.cn/bioconductor")
  ```

### 3. 运行应用

确保所有依赖安装完成后，运行：

```r
# 方法1：在 R 控制台中
shiny::runApp()

# 方法2：在 RStudio 中
# 打开 ui.R 或 server.R，点击 "Run App" 按钮

# 方法3：指定端口和主机
shiny::runApp(port = 3838, host = "0.0.0.0")
```

## 应用功能

这个应用提供以下功能：

1. **基因表达探索**：查看单个基因在不同临床参数下的表达情况
2. **基因相关性分析**：分析两个基因之间的表达相关性
3. **药物耐药分析**：探索与伊马替尼耐药相关的基因
4. **治疗前后比较**：比较治疗前后的基因表达变化
5. **通路分析**：基因与信号通路、免疫细胞的相关性分析

## 使用提示

- 首次运行时，应用会加载多个大型数据文件，可能需要等待几秒钟
- 输入基因名称时使用标准的基因符号（如 TP53, EGFR 等）
- 应用会自动验证输入的基因名称是否有效

## 故障排除

如果应用无法启动：

1. 确保所有依赖包都已安装
2. 检查数据文件是否存在于 `original/` 目录
3. 查看 R 控制台的错误信息

如果某些功能无法使用，可能是相关数据文件缺失。请确保以下文件存在：
- `original/dbGIST_matrix(2).Rdata`
- `original/dbGIST_ImmuneCell.RData`
- `original/dbGIST_msigdb.RData`
- `original/dbGIST_wikipathways.RData`