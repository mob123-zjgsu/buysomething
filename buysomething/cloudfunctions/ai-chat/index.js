const cloud = require('wx-server-sdk');
const https = require('https');

// 初始化 CloudBase
cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

// DeepSeek 配置 - 从环境变量读取
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'api.deepseek.com';

/**
 * AI 智能客服云函数
 * 优先使用商家提供的商品上下文（尺码建议、FAQ等），无匹配时使用通用知识
 */
exports.main = async (event, context) => {
  const { question, productId, productInfo: clientProductInfo, conversationHistory } = event;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 预检请求
  const isHttpCall = event.httpMethod !== undefined;
  if (isHttpCall && event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 参数验证
  if (!question || question.trim() === '') {
    return buildResponse(isHttpCall, headers, {
      code: 4001,
      message: '问题不能为空',
      data: null
    });
  }

  try {
    // 从数据库查询商品完整信息（含商家提供的尺码建议、FAQ等）
    let productInfo = null;
    if (productId) {
      try {
        const pResult = await db.collection('products').where({ _id: productId }).get();
        if (pResult.data && pResult.data.length > 0) {
          productInfo = pResult.data[0];
        }
      } catch (e) {
        console.log('查询商品上下文失败:', e.message);
      }
    }
    // 数据库查不到时用前端传来的 productInfo 做 fallback
    if (!productInfo && clientProductInfo) {
      productInfo = clientProductInfo;
    }

    // 构建系统提示词（含商家上下文）
    let systemPrompt = buildSystemPrompt(productInfo);

    // 构建消息数组
    const messages = buildMessages(systemPrompt, conversationHistory, question);

    // 调用 DeepSeek API
    const aiResult = await callDeepSeekAPI(messages);

    console.log('DeepSeek 返回结果:', aiResult);

    // 解析响应
    let answer = '抱歉，AI 暂时无法回答，请稍后再试。';
    
    if (aiResult.choices && aiResult.choices[0] && aiResult.choices[0].message) {
      answer = aiResult.choices[0].message.content;
    }

    return buildResponse(isHttpCall, headers, {
      code: 0,
      message: 'success',
      data: {
        answer: answer,
        model: 'deepseek-chat',
        usage: aiResult.usage || null
      }
    });

  } catch (err) {
    console.error('DeepSeek 调用失败:', err);

    return buildResponse(isHttpCall, headers, {
      code: 5001,
      message: 'AI 服务异常',
      data: {
        error: err.message || '网络请求失败，请检查网络连接',
        detail: err.stack
      }
    });
  }
};

/**
 * 调用 DeepSeek 官方 API
 */
function callDeepSeekAPI(messages) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 800
    });

    const options = {
      hostname: DEEPSEEK_BASE_URL,
      port: 443,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200) {
            resolve(result);
          } else {
            console.error('DeepSeek API 错误:', result);
            reject(new Error(result.error?.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          console.error('解析响应失败:', data);
          reject(new Error(`解析响应失败: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('网络请求失败:', e);
      reject(new Error(`网络请求失败: ${e.message}`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('请求超时，请检查网络连接'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(productInfo) {
  let prompt = `你是"优选购物"小程序的智能客服助手，名字叫小优。

## 你的职责
1. 热情、专业地回答用户关于商品的问题
2. 根据用户需求提供购物建议
3. 帮助用户了解商品特点、使用方法、尺码选择等
4. 如遇无法回答的问题，引导用户转人工客服

## 回答风格
- 语气友好、亲切，像朋友聊天
- 回答简洁明了，不啰嗦
- 适当使用 emoji 增加亲切感
- 如需推荐，引导用户查看商品详情

## 转人工场景
当用户询问以下问题时，引导转人工：
- 退款、售后、投诉等复杂问题
- 需要人工介入才能解决的问题
- 系统故障相关问题

## 重要规则：优先使用商家提供的信息
- 如果下面提供了商家尺码建议、FAQ等内容，回答相关问题时必须优先使用这些信息
- 只有在商家信息无法覆盖用户问题时，才使用你的通用知识补充回答
- 永远不要编造商家没有提供的信息

## 当前商品绑定（非常重要）
用户当前正在浏览的商品就是下面这件商品。当用户问"这件商品"、"这个"、"它"时，指的就是这件商品。你必须基于这件商品的信息回答，不要反问用户是哪件商品。

## 当前商品信息`;

  if (productInfo && productInfo.name) {
    const colors = productInfo.specs?.colors || productInfo.colors || [];
    const sizes = productInfo.specs?.sizes || productInfo.sizes || [];
    prompt += `
商品名称：${productInfo.name}
商品价格：¥${productInfo.price || '暂无'}
商品描述：${productInfo.description || productInfo.subtitle || '暂无'}
可选颜色：${colors.length > 0 ? colors.join('、') : '标准'}
可选尺寸：${sizes.length > 0 ? sizes.join('、') : '标准'}
销量：${productInfo.sales || 0}
评分：${productInfo.rating || 5}星
库存：${productInfo.stock || '充足'}
品类：${productInfo.category || '通用'}
材质：${productInfo.material || '详见商品详情'}`;

    // 商家尺码建议（高优先级）
    if (productInfo.sizeGuide) {
      prompt += `\n\n【商家尺码建议 - 必须优先使用】\n${typeof productInfo.sizeGuide === 'string' ? productInfo.sizeGuide : JSON.stringify(productInfo.sizeGuide)}`;
    }

    // 商家常见问题
    if (productInfo.faq && Array.isArray(productInfo.faq) && productInfo.faq.length > 0) {
      prompt += '\n\n【商家常见问题 - 必须优先使用】';
      productInfo.faq.forEach((faq, i) => {
        prompt += `\nQ${i + 1}: ${faq.q}\nA${i + 1}: ${faq.a}`;
      });
    }

    // 商家保养说明
    if (productInfo.careInstructions) {
      prompt += `\n\n【商家保养说明 - 必须优先使用】\n${productInfo.careInstructions}`;
    }
  } else {
    prompt += `
（当前无商品上下文，用户可能在通用咨询或首页）`;
  }

  return prompt;
}

/**
 * 构建消息数组
 */
function buildMessages(systemPrompt, history, currentQuestion) {
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // 添加历史对话
  if (history && Array.isArray(history) && history.length > 0) {
    // 只取最近 6 条历史记录，控制 token 消耗
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
  }

  // 添加当前问题
  messages.push({
    role: 'user',
    content: currentQuestion
  });

  return messages;
}

/**
 * 统一响应格式
 */
function buildResponse(isHttpCall, headers, data) {
  if (isHttpCall) {
    return {
      statusCode: data.code === 0 ? 200 : 400,
      headers,
      body: JSON.stringify(data)
    };
  }
  return data;
}
