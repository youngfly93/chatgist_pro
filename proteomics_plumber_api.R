# GIST蛋白质组学分析 Plumber API
# 端口: 8004
# 功能: 提供HTTP API接口用于蛋白质组学数据分析

library(plumber)
library(jsonlite)
library(base64enc)

# 设置工作目录到项目根目录
setwd("F:/work/claude_code/chatgist_pro")

# 检查并加载GIST_Protemics项目的分析函数
if (dir.exists("GIST_Protemics")) {
  cat("✓ 找到GIST_Protemics目录\n")
  
  # 检查数据文件
  data_file <- "GIST_Protemics/Protemics_list.rds"
  if (file.exists(data_file)) {
    cat("✓ 找到蛋白质组学数据文件\n")
    
    # 设置工作目录到GIST_Protemics以加载数据和函数
    old_wd <- getwd()
    setwd("GIST_Protemics")
    
    # 加载分析函数
    source("Protemic.R")
    cat("✓ 加载分析函数完成\n")
    
    # 恢复工作目录
    setwd(old_wd)
    
  } else {
    stop("❌ 未找到蛋白质组学数据文件: ", data_file)
  }
} else {
  stop("❌ 未找到GIST_Protemics目录")
}

# 辅助函数：将ggplot对象转换为base64编码的PNG
plot_to_base64 <- function(plot_obj, width = 800, height = 600) {
  if (is.null(plot_obj)) return(NULL)
  
  tryCatch({
    # 创建临时文件
    temp_file <- tempfile(fileext = ".png")
    
    # 保存图片
    ggsave(temp_file, plot = plot_obj, width = width/100, height = height/100, dpi = 100)
    
    # 读取并编码为base64
    img_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
    base64_str <- paste0("data:image/png;base64,", base64encode(img_data))
    
    # 删除临时文件
    unlink(temp_file)
    
    return(base64_str)
  }, error = function(e) {
    cat("图片转换错误:", e$message, "\n")
    return(NULL)
  })
}

# 辅助函数：规范化数组格式的响应
normalize_response <- function(response) {
  if (is.list(response)) {
    for (name in names(response)) {
      if (is.vector(response[[name]]) && length(response[[name]]) == 1) {
        response[[name]] <- as.character(response[[name]])
      }
    }
  }
  return(response)
}

#* @apiTitle GIST蛋白质组学分析API
#* @apiDescription 提供GIST蛋白质组学数据的多维度分析功能
#* @apiVersion 1.0

#* 健康检查
#* @get /health
function() {
  list(
    status = "healthy",
    message = "GIST蛋白质组学API运行正常",
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S"),
    data_loaded = exists("Protemics_list"),
    available_functions = c(
      "query", "boxplot", "correlation", "drug_resistance", 
      "survival", "comprehensive"
    )
  )
}

#* 蛋白质基本信息查询
#* @param gene 蛋白质ID/基因名称
#* @post /query
function(gene) {
  tryCatch({
    cat("=== 蛋白质查询 ===\n")
    cat("查询蛋白质:", gene, "\n")
    
    if (missing(gene) || is.null(gene) || gene == "") {
      return(list(
        status = "error",
        message = "请提供蛋白质ID",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 检查蛋白质是否存在于数据中
    found_datasets <- c()
    total_datasets <- length(Protemics_list)
    
    for (i in 1:total_datasets) {
      if (!is.null(Protemics_list[[i]]$Matrix) && gene %in% rownames(Protemics_list[[i]]$Matrix)) {
        found_datasets <- c(found_datasets, i)
      }
    }
    
    if (length(found_datasets) == 0) {
      return(list(
        status = "not_found",
        message = paste0("未找到蛋白质 '", gene, "' 的数据"),
        data = NULL,
        plot = NULL
      ))
    }
    
    # 构建基本信息
    protein_info <- list(
      protein_id = gene,
      datasets_found = found_datasets,
      total_datasets = total_datasets,
      available_analyses = c(
        "临床特征关联分析", "蛋白质相关性分析", 
        "药物耐药性分析", "生存分析"
      )
    )
    
    response <- list(
      status = "success",
      message = paste0("找到蛋白质 '", gene, "' 在 ", length(found_datasets), " 个数据集中"),
      data = protein_info,
      plot = NULL
    )
    
    return(normalize_response(response))
    
  }, error = function(e) {
    cat("查询错误:", e$message, "\n")
    return(list(
      status = "error", 
      message = paste("查询失败:", e$message),
      data = NULL,
      plot = NULL
    ))
  })
}

#* 临床特征箱线图分析
#* @param gene 蛋白质ID
#* @param analysis_type 分析类型 (TvsN, Risk, Gender, Age, Tumor_Size, Mitotic, Location, WHO, Ki67, CD34, Mutation)
#* @post /boxplot
function(gene, analysis_type = "TvsN") {
  tryCatch({
    cat("=== 蛋白质组学箱线图分析 ===\n")
    cat("蛋白质:", gene, "\n")
    cat("分析类型:", analysis_type, "\n")
    
    if (missing(gene) || is.null(gene) || gene == "") {
      return(list(
        status = "error",
        message = "请提供蛋白质ID",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 根据分析类型调用相应函数
    plot_result <- NULL
    analysis_name <- ""
    
    switch(analysis_type,
      "TvsN" = {
        plot_result <- dbGIST_Proteomics_boxplot_TvsN(gene)
        analysis_name <- "肿瘤vs正常组织"
      },
      "Risk" = {
        plot_result <- dbGIST_Proteomics_boxplot_Risk(gene)
        analysis_name <- "风险等级"
      },
      "Gender" = {
        plot_result <- dbGIST_Proteomics_boxplot_Gender(gene)
        analysis_name <- "性别差异"
      },
      "Age" = {
        plot_result <- dbGIST_Proteomics_boxplot_Age(gene)
        analysis_name <- "年龄分组"
      },
      "Tumor_Size" = {
        plot_result <- dbGIST_Proteomics_boxplot_Tumor.size(gene)
        analysis_name <- "肿瘤大小"
      },
      "Mitotic" = {
        plot_result <- dbGIST_Proteomics_boxplot_Mitotic.count(gene)
        analysis_name <- "有丝分裂计数"
      },
      "Location" = {
        plot_result <- dbGIST_Proteomics_boxplot_Location(gene)
        analysis_name <- "肿瘤位置"
      },
      "WHO" = {
        plot_result <- dbGIST_Proteomics_boxplot_WHO(gene)
        analysis_name <- "WHO分级"
      },
      "Ki67" = {
        plot_result <- dbGIST_Proteomics_boxplot_Ki.67(gene)
        analysis_name <- "Ki67表达"
      },
      "CD34" = {
        plot_result <- dbGIST_Proteomics_boxplot_CD34(gene)
        analysis_name <- "CD34状态"
      },
      "Mutation" = {
        plot_result <- dbGIST_Proteomics_boxplot_Mutation(gene)
        analysis_name <- "突变状态"
      },
      {
        return(list(
          status = "error",
          message = paste("不支持的分析类型:", analysis_type),
          data = NULL,
          plot = NULL
        ))
      }
    )
    
    # 转换图片为base64
    plot_base64 <- plot_to_base64(plot_result)
    
    response <- list(
      status = "success",
      message = paste0(gene, " 的", analysis_name, "分析完成"),
      data = list(
        gene = gene,
        analysis_type = analysis_type,
        analysis_name = analysis_name
      ),
      plot = plot_base64
    )
    
    return(normalize_response(response))
    
  }, error = function(e) {
    cat("箱线图分析错误:", e$message, "\n")
    return(list(
      status = "error",
      message = paste("分析失败:", e$message),
      data = NULL,
      plot = NULL
    ))
  })
}

#* 蛋白质相关性分析
#* @param gene1 第一个蛋白质ID
#* @param gene2 第二个蛋白质ID
#* @post /correlation
function(gene1, gene2) {
  tryCatch({
    cat("=== 蛋白质相关性分析 ===\n")
    cat("蛋白质1:", gene1, "\n")
    cat("蛋白质2:", gene2, "\n")
    
    if (missing(gene1) || missing(gene2) || is.null(gene1) || is.null(gene2)) {
      return(list(
        status = "error",
        message = "请提供两个蛋白质ID",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 调用相关性分析函数
    plot_result <- dbGIST_Proteomics_cor_ID(gene1, gene2)
    
    # 转换图片为base64
    plot_base64 <- plot_to_base64(plot_result)
    
    response <- list(
      status = "success",
      message = paste0(gene1, " 与 ", gene2, " 的相关性分析完成"),
      data = list(
        gene1 = gene1,
        gene2 = gene2,
        analysis_type = "correlation"
      ),
      plot = plot_base64
    )
    
    return(normalize_response(response))
    
  }, error = function(e) {
    cat("相关性分析错误:", e$message, "\n")
    return(list(
      status = "error",
      message = paste("相关性分析失败:", e$message),
      data = NULL,
      plot = NULL
    ))
  })
}

#* 药物耐药性分析
#* @param gene 蛋白质ID
#* @post /drug_resistance
function(gene) {
  tryCatch({
    cat("=== 药物耐药性分析 ===\n")
    cat("蛋白质:", gene, "\n")
    
    if (missing(gene) || is.null(gene) || gene == "") {
      return(list(
        status = "error",
        message = "请提供蛋白质ID",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 调用药物耐药性分析函数
    plot_result <- dbGIST_Proteomics_boxplot_IM.Response(gene)
    
    # 转换图片为base64
    plot_base64 <- plot_to_base64(plot_result)
    
    response <- list(
      status = "success",
      message = paste0(gene, " 的伊马替尼耐药性分析完成"),
      data = list(
        gene = gene,
        analysis_type = "drug_resistance",
        drug = "Imatinib"
      ),
      plot = plot_base64
    )
    
    return(normalize_response(response))
    
  }, error = function(e) {
    cat("药物耐药性分析错误:", e$message, "\n")
    return(list(
      status = "error",
      message = paste("药物耐药性分析失败:", e$message),
      data = NULL,
      plot = NULL
    ))
  })
}

#* 单基因富集分析（GSEA + 传统富集分析）
#* @param gene 蛋白质ID
#* @param dataset 数据集名称，默认"Sun's Study"
#* @param analysis_type 分析类型：enrichment(传统富集), gsea(GSEA), both(两者)
#* @param top_positive 正相关基因数量
#* @param top_negative 负相关基因数量
#* @param nperm GSEA排列次数
#* @post /enrichment
function(gene, dataset = "Sun's Study", analysis_type = "both", top_positive = 50, top_negative = 50, nperm = 1000) {
  tryCatch({
    cat("=== 蛋白质组学富集分析 ===\n")
    cat("蛋白质:", gene, "\n")
    cat("数据集:", dataset, "\n")
    cat("分析类型:", analysis_type, "\n")
    
    if (missing(gene) || is.null(gene) || gene == "") {
      return(list(
        status = "error",
        message = "请提供蛋白质ID",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 检查并加载pathway_final.R中的函数
    pathway_file <- "GIST_Protemics/pathway_final.R"
    if (!file.exists(pathway_file)) {
      return(list(
        status = "error",
        message = "富集分析功能未找到",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 设置工作目录到GIST_Protemics进行富集分析
    old_wd2 <- getwd()
    setwd("GIST_Protemics")
    
    # 加载富集分析函数
    source("pathway_final.R")
    
    # 根据分析类型选择函数
    result <- NULL
    if (analysis_type == "enrichment") {
      # 仅传统富集分析
      result <- dbGIST_Proteomics_Pathway_Enrichment(
        Dataset = dataset,
        ID = gene,
        top_positive = as.numeric(top_positive),
        top_negative = as.numeric(top_negative),
        perform_enrichment = TRUE,
        perform_gsea = FALSE
      )
    } else if (analysis_type == "gsea") {
      # 仅GSEA分析
      result <- dbGIST_Proteomics_GSEA(
        Dataset = dataset,
        ID = gene,
        gmt_files = c("GSEA_KEGG.gmt", "GSEA_hallmark.gmt"),
        nperm = as.numeric(nperm),
        min_size = 15,
        max_size = 500
      )
    } else {
      # 完整分析（默认）
      result <- dbGIST_Proteomics_Pathway_Enrichment(
        Dataset = dataset,
        ID = gene,
        top_positive = as.numeric(top_positive),
        top_negative = as.numeric(top_negative),
        perform_enrichment = TRUE,
        perform_gsea = TRUE,
        gmt_files = c("GSEA_KEGG.gmt", "GSEA_hallmark.gmt"),
        gsea_nperm = as.numeric(nperm)
      )
    }
    
    # 恢复工作目录
    setwd(old_wd2)
    
    if (is.null(result)) {
      return(list(
        status = "error",
        message = "富集分析未返回结果",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 处理图片结果
    plots_base64 <- list()
    
    # 处理传统富集分析图片
    if (!is.null(result$enrichment_plots)) {
      for (i in seq_along(result$enrichment_plots)) {
        if (!is.null(result$enrichment_plots[[i]])) {
          plots_base64[[paste0("enrichment_", i)]] <- plot_to_base64(result$enrichment_plots[[i]])
        }
      }
    }
    
    # 处理GSEA图片 - 修正字段名称
    if (!is.null(result$plots)) {
      for (db_name in names(result$plots)) {
        db_plots <- result$plots[[db_name]]
        
        # 处理汇总图
        if (!is.null(db_plots$summary)) {
          plots_base64[[paste0("gsea_", db_name, "_summary")]] <- plot_to_base64(db_plots$summary)
        }
        
        # 处理详细图
        if (!is.null(db_plots$detailed)) {
          for (pathway_name in names(db_plots$detailed)) {
            if (!is.null(db_plots$detailed[[pathway_name]])) {
              safe_pathway_name <- gsub("[^A-Za-z0-9_]", "_", pathway_name)
              plots_base64[[paste0("gsea_", db_name, "_", safe_pathway_name)]] <- plot_to_base64(db_plots$detailed[[pathway_name]])
            }
          }
        }
      }
    }
    
    # 构建响应
    response <- list(
      status = "success",
      message = paste0(gene, " 的富集分析完成"),
      data = list(
        gene = gene,
        dataset = dataset,
        analysis_type = analysis_type,
        correlated_genes = if (!is.null(result$correlated_genes)) length(result$correlated_genes$all) else 0,
        enrichment_results = if (!is.null(result$enrichment_results)) {
          list(
            GO = if (!is.null(result$enrichment_results$GO)) nrow(result$enrichment_results$GO@result) else 0,
            KEGG = if (!is.null(result$enrichment_results$KEGG)) nrow(result$enrichment_results$KEGG@result) else 0,
            Reactome = if (!is.null(result$enrichment_results$Reactome)) nrow(result$enrichment_results$Reactome@result) else 0
          )
        } else NULL,
        gsea_results = if (!is.null(result$gsea_results)) {
          lapply(result$gsea_results, function(x) if (!is.null(x$results)) nrow(x$results) else 0)
        } else NULL
      ),
      plots = plots_base64
    )
    
    return(normalize_response(response))
    
  }, error = function(e) {
    cat("富集分析错误:", e$message, "\n")
    return(list(
      status = "error",
      message = paste("富集分析失败:", e$message),
      data = NULL,
      plot = NULL
    ))
  })
}

#* 综合分析（多个临床特征）
#* @param gene 蛋白质ID
#* @param analyses 分析类型数组，默认包含主要分析
#* @post /comprehensive
function(gene, analyses = NULL) {
  tryCatch({
    cat("=== 蛋白质组学综合分析 ===\n")
    cat("蛋白质:", gene, "\n")
    
    if (missing(gene) || is.null(gene) || gene == "") {
      return(list(
        status = "error",
        message = "请提供蛋白质ID",
        data = NULL,
        plot = NULL
      ))
    }
    
    # 默认分析类型
    if (is.null(analyses)) {
      analyses <- c("TvsN", "Risk", "Gender", "Age", "Location", "Drug_Resistance")
    }
    
    results <- list()
    successful <- 0
    failed <- 0
    warnings <- 0
    
    # 执行各种分析
    for (analysis in analyses) {
      cat("执行分析:", analysis, "\n")
      
      tryCatch({
        if (analysis == "Drug_Resistance") {
          plot_result <- dbGIST_Proteomics_boxplot_IM.Response(gene)
          analysis_name <- "药物耐药性"
        } else {
          # 使用箱线图分析的逻辑
          switch(analysis,
            "TvsN" = {
              plot_result <- dbGIST_Proteomics_boxplot_TvsN(gene)
              analysis_name <- "肿瘤vs正常"
            },
            "Risk" = {
              plot_result <- dbGIST_Proteomics_boxplot_Risk(gene)
              analysis_name <- "风险等级"
            },
            "Gender" = {
              plot_result <- dbGIST_Proteomics_boxplot_Gender(gene)
              analysis_name <- "性别差异"
            },
            "Age" = {
              plot_result <- dbGIST_Proteomics_boxplot_Age(gene)
              analysis_name <- "年龄分组"
            },
            "Location" = {
              plot_result <- dbGIST_Proteomics_boxplot_Location(gene)
              analysis_name <- "肿瘤位置"
            },
            {
              plot_result <- NULL
              analysis_name <- analysis
            }
          )
        }
        
        if (!is.null(plot_result)) {
          plot_base64 <- plot_to_base64(plot_result)
          results[[analysis]] <- list(
            status = "success",
            message = paste0(analysis_name, "分析完成"),
            description = analysis_name,
            plot = plot_base64,
            data = list(analysis_type = analysis)
          )
          successful <- successful + 1
        } else {
          results[[analysis]] <- list(
            status = "warning",
            message = paste0(analysis_name, "分析无结果"),
            description = analysis_name,
            plot = NULL,
            data = NULL
          )
          warnings <- warnings + 1
        }
      }, error = function(e) {
        results[[analysis]] <<- list(
          status = "error",
          message = paste0(analysis, "分析失败: ", e$message),
          description = analysis,
          plot = NULL,
          data = NULL
        )
        failed <<- failed + 1
      })
    }
    
    response <- list(
      status = "success",
      message = paste0(gene, " 综合蛋白质组学分析完成"),
      gene = gene,
      analyses = results,
      summary = list(
        total = length(analyses),
        successful = successful,
        failed = failed,
        warnings = warnings
      )
    )
    
    return(normalize_response(response))
    
  }, error = function(e) {
    cat("综合分析错误:", e$message, "\n")
    return(list(
      status = "error",
      message = paste("综合分析失败:", e$message),
      data = NULL,
      plot = NULL
    ))
  })
}

#* 获取API文档
#* @get /__docs__/
function() {
  list(
    title = "GIST蛋白质组学分析API",
    version = "1.0",
    description = "提供GIST蛋白质组学数据的多维度分析功能",
    endpoints = list(
      "GET /health" = "健康检查",
      "POST /query" = "蛋白质基本信息查询",
      "POST /boxplot" = "临床特征箱线图分析",
      "POST /correlation" = "蛋白质相关性分析", 
      "POST /drug_resistance" = "药物耐药性分析",
      "POST /enrichment" = "单基因富集分析（GSEA + 传统富集）",
      "POST /comprehensive" = "综合分析"
    ),
    parameters = list(
      gene = "蛋白质ID/基因名称",
      analysis_type = "分析类型 (TvsN, Risk, Gender, Age, Tumor_Size, Mitotic, Location, WHO, Ki67, CD34, Mutation)",
      gene1 = "第一个蛋白质ID",
      gene2 = "第二个蛋白质ID"
    ),
    examples = list(
      query = "POST /query with gene='P4HA1'",
      boxplot = "POST /boxplot with gene='P4HA1', analysis_type='TvsN'",
      correlation = "POST /correlation with gene1='P4HA1', gene2='FN1'",
      enrichment = "POST /enrichment with gene='P4HA1', analysis_type='both'"
    )
  )
}

cat("🚀 GIST蛋白质组学分析API已准备就绪\n")
cat("📡 端口: 8004\n")
cat("🔧 可用端点: /health, /query, /boxplot, /correlation, /drug_resistance, /comprehensive\n")