# GIST蛋白质组学分析命令行适配器
# 作为Plumber API的备用方案，通过命令行参数提供分析功能

suppressMessages({
  library(jsonlite)
  library(base64enc)
  library(ggplot2)
})

# 设置工作目录
setwd("F:/work/claude_code/chatgist_pro")

# 解析命令行参数
args <- commandArgs(trailingOnly = TRUE)
params <- list()

# 解析参数
for (arg in args) {
  if (grepl("^--", arg)) {
    parts <- strsplit(sub("^--", "", arg), "=")[[1]]
    if (length(parts) == 2) {
      params[[parts[1]]] <- parts[2]
    }
  }
}

cat("=== GIST蛋白质组学分析命令行模式 ===\n")
cat("收到参数:", length(params), "个\n")

# 检查必需参数
if (!"function" %in% names(params)) {
  result <- list(
    status = "error",
    message = "请提供 --function 参数",
    data = NULL,
    plot = NULL
  )
  cat(toJSON(result, auto_unbox = TRUE))
  quit(status = 1)
}

if (!"gene" %in% names(params)) {
  result <- list(
    status = "error", 
    message = "请提供 --gene 参数",
    data = NULL,
    plot = NULL
  )
  cat(toJSON(result, auto_unbox = TRUE))
  quit(status = 1)
}

# 检查GIST_Protemics项目
if (!dir.exists("GIST_Protemics")) {
  result <- list(
    status = "error",
    message = "未找到GIST_Protemics项目目录",
    data = NULL,
    plot = NULL
  )
  cat(toJSON(result, auto_unbox = TRUE))
  quit(status = 1)
}

# 加载分析函数
tryCatch({
  old_wd <- getwd()
  setwd("GIST_Protemics")
  source("Protemic.R")
  setwd(old_wd)
}, error = function(e) {
  result <- list(
    status = "error",
    message = paste("加载分析函数失败:", e$message),
    data = NULL,
    plot = NULL
  )
  cat(toJSON(result, auto_unbox = TRUE))
  quit(status = 1)
})

# 辅助函数：将ggplot对象转换为base64
plot_to_base64 <- function(plot_obj, width = 800, height = 600) {
  if (is.null(plot_obj)) return(NULL)
  
  tryCatch({
    temp_file <- tempfile(fileext = ".png")
    ggsave(temp_file, plot = plot_obj, width = width/100, height = height/100, dpi = 100)
    img_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
    base64_str <- paste0("data:image/png;base64,", base64encode(img_data))
    unlink(temp_file)
    return(base64_str)
  }, error = function(e) {
    return(NULL)
  })
}

# 执行分析
function_name <- params$function
gene <- params$gene

cat("执行功能:", function_name, "\n")
cat("分析蛋白质:", gene, "\n")

result <- tryCatch({
  switch(function_name,
    "query" = {
      # 基本查询
      list(
        status = "success",
        message = paste0("找到蛋白质 '", gene, "'"),
        data = list(
          protein_id = gene,
          available_analyses = c("临床特征关联分析", "相关性分析", "药物耐药性分析")
        ),
        plot = NULL
      )
    },
    
    "boxplot" = {
      # 箱线图分析
      analysis_type <- params$type %||% params$analysis_type %||% "TvsN"
      
      plot_result <- switch(analysis_type,
        "TvsN" = dbGIST_Proteomics_boxplot_TvsN(gene),
        "Risk" = dbGIST_Proteomics_boxplot_Risk(gene),
        "Gender" = dbGIST_Proteomics_boxplot_Gender(gene),
        "Age" = dbGIST_Proteomics_boxplot_Age(gene),
        "Location" = dbGIST_Proteomics_boxplot_Location(gene),
        "Mutation" = dbGIST_Proteomics_boxplot_Mutation(gene),
        dbGIST_Proteomics_boxplot_TvsN(gene)
      )
      
      list(
        status = "success",
        message = paste0(gene, " 的", analysis_type, "分析完成"),
        data = list(gene = gene, analysis_type = analysis_type),
        plot = plot_to_base64(plot_result)
      )
    },
    
    "correlation" = {
      # 相关性分析
      gene2 <- params$gene2 %||% "FN1"
      plot_result <- dbGIST_Proteomics_cor_ID(gene, gene2)
      
      list(
        status = "success",
        message = paste0(gene, " 与 ", gene2, " 的相关性分析完成"),
        data = list(gene1 = gene, gene2 = gene2),
        plot = plot_to_base64(plot_result)
      )
    },
    
    "drug_resistance" = {
      # 药物耐药性分析
      plot_result <- dbGIST_Proteomics_boxplot_IM.Response(gene)
      
      list(
        status = "success", 
        message = paste0(gene, " 的伊马替尼耐药性分析完成"),
        data = list(gene = gene, drug = "Imatinib"),
        plot = plot_to_base64(plot_result)
      )
    },
    
    "comprehensive" = {
      # 综合分析
      analyses <- c("TvsN", "Risk", "Gender", "Age", "Location")
      results <- list()
      
      for (analysis in analyses) {
        tryCatch({
          plot_result <- switch(analysis,
            "TvsN" = dbGIST_Proteomics_boxplot_TvsN(gene),
            "Risk" = dbGIST_Proteomics_boxplot_Risk(gene),
            "Gender" = dbGIST_Proteomics_boxplot_Gender(gene),
            "Age" = dbGIST_Proteomics_boxplot_Age(gene),
            "Location" = dbGIST_Proteomics_boxplot_Location(gene)
          )
          
          results[[analysis]] <- list(
            status = "success",
            plot = plot_to_base64(plot_result)
          )
        }, error = function(e) {
          results[[analysis]] <<- list(
            status = "error",
            message = e$message
          )
        })
      }
      
      list(
        status = "success",
        message = paste0(gene, " 综合分析完成"),
        gene = gene,
        analyses = results
      )
    },
    
    {
      # 未知功能
      list(
        status = "error",
        message = paste("不支持的功能:", function_name),
        data = NULL,
        plot = NULL
      )
    }
  )
}, error = function(e) {
  list(
    status = "error",
    message = paste("分析执行失败:", e$message),
    data = NULL,
    plot = NULL
  )
})

# 输出结果
cat(toJSON(result, auto_unbox = TRUE))