const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    wx.setNavigationBarTitle({ title: '隐私协议' });
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果无法返回（例如分享卡片直接打开），则跳转首页
        wx.switchTab({ url: '/pages/index/index' });
      }
    });
  }
})