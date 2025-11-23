const app = getApp();

Page({
  data: {
    userInfo: {},
    fontSizeLevel: 1,
    isDarkMode: false
  },

  onShow() {
    this.setData({ 
      userInfo: app.globalData.userInfo,
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });

    // [特殊处理] 充值页面单独的导航栏逻辑
    if (app.globalData.isDarkMode) {
      // 夜间模式：统一黑色风格
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1C1917', // Stone 900
        animation: { duration: 300 }
      });
      wx.setBackgroundColor({ backgroundColor: '#1C1917' });
    } else {
      // 白天模式：恢复该页面特色的橙色导航栏
      wx.setNavigationBarColor({
        frontColor: '#ffffff', // 橙色背景配白字
        backgroundColor: '#F59E0B', // Amber 500
        animation: { duration: 300 }
      });
      wx.setBackgroundColor({ backgroundColor: '#FAFAF9' });
    }
  },

  buyPoints(e) {
    const { amount, price } = e.currentTarget.dataset;
    const isUnlimited = parseInt(amount) > 10000;
    
    const content = isUnlimited 
      ? `确认支付 ¥${price} 购买无限点数？` 
      : `确认支付 ¥${price} 购买 ${amount} 点数？`;

    wx.showModal({
      title: '确认支付',
      content: content,
      confirmColor: '#2DD4BF', // 主题色
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '支付中...' });
          
          setTimeout(() => {
            wx.hideLoading();
            if (isUnlimited) {
              app.globalData.userInfo.points = 999999;
            } else {
              app.globalData.userInfo.points += parseInt(amount);
            }
            app.saveData();
            this.setData({ userInfo: app.globalData.userInfo });
            
            wx.showToast({ title: '充值成功', icon: 'success', duration: 2000 });
            setTimeout(() => { wx.navigateBack(); }, 1500);
          }, 1000);
        }
      }
    });
  }
})