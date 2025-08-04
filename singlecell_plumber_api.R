# GIST Single-cell Plumber API
# 基于 ChatGIST_ssc 单细胞数据的 RESTful API

# 禁用 renv
Sys.setenv(RENV_CONFIG_ACTIVATED = FALSE)

# 加载必要的包
suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(base64enc)
  library(Seurat)
  library(ggplot2)
  library(patchwork)
  library(stringr)
  library(ggsci)
})

# 初始化
cat("=== 初始化 Single-cell Plumber API ===\n")
cat("当前工作目录:", getwd(), "\n")

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

# 加载数据集函数
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

# 自动选择最佳数据集
auto_select_dataset <- function(gene = NULL) {
  sorted_datasets <- names(dataset_info)[order(sapply(dataset_info, function(x) x$priority))]
  
  for (dataset_name in sorted_datasets) {
    tryCatch({
      if (file.exists(dataset_info[[dataset_name]]$file)) {
        seurat_obj <- load_dataset(dataset_name)
        
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

# 预加载数据集
cat("预加载可用数据集...\n")
for (dataset_name in names(dataset_info)) {
  dataset_path <- dataset_info[[dataset_name]]$file
  if (file.exists(dataset_path)) {
    tryCatch({
      load_dataset(dataset_name)
      cat("成功预加载:", dataset_name, "\n")
    }, error = function(e) {
      cat("预加载失败:", dataset_name, "-", e$message, "\n")
    })
  } else {
    cat("数据集文件不存在:", dataset_path, "\n")
  }
}

cat("Single-cell Plumber API 初始化完成\n")

#* @apiTitle GIST Single-cell Analysis API
#* @apiDescription RESTful API for GIST single-cell RNA-seq analysis
#* @apiVersion 1.0.0

#* Health check endpoint
#* @get /singlecell/health
#* @serializer json
function() {
  list(
    status = "healthy",
    service = "singlecell-plumber-api",
    timestamp = Sys.time(),
    loaded_datasets = names(loaded_datasets),
    available_datasets = names(dataset_info)[sapply(names(dataset_info), function(x) file.exists(dataset_info[[x]]$file))]
  )
}

#* Query gene information and cell types
#* @post /singlecell/query
#* @param gene:str Gene symbol
#* @param dataset:str Dataset name (optional, auto-selected if not provided)
#* @serializer json
function(gene, dataset = NULL) {
  tryCatch({
    # 自动选择数据集
    if (is.null(dataset) || dataset == "auto") {
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
    
  }, error = function(e) {
    list(
      status = "error",
      message = e$message,
      gene = gene,
      dataset = dataset
    )
  })
}

#* Generate violin plot
#* @post /singlecell/violin
#* @param gene:str Gene symbol
#* @param dataset:str Dataset name (optional)
#* @serializer json
function(gene, dataset = NULL) {
  tryCatch({
    # 自动选择数据集
    if (is.null(dataset) || dataset == "auto") {
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
    
    # 提取数据
    gene_df <- FetchData(seurat_obj, vars = c(gene, "celltype"))
    colnames(gene_df)[1] <- 'Expr'
    
    # 生成violin plot
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
    
  }, error = function(e) {
    list(
      status = "error",
      message = e$message,
      gene = gene,
      dataset = dataset
    )
  })
}

#* Generate UMAP cell type plot
#* @post /singlecell/umap_celltype
#* @param dataset:str Dataset name (optional)
#* @serializer json
function(dataset = NULL) {
  tryCatch({
    # 自动选择数据集
    if (is.null(dataset) || dataset == "auto") {
      dataset_result <- auto_select_dataset()
      dataset <- dataset_result$dataset
      seurat_obj <- dataset_result$object
    } else {
      seurat_obj <- load_dataset(dataset)
    }
    
    # 提取UMAP坐标和细胞类型
    emb_table <- seurat_obj@reductions[["umap"]]@cell.embeddings
    plot_data <- data.frame(
      emb_table,
      Cluster = seurat_obj$celltype
    )
    colnames(plot_data) <- c("UMAP_1", "UMAP_2", "Cluster")
    
    # 生成UMAP图
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
    
  }, error = function(e) {
    list(
      status = "error",
      message = e$message,
      dataset = dataset
    )
  })
}

#* Generate UMAP gene expression plot
#* @post /singlecell/umap_expression
#* @param gene:str Gene symbol
#* @param dataset:str Dataset name (optional)
#* @serializer json
function(gene, dataset = NULL) {
  tryCatch({
    # 自动选择数据集
    if (is.null(dataset) || dataset == "auto") {
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
    
    # 提取数据
    emb_table <- seurat_obj@reductions[["umap"]]@cell.embeddings
    gene_df <- FetchData(seurat_obj, vars = c(gene, "celltype"))
    colnames(gene_df)[1] <- 'Expr'
    
    plot_data <- data.frame(
      emb_table,
      Values = gene_df$Expr
    )
    colnames(plot_data) <- c("UMAP_1", "UMAP_2", "Values")
    
    # 生成UMAP基因表达图
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
    
  }, error = function(e) {
    list(
      status = "error",
      message = e$message,
      gene = gene,
      dataset = dataset
    )
  })
}

#* Comprehensive analysis (all analysis types)
#* @post /singlecell/comprehensive
#* @param gene:str Gene symbol
#* @param dataset:str Dataset name (optional)
#* @serializer json
function(gene, dataset = NULL) {
  tryCatch({
    results <- list()
    
    # 基本查询
    results$query <- query_gene_info(gene, dataset)
    
    if (results$query$status == "error") {
      return(results$query)
    }
    
    # 使用查询结果中确定的数据集
    final_dataset <- results$query$dataset
    
    # 小提琴图
    tryCatch({
      results$violin_plot <- generate_violin_plot(gene, final_dataset)
    }, error = function(e) {
      results$violin_plot <<- list(
        status = "error",
        message = paste("Violin plot failed:", e$message)
      )
    })
    
    # UMAP细胞类型图
    tryCatch({
      results$umap_celltype <- generate_umap_celltype(final_dataset)
    }, error = function(e) {
      results$umap_celltype <<- list(
        status = "error",
        message = paste("UMAP celltype plot failed:", e$message)
      )
    })
    
    # UMAP基因表达图
    tryCatch({
      results$umap_expression <- generate_umap_expression(gene, final_dataset)
    }, error = function(e) {
      results$umap_expression <<- list(
        status = "error",
        message = paste("UMAP expression plot failed:", e$message)
      )
    })
    
    # 综合信息
    successful_analyses <- sum(sapply(results, function(x) x$status == "success"))
    results$summary <- list(
      status = "success",
      gene = gene,
      dataset = final_dataset,
      analysis_types = c("query", "violin_plot", "umap_celltype", "umap_expression"),
      total_analyses = 4,
      successful_analyses = successful_analyses,
      message = paste("Comprehensive single-cell analysis completed for", gene, "using", final_dataset, "dataset.",
                     successful_analyses, "out of 4 analyses successful.")
    )
    
    return(results)
    
  }, error = function(e) {
    list(
      status = "error",
      message = e$message,
      gene = gene,
      dataset = dataset
    )
  })
}