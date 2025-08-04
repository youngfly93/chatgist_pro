# GIST Phosphoproteomics Plumber API
# 提供 RESTful API 接口用于磷酸化蛋白质组学分析

# 加载必要的包
suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(base64enc)
  library(ggplot2)
})

# 设置工作目录和加载数据
initialize_api <- function() {
  # 保存原始工作目录
  original_wd <- getwd()
  
  # 检查并设置工作目录
  if (dir.exists("GIST_Phosphoproteomics")) {
    setwd("GIST_Phosphoproteomics")
  } else if (dir.exists("../GIST_Phosphoproteomics")) {
    setwd("../GIST_Phosphoproteomics")
  } else {
    stop("找不到GIST_Phosphoproteomics目录")
  }
  
  # 加载数据和函数
  cat("正在加载 GIST Phosphoproteomics 数据...\n")
  cat("当前工作目录: ", getwd(), "\n")
  
  # 直接加载 RDS 文件，避免 source 可能的 renv 问题
  if (file.exists("Phosphoproteomics_list.RDS")) {
    Phosphoproteomics_list <- readRDS("Phosphoproteomics_list.RDS")
    cat("成功加载 Phosphoproteomics_list.RDS\n")
  } else {
    stop("找不到 Phosphoproteomics_list.RDS 文件")
  }
  
  # 尝试加载函数文件
  if (file.exists("Phosphoproteomics.R")) {
    # 临时忽略 renv
    if (file.exists("renv/activate.R")) {
      cat("检测到 renv，尝试跳过...\n")
    }
    source("Phosphoproteomics.R", local = TRUE)
    cat("成功加载 Phosphoproteomics.R\n")
  } else {
    stop("找不到 Phosphoproteomics.R 文件")
  }
  
  # 返回加载的数据（作为全局变量使用）
  list(
    Phosphoproteomics_list = Phosphoproteomics_list,
    Proteomics_ID_Pathway_list = if(exists("Proteomics_ID_Pathway_list")) Proteomics_ID_Pathway_list else NULL,
    original_wd = original_wd
  )
}

# 初始化（只执行一次）
api_data <- initialize_api()
Phosphoproteomics_list <- api_data$Phosphoproteomics_list
Proteomics_ID_Pathway_list <- api_data$Proteomics_ID_Pathway_list

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
  
  # 如果提供了site，使用site；否则使用gene
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

#* Risk stratification boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/Risk
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
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Risk(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 风险分组分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的风险分组分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Gender difference boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/Gender
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
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Gender(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 性别差异分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的性别差异分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Age group boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/Age
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
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Age(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 年龄分组分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的年龄分组分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Tumor location boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/Location
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
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Location(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 肿瘤位置分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的肿瘤位置分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* WHO classification boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/WHO
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
    plot_obj <- dbGIST_Phosphoproteome_boxplot_WHO(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " WHO分型分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的WHO分型分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Mutation type boxplot analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @post /phospho/boxplot/Mutation
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
    plot_obj <- dbGIST_Phosphoproteome_boxplot_Mutation(
      ID = phospho_id,
      DB = Phosphoproteomics_list
    )
    
    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 突变类型分析完成")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的突变类型分析图")
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Survival analysis
#* @param gene:str The gene symbol
#* @param site:str The phosphorylation site (optional)
#* @param cutoff:str Cutoff method (Auto, Median, Mean, etc.)
#* @param survtype:str Survival type (OS, PFS, etc.)
#* @post /phospho/survival
function(gene = NULL, site = NULL, cutoff = "Auto", survtype = "OS") {
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
    plot_obj <- Pho_KM_function(
      Protemics2_Clinical = Phosphoproteomics_list[[1]]$Clinical,
      CutOff_point = cutoff,
      Survival_type = survtype,
      ID = phospho_id
    )

    if (!is.null(plot_obj)) {
      result$plot <- save_plot_to_base64(plot_obj, width = 10, height = 8)
      result$message <- paste0(phospho_id, " 生存分析完成 (cutoff=", cutoff, ", type=", survtype, ")")
    } else {
      result$status <- "warning"
      result$message <- paste0("无法生成 ", phospho_id, " 的生存分析图")
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

#* Comprehensive analysis for a gene
#* @param gene:str The gene symbol
#* @post /phospho/comprehensive
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "缺少必需参数: gene"
    ))
  }
  
  results <- list(
    status = "success",
    message = paste0(gene, "基因综合分析完成"),
    gene = gene,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    summary = list(
      total = 12,
      successful = 0,
      failed = 0,
      warnings = 0
    ),
    analyses = list()
  )

  # 定义要执行的分析类型
  analysis_types <- list(
    list(name = "query", description = "磷酸化位点查询"),
    list(name = "boxplot_TvsN", description = "肿瘤vs正常组织分析"),
    list(name = "boxplot_Risk", description = "风险分组分析"),
    list(name = "boxplot_Gender", description = "性别差异分析"),
    list(name = "boxplot_Age", description = "年龄分组分析"),
    list(name = "boxplot_Location", description = "肿瘤位置分析"),
    list(name = "boxplot_WHO", description = "WHO分型分析"),
    list(name = "boxplot_Mutation", description = "突变类型分析"),
    list(name = "boxplot_Tumor.size", description = "肿瘤大小分析"),
    list(name = "boxplot_Mitotic.count", description = "核分裂计数分析"),
    list(name = "boxplot_IM.Response", description = "伊马替尼反应分析"),
    list(name = "survival", description = "生存分析")
  )
  
  # 首先执行查询以获取磷酸化位点
  query_result <- NULL
  tryCatch({
    query_data <- Phosphoproteome_query(
      ID = gene,
      Phosphoproteomics_list = Phosphoproteomics_list
    )
    
    if (!is.null(query_data) && nrow(query_data) > 0) {
      query_result <- list(
        status = "success",
        data = query_data,
        message = paste0("找到 ", nrow(query_data), " 个磷酸化位点"),
        description = "磷酸化位点查询"
      )
      results$analyses$query <- query_result
      results$summary$successful <- results$summary$successful + 1
      
      # 使用第一个磷酸化位点进行后续分析
      default_site <- rownames(query_data)[1]
    } else {
      results$analyses$query <- list(
        status = "warning",
        message = paste0("未找到基因 ", gene, " 的磷酸化位点信息"),
        description = "磷酸化位点查询"
      )
      results$summary$warnings <- results$summary$warnings + 1
      default_site <- gene
    }
  }, error = function(e) {
    results$analyses$query <- list(
      status = "error",
      message = paste0("查询失败: ", e$message),
      description = "磷酸化位点查询"
    )
    results$summary$failed <- results$summary$failed + 1
    default_site <- gene
  })
  
  # 执行其他分析
  for (analysis in analysis_types[-1]) {  # 跳过query，已经执行过了
    tryCatch({
      if (analysis$name == "survival") {
        # 生存分析
        plot_obj <- Pho_KM_function(
          Protemics2_Clinical = Phosphoproteomics_list[[1]]$Clinical,
          CutOff_point = "Auto",
          Survival_type = "OS",
          ID = default_site
        )
      } else if (startsWith(analysis$name, "boxplot_")) {
        # 箱线图分析
        func_name <- paste0("dbGIST_Phosphoproteome_", analysis$name)
        plot_obj <- do.call(func_name, list(
          ID = default_site,
          DB = Phosphoproteomics_list
        ))
      }
      
      if (!is.null(plot_obj)) {
        results$analyses[[analysis$name]] <- list(
          status = "success",
          plot = save_plot_to_base64(plot_obj, width = 10, height = 8),
          message = paste0(analysis$description, "完成"),
          description = analysis$description
        )
        results$summary$successful <- results$summary$successful + 1
      } else {
        results$analyses[[analysis$name]] <- list(
          status = "warning",
          message = paste0("无法生成", analysis$description),
          description = analysis$description
        )
        results$summary$warnings <- results$summary$warnings + 1
      }
    }, error = function(e) {
      results$analyses[[analysis$name]] <- list(
        status = "error",
        message = paste0("分析失败: ", e$message),
        description = analysis$description
      )
      results$summary$failed <- results$summary$failed + 1
    })
  }
  
  # 更新总体状态
  if (results$summary$successful == 0) {
    results$status <- "error"
    results$message <- paste0(gene, "基因综合分析失败")
  } else if (results$summary$failed > 0 || results$summary$warnings > 0) {
    results$status <- "warning"
    results$message <- paste0(gene, "基因综合分析部分完成 (成功: ", 
                             results$summary$successful, ", 失败: ", 
                             results$summary$failed, ", 警告: ", 
                             results$summary$warnings, ")")
  }
  
  return(results)
}

# 注意：这个文件本身不会运行API服务器
# 需要通过 start_plumber_api.R 或其他方式启动