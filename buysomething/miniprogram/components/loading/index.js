// components/loading/index.js
Component({
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: false
    },
    // 提示文字
    text: {
      type: String,
      value: '加载中...'
    },
    // 类型: fullscreen / inline
    type: {
      type: String,
      value: 'fullscreen'
    }
  }
})
