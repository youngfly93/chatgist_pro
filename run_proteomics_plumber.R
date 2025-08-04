# 启动GIST蛋白质组学分析 Plumber API服务
# 端口: 8004

library(plumber)

cat("=== 启动GIST蛋白质组学分析API ===\n")
cat("端口: 8004\n")
cat("API文档: http://localhost:8004/__docs__/\n")

# 设置工作目录
setwd("F:/work/claude_code/chatgist_pro")

# 创建并运行API
api <- plumb("proteomics_plumber_api.R")

# 启用CORS
api$filter("cors", function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
  res$setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
})

# 启动服务器
cat("🚀 启动蛋白质组学分析API服务器...\n")
api$run(host = "0.0.0.0", port = 8004)