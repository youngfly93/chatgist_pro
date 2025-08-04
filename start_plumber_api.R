#!/usr/bin/env Rscript

# GIST Phosphoproteomics Plumber API 启动脚本
# 用于启动 plumber API 服务器

# 确保不加载 renv
if (file.exists("renv/activate.R")) {
  cat("Skipping renv activation...\n")
}

# 加载 plumber
tryCatch({
  library(plumber)
}, error = function(e) {
  cat("Error loading plumber package. Please install it with:\n")
  cat("install.packages('plumber')\n")
  quit(status = 1)
})

# 配置
API_PORT <- 8001
API_HOST <- "0.0.0.0"  # 监听所有接口

cat("===========================================\n")
cat("GIST Phosphoproteomics Plumber API Server\n")
cat("===========================================\n")
cat(sprintf("Starting API server on %s:%d\n", API_HOST, API_PORT))
cat("\n")

# 创建并启动 plumber API
pr <- plumb("phospho_plumber_api.R")

# 配置 CORS（允许前端访问）
pr$registerHooks(
  list(
    preroute = function(req, res) {
      # 处理 CORS
      res$setHeader("Access-Control-Allow-Origin", "*")
      res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      
      # 处理 OPTIONS 请求（预检请求）
      if (req$REQUEST_METHOD == "OPTIONS") {
        res$status <- 200
        return(list())
      }
    }
  )
)

# 添加全局错误处理
pr$setErrorHandler(function(req, res, err) {
  res$status <- 500
  list(
    status = "error",
    message = "服务器内部错误",
    error = as.character(err),
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
})

# 启动服务器
tryCatch({
  pr$run(
    host = API_HOST,
    port = API_PORT,
    swagger = TRUE  # 启用 Swagger UI
  )
}, error = function(e) {
  cat("\n错误: 无法启动 API 服务器\n")
  cat(sprintf("详情: %s\n", e$message))
  
  # 检查常见问题
  if (grepl("address already in use", e$message, ignore.case = TRUE)) {
    cat(sprintf("\n端口 %d 已被占用。请检查是否有其他服务正在使用该端口。\n", API_PORT))
    cat("可以尝试以下命令查看端口占用情况：\n")
    if (Sys.info()["sysname"] == "Windows") {
      cat(sprintf("  netstat -ano | findstr :%d\n", API_PORT))
    } else {
      cat(sprintf("  lsof -i :%d\n", API_PORT))
    }
  }
  
  quit(status = 1)
})