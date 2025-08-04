# 启动转录组 Plumber API
library(plumber)

# 创建 plumber 实例
pr <- pr("transcriptome_plumber_api.R")

# 启用文档
pr$setDocs(TRUE)

# 运行 API
cat("Starting Transcriptome Plumber API on port 8002...\n")
cat("API documentation will be available at: http://localhost:8002/__docs__/\n")
pr$run(port = 8002, host = "0.0.0.0", docs = TRUE)