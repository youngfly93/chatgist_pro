# GIST Phosphoproteomics Plumber API - 无 renv 版本
# 直接加载数据和函数，避免 renv 相关问题

# 禁用 renv
Sys.setenv(RENV_CONFIG_ACTIVATED = FALSE)

# 加载必要的包
suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(base64enc)
  library(ggplot2)
})

# 直接加载数据
cat("=== 初始化 Plumber API ===\n")
cat("当前工作目录:", getwd(), "\n")

# 尝试找到并加载数据
if (file.exists("GIST_Phosphoproteomics/Phosphoproteomics_list.RDS")) {
  Phosphoproteomics_list <- readRDS("GIST_Phosphoproteomics/Phosphoproteomics_list.RDS")
  cat("从 GIST_Phosphoproteomics/Phosphoproteomics_list.RDS 加载数据\n")
  
  # 设置工作目录以便加载函数
  original_wd <- getwd()
  setwd("GIST_Phosphoproteomics")
  
  # 加载函数文件
  if (file.exists("Phosphoproteomics.R")) {
    source("Phosphoproteomics.R", local = FALSE)
    cat("成功加载 Phosphoproteomics.R\n")
  }
  
  # 恢复工作目录
  setwd(original_wd)
  
} else {
  stop("找不到 GIST_Phosphoproteomics/Phosphoproteomics_list.RDS")
}

# 保存图片并转换为base64的辅助函数
save_plot_to_base64 <- function(plot_obj, width = 8, height = 6) {
  temp_file <- tempfile(fileext = ".png")
  
  tryCatch({
    ggsave(temp_file, plot = plot_obj, width = width, height = height, dpi = 150)
    
    if (file.exists(temp_file)) {
      img_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
      base64_img <- base64encode(img_data)
      unlink(temp_file)
      return(paste0("data:image/png;base64,", base64_img))
    }
  }, error = function(e) {
    if (file.exists(temp_file)) unlink(temp_file)
    return(NULL)
  })
  
  return(NULL)
}

#* @apiTitle GIST Phosphoproteomics API
#* @apiDescription RESTful API for GIST phosphoproteomics analysis
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /phospho/health
function() {
  list(
    status = "healthy",
    message = "GIST Phosphoproteomics API is running",
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    data_loaded = !is.null(Phosphoproteomics_list)
  )
}

#* Query phosphorylation sites for a gene
#* @param gene:str The gene symbol to query
#* @post /phospho/query
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "缺少必需参数: gene"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    data = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    query_result <- Phosphoproteome_query(
      ID = gene,
      Phosphoproteomics_list = Phosphoproteomics_list
    )
    
    if (!is.null(query_result)) {
      result$data <- query_result
      result$message <- paste0("找到 ", nrow(query_result), " 个磷酸化位点")
    } else {
      result$status <- "warning"
      result$message <- paste0("未找到基因 ", gene, " 的磷酸化位点信息")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("查询执行错误: ", e$message)
  })
  
  return(result)
}

#* Tumor vs Normal boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/TvsN
function(gene = NULL, site = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "缺少必需参数: gene"
    ))
  }
  
  phospho_id <- ifelse(!is.null(site) && site != "", site, gene)
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    plot_obj <- dbGIST_Phosphoproteome_boxplot_TvsN(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 肿瘤vs正常组织分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤vs正常组织对比图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Tumor size boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/TumorSize
function(gene = NULL, site = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "缺少必需参数: gene"
    ))
  }

  phospho_id <- ifelse(!is.null(site) && site != "", site, gene)

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Tumor.size(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 肿瘤大小分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤大小分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

#* Mitotic count boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/MitoticCount
function(gene = NULL, site = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "缺少必需参数: gene"
    ))
  }

  phospho_id <- ifelse(!is.null(site) && site != "", site, gene)

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Mitotic.count(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 核分裂计数分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的核分裂计数分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

#* Imatinib response boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/IMResponse
function(gene = NULL, site = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "缺少必需参数: gene"
    ))
  }

  phospho_id <- ifelse(!is.null(site) && site != "", site, gene)

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    plot_obj <- dbGIST_Phosphoproteome_boxplot_IM.Response(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 伊马替尼反应分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的伊马替尼反应分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

cat("\n=== Plumber API 初始化完成 ===\n")
cat("数据已加载，函数已准备就绪\n\n")