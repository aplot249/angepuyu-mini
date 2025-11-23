App({
  globalData: {
    userInfo: {
      nickname: "Marafiki",
      points: 100,
      hasSignedIn: false,
      favorites: []
    },
    fontSizeLevel: 1, // 默认为 1 (标准)
    isDarkMode: false
  },

  onLaunch() {
    // 读取本地存储
    const user = wx.getStorageSync('ts_user');
    const font = wx.getStorageSync('ts_font');
    const dark = wx.getStorageSync('ts_dark'); 
    
    if (user) this.globalData.userInfo = user;
    
    // 严谨判断：因为 0 也是有效值，不能简单用 if(font)
    if (font === 0 || font === 1 || font === 2 || font === 3) {
      this.globalData.fontSizeLevel = font;
    }
    
    if (dark === true || dark === false) {
      this.globalData.isDarkMode = dark;
    }
    
    // 初始化皮肤颜色
    this.updateThemeSkin(this.globalData.isDarkMode);
  },

  saveData() {
    wx.setStorageSync('ts_user', this.globalData.userInfo);
  },

  // 切换字体方法
  changeFontSize() {
    let lvl = this.globalData.fontSizeLevel;
    lvl = (lvl + 1) % 4; // 0->1->2->3->0 循环
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