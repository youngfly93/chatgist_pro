# GIST Phosphoproteomics API 适配器
# 用于连接后端API和真实的 GIST_Phosphoproteomics 项目

# 加载必要的包
suppressPackageStartupMessages({
  library(jsonlite)
  library(base64enc)
})

# 设置工作目录到 GIST_Phosphoproteomics
# 检查当前目录是否有GIST_Phosphoproteomics，如果没有，尝试上一级目录
if (dir.exists("GIST_Phosphoproteomics")) {
  setwd("GIST_Phosphoproteomics")
} else if (dir.exists("../GIST_Phosphoproteomics")) {
  setwd("../GIST_Phosphoproteomics")
} else {
  stop("找不到GIST_Phosphoproteomics目录")
}

# 确保库路径正确
.libPaths(c("/Users/yangfei/R/library", .libPaths()))

# 加载真实项目的函数和数据
source("Phosphoproteomics.R")

# 解析命令行参数
args <- commandArgs(trailingOnly = TRUE)

# 解析参数函数
parse_args <- function(args) {
  params <- list()
  
  for (arg in args) {
    if (grepl("=", arg)) {
      parts <- strsplit(arg, "=", fixed = TRUE)[[1]]
      if (length(parts) == 2) {
        key <- gsub("^--", "", parts[1])
        value <- gsub('^"|"$', '', parts[2])
        params[[key]] <- value
      }
    }
  }
  
  return(params)
}

# 保存图片并转换为base64
save_plot_to_base64 <- function(plot_obj, width = 8, height = 6) {
  temp_file <- tempfile(fileext = ".png")
  
  # 保存图片
  ggsave(temp_file, plot = plot_obj, width = width, height = height, dpi = 150)
  
  # 转换为base64
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
  cat("=== GIST Phosphoproteomics API 适配器启动 ===\n", file = stderr())
  
  # 解析参数
  params <- parse_args(args)
  cat(paste0("接收参数: ", paste(names(params), "=", params, collapse = ", "), "\n"), file = stderr())
  
  if (is.null(params[["function"]]) || is.null(params$gene)) {
    stop("缺少必需参数: --function 和 --gene")
  }
  
  func_name <- params[["function"]]
  gene_name <- params$gene
  
  # 如果有site参数，构建完整的磷酸化位点ID
  if (!is.null(params$site)) {
    phospho_id <- params$site
  } else {
    phospho_id <- gene_name
  }
  
  result <- list(
    status = "success",
    message = "",
    data = NULL,
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    # 根据分析类型执行相应功能
    if (func_name == "query") {
      # 查询磷酸化位点
      query_result <- Phosphoproteome_query(ID = gene_name, 
                                             Phosphoproteomics_list = Phosphoproteomics_list)
      
      if (!is.null(query_result)) {
        result$data <- query_result
        result$message <- paste0("找到 ", nrow(query_result), " 个磷酸化位点")
      } else {
        result$status <- "warning"
        result$message <- paste0("未找到基因 ", gene_name, " 的磷酸化位点信息")
      }
      
    } else if (func_name == "boxplot_TvsN") {
      # 肿瘤 vs 正常组织分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_TvsN(ID = phospho_id, 
                                                       DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 肿瘤vs正常组织分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤vs正常组织对比图")
      }
      
    } else if (func_name == "boxplot_Risk") {
      # 风险分组分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_Risk(ID = phospho_id, 
                                                       DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 风险分组分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的风险分组分析图")
      }
      
    } else if (func_name == "boxplot_Gender") {
      # 性别差异分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_Gender(ID = phospho_id, 
                                                         DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 性别差异分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的性别差异分析图")
      }
      
    } else if (func_name == "boxplot_Age") {
      # 年龄分组分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_Age(ID = phospho_id, 
                                                      DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 年龄分组分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的年龄分组分析图")
      }
      
    } else if (func_name == "boxplot_Location") {
      # 肿瘤位置分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_Location(ID = phospho_id, 
                                                           DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 肿瘤位置分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤位置分析图")
      }
      
    } else if (func_name == "boxplot_WHO") {
      # WHO分型分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_WHO(ID = phospho_id, 
                                                      DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " WHO分型分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的WHO分型分析图")
      }
      
    } else if (func_name == "boxplot_Mutation") {
      # 突变类型分析
      plot_obj <- dbGIST_Phosphoproteome_boxplot_Mutation(ID = phospho_id, 
                                                           DB = Phosphoproteomics_list)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 突变类型分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的突变类型分析图")
      }
      
    } else if (func_name == "survival") {
      # 生存分析
      if (is.null(params$cutoff)) {
        params$cutoff <- "Auto"  # 默认使用Auto
      }
      if (is.null(params$survtype)) {
        params$survtype <- "OS"  # 默认总生存
      }
      
      plot_obj <- Pho_KM_function(
        Protemics2_Clinical = Phosphoproteomics_list[[1]]$Clinical,
        CutOff_point = params$cutoff,
        Survival_type = params$survtype,
        ID = phospho_id
      )
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
        result$message <- paste0(phospho_id, " 生存分析完成 (cutoff=", params$cutoff, ", type=", params$survtype, ")")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", phospho_id, " 的生存分析图")
      }
      
    } else {
      result$status <- "error"
      result$message <- paste0("不支持的分析类型: ", func_name)
    }
    
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
    cat(paste0("错误详情: ", e$message, "\n"), file = stderr())
  })
  
  # 输出JSON结果
  cat(toJSON(result, auto_unbox = TRUE, pretty = FALSE))
  
  cat("\n=== GIST Phosphoproteomics API 适配器完成 ===\n", file = stderr())
}

# 执行主函数
main()