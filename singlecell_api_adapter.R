# Single-cell RNA-seq Analysis API Adapter
# Integrates with ChatGIST_ssc single-cell datasets
# Compatible with ChatGIST Pro AI tool calling architecture

# 加载必要包
suppressWarnings({
  library(Seurat)
  library(ggplot2)
  library(patchwork)
  library(stringr)
  library(ggsci)
  library(jsonlite)
  library(base64enc)
})

# 定义颜色主题（与原始代码保持一致）
defined_color <- c(pal_npg("nrc", alpha = 1)(9),
                   pal_lancet("lanonc", alpha = 1)(9)[c(3,5,10)])

# 全局变量
loaded_datasets <- list()
dataset_info <- list(
  "In_house" = list(
    file = "ChatGIST_ssc/In_house_ssc_reduce.RDS",
    name = "In-house GIST Single-cell Data",
    priority = 1
  ),
  "GSE254762" = list(
    file = "ChatGIST_ssc/GSE254762_ssc_reduce.RDS", 
    name = "GSE254762 GIST Single-cell Data",
    priority = 2
  ),
  "GSE162115" = list(
    file = "ChatGIST_ssc/GSE162115_ssc_reduce.RDS",
    name = "GSE162115 GIST Single-cell Data", 
    priority = 3
  )
)

#' 加载单细胞数据集
#' @param dataset_name 数据集名称
#' @return Seurat对象
load_dataset <- function(dataset_name) {
  if (dataset_name %in% names(loaded_datasets)) {
    return(loaded_datasets[[dataset_name]])
  }
  
  dataset_path <- dataset_info[[dataset_name]]$file
  if (!file.exists(dataset_path)) {
    stop(paste("Dataset file not found:", dataset_path))
  }
  
  cat("Loading dataset:", dataset_name, "\n")
  seurat_obj <- readRDS(dataset_path)
  loaded_datasets[[dataset_name]] <<- seurat_obj
  
  return(seurat_obj)
}

#' 自动选择最佳数据集（基于优先级和基因可用性）
#' @param gene 基因名称
#' @return 数据集名称和Seurat对象的列表
auto_select_dataset <- function(gene = NULL) {
  # 按优先级排序数据集
  sorted_datasets <- names(dataset_info)[order(sapply(dataset_info, function(x) x$priority))]
  
  for (dataset_name in sorted_datasets) {
    tryCatch({
      if (file.exists(dataset_info[[dataset_name]]$file)) {
        seurat_obj <- load_dataset(dataset_name)
        
        # 如果指定了基因，检查基因是否存在
        if (!is.null(gene)) {
          if (gene %in% rownames(seurat_obj)) {
            return(list(dataset = dataset_name, object = seurat_obj))
          }
        } else {
          return(list(dataset = dataset_name, object = seurat_obj))
        }
      }
    }, error = function(e) {
      cat("Failed to load dataset", dataset_name, ":", e$message, "\n")
    })
  }
  
  stop("No suitable dataset found")
}

#' 查询基因信息和细胞类型
#' @param gene 基因名称
#' @param dataset 指定数据集（可选）
query_gene_info <- function(gene, dataset = NULL) {
  # 自动选择数据集
  if (is.null(dataset)) {
    dataset_result <- auto_select_dataset(gene)
    dataset <- dataset_result$dataset
    seurat_obj <- dataset_result$object
  } else {
    seurat_obj <- load_dataset(dataset)
  }
  
  # 检查基因是否存在
  if (!gene %in% rownames(seurat_obj)) {
    return(list(
      status = "error",
      message = paste("Gene", gene, "not found in dataset", dataset),
      available_genes = head(rownames(seurat_obj), 10)
    ))
  }
  
  # 获取细胞类型信息
  cell_types <- unique(seurat_obj$celltype)
  
  # 获取基因表达统计
  gene_expr <- FetchData(seurat_obj, vars = gene)
  expr_stats <- summary(gene_expr[,1])
  
  # 按细胞类型统计表达
  celltype_expr <- FetchData(seurat_obj, vars = c(gene, "celltype"))
  colnames(celltype_expr)[1] <- "Expression"
  
  celltype_stats <- aggregate(Expression ~ celltype, data = celltype_expr, 
                             FUN = function(x) c(mean = mean(x), median = median(x), 
                                               max = max(x), positive_cells = sum(x > 0)))
  
  return(list(
    status = "success",
    dataset = dataset,
    dataset_name = dataset_info[[dataset]]$name,
    gene = gene,
    total_cells = ncol(seurat_obj),
    cell_types = cell_types,
    n_cell_types = length(cell_types),
    expression_summary = as.list(expr_stats),
    celltype_expression = celltype_stats,
    positive_cells = sum(gene_expr[,1] > 0),
    expression_range = range(gene_expr[,1])
  ))
}

#' 生成violin plot
#' @param gene 基因名称
#' @param dataset 指定数据集（可选）
generate_violin_plot <- function(gene, dataset = NULL) {
  # 自动选择数据集
  if (is.null(dataset)) {
    dataset_result <- auto_select_dataset(gene)
    dataset <- dataset_result$dataset
    seurat_obj <- dataset_result$object
  } else {
    seurat_obj <- load_dataset(dataset)
  }
  
  # 检查基因是否存在
  if (!gene %in% rownames(seurat_obj)) {
    return(list(
      status = "error",
      message = paste("Gene", gene, "not found in dataset", dataset)
    ))
  }
  
  # 提取数据（与原始代码保持一致）
  gene_df <- FetchData(seurat_obj, vars = c(gene, "celltype"))
  colnames(gene_df)[1] <- 'Expr'
  
  # 生成violin plot（使用原始代码的样式）
  p <- ggplot(gene_df, aes(x = celltype, y = Expr, fill = celltype)) +
    geom_violin(scale = "width", trim = TRUE) +
    geom_boxplot(width = 0.1, outlier.shape = NA) + 
    scale_fill_manual(values = defined_color) + 
    theme_bw() +
    ylab(gene) +
    theme(
      legend.position = 'none',
      panel.background = element_rect(fill = "#F3F6F6"),
      panel.border = element_rect(linewidth = 1.2),
      panel.grid.major = element_line(colour = "#DEE2E4",
                                      linewidth = 0.5,
                                      linetype = "dashed"),
      plot.title = element_text(hjust = 0.5,
                                size = 14,
                                colour = "darkred",
                                face = "bold"),
      axis.title.y = element_text(size = 12,
                                  colour = "darkred",
                                  face = "bold"),
      axis.text.x = element_text(size = 10,
                                 angle = 45,
                                 hjust = 1,
                                 face = "bold"),
      axis.text.y = element_text(size = 10,
                                 face = "bold"),
      axis.title.x = element_blank()
    )
  
  # 保存为临时文件并转换为base64
  temp_file <- tempfile(fileext = ".png")
  ggsave(temp_file, plot = p, width = 10, height = 6, dpi = 300)
  
  # 转换为base64
  img_base64 <- base64encode(temp_file)
  
  # 清理临时文件
  unlink(temp_file)
  
  # 返回结果
  return(list(
    status = "success",
    dataset = dataset,
    gene = gene,
    plot_type = "violin_plot",
    image_base64 = img_base64,
    cell_types = unique(gene_df$celltype),
    summary = paste("Violin plot showing", gene, "expression across", 
                   length(unique(gene_df$celltype)), "cell types in", dataset)
  ))
}

#' 生成UMAP细胞类型图
#' @param dataset 指定数据集（可选）
generate_umap_celltype <- function(dataset = NULL) {
  # 自动选择数据集
  if (is.null(dataset)) {
    dataset_result <- auto_select_dataset()
    dataset <- dataset_result$dataset
    seurat_obj <- dataset_result$object
  } else {
    seurat_obj <- load_dataset(dataset)
  }
  
  # 提取UMAP坐标和细胞类型（与原始代码保持一致）
  emb_table <- seurat_obj@reductions[["umap"]]@cell.embeddings
  plot_data <- data.frame(
    emb_table,
    Cluster = seurat_obj$celltype
  )
  colnames(plot_data) <- c("UMAP_1", "UMAP_2", "Cluster")
  
  # 生成UMAP图（使用原始代码的样式）
  p <- ggplot(plot_data, aes(x = UMAP_1, y = UMAP_2, color = Cluster)) +
    geom_point(size = 0.5) +
    theme_bw() + 
    guides(color = guide_legend(override.aes = list(size = 3))) +
    scale_color_manual(values = defined_color) + 
    theme(
      panel.background = element_rect(fill = "#F3F6F6"),
      panel.border = element_rect(linewidth = 1.2),
      panel.grid.major = element_line(colour = "#DEE2E4",
                                      linewidth = 0.5,
                                      linetype = "dashed"),
      plot.title = element_text(hjust = 0.5,
                                size = 14,
                                colour = "darkred",
                                face = "bold"),
      axis.title.y = element_text(size = 12,
                                  colour = "darkred",
                                  face = "bold"),
      axis.text.x = element_text(size = 10,
                                 face = "bold"),
      axis.text.y = element_text(size = 10,
                                 face = "bold"),
      axis.title.x = element_text(size = 12,
                                  colour = "darkred",
                                  face = "bold")
    )
  
  # 保存为临时文件并转换为base64
  temp_file <- tempfile(fileext = ".png")
  ggsave(temp_file, plot = p, width = 10, height = 8, dpi = 300)
  
  # 转换为base64
  img_base64 <- base64encode(temp_file)
  
  # 清理临时文件
  unlink(temp_file)
  
  return(list(
    status = "success",
    dataset = dataset,
    plot_type = "umap_celltype",
    image_base64 = img_base64,
    cell_types = unique(plot_data$Cluster),
    total_cells = nrow(plot_data),
    summary = paste("UMAP visualization showing", length(unique(plot_data$Cluster)), 
                   "cell types in", dataset, "dataset")
  ))
}

#' 生成UMAP基因表达图
#' @param gene 基因名称
#' @param dataset 指定数据集（可选）
generate_umap_expression <- function(gene, dataset = NULL) {
  # 自动选择数据集
  if (is.null(dataset)) {
    dataset_result <- auto_select_dataset(gene)
    dataset <- dataset_result$dataset
    seurat_obj <- dataset_result$object
  } else {
    seurat_obj <- load_dataset(dataset)
  }
  
  # 检查基因是否存在
  if (!gene %in% rownames(seurat_obj)) {
    return(list(
      status = "error",
      message = paste("Gene", gene, "not found in dataset", dataset)
    ))
  }
  
  # 提取数据（与原始代码保持一致）
  emb_table <- seurat_obj@reductions[["umap"]]@cell.embeddings
  gene_df <- FetchData(seurat_obj, vars = c(gene, "celltype"))
  colnames(gene_df)[1] <- 'Expr'
  
  plot_data <- data.frame(
    emb_table,
    Values = gene_df$Expr
  )
  colnames(plot_data) <- c("UMAP_1", "UMAP_2", "Values")
  
  # 生成UMAP基因表达图（使用原始代码的样式）
  p <- ggplot(plot_data, aes(UMAP_1, UMAP_2, color = Values)) +
    geom_point(size = 0.5) +
    scale_color_gradient(
      low = "grey80",       # 浅灰色起点
      high = "darkred",     # 深红色终点
      na.value = "grey90"   # 缺失值颜色
    ) + 
    theme_bw() +
    labs(color = gene) +
    theme(
      panel.background = element_rect(fill = "#F3F6F6"),
      panel.border = element_rect(linewidth = 1.2),
      panel.grid.major = element_line(colour = "#DEE2E4",
                                      linewidth = 0.5,
                                      linetype = "dashed"),
      plot.title = element_text(hjust = 0.5,
                                size = 14,
                                colour = "darkred",
                                face = "bold"),
      axis.title.y = element_text(size = 12,
                                  colour = "darkred",
                                  face = "bold"),
      axis.text.x = element_text(size = 10,
                                 face = "bold"),
      axis.text.y = element_text(size = 10,
                                 face = "bold"),
      axis.title.x = element_text(size = 12,
                                  colour = "darkred",
                                  face = "bold")
    )
  
  # 保存为临时文件并转换为base64
  temp_file <- tempfile(fileext = ".png")
  ggsave(temp_file, plot = p, width = 10, height = 8, dpi = 300)
  
  # 转换为base64
  img_base64 <- base64encode(temp_file)
  
  # 清理临时文件
  unlink(temp_file)
  
  return(list(
    status = "success",
    dataset = dataset,
    gene = gene,
    plot_type = "umap_expression",
    image_base64 = img_base64,
    expression_range = range(plot_data$Values),
    positive_cells = sum(plot_data$Values > 0),
    total_cells = nrow(plot_data),
    summary = paste("UMAP visualization showing", gene, "expression in", dataset, "dataset")
  ))
}

#' 综合分析（执行所有分析类型）
#' @param gene 基因名称
#' @param dataset 指定数据集（可选）
comprehensive_analysis <- function(gene, dataset = NULL) {
  results <- list()
  
  # 基本查询
  results$query <- query_gene_info(gene, dataset)
  
  if (results$query$status == "error") {
    return(results$query)
  }
  
  # 使用查询结果中确定的数据集
  final_dataset <- results$query$dataset
  
  # Violin plot
  results$violin_plot <- generate_violin_plot(gene, final_dataset)
  
  # UMAP细胞类型图
  results$umap_celltype <- generate_umap_celltype(final_dataset)
  
  # UMAP基因表达图
  results$umap_expression <- generate_umap_expression(gene, final_dataset)
  
  # 综合信息
  results$summary <- list(
    status = "success",
    gene = gene,
    dataset = final_dataset,
    analysis_types = c("query", "violin_plot", "umap_celltype", "umap_expression"),
    total_analyses = 4,
    message = paste("Comprehensive single-cell analysis completed for", gene, "using", final_dataset, "dataset")
  )
  
  return(results)
}

# 主函数：处理命令行参数
main <- function() {
  # 解析命令行参数
  args <- commandArgs(trailingOnly = TRUE)
  
  if (length(args) == 0) {
    cat("Usage: Rscript singlecell_api_adapter.R --function=<function> --gene=<gene> [--dataset=<dataset>]\n")
    cat("Functions: query, violin_plot, umap_celltype, umap_expression, comprehensive\n")
    quit(status = 1)
  }
  
  # 解析参数
  params <- list()
  for (arg in args) {
    if (grepl("^--", arg)) {
      parts <- strsplit(arg, "=")[[1]]
      key <- gsub("^--", "", parts[1])
      value <- ifelse(length(parts) > 1, parts[2], TRUE)
      params[[key]] <- value
    }
  }
  
  # 检查必需参数
  if (is.null(params$`function`)) {
    cat("Error: --function parameter is required\n")
    quit(status = 1)
  }
  
  func_name <- params$`function`
  gene <- params$gene
  dataset <- params$dataset
  
  # 执行相应函数
  result <- tryCatch({
    switch(func_name,
      "query" = {
        if (is.null(gene)) stop("Gene parameter required for query function")
        query_gene_info(gene, dataset)
      },
      "violin_plot" = {
        if (is.null(gene)) stop("Gene parameter required for violin_plot function")
        generate_violin_plot(gene, dataset)
      },
      "umap_celltype" = {
        generate_umap_celltype(dataset)
      },
      "umap_expression" = {
        if (is.null(gene)) stop("Gene parameter required for umap_expression function")
        generate_umap_expression(gene, dataset)
      },
      "comprehensive" = {
        if (is.null(gene)) stop("Gene parameter required for comprehensive function")
        comprehensive_analysis(gene, dataset)
      },
      stop(paste("Unknown function:", func_name))
    )
  }, error = function(e) {
    list(
      status = "error",
      message = e$message,
      function_name = func_name,
      parameters = params
    )
  })
  
  # 输出JSON结果
  cat(toJSON(result, auto_unbox = TRUE, pretty = TRUE))
}

# 如果脚本直接运行，执行主函数
if (!interactive()) {
  main()
}