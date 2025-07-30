const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: "d1sag5un3mk84t6hsjl0",
    baseURL: "https://api.moonshot.cn/v1",
    organization: "org-14a4dd323087471abce30132f9becc19"
});

async function testKimiAPI() {
    // 测试多种认证方式
    const testConfigs = [
        {
            name: "方式1: 使用 d1sag5un3mk84t6hsjl0 作为API密钥",
            config: {
                apiKey: "d1sag5un3mk84t6hsjl0",
                baseURL: "https://api.moonshot.cn/v1",
                organization: "org-14a4dd323087471abce30132f9becc19"
            }
        },
        {
            name: "方式2: 使用新的API密钥",
            config: {
                apiKey: "sk-aF3l0DFrnBRqreiJcIaYVbYPG6pPYXpu0Wg7aimLO4kH9U9p",
                baseURL: "https://api.moonshot.cn/v1"
            }
        },
        {
            name: "方式3: 组合格式",
            config: {
                apiKey: "org-14a4dd323087471abce30132f9becc19:d1sag5un3mk84t6hsjl0",
                baseURL: "https://api.moonshot.cn/v1"
            }
        }
    ];

    for (const testConfig of testConfigs) {
        console.log(`\n🔍 ${testConfig.name}`);
        console.log("正在测试...");

        try {
            const testClient = new OpenAI(testConfig.config);

            const completion = await testClient.chat.completions.create({
                model: "kimi-k2-0711-preview",
                messages: [
                    {
                        role: "system",
                        content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手。"
                    },
                    {
                        role: "user",
                        content: "你好，1+1等于多少？"
                    }
                ],
                temperature: 0.6
            });

            console.log("✅ 测试成功！");
            console.log("📝 响应内容：");
            console.log(completion.choices[0].message.content);
            console.log("🔧 API 详细信息：");
            console.log("- 模型:", completion.model);
            console.log("- 使用的 tokens:", completion.usage);
            return; // 成功后退出

        } catch (error) {
            console.error("❌ 测试失败：");
            console.error("错误类型:", error.constructor.name);
            console.error("错误信息:", error.message);

            if (error.response) {
                console.error("HTTP 状态码:", error.response.status);
                if (error.response.data) {
                    console.error("响应数据:", JSON.stringify(error.response.data, null, 2));
                }
            }
        }
    }

    console.log("\n❌ 所有认证方式都失败了");
    console.log("💡 建议检查：");
    console.log("1. 账户是否已激活");
    console.log("2. API密钥是否正确");
    console.log("3. 是否有足够的余额或配额");
}

// 运行测试
testKimiAPI();
