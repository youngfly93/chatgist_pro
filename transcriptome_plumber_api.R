# GIST Transcriptome Plumber API
# 基于 GIST_Transcriptome 项目的 RESTful API

# 禁用 renv
Sys.setenv(RENV_CONFIG_ACTIVATED = FALSE)

# 加载必要的包
suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(base64enc)
  library(ggplot2)
  library(tidyverse)
  library(data.table)
  library(stringr)
  library(ggpubr)
  library(ggsci)
  library(patchwork)
  library(pROC)
})

# 初始化
cat("=== 初始化 Transcriptome Plumber API ===\n")
cat("当前工作目录:", getwd(), "\n")

# 设置工作目录到 GIST_Transcriptome
original_wd <- getwd()
transcriptome_path <- file.path(original_wd, "GIST_Transcriptome")

# 加载数据和函数
if (dir.exists(transcriptome_path)) {
  setwd(transcriptome_path)
  
  # 加载 global.R 中的所有函数和数据
  if (file.exists("global.R")) {
    source("global.R", local = FALSE)
    cat("成功加载 global.R\n")
  }
  
  # 确保数据已加载
  if (exists("dbGIST_matrix")) {
    cat("dbGIST_matrix 数据已加载\n")
    cat("可用数据集数量:", length(dbGIST_matrix), "\n")
  } else {
    stop("未能加载 dbGIST_matrix 数据")
  }
  
  setwd(original_wd)
} else {
  stop("找不到 GIST_Transcriptome 目录")
}

# 保存图片并转换为base64的辅助函数
save_plot_to_base64 <- function(plot_obj, width = 10, height = 8) {
  temp_file <- tempfile(fileext = ".png")
  
  tryCatch({
    # 处理不同类型的图形对象
    if (inherits(plot_obj, "ggplot")) {
      ggsave(temp_file, plot = plot_obj, width = width, height = height, dpi = 150)
    } else if (inherits(plot_obj, "patchwork")) {
      ggsave(temp_file, plot = plot_obj, width = width * 1.5, height = height, dpi = 150)
    } else {
      # 尝试直接保存
      png(temp_file, width = width * 150, height = height * 150)
      print(plot_obj)
      dev.off()
    }
    
    if (file.exists(temp_file)) {
      img_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
      base64_img <- base64encode(img_data)
      unlink(temp_file)
      return(paste0("data:image/png;base64,", base64_img))
    }
  }, error = function(e) {
    cat("图片保存错误:", e$message, "\n")
    if (file.exists(temp_file)) unlink(temp_file)
    return(NULL)
  })
  
  return(NULL)
}

#* @apiTitle GIST Transcriptome API
#* @apiDescription RESTful API for GIST transcriptome analysis
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /transcriptome/health
function() {
  list(
    status = "healthy",
    message = "GIST Transcriptome API is running",
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    data_loaded = exists("dbGIST_matrix"),
    datasets_count = if(exists("dbGIST_matrix")) length(dbGIST_matrix) else 0
  )
}

#* Query gene expression
#* @param gene:str The gene symbol
#* @post /transcriptome/query
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    data = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_query") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      query_result <- dbGIST_query(ID = gene, DB = dbGIST_matrix)
      setwd(original_wd)
      
      if (!is.null(query_result) && is.data.frame(query_result)) {
        result$data <- query_result
        result$message <- paste0("成功查询 ", gene, " 基因表达数据")
      } else {
        result$status <- "warning"
        result$message <- paste0("未找到 ", gene, " 基因的表达数据")
      }
    } else {
      result$status <- "error"
      result$message <- "查询函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("查询执行错误: ", e$message)
  })
  
  return(result)
}

#* Gender analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/gender
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_boxplot_Gender") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Gender(ID = gene, DB = dbGIST_matrix[Gender_ID])
      setwd(original_wd)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 性别差异分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的性别差异分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Tumor vs Normal analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/tvn
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_boxplot_Metastatic_Primary") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Metastatic_Primary(ID = gene, DB = dbGIST_matrix[Stage_ID])
      setwd(original_wd)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 肿瘤vs正常组织分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的肿瘤vs正常组织分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Risk analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/risk
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_boxplot_Risk") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Risk(ID = gene, DB = dbGIST_matrix[RISK_ID])
      setwd(original_wd)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 风险分层分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的风险分层分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Location analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/location
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_boxplot_Site") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Site(ID = gene, DB = dbGIST_matrix[Location_ID])
      setwd(original_wd)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 肿瘤位置分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的肿瘤位置分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Mutation type analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/mutation
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_boxplot_Mutation_ID") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Mutation_ID(ID = gene, DB = dbGIST_matrix[Mutation_ID])
      setwd(original_wd)
      
      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 突变类型分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的突变类型分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Gene correlation analysis
#* @param gene1:str The first gene symbol
#* @param gene2:str The second gene symbol
#* @post /transcriptome/correlation
function(gene1 = NULL, gene2 = NULL) {
  if (is.null(gene1) || gene1 == "" || is.null(gene2) || gene2 == "") {
    return(list(
      status = "error",
      message = "两个基因名称都不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    correlation_stats = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_cor_ID") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)

      # 执行相关性分析
      cor_result <- dbGIST_cor_ID(ID = gene1, ID2 = gene2, DB = dbGIST_matrix)

      setwd(original_wd)
      
      if (!is.null(cor_result)) {
        # 提取图形
        if (!is.null(cor_result$plot)) {
          result$plot <- save_plot_to_base64(cor_result$plot, width = 12, height = 10)
        }
        
        # 提取统计信息
        if (!is.null(cor_result$stats)) {
          result$correlation_stats <- cor_result$stats
        }
        
        result$message <- paste0(gene1, " 与 ", gene2, " 的相关性分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法完成 ", gene1, " 与 ", gene2, " 的相关性分析")
      }
    } else {
      result$status <- "error"
      result$message <- "相关性分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Drug resistance analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/drug
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }
  
  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    roc_stats = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
  
  tryCatch({
    if (exists("dbGIST_boxplot_Drug") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)

      # 执行药物耐药分析
      drug_result <- dbGIST_boxplot_Drug(ID = gene, DB = dbGIST_matrix[IM_ID])

      setwd(original_wd)
      
      if (!is.null(drug_result)) {
        result$plot <- save_plot_to_base64(drug_result, width = 10, height = 8)
        result$message <- paste0(gene, " 药物耐药分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的药物耐药分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "药物耐药分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })
  
  return(result)
}

#* Pre-post treatment analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/prepost
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    if (exists("Post_pre_treament_ID") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_PrePost(ID = gene, Mutation = "All", DB = dbGIST_matrix[Post_pre_treament_ID])
      setwd(original_wd)

      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj, width = 12, height = 8)
        result$message <- paste0(gene, " 治疗前后分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的治疗前后分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "治疗前后数据集不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

#* Age group analysis
#* @param gene:str The gene symbol
#* @param cutoff:int Age cutoff (default: 65)
#* @post /transcriptome/boxplot/age
function(gene = NULL, cutoff = 65) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    if (exists("dbGIST_boxplot_Age") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Age(ID = gene, Cut_off = as.numeric(cutoff), DB = dbGIST_matrix[Age_ID])
      setwd(original_wd)

      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 年龄分组分析完成 (分界值: ", cutoff, "岁)")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的年龄分组分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

#* Tumor size analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/tumorsize
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    if (exists("dbGIST_boxplot_Tumor_size") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Tumor_size(ID = gene, DB = dbGIST_matrix[Stage_ID])
      setwd(original_wd)

      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " 肿瘤大小分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的肿瘤大小分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

#* WHO grade analysis
#* @param gene:str The gene symbol
#* @post /transcriptome/boxplot/grade
function(gene = NULL) {
  if (is.null(gene) || gene == "") {
    return(list(
      status = "error",
      message = "基因名称不能为空"
    ))
  }

  result <- list(
    status = "success",
    message = "",
    plot = NULL,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )

  tryCatch({
    if (exists("dbGIST_boxplot_Grade") && exists("dbGIST_matrix")) {
      setwd(transcriptome_path)
      plot_obj <- dbGIST_boxplot_Grade(ID = gene, DB = dbGIST_matrix[Stage_ID])
      setwd(original_wd)

      if (!is.null(plot_obj)) {
        result$plot <- save_plot_to_base64(plot_obj)
        result$message <- paste0(gene, " WHO分级分析完成")
      } else {
        result$status <- "warning"
        result$message <- paste0("无法生成 ", gene, " 的WHO分级分析图")
      }
    } else {
      result$status <- "error"
      result$message <- "分析函数或数据不可用"
    }
  }, error = function(e) {
    result$status <- "error"
    result$message <- paste0("分析执行错误: ", e$message)
  })

  return(result)
}

#* Test endpoint for available genes
#* @get /transcriptome/test
function() {
  # 列出可用的基因供测试
  available_genes <- c()
  
  if (exists("dbGIST_matrix") && length(dbGIST_matrix) > 0) {
    # 从第一个数据集获取基因列表
    if (!is.null(dbGIST_matrix[[1]]$Matrix)) {
      all_genes <- rownames(dbGIST_matrix[[1]]$Matrix)
      available_genes <- head(all_genes, 50)
    }
  }
  
  list(
    status = "success",
    message = "测试端点",
    available_genes = available_genes,
    dataset_count = if(exists("dbGIST_matrix")) length(dbGIST_matrix) else 0,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
}
          