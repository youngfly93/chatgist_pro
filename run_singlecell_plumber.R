# Single-cell Plumber API Runner
# 启动单细胞分析 Plumber API 服务器

# 禁用 renv
Sys.setenv(RENV_CONFIG_ACTIVATED = FALSE)

# 设置工作目录
cat("当前工作目录:", getwd(), "\n")

# 检查必要文件
api_file <- "singlecell_plumber_api.R"
if (!file.exists(api_file)) {
  stop(paste("API文件不存在:", api_file))
}

# 检查数据集文件
datasets <- c(
  "ChatGIST_ssc/In_house_ssc_reduce.RDS",
  "ChatGIST_ssc/GSE254762_ssc_reduce.RDS", 
  "ChatGIST_ssc/GSE162115_ssc_reduce.RDS"
)

available_datasets <- datasets[file.exists(datasets)]
if (length(available_datasets) == 0) {
  stop("未找到任何单细胞数据集文件")
}

cat("可用数据集:\n")
for (dataset in available_datasets) {
  cat("  -", dataset, "\n")
}

# 加载 plumber
library(plumber)

# 创建并启动 API
tryCatch({
  cat("=== 启动 Single-cell Plumber API ===\n")
  cat("端口: 8003\n")
  cat("API文档: http://localhost:8003/__docs__/\n")
  cat("健康检查: http://localhost:8003/singlecell/health\n")
  
  # 创建 plumber API
  pr <- plumb(api_file)
  
  # 启动服务器
  pr$run(host = "0.0.0.0", port = 8003, swagger = TRUE)
  
}, error = function(e) {
  cat("启动失败:", e$message, "\n")
  quit(status = 1)
})