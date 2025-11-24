App({
  globalData: {
    userInfo: {
      nickname: "Marafiki",
      points: 100,
      hasSignedIn: false,
      hasSharedToday: false, // [新增] 今日是否已分享
      favorites: []
    },
    fontSizeLevel: 1, 
    isDarkMode: false
  },

  onLaunch() {
    // 读取本地存储
    const user = wx.getStorageSync('ts_user');
    const font = wx.getStorageSync('ts_font');
    const dark = wx.getStorageSync('ts_dark'); 
    
    if (user) this.globalData.userInfo = user;
    
    if (font === 0 || font === 1 || font === 2 || font === 3) {
      this.globalData.fontSizeLevel = font;
    }
    
    if (dark === true || dark === false) {
      this.globalData.isDarkMode = dark;
    }
    
    // [新增] 每日状态重置检查
    this.checkDailyReset();

    // 初始化皮肤颜色
    this.updateThemeSkin(this.globalData.isDarkMode);
  },

  // [新增] 检查是否需要重置每日任务状态
  checkDailyReset() {
    const todayStr = new Date().toDateString(); // 获取当前日期字符串 (e.g. "Mon Nov 24 2025")
    const lastDate = wx.getStorageSync('ts_last_active_date');

    if (lastDate !== todayStr) {
      // 是新的一天，重置状态
      console.log('New day detected, resetting daily tasks.');
      this.globalData.userInfo.hasSignedIn = false;
      this.globalData.userInfo.hasSharedToday = false;
      
      // 保存新日期和重置后的用户数据
      wx.setStorageSync('ts_last_active_date', todayStr);
      this.saveData();
    }
  },

  saveData() {
    wx.setStorageSync('ts_user', this.globalData.userInfo);
  },

  changeFontSize() {
    let lvl = this.globalData.fontSizeLevel;
    lvl = (lvl + 1) % 4; 
    this.globalData.fontSizeLevel = lvl;
    wx.setStorageSync('ts_font', lvl);
    return lvl;
  },

  toggleDarkMode() {
    const isDark = !this.globalData.isDarkMode;
    this.globalData.isDarkMode = isDark;
    wx.setStorageSync('ts_dark', isDark);
    this.updateThemeSkin(isDark);
    return isDark;
  },

  updateThemeSkin(isDark) {
    if (isDark) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1C1917',
        animation: { duration: 300, timingFunc: 'easeIn' }
      });
      wx.setTabBarStyle({
        backgroundColor: '#292524',
        color: '#78716c',
        selectedColor: '#2DD4BF',
        borderStyle: 'black'
      });
      wx.setBackgroundColor({ backgroundColor: '#1C1917' });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff',
        animation: { duration: 300, timingFunc: 'easeIn' }
      });
      wx.setTabBarStyle({
        backgroundColor: '#ffffff',
        color: '#a8a29e',
        selectedColor: '#2DD4BF',
        borderStyle: 'white'
      });
      wx.setBackgroundColor({ backgroundColor: '#FAFAF9' });
    }
  }
})