const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false
  },

  onShow() {
    // 1. 同步全局数据
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    
    // 2. 刷新原生导航栏颜色 (适配夜间模式)
    app.updateThemeSkin(app.globalData.isDarkMode);
    
    // 3. 特殊处理：如果是白天模式，强制设置导航栏为蜜桃色以配合Banner
    if (!this.data.isDarkMode) {
       wx.setNavigationBarColor({
         frontColor: '#ffffff', 
         backgroundColor: '#FEC99D',
         animation: { duration: 0 }
       })
    }
  },
  
  onShareAppMessage() {
    if(!app.globalData.userInfo.hasSharedToday){
      app.globalData.userInfo.hasSharedToday = true
      this.setData({ points: this.data.points + 20});
      app.globalData.userInfo.points = this.data.points
      app.saveData()
      wx.showToast({ title: '分享积分 +20', icon: 'none' });
      return {
        title: '坦坦斯语-坦桑华人的斯语学习平台',
        path: '/pages/index/index'
      }
    }
  }
})