const app = getApp();

Page({
  data: {
    userInfo: {},
    fontSizeLevel: 1,
    fontSizeLabel: '标准',
    isDarkMode: false
  },

  onShow() {
    this.setData({ 
      userInfo: app.globalData.userInfo,
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    this.updateFontLabel(app.globalData.fontSizeLevel);
  },

  handleSignIn() {
    if(this.data.userInfo.hasSignedIn) return;
    app.globalData.userInfo.points += 20;
    app.globalData.userInfo.hasSignedIn = true;
    app.saveData();
    this.setData({ userInfo: app.globalData.userInfo });
    wx.showToast({ title: '签到成功 +20', icon: 'success' });
  },

  handleFontSize() {
    const newLvl = app.changeFontSize();
    this.setData({ fontSizeLevel: newLvl });
    this.updateFontLabel(newLvl);
    wx.showToast({ title: '字体已调整', icon: 'none' });
  },

  // 核心：切换夜间模式
  handleDarkMode() {
    const isDark = app.toggleDarkMode();
    this.setData({ isDarkMode: isDark });
    wx.showToast({ title: isDark ? '已开启夜间模式' : '已关闭夜间模式', icon: 'none' });
  },

  updateFontLabel(lvl) {
    const labels = ['紧凑', '标准', '大号', '特大'];
    this.setData({ fontSizeLabel: labels[lvl] });
  },

  goPurchase() {
    wx.navigateTo({ url: '/pages/purchase/purchase' });
  },
  navigateToContribute() {
    wx.navigateTo({ url: '/pages/contribute/contribute' });
  },
  notImplemented() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
})