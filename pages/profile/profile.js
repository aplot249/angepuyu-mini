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

  // 1. 签到功能 (每日一次)
  handleSignIn() {
    if(this.data.userInfo.hasSignedIn) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }
    app.globalData.userInfo.points += 20;
    app.globalData.userInfo.hasSignedIn = true;
    app.saveData();
    
    this.setData({ userInfo: app.globalData.userInfo });
    wx.showToast({ title: '签到成功 +20', icon: 'success' });
  },

  // 2. 分享点击事件 (触发积分逻辑)
  // 注意：微信不再提供分享成功的明确回调，通常的做法是在用户点击分享按钮拉起分享面板时就视为“尝试分享”并给予奖励，
  // 或者引导用户分享后返回。这里我们在点击时直接判断并发放。
  handleShareTap() {
    if(this.data.userInfo.hasSharedToday) {
      // 如果今天已经分享过，仅弹出提示，不阻止原生分享面板的弹出
      // (原生 open-type="share" 会继续执行拉起分享)
      return;
    }

    // 发放奖励
    app.globalData.userInfo.points += 15;
    app.globalData.userInfo.hasSharedToday = true;
    app.saveData();
    
    this.setData({ userInfo: app.globalData.userInfo });
    
    // 延迟一点提示，以免和分享面板冲突
    setTimeout(() => {
        wx.showToast({ title: '分享奖励 +15', icon: 'success' });
    }, 500);
  },

  // 3. 配置原生分享内容
  onShareAppMessage() {
    return {
      title: '我正在用坦桑通学习斯瓦西里语，快来一起吧！',
      path: '/pages/index/index',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7541e89a43ca?w=600&q=80' // 示例封面
    }
  },

  handleFontSize() {
    const newLvl = app.changeFontSize();
    this.setData({ fontSizeLevel: newLvl });
    this.updateFontLabel(newLvl);
    wx.showToast({ title: '字体已调整', icon: 'none' });
  },

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
  navigateToPoster(){
    wx.navigateTo({ url: '/pages/share/share' });
  },
  notImplemented() {
    // wx.showToast({ title: '功能开发中', icon: 'none' });
    wx.navigateTo({ url: '/pages/share/share' });
  }

})