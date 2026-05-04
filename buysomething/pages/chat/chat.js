// pages/chat/chat.js
const app = getApp();

Page({
  data: {
    // 消息列表
    messages: [],
    // 输入框内容
    inputText: '',
    // 发送中状态
    loading: false,
    // 商品信息（如果有）
    productInfo: null,
    // AI 欢迎语
    welcomeSent: false,
    // 转人工确认弹窗
    showTransferModal: false,
    // 键盘高度
    keyboardHeight: 0,
    // 滚动相关
    scrollTop: 0,
    needScrollToBottom: true
  },

  onLoad(options) {
    console.log('客服页面加载，参数:', options);

    // 如果是从商品详情页进入，获取商品信息
    if (options.productInfo) {
      try {
        const productInfo = JSON.parse(decodeURIComponent(options.productInfo));
        this.setData({ productInfo });
        console.log('携带商品信息:', productInfo.name);
      } catch (err) {
        console.error('解析商品信息失败:', err);
      }
    }

    // 监听键盘高度变化
    wx.onKeyboardHeightChange(res => {
      this.setData({ keyboardHeight: res.height });
      if (res.height > 0) {
        this.scrollToBottom();
      }
    });
  },

  onUnload() {
    // 移除键盘监听
    wx.offKeyboardHeightChange();
  },

  onShow() {
    // 发送欢迎语（只发送一次）
    if (!this.data.welcomeSent) {
      this.sendWelcome();
    }
  },

  /**
   * 发送欢迎语
   */
  sendWelcome() {
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '👋 您好！我是小优，您的智能购物助手。\n\n我可以帮您：\n• 解答商品相关问题\n• 提供尺码选择建议\n• 介绍商品使用方法\n• 推荐适合您的商品\n\n有什么可以帮到您的吗？',
      time: this.formatTime(new Date())
    };

    this.setData({
      messages: [welcomeMessage],
      welcomeSent: true
    });

    this.scrollToBottom();
  },

  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  /**
   * 发送消息
   */
  async sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;
    if (this.data.loading) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      time: this.formatTime(new Date())
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: '',
      loading: true,
      needScrollToBottom: true
    });

    this.scrollToBottom();

    // 调用 AI
    try {
      const res = await wx.cloud.callFunction({
        name: 'ai-chat',
        data: {
          question: text,
          productInfo: this.data.productInfo,
          conversationHistory: this.data.messages.slice(0, -1)
        }
      });

      console.log('AI 响应:', res.result);

      let aiAnswer = '抱歉，我暂时无法回答您的问题，请稍后再试。';

      if (res.result) {
        if (res.result.code === 0) {
          aiAnswer = res.result.data?.answer || aiAnswer;
        } else if (res.result.data?.fallback) {
          aiAnswer = res.result.data?.error || aiAnswer;
        }
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiAnswer,
        time: this.formatTime(new Date())
      };

      this.setData({
        messages: [...this.data.messages, aiMessage],
        needScrollToBottom: true
      });

      this.scrollToBottom();

    } catch (err) {
      console.error('调用 AI 失败:', err);
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none'
      });

      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '😅 网络开小差了，请稍后再试试~',
        time: this.formatTime(new Date())
      };

      this.setData({
        messages: [...this.data.messages, errorMessage],
        needScrollToBottom: true
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 点击回车发送
   */
  onConfirm(e) {
    this.sendMessage();
  },

  /**
   * 快捷问题点击
   */
  onQuickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputText: question });
    this.sendMessage();
  },

  /**
   * 转人工按钮点击
   */
  onTransferClick() {
    this.setData({ showTransferModal: true });
  },

  /**
   * 关闭转人工弹窗
   */
  onCloseTransferModal() {
    this.setData({ showTransferModal: false });
  },

  /**
   * 确认转人工
   */
  onConfirmTransfer() {
    this.setData({ showTransferModal: false });

    // 添加系统消息
    const systemMessage = {
      id: Date.now(),
      role: 'system',
      content: '⏳ 正在为您转接人工客服，请稍候...\n\n（人工客服功能正在建设中，敬请期待！）',
      time: this.formatTime(new Date())
    };

    this.setData({
      messages: [...this.data.messages, systemMessage],
      needScrollToBottom: true
    });

    this.scrollToBottom();
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 99999 });
    }, 100);
  },

  /**
   * 清空聊天
   */
  onClearChat() {
    wx.showModal({
      title: '清空聊天',
      content: '确定要清空所有聊天记录吗？',
      success: res => {
        if (res.confirm) {
          this.setData({
            messages: [],
            welcomeSent: false
          });
          this.sendWelcome();
        }
      }
    });
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  }
});
