# 启动修复版 Plumber API 的 R 脚本

cat("=== 启动修复版 Plumber API ===\n")

# 加载 plumber
library(plumber)

# 创建 API
pr <- pr("phospho_plumber_api_fixed.R")

# 启动服务
cat("在端口 8001 启动 API 服务...\n")
pr_run(pr, port = 8001, host = "0.0.0.0")