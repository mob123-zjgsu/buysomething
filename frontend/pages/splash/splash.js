Page({
  data: {
    progress: 0
  },

  onLoad(options) {
    this.animateProgress()
  },

  animateProgress() {
    const duration = 2000 // 2秒
    const interval = 20
    const steps = duration / interval
    const increment = 100 / steps
    let currentProgress = 0

    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(timer)
        this.navigateToHome()
      }
      this.setData({
        progress: currentProgress
      })
    }, interval)
  },

  navigateToHome() {
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home',
        fail: () => {
          wx.redirectTo({
            url: '/pages/home/home'
          })
        }
      })
    }, 300)
  }
})
