# GIST Phosphoproteomics Plumber API - 修复版
# 修复了查询函数返回空数据的问题

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
cat("=== 初始化 Plumber API (修复版) ===\n")
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
  
  # 检查数据结构并输出调试信息
  cat("\n数据检查:\n")
  if (is.list(Phosphoproteomics_list) && length(Phosphoproteomics_list) >= 2) {
    if (!is.null(Phosphoproteomics_list[[1]]$Matrix)) {
      cat("Matrix 1 维度:", dim(Phosphoproteomics_list[[1]]$Matrix), "\n")
      cat("前5个行名:", paste(head(rownames(Phosphoproteomics_list[[1]]$Matrix), 5), collapse=", "), "\n")
      
      # 提取所有基因名
      all_genes <- unique(gsub("/.*", "", rownames(Phosphoproteomics_list[[1]]$Matrix)))
      cat("总基因数:", length(all_genes), "\n")
      cat("包含 KIT?", "KIT" %in% all_genes, "\n")
      cat("包含 PDGFRA?", "PDGFRA" %in% all_genes, "\n")
    }
  }
  
} else {
  stop("找不到 GIST_Phosphoproteomics/Phosphoproteomics_list.RDS")
}

# 获取基因的第一个磷酸化位点
get_first_phospho_site <- function(gene) {
  query_result <- Phosphoproteome_query(ID = gene, Phosphoproteomics_list = Phosphoproteomics_list)
  if (!is.null(query_result) && nrow(query_result) > 0) {
    return(query_result$PhosphoSites[1])
  }
  return(NULL)
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

#* @apiTitle GIST Phosphoproteomics API (Fixed)
#* @apiDescription RESTful API for GIST phosphoproteomics analysis with fixed query function
#* @apiVersion 1.0.1

#* Health check endpoint
#* @get /phospho/health
function() {
  # 再次检查数据中的基因
  all_genes <- c()
  if (exists("Phosphoproteomics_list") && !is.null(Phosphoproteomics_list[[1]]$Matrix)) {
    all_genes <- unique(gsub("/.*", "", rownames(Phosphoproteomics_list[[1]]$Matrix)))
  }
  
  list(
    status = "healthy",
    message = "GIST Phosphoproteomics API (Fixed) is running",
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    data_loaded = !is.null(Phosphoproteomics_list),
    total_genes = length(all_genes),
    sample_genes = paste(head(all_genes, 10), collapse=", ")
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
    # 调试信息
    cat("查询基因:", gene, "\n")
    
    # 调用查询函数
    query_result <- Phosphoproteome_query(
      ID = gene,
      Phosphoproteomics_list = Phosphoproteomics_list
    )
    
    if (!is.null(query_result) && nrow(query_result) > 0) {
      # 将 data.frame 转换为 list 格式，避免 Plumber 的序列化问题
      result$data <- as.list(query_result)
      result$message <- paste0("找到 ", nrow(query_result), " 个磷酸化位点")
      cat("查询成功，找到", nrow(query_result), "个位点\n")
    } else {
      result$status <- "warning"
      result$message <- paste0("未找到基因 ", gene, " 的磷酸化位点信息")
      result$data <- list()  # 返回空列表而不是空对象
      cat("未找到数据\n")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("查询执行错误: ", e$message)
    cat("查询错误:", e$message, "\n")
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
  
  # 确定要使用的磷酸化位点
  if (!is.null(site) && site != "") {
    phospho_id <- site
  } else {
    # 如果没有提供具体位点，自动选择第一个
    first_site <- get_first_phospho_site(gene)
    if (!is.null(first_site)) {
      phospho_id <- first_site
      cat("自动选择磷酸化位点:", phospho_id, "\n")
    } else {
      # 如果查询失败，返回错误
      return(list(
        status = "error",
        message = paste0("未找到基因 ", gene, " 的磷酸化位点信息"),
        timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
      ))
    }
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    cat("执行 boxplot_TvsN 分析:", phospho_id, "\n")
    
    plot_obj <- dbGIST_Phosphoproteome_boxplot_TvsN(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 肿瘤vs正常组织分析完成")
      if (!is.null(result$plot)) {
        cat("图片生成成功\n")
      } else {
        cat("图片转换失败\n")
      }
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤vs正常组织对比图")
      cat("分析返回 NULL\n")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
    cat("分析错误:", e$message, "\n")
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
    cat("执行肿瘤大小分析:", phospho_id, "\n")

    plot_obj <- dbGIST_Phosphoproteome_boxplot_Tumor.size(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 肿瘤大小分析完成")
      if (!is.null(result$plot)) {
        cat("图片生成成功\n")
      } else {
        cat("图片转换失败\n")
      }
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤大小分析图")
      cat("分析返回 NULL\n")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
    cat("分析错误:", e$message, "\n")
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
    cat("执行核分裂计数分析:", phospho_id, "\n")

    plot_obj <- dbGIST_Phosphoproteome_boxplot_Mitotic.count(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 核分裂计数分析完成")
      if (!is.null(result$plot)) {
        cat("图片生成成功\n")
      } else {
        cat("图片转换失败\n")
      }
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的核分裂计数分析图")
      cat("分析返回 NULL\n")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
    cat("分析错误:", e$message, "\n")
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
    cat("执行伊马替尼反应分析:", phospho_id, "\n")

    plot_obj <- dbGIST_Phosphoproteome_boxplot_IM.Response(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 伊马替尼反应分析完成")
      if (!is.null(result$plot)) {
        cat("图片生成成功\n")
      } else {
        cat("图片转换失败\n")
      }
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的伊马替尼反应分析图")
      cat("分析返回 NULL\n")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
    cat("分析错误:", e$message, "\n")
  })

  return(result)
}

#* Test endpoint for debugging
#* @get /phospho/test
function() {
  # 列出前20个基因供测试
  all_genes <- c()
  all_sites <- c()

  if (exists("Phosphoproteomics_list") && !is.null(Phosphoproteomics_list[[1]]$Matrix)) {
    all_row_names <- rownames(Phosphoproteomics_list[[1]]$Matrix)
    all_genes <- unique(gsub("/.*", "", all_row_names))
    all_sites <- head(all_row_names, 20)
  }

  list(
    status = "success",
    message = "测试端点",
    available_genes = head(all_genes, 20),
    available_sites = all_sites,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
}