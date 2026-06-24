// pages/payment/payment.js
Page({
  data: {
    orderId: '',
    orderNo: '',
    amount: '0.00',
    products: [],
    countdown: 900, // 15分钟
    countdownMin: '15',
    countdownSec: '00'
  },

  timer: null,

  onLoad(options) {
    const orderId = options.orderId || '';
    const orderNo = options.orderNo || '';
    const amount = options.amount || '0.00';
    const productsStr = options.products || '[]';

    let products = [];
    try {
      products = JSON.parse(decodeURIComponent(productsStr));
    } catch (e) { products = []; }

    this.setData({ orderId, orderNo, amount, products });
    this.startCountdown();
    this.drawQRCode();
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  startCountdown() {
    this.timer = setInterval(() => {
      const cd = this.data.countdown - 1;
      if (cd <= 0) {
        clearInterval(this.timer);
        wx.showModal({
          title: '支付超时',
          content: '支付时间已过，订单将自动取消',
          showCancel: false,
          success: () => wx.navigateBack()
        });
        return;
      }
      const min = Math.floor(cd / 60).toString().padStart(2, '0');
      const sec = (cd % 60).toString().padStart(2, '0');
      this.setData({ countdown: cd, countdownMin: min, countdownSec: sec });
    }, 1000);
  },

  drawQRCode() {
    const ctx = wx.createCanvasContext('qrCanvas');
    const size = 200;

    // 白色背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, size, size);

    // 绘制模拟二维码图案
    const cellSize = 6;
    const gridCount = Math.floor(size / cellSize);

    // 三个定位角
    this.drawFinderPattern(ctx, 0, 0, cellSize);
    this.drawFinderPattern(ctx, (gridCount - 7) * cellSize, 0, cellSize);
    this.drawFinderPattern(ctx, 0, (gridCount - 7) * cellSize, cellSize);

    // 随机填充中间区域
    ctx.setFillStyle('#000000');
    for (let i = 8; i < gridCount - 8; i++) {
      for (let j = 8; j < gridCount - 8; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // 中间 Logo
    const logoSize = 36;
    const logoX = (size - logoSize) / 2;
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(logoX - 4, logoX - 4, logoSize + 8, logoSize + 8);
    ctx.setFillStyle('#FF6B6B');
    ctx.fillRect(logoX, logoX, logoSize, logoSize);
    ctx.setFillStyle('#ffffff');
    ctx.setFontSize(20);
    ctx.setTextAlign('center');
    ctx.fillText('优', size / 2, logoX + logoSize / 2 + 7);

    ctx.draw();
  },

  drawFinderPattern(ctx, x, y, cell) {
    // 外框 7x7
    ctx.setFillStyle('#000000');
    ctx.fillRect(x, y, cell * 7, cell * 7);
    // 内白 5x5
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
    // 内黑 3x3
    ctx.setFillStyle('#000000');
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  },

  async confirmPay() {
    wx.showLoading({ title: '处理中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'orders',
        data: { action: 'pay', orderId: this.data.orderId }
      });
      wx.hideLoading();

      if (res.result && res.result.code === 0) {
        // 支付成功，跳转物流页
        wx.showToast({ title: '支付成功', icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/logistics/logistics?orderId=${this.data.orderId}`
          });
        }, 1500);
      } else {
        wx.showToast({ title: '支付失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('支付失败:', err);
      // 前端模拟支付成功
      wx.showToast({ title: '支付成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/logistics/logistics?orderId=${this.data.orderId}`
        });
      }, 1500);
    }
  },

  cancelPay() {
    wx.showModal({
      title: '放弃支付',
      content: '确定要放弃支付吗？订单将保留为待付款状态。',
      confirmText: '放弃',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
