# R Shiny AI分析模块
# 这个文件展示如何在R Shiny中集成AI分析功能

library(shiny)
library(httr)
library(jsonlite)
library(ggplot2)

# AI分析函数
analyzeGISTData <- function(gene_name, plot_data, plot_type = "expression") {
  # 准备AI请求
  api_url <- "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
  api_key <- Sys.getenv("ARK_API_KEY")  # 从环境变量读取
  
  # 构建分析提示
  prompt <- sprintf("
    分析GIST相关基因%s的%s数据：
    
    数据摘要：
    - 样本数：%d
    - 平均值：%.2f
    - 标准差：%.2f
    - 最大值：%.2f
    - 最小值：%.2f
    
    请提供：
    1. 数据特征分析
    2. 与GIST疾病的潜在关联
    3. 临床意义
    4. 后续研究建议
  ", 
    gene_name, 
    plot_type,
    nrow(plot_data),
    mean(plot_data$value, na.rm = TRUE),
    sd(plot_data$value, na.rm = TRUE),
    max(plot_data$value, na.rm = TRUE),
    min(plot_data$value, na.rm = TRUE)
  )
  
  # 调用AI API
  response <- POST(
    api_url,
    add_headers(
      "Authorization" = paste("Bearer", api_key),
      "Content-Type" = "application/json"
    ),
    body = list(
      model = "deepseek-v3-250324",
      messages = list(
        list(role = "system", content = "你是GIST疾病研究专家，请提供专业的数据分析。"),
        list(role = "user", content = prompt)
      ),
      temperature = 0.7
    ),
    encode = "json"
  )
  
  # 解析响应
  if (status_code(response) == 200) {
    result <- content(response, "parsed")
    return(result$choices[[1]]$message$content)
  } else {
    return("AI分析服务暂时不可用")
  }
}

# Shiny UI模块
aiAnalysisUI <- function(id) {
  ns <- NS(id)
  tagList(
    # AI分析按钮
    actionButton(ns("analyze"), "🤖 AI智能分析", 
                 class = "btn-primary",
                 style = "margin: 10px;"),
    
    # 分析结果显示区
    conditionalPanel(
      condition = sprintf("input['%s'] > 0", ns("analyze")),
      wellPanel(
        h4("AI分析结果"),
        uiOutput(ns("analysis_result"))
      )
    )
  )
}

# Shiny Server模块
aiAnalysisServer <- function(id, gene_reactive, data_reactive, plot_type_reactive) {
  moduleServer(id, function(input, output, session) {
    
    # AI分析结果
    analysis_result <- eventReactive(input$analyze, {
      withProgress(message = '正在进行AI分析...', {
        analyzeGISTData(
          gene_reactive(),
          data_reactive(),
          plot_type_reactive()
        )
      })
    })
    
    # 显示分析结果
    output$analysis_result <- renderUI({
      result <- analysis_result()
      # 将结果转换为HTML格式
      HTML(gsub("\n", "<br>", result))
    })
  })
}

# 示例：在你的主Shiny应用中使用
# ui <- fluidPage(
#   # ... 其他UI元素 ...
#   
#   # 在图表下方添加AI分析模块
#   aiAnalysisUI("ai_module")
# )
# 
# server <- function(input, output, session) {
#   # ... 其他服务器逻辑 ...
#   
#   # 假设你有这些响应式值
#   current_gene <- reactive({ input$gene_input })
#   current_data <- reactive({ your_data_processing() })
#   plot_type <- reactive({ "expression" })
#   
#   # 调用AI分析模块
#   aiAnalysisServer("ai_module", current_gene, current_data, plot_type)
# }

# 更高级的集成：自动分析
autoAnalyzeModule <- function(id) {
  moduleServer(id, function(input, output, session) {
    # 监听数据变化，自动触发分析
    observe({
      data <- data_reactive()
      if (!is.null(data) && nrow(data) > 0) {
        # 自动分析
        result <- analyzeGISTData(
          gene_reactive(),
          data,
          plot_type_reactive()
        )
        
        # 显示为通知
        showNotification(
          ui = tags$div(
            tags$h4("AI分析完成"),
            tags$p(substr(result, 1, 200), "..."),
            actionButton("show_full", "查看完整分析")
          ),
          duration = NULL,
          type = "message"
        )
      }
    })
  })
}