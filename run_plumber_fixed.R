# 直接运行修复版 Plumber API，跳过所有初始化

# 禁用 renv
Sys.setenv(RENV_CONFIG_ACTIVATED = FALSE)

# 设置选项以跳过任何启动配置
options(renv.activate.prompt = FALSE)

# 加载并运行 Plumber
cat("=== 启动修复版 Plumber API (无 renv) ===\n")
library(plumber)

# 创建并运行 API
pr <- pr("phospho_plumber_api_fixed.R")
pr_run(pr, port = 8001, host = "0.0.0.0")