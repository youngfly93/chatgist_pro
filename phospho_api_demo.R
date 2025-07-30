# 磷酸化蛋白质组学分析API演示脚本
# 这个脚本模拟GIST磷酸化数据分析功能

# 加载必要的包
suppressPackageStartupMessages({
  library(jsonlite)
  library(base64enc)
  library(ggplot2)
})

# 解析命令行参数
args <- commandArgs(trailingOnly = TRUE)

# 解析参数函数
parse_args <- function(args) {
  params <- list()

  for (arg in args) {
    if (grepl("=", arg)) {
      # 处理 --key=value 格式
      parts <- strsplit(arg, "=", fixed = TRUE)[[1]]
      if (length(parts) == 2) {
        key <- gsub("^--", "", parts[1])
        value <- gsub('^"|"$', '', parts[2])
        params[[key]] <- value
      }
    } else if (grepl("^--", arg)) {
      # 处理 --key value 格式
      key <- gsub("^--", "", arg)
      # 在这种情况下，我们需要查找下一个参数
      idx <- which(args == arg)
      if (idx < length(args) && !grepl("^--", args[idx + 1])) {
        value <- gsub('^"|"$', '', args[idx + 1])
        params[[key]] <- value
      }
    }
  }

  return(params)
}

# 模拟磷酸化位点查询
query_phospho_sites <- function(gene) {
  # 模拟数据
  sites_data <- data.frame(
    Site = c(paste0(gene, "_S", c(123, 456, 789))),
    Position = c(123, 456, 789),
    Tumor_Detection = c(0.85, 0.72, 0.91),
    Normal_Detection = c(0.23, 0.15, 0.31),
    Fold_Change = c(3.7, 4.8, 2.9),
    P_Value = c(0.001, 0.003, 0.007)
  )
  
  return(sites_data)
}

# 创建箱线图
create_boxplot <- function(gene, analysis_type) {
  # 模拟数据
  set.seed(123)
  n_samples <- 50
  
  if (analysis_type == "boxplot_TvsN") {
    data <- data.frame(
      Expression = c(rnorm(n_samples/2, mean = 2.5, sd = 0.8),
                     rnorm(n_samples/2, mean = 1.8, sd = 0.6)),
      Group = rep(c("Tumor", "Normal"), each = n_samples/2)
    )
    title <- paste0(gene, " 磷酸化水平: 肿瘤 vs 正常组织")
  } else if (analysis_type == "boxplot_Risk") {
    data <- data.frame(
      Expression = c(rnorm(n_samples/2, mean = 2.2, sd = 0.7),
                     rnorm(n_samples/2, mean = 1.9, sd = 0.5)),
      Group = rep(c("High Risk", "Low Risk"), each = n_samples/2)
    )
    title <- paste0(gene, " 磷酸化水平: 高风险 vs 低风险")
  } else {
    data <- data.frame(
      Expression = rnorm(n_samples, mean = 2.0, sd = 0.7),
      Group = sample(c("Group A", "Group B"), n_samples, replace = TRUE)
    )
    title <- paste0(gene, " 磷酸化水平分析")
  }
  
  # 创建图表
  p <- ggplot(data, aes(x = Group, y = Expression, fill = Group)) +
    geom_boxplot(alpha = 0.7) +
    geom_jitter(width = 0.2, alpha = 0.5) +
    labs(title = title,
         x = "组别",
         y = "磷酸化水平 (log2)") +
    theme_minimal() +
    theme(legend.position = "none",
          plot.title = element_text(hjust = 0.5))
  
  # 保存为临时文件
  temp_file <- tempfile(fileext = ".png")
  ggsave(temp_file, plot = p, width = 6, height = 4, dpi = 150)
  
  # 转换为base64
  if (file.exists(temp_file)) {
    img_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
    base64_img <- base64encode(img_data)
    unlink(temp_file)
    return(paste0("data:image/png;base64,", base64_img))
  }
  
  return(NULL)
}

# 生存分析
create_survival_plot <- function(gene) {
  # 模拟生存数据
  set.seed(456)
  n_patients <- 100
  
  survival_data <- data.frame(
    Time = rexp(n_patients, rate = 0.1),
    Status = rbinom(n_patients, 1, 0.7),
    Group = sample(c("High", "Low"), n_patients, replace = TRUE)
  )
  
  # 简化的生存曲线图
  p <- ggplot(survival_data, aes(x = Time, color = Group)) +
    geom_step(stat = "ecdf") +
    labs(title = paste0(gene, " 磷酸化水平与生存分析"),
         x = "生存时间 (月)",
         y = "生存概率") +
    theme_minimal() +
    theme(plot.title = element_text(hjust = 0.5))
  
  # 保存图表
  temp_file <- tempfile(fileext = ".png")
  ggsave(temp_file, plot = p, width = 6, height = 4, dpi = 150)
  
  if (file.exists(temp_file)) {
    img_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
    base64_img <- base64encode(img_data)
    unlink(temp_file)
    return(paste0("data:image/png;base64,", base64_img))
  }
  
  return(NULL)
}

# 主执行函数
main <- function() {
  cat("=== 磷酸化分析API启动 ===\n", file = stderr())
  cat(paste0("原始参数: ", paste(args, collapse = " "), "\n"), file = stderr())

  # 解析参数
  params <- parse_args(args)
  cat(paste0("解析后参数: ", paste(names(params), "=", params, collapse = ", "), "\n"), file = stderr())
  
  if (is.null(params[["function"]]) || is.null(params$gene)) {
    stop("缺少必需参数: --function 和 --gene")
  }

  func_name <- params[["function"]]
  gene_name <- params$gene
  
  cat(paste0("分析类型: ", func_name, "\n"), file = stderr())
  cat(paste0("基因: ", gene_name, "\n"), file = stderr())
  
  result <- list(
    status = "success",
    message = "",
    data = NULL,
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  # 根据分析类型执行相应功能
  if (func_name == "query") {
    result$data <- query_phospho_sites(gene_name)
    result$message <- paste0("找到 ", nrow(result$data), " 个磷酸化位点")
    
  } else if (grepl("^boxplot_", func_name)) {
    result$plot <- create_boxplot(gene_name, func_name)
    result$message <- paste0(gene_name, " ", func_name, " 分析完成")
    
  } else if (func_name == "survival") {
    result$plot <- create_survival_plot(gene_name)
    result$message <- paste0(gene_name, " 生存分析完成")
    
  } else {
    result$status <- "error"
    result$message <- paste0("不支持的分析类型: ", func_name)
  }
  
  # 输出JSON结果
  cat(toJSON(result, auto_unbox = TRUE, pretty = FALSE))
  
  cat("\n=== 磷酸化分析完成 ===\n", file = stderr())
}

# 错误处理
tryCatch({
  main()
}, error = function(e) {
  error_result <- list(
    status = "error",
    message = paste("分析执行错误:", e$message),
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  cat(toJSON(error_result, auto_unbox = TRUE))
})
