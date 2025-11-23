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