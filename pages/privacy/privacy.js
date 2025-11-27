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
  }
})