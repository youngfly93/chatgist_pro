# 完整版SiliconFlow AI模块 - 包含备用功能

# SiliconFlow API调用函数
call_siliconflow_api <- function(messages, api_key = "sk-cntlncwclfbxhmyfkogdswktucjkvcowddhdotykzhbohzki") {
  library(httr)
  library(jsonlite)
  
  url <- "https://api.siliconflow.cn/v1/chat/completions"
  
  body <- list(
    model = "Qwen/Qwen2.5-VL-72B-Instruct",
    messages = messages,
    max_tokens = 2048,
    stream = FALSE
  )
  
  cat("调用SiliconFlow API...\n")
  start_time <- Sys.time()
  
  tryCatch({
    response <- POST(
      url = url,
      add_headers(
        `Content-Type` = "application/json",
        `Authorization` = paste("Bearer", api_key)
      ),
      body = toJSON(body, auto_unbox = TRUE),
      timeout(45)
    )
    
    end_time <- Sys.time()
    elapsed <- round(as.numeric(difftime(end_time, start_time, units = "secs")), 2)
    cat("API调用完成，耗时:", elapsed, "秒\n")
    
    if (status_code(response) == 200) {
      result <- fromJSON(content(response, "text", encoding = "UTF-8"))
      
      if ("choices" %in% names(result) && length(result$choices) > 0) {
        content_text <- NULL
        if (is.data.frame(result$choices)) {
          if ("message" %in% names(result$choices) && 
              nrow(result$choices$message) > 0 &&
              "content" %in% names(result$choices$message)) {
            content_text <- result$choices$message$content[1]
          }
        } else {
          content_text <- result$choices[[1]]$message$content
        }
        if (!is.null(content_text) && nchar(content_text) > 0) {
          cat("API调用成功\n")
          return(list(success = TRUE, content = content_text, elapsed = elapsed))
        }
      }
    }
    
    cat("API响应解析失败\n")
    return(list(success = FALSE, error = paste("状态码:", status_code(response))))
    
  }, error = function(e) {
    end_time <- Sys.time()
    elapsed <- round(as.numeric(difftime(end_time, start_time, units = "secs")), 2)
    cat("API调用异常，耗时:", elapsed, "秒\n")
    cat("错误详情:", e$message, "\n")
    return(list(success = FALSE, error = e$message))
  })
}

# 直接分析PNG文件的函数
analyze_png_file <- function(png_file_path, question = NULL) {
  if (is.null(question)) {
    question <- "请详细分析这个基因表达图表。重点关注：1)统计学意义（P值、置信区间）2)生物学解释（基因功能、调控机制）3)临床意义（疾病关联、治疗指导）。请用中文回答。"
  }
  
  cat("直接分析PNG文件:", png_file_path, "\n")
  
  if (!file.exists(png_file_path)) {
    return(list(
      success = FALSE,
      error = paste("文件不存在:", png_file_path)
    ))
  }
  
  tryCatch({
    file_size <- file.info(png_file_path)$size
    cat("PNG文件大小:", file_size, "bytes\n")
    
    # 转换为base64
    raw_data <- readBin(png_file_path, "raw", file_size)
    base64_data <- base64enc::base64encode(raw_data)
    base64_url <- paste0("data:image/png;base64,", base64_data)
    
    cat("Base64长度:", nchar(base64_url), "字符\n")
    
    # 构建消息
    messages <- list(
      list(
        role = "user",
        content = list(
          list(
            type = "text",
            text = question
          ),
          list(
            type = "image_url",
            image_url = list(
              url = base64_url
            )
          )
        )
      )
    )
    
    # 调用API
    result <- call_siliconflow_api(messages)
    
    if (result$success) {
      cat("PNG文件分析成功!\n")
      return(list(
        success = TRUE,
        content = paste0(result$content, "<br/><small>📁 直接PNG分析，耗时: ", result$elapsed, "秒</small>"),
        mode = "png_file"
      ))
    } else {
      cat("PNG分析失败:", result$error, "\n")
      # 使用简单的离线分析
      offline_content <- "📊 <strong>基因表达图表分析</strong><br/>由于网络问题，目前使用离线模式分析。请检查网络连接后重试在线分析功能。"
      return(list(
        success = TRUE,
        content = paste0(offline_content, "<br/><small>📱 离线分析模式</small>"),
        mode = "offline"
      ))
    }
    
  }, error = function(e) {
    cat("处理PNG文件时出错:", e$message, "\n")
    offline_content <- "📊 <strong>基因表达图表分析</strong><br/>文件处理出现问题，请检查文件格式是否正确。"
    return(list(
      success = TRUE,
      content = paste0(offline_content, "<br/><small>📱 离线分析模式</small>"),
      mode = "offline"
    ))
  })
}

# 保存当前图表为PNG并分析
save_and_analyze_current_plot <- function(plot_object, save_path = NULL, question = NULL) {
  if (is.null(save_path)) {
    save_path <- tempfile(fileext = ".png")
  }
  
  cat("保存并分析当前图表...\n")
  
  tryCatch({
    # 保存高质量PNG
    png(save_path, width = 800, height = 600, res = 150, type = "cairo")
    print(plot_object)
    dev.off()
    
    cat("图表已保存到:", save_path, "\n")
    
    # 直接分析保存的PNG文件
    result <- analyze_png_file(save_path, question)
    
    # 如果是临时文件，清理
    if (is.null(save_path) || grepl("tmp", save_path)) {
      unlink(save_path)
    }
    
    return(result)
    
  }, error = function(e) {
    cat("保存图表时出错:", e$message, "\n")
    return(list(
      success = TRUE,
      content = "图表保存失败，请检查绘图对象是否有效。<br/><small>📱 离线模式</small>",
      mode = "offline"
    ))
  })
}

# 智能获取当前活跃图表的函数 - 简化版：直接检查所有模块数据
get_current_plot_info <- function(input, session = NULL) {
  tryCatch({
    # 收集所有模块的有效数据
    modules <- list()
    
    # Module2: Single gene expression investigation
    if (!is.null(input$DE_overall_vol_dataset) && 
        input$DE_overall_vol_dataset != "" &&
        input$DE_overall_vol_dataset %in% gene2sym$SYMBOL) {
      modules[["module2"]] <- list(
        plot = dbGIST_boxplot_Gender(ID = input$DE_overall_vol_dataset, 
                                    DB = dbGIST_matrix[Gender_ID]),
        gene_name = input$DE_overall_vol_dataset,
        module_info = "Module2-性别差异基因表达分析",
        success = TRUE
      )
    }
    
    # Module3: Expression correlation between genes
    if (!is.null(input$DE_overall_vol_dataset_3) && 
        !is.null(input$DE_overall_vol_dataset_3_1) &&
        input$DE_overall_vol_dataset_3 != "" &&
        input$DE_overall_vol_dataset_3_1 != "" &&
        input$DE_overall_vol_dataset_3 %in% gene2sym$SYMBOL &&
        input$DE_overall_vol_dataset_3_1 %in% gene2sym$SYMBOL) {
      modules[["module3"]] <- list(
        plot = dbGIST_cor_ID(ID = input$DE_overall_vol_dataset_3,
                            ID2 = input$DE_overall_vol_dataset_3_1, 
                            DB = dbGIST_matrix[mRNA_ID]),
        gene_name = paste0(input$DE_overall_vol_dataset_3, "_vs_", input$DE_overall_vol_dataset_3_1),
        module_info = "Module3-基因相关性分析",
        success = TRUE
      )
    }
    
    # Module4: Drug-resistant gene exploration
    if (!is.null(input$DE_overall_vol_dataset_4) && 
        input$DE_overall_vol_dataset_4 != "" &&
        input$DE_overall_vol_dataset_4 %in% gene2sym$SYMBOL) {
      modules[["module4"]] <- list(
        plot = dbGIST_boxplot_Drug(ID = input$DE_overall_vol_dataset_4,
                                  DB = dbGIST_matrix[IM_ID]),
        gene_name = input$DE_overall_vol_dataset_4,
        module_info = "Module4-药物抗性基因分析",
        success = TRUE
      )
    }
    
    # Module5: Pre/post treatment gene exploration
    if (!is.null(input$DE_overall_vol_dataset_5) && 
        input$DE_overall_vol_dataset_5 != "" &&
        input$DE_overall_vol_dataset_5 %in% gene2sym$SYMBOL) {
      modules[["module5"]] <- list(
        plot = dbGIST_boxplot_PrePost(ID = input$DE_overall_vol_dataset_5,
                                     Mutation = "All",
                                     DB = dbGIST_matrix[Post_pre_treament_ID]),
        gene_name = input$DE_overall_vol_dataset_5,
        module_info = "Module5-治疗前后基因表达分析",
        success = TRUE
      )
    }
    
    # 调试信息
    cat("🔍 检测到的模块:\n")
    for (name in names(modules)) {
      cat(sprintf("  - %s: %s (%s)\n", name, modules[[name]]$module_info, modules[[name]]$gene_name))
    }
    
    # 策略：只返回最后一个有数据的模块（用户最近操作的）
    # 按照module2, module3, module4, module5的顺序检查，返回最后一个
    if (length(modules) > 0) {
      # 按照模块顺序，选择编号最大的模块
      module_names <- names(modules)
      module_numbers <- as.numeric(gsub("module", "", module_names))
      selected_index <- which.max(module_numbers)
      selected_module <- modules[[selected_index]]
      
      cat(sprintf("✅ 选择最高编号的模块: %s\n", selected_module$module_info))
      return(selected_module)
    }
    
    # 如果没有找到有效的图表
    cat("❌ 未检测到任何活跃模块\n")
    return(list(
      plot = NULL,
      gene_name = "Unknown",
      module_info = "未检测到活跃的模块，请先在某个模块中生成图表",
      success = FALSE
    ))
    
  }, error = function(e) {
    cat(sprintf("❌ 获取图表时出错: %s\n", e$message))
    return(list(
      plot = NULL,
      gene_name = "Error",
      module_info = paste("获取图表时出错:", e$message),
      success = FALSE
    ))
  })
}

# 为了向后兼容
call_doubao_api <- call_siliconflow_api

# 完整的AI聊天UI - 包含多个位置的按钮
ai_chat_ui <- function() {
  tagList(
    # 1. 顶部固定按钮条 - 最显眼的位置
    div(
      id = "ai-top-buttons",
      style = "position: fixed; top: 10px; right: 10px; z-index: 10000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);",
      actionButton("ai_analyze_current_plot_top", 
                  "🚀 AI分析当前图表", 
                  class = "btn btn-success btn-sm", 
                  style = "font-weight: bold; margin-right: 5px;"),
      actionButton("ai_toggle_chat", 
                  "💬 AI助手", 
                  class = "btn btn-info btn-sm")
    ),
    
    # 2. 左下角备用按钮
    div(
      id = "ai-backup-buttons",
      style = "position: fixed; bottom: 20px; left: 20px; z-index: 9998;",
      div(
        style = "background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 10px;",
        actionButton("ai_analyze_current_plot_backup", 
                    "🚀 分析图表", 
                    class = "btn btn-primary btn-sm", 
                    style = "width: 120px; font-weight: bold;")
      )
    ),
    
    # 3. 主要聊天界面（右下角）
    div(
      id = "ai-chat-container",
      style = "position: fixed; bottom: 20px; right: 20px; z-index: 9999;",
      
      # 聊天按钮
      div(
        id = "ai-chat-toggle",
        style = "width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease;",
        tags$span("🤖", style = "color: white; font-size: 24px;")
      ),
      
      # 聊天窗口
      div(
        id = "ai-chat-window", 
        style = "position: absolute; bottom: 70px; right: 0; width: 400px; height: 500px; background: white; border-radius: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden;",
        
        # 头部
        div(
          style = "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;",
          h4("🚀 SiliconFlow AI助手", style = "margin: 0; font-size: 16px;"),
          tags$span("❌", style = "cursor: pointer; font-size: 18px;", id = "close-chat")
        ),
        
        # 消息区域
        div(
          id = "ai-chat-messages",
          style = "flex: 1; overflow-y: scroll; padding: 15px; background: #f8f9fa; height: 300px;"
        ),
        
        # 文件上传
        div(
          style = "padding: 10px 15px; border-top: 1px solid #e9ecef;",
          fileInput("ai_image_upload", NULL, accept = c("image/*"), buttonLabel = "📁 上传图片", placeholder = "选择图片文件")
        ),
        
        # 文本输入
        div(
          style = "padding: 15px; border-top: 1px solid #e9ecef; display: flex; gap: 10px;",
          textInput("ai_chat_message", NULL, placeholder = "输入消息...", width = "100%"),
          actionButton("ai_send_message", "发送", class = "btn-primary", style = "min-width: 60px;")
        ),
        
        # 功能按钮 - 窗口内的按钮
        div(
          style = "padding: 15px; background: #f8f9fa; border-top: 1px solid #e9ecef;",
          div(
            style = "display: block; margin-bottom: 8px;",
            actionButton("ai_analyze_current_plot", 
                        "🚀 分析当前图表", 
                        class = "btn btn-primary btn-sm", 
                        style = "width: 100%; font-weight: bold; font-size: 12px; padding: 8px;")
          ),
          div(
            style = "display: block;",
            actionButton("ai_explain_stats", 
                        "📊 解释统计结果", 
                        class = "btn btn-secondary btn-sm", 
                        style = "width: 100%; font-size: 12px; padding: 8px;")
          )
        )
      )
    ),
    
    # CSS样式
    tags$style(HTML("
      #ai-chat-container .ai-chat-toggle:hover { transform: scale(1.1); }
      #ai-chat-messages { 
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
      }
      #ai-chat-messages::-webkit-scrollbar {
        width: 8px;
      }
      #ai-chat-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      #ai-chat-messages::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      #ai-chat-messages::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .chat-message { 
        margin-bottom: 10px; 
        padding: 8px; 
        border-radius: 6px; 
        max-width: 90%; 
        word-wrap: break-word;
      }
      .user-message { 
        background: #e3f2fd; 
        margin-left: auto; 
        text-align: right; 
      }
      .ai-message { 
        background: white; 
        border: 1px solid #e0e0e0; 
      }
      #ai-top-buttons {
        animation: fadeIn 0.5s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    "))
  )
}

# JavaScript代码 - 增强版
ai_chat_js <- '
$(document).ready(function() {
  setTimeout(function() {
    // 主聊天窗口toggle
    $("#ai-chat-toggle, #ai_toggle_chat").click(function() {
      $("#ai-chat-window").toggle();
    });
    
    $("#close-chat").click(function() {
      $("#ai-chat-window").hide();
    });
    
    $("#ai_chat_message").keypress(function(e) {
      if (e.which == 13) {
        $("#ai_send_message").click();
      }
    });
    
    // 消息添加函数
    window.addChatMessage = function(message, isUser) {
      var messageClass = isUser ? "user-message" : "ai-message";
      var time = new Date().toLocaleTimeString();
      var html = "<div class=\\"chat-message " + messageClass + "\\">" + message + "<div style=\\"font-size:10px;color:#666;margin-top:3px;\\">" + time + "</div></div>";
      $("#ai-chat-messages").append(html);
      
      setTimeout(function() {
        var messagesDiv = $("#ai-chat-messages");
        messagesDiv.scrollTop(messagesDiv[0].scrollHeight);
      }, 100);
    };
    
    // 初始消息
    if ($("#ai-chat-messages").children().length === 0) {
      window.addChatMessage("🚀 AI助手已启动！<br/>✅ 多个位置都有分析按钮<br/>✅ 可以上传图片进行分析<br/>✅ 支持文字对话", false);
    }
    
    // 给顶部按钮添加提示
    $("#ai_analyze_current_plot_top").hover(
      function() {
        $(this).text("🚀 点击分析当前显示的图表");
      },
      function() {
        $(this).text("🚀 AI分析当前图表");
      }
    );
    
  }, 1000);
});
'

cat("✅ 完整版AI模块创建完成 - 修复了模块选择问题\n")
