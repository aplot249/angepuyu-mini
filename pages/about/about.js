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
  
  // 分享配置
  onShareAppMessage(res) {
    if(!app.globalData.userInfo.hasSharedToday){
      app.globalData.userInfo.hasSharedToday = true
      this.setData({ points: this.data.points+20 });
      app.globalData.userInfo.points = this.data.points
      app.saveData()
      wx.showToast({ title: '分享积分 +20', icon: 'none' });
    }
    return {
      title: '安哥拉华人学葡语，快来一起进步吧。',
      path: '/pages/index/index',
      // imageUrl: '/images/share-cover.png', // 假设有分享图
    }
  // else{
  //   wx.showToast({ title: '一天领取一次', icon: 'none' });
  // }
  },
})