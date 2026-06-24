// pages/chat/chat.js
const app = getApp();

Page({
  data: {
    messages: [],
    inputText: '',
    loading: false,
    productInfo: null,
    productId: '',
    chatType: 'ai', // 'ai' | 'merchant'
    merchantName: '商家',
    merchantId: '',
    userId: '',
    userName: '',
    conversationId: '',
    welcomeSent: false,
    showTransferModal: false,
    keyboardHeight: 0,
    scrollTop: 0,
    needScrollToBottom: true,
    pollingTimer: null
  },

  onLoad(options) {
    console.log('客服页面加载，参数:', options);

    // 聊天类型
    if (options.chatType === 'merchant') {
      const merchantName = options.merchantName ? decodeURIComponent(options.merchantName) : '商家';
      this.setData({
        chatType: 'merchant',
        merchantName,
        merchantId: options.merchantId || ''
      });
    }

    // 用户信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userId = userInfo.userId || app.globalData.openid || 'test-user-001';
    const userName = userInfo.nickName || '用户';
    this.setData({ userId, userName });

    // 如果是从商品详情页进入，获取商品信息
    if (options.productInfo) {
      try {
        const productInfo = JSON.parse(decodeURIComponent(options.productInfo));
        this.setData({
          productInfo,
          productId: productInfo._id || productInfo.id || options.productId || ''
        });
        console.log('携带商品信息:', productInfo.name);
      } catch (err) {
        console.error('解析商品信息失败:', err);
      }
    }
    if (options.productId) {
      this.setData({ productId: options.productId });
    }

    // 生成 conversationId
    if (this.data.chatType === 'merchant') {
      const mid = this.data.merchantId || 'default';
      const uid = this.data.userId;
      const pid = this.data.productId || 'general';
      this.setData({ conversationId: `${mid}_${uid}_${pid}` });
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
    wx.offKeyboardHeightChange();
    if (this.data.pollingTimer) {
      clearInterval(this.data.pollingTimer);
    }
  },

  onShow() {
    if (!this.data.welcomeSent) {
      this.sendWelcome();
    }

    // 商家聊天模式：加载历史消息 + 轮询
    if (this.data.chatType === 'merchant') {
      this.loadChatMessages();
      this.markRead();
      this.data.pollingTimer = setInterval(() => {
        this.loadChatMessages(true);
      }, 5000);
    }
  },

  onHide() {
    if (this.data.pollingTimer) {
      clearInterval(this.data.pollingTimer);
      this.data.pollingTimer = null;
    }
  },

  sendWelcome() {
    if (this.data.chatType === 'merchant') {
      // 商家模式不需要本地欢迎语，从DB加载
      this.setData({ welcomeSent: true });
      return;
    }

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

  // ======== 商家聊天：加载消息 ========
  async loadChatMessages(silent) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'list',
          conversationId: this.data.conversationId
        }
      });
      if (res.result && res.result.code === 0) {
        const dbMessages = (res.result.data || []).map(item => ({
          id: item._id,
          role: item.senderType === 'user' ? 'user' : 'assistant',
          content: item.content,
          time: item.createTime ? this.formatTime(item.createTime) : ''
        }));
        this.setData({ messages: dbMessages });
        this.scrollToBottom();
      }
    } catch (err) {
      if (!silent) console.error('加载消息失败:', err);
    }
  },

  async markRead() {
    try {
      await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'markRead',
          conversationId: this.data.conversationId,
          readerType: 'user'
        }
      });
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  },

  // ======== 输入 & 发送 ========
  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;
    if (this.data.loading) return;

    if (this.data.chatType === 'merchant') {
      this.sendMerchantMessage(text);
    } else {
      this.sendAIMessage(text);
    }
  },

  // ======== 商家模式发送 ========
  async sendMerchantMessage(text) {
    this.setData({ inputText: '' });

    // 本地先显示
    const localMsg = {
      id: 'local_' + Date.now(),
      role: 'user',
      content: text,
      time: this.formatTime(new Date())
    };
    this.setData({ messages: [...this.data.messages, localMsg] });
    this.scrollToBottom();

    try {
      await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'send',
          conversationId: this.data.conversationId,
          senderType: 'user',
          senderName: this.data.userName,
          content: text,
          productId: this.data.productId,
          productName: this.data.productInfo?.name || '',
          productImage: this.data.productInfo?.image || '',
          merchantId: this.data.merchantId,
          merchantName: this.data.merchantName,
          userId: this.data.userId
        }
      });
      // 重新加载以获取服务端时间
      this.loadChatMessages(true);
    } catch (err) {
      console.error('发送失败:', err);
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  // ======== AI 模式发送 ========
  async sendAIMessage(text) {
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

    try {
      const res = await wx.cloud.callFunction({
        name: 'ai-chat',
        data: {
          question: text,
          productId: this.data.productId || undefined,
          productInfo: this.data.productInfo,
          conversationHistory: this.data.messages.slice(0, -1)
        }
      });

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
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });

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

  onConfirm(e) {
    this.sendMessage();
  },

  onQuickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputText: question });
    this.sendMessage();
  },

  onTransferClick() {
    this.setData({ showTransferModal: true });
  },

  onCloseTransferModal() {
    this.setData({ showTransferModal: false });
  },

  onConfirmTransfer() {
    this.setData({ showTransferModal: false });
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

  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 99999 });
    }, 100);
  },

  onClearChat() {
    if (this.data.chatType === 'merchant') {
      wx.showToast({ title: '聊天记录保存在云端', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '清空聊天',
      content: '确定要清空所有聊天记录吗？',
      success: res => {
        if (res.confirm) {
          this.setData({ messages: [], welcomeSent: false });
          this.sendWelcome();
        }
      }
    });
  },

  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  onBack() {
    wx.navigateBack();
  }
});
