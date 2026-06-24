// pages/merchant-chat-detail/merchant-chat-detail.js
Page({
  data: {
    messages: [],
    inputText: '',
    conversationId: '',
    userName: '用户',
    productName: '',
    merchantId: '',
    merchantName: '',
    scrollTop: 0,
    pollingTimer: null
  },

  onLoad(options) {
    const merchantInfo = wx.getStorageSync('merchantInfo') || {};
    this.setData({
      conversationId: options.conversationId || '',
      userName: options.userName ? decodeURIComponent(options.userName) : '用户',
      productName: options.productName ? decodeURIComponent(options.productName) : '',
      merchantId: merchantInfo.merchantId || '',
      merchantName: merchantInfo.merchantName || '商家'
    });

    this.loadMessages();
    this.markRead();
    // 每5秒轮询新消息
    this.data.pollingTimer = setInterval(() => {
      this.loadMessages(true);
    }, 5000);
  },

  onUnload() {
    if (this.data.pollingTimer) {
      clearInterval(this.data.pollingTimer);
    }
  },

  async loadMessages(silent) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'list',
          conversationId: this.data.conversationId
        }
      });
      if (res.result && res.result.code === 0) {
        const messages = (res.result.data || []).map(item => ({
          ...item,
          timeStr: item.createTime ? this.formatTime(item.createTime) : ''
        }));
        this.setData({ messages });
        this.scrollToBottom();
      }
    } catch (err) {
      if (!silent) {
        console.error('加载消息失败:', err);
      }
    }
  },

  async markRead() {
    try {
      await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'markRead',
          conversationId: this.data.conversationId,
          readerType: 'merchant'
        }
      });
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    this.setData({ inputText: '' });

    // 先本地显示消息
    const localMsg = {
      _id: 'local_' + Date.now(),
      senderType: 'merchant',
      senderName: this.data.merchantName,
      content: text,
      timeStr: this.formatTime(new Date()),
      createTime: new Date()
    };
    this.setData({ messages: [...this.data.messages, localMsg] });
    this.scrollToBottom();

    try {
      await wx.cloud.callFunction({
        name: 'chat',
        data: {
          action: 'send',
          conversationId: this.data.conversationId,
          senderType: 'merchant',
          senderName: this.data.merchantName,
          content: text,
          merchantId: this.data.merchantId,
          merchantName: this.data.merchantName
        }
      });
      // 重新加载以获取服务端时间
      this.loadMessages(true);
    } catch (err) {
      console.error('发送失败:', err);
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 99999 });
    }, 100);
  },

  formatTime(time) {
    if (!time) return '';
    const d = new Date(time);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
});
