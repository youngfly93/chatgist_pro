#!/usr/bin/env Rscript

# 禁用 renv
Sys.setenv(RENV_CONFIG_ACTIVATED = FALSE)

# 启动 Plumber API
library(plumber)

# 配置
API_PORT <- 8001
API_HOST <- "0.0.0.0"

cat("===========================================\n")
cat("GIST Phosphoproteomics Plumber API Server\n")
cat("===========================================\n")
cat(sprintf("Starting API server on %s:%d\n", API_HOST, API_PORT))
cat("\n")

# 创建并启动 plumber API
pr <- plumb("phospho_plumber_api_norenv.R")

# 配置 CORS
pr$registerHooks(
  list(
    preroute = function(req, res) {
      res$setHeader("Access-Control-Allow-Origin", "*")
      res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      
      if (req$REQUEST_METHOD == "OPTIONS") {
        res$status <- 200
        return(list())
      }
    }
  )
)

# 启动服务器
pr$run(
  host = API_HOST,
  port = API_PORT,
  swagger = TRUE
)