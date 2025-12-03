const app = getApp();
import {http,fileupload } from '../../requests/index'

Page({
  data: {
    userInfo: {},
    fontSizeLevel: 1,
    fontSizeLabel: '标准',
    isDarkMode: false,
    
    // 弹窗相关数据
    showFeedbackModal: false,
    feedbackContent: '',
    feedbackLen: 0
  },

  onShow() {
    this.setData({ 
      userInfo: app.globalData.userInfo,
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    this.updateFontLabel(app.globalData.fontSizeLevel);
  },

  // --- 登录与用户信息 ---
  handleLogin() {
      wx.showLoading({ title: '登录中...' });
      wx.getUserProfile({
        desc: '需微信授权登录', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          wx.login({
            timeout: 8000,
            success: r => {
              console.log(r.code)
              http('/user/openid/', 'POST', {
                code: r.code,
                gender: res.userInfo.gender,
                wxnickname: res.userInfo.nickName,
              }).then(res => {
                //console.log(res.user, res.token)
                const newInfo = {
                  ...res.user,
                  isLoggedIn: true,
                };
                app.globalData.userInfo = newInfo;
                app.saveData();
                this.setData({ userInfo: newInfo });
                wx.showToast({ title: '登录成功', icon: 'success' });
//                 wx.setStorageSync('userInfo', JSON.stringify(res.user))
//                 wx.showToast({ title: '登录成功', icon: 'success' });
//                 wx.setStorageSync('favorites', res.user.favorites)
                wx.setStorageSync('token', res.token)
              })
            }
          })
        }
      })
  },

  navigateToAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  // [新增] 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: '#FF8A65',
      success: (res) => {
        if (res.confirm) {
          // 重置用户状态，保留积分等数据通常取决于业务需求，这里仅重置登录态
          const newInfo = {
            // ...this.data.userInfo,
            isLoggedIn: false,
            // 可选：重置头像和昵称回默认
            // nickname: "Marafiki", 
            // avatarUrl: "" 
          };
          wx.setStorageSync('token', '')
          this.setData({ userInfo: newInfo });
          app.globalData.userInfo = newInfo;
          app.saveData();
          
          wx.showToast({ title: '已退出', icon: 'none' });
        }
      }
    });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    const newInfo = { ...this.data.userInfo, avatarUrl };
    this.setData({ userInfo: newInfo });
    app.globalData.userInfo = newInfo;
    app.saveData();
    fileupload('/user/userinfo/',avatarUrl,'avatarUrl',{}).then(res=>{
      console.log('res头像已更新',res)
      wx.showToast({ title: '头像已更新', icon: 'none' });
    })
  },

  onEditNickname() {
      wx.showModal({
          title: '修改昵称',
          editable: true,
          placeholderText: '请输入新昵称',
          content: this.data.userInfo.nickname ? this.data.userInfo.nickname:'',
          success: (res) => {
            if (res.confirm && res.content) {
              const newName = res.content.trim();
              if(!newName) return;
              const newInfo = { ...this.data.userInfo, nickname: newName };
              this.setData({ userInfo: newInfo });
              app.globalData.userInfo = newInfo;
              app.saveData();
              http('/user/userinfo/','POST',{"nickname":newName}).then(res=>{
                console.log('昵称已更新',res)
                wx.showToast({ title: '昵称已更新', icon: 'none' });
              })
            }
          }
        });
  },

  // --- 意见反馈弹窗逻辑 ---
  
  showFeedback() {
    this.setData({ 
      showFeedbackModal: true,
      feedbackContent: '', // 每次打开清空
      feedbackLen: 0
    });
  },

  hideFeedback() {
    this.setData({ showFeedbackModal: false });
  },

  onFeedbackInput(e) {
    const val = e.detail.value;
    this.setData({ 
      feedbackContent: val,
      feedbackLen: val.length
    });
  },

  submitFeedback() {
    if (!this.data.userInfo.isLoggedIn) {
      return wx.showToast({ title: '请先登录', icon: 'none' });
    }
    const content = this.data.feedbackContent.trim();
    console.log(content)
    if (!content) {
      return wx.showToast({ title: '请输入内容', icon: 'none' });
    }
    
    // 模拟提交
    wx.showLoading({ title: '提交中...' });
    http('/web/feedback/','post',{"content":content}).then(res=>{
      console.log('res',res)
      wx.showToast({ title: '感谢您的反馈', icon: 'success' });
      this.setData({ showFeedbackModal: false });
    })
    // setTimeout(() => {
    //   wx.hideLoading();
    //   this.setData({ showFeedbackModal: false });
    //   wx.showToast({ title: '感谢您的反馈', icon: 'success' });
    // }, 1000);
  },

  // --- 其他功能 ---

  navigateToPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  handleSignIn() {
    if (!this.data.userInfo.isLoggedIn) {
        return wx.showToast({ title: '请先登录', icon: 'none' });
    }
    if(this.data.userInfo.hasSignedIn) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }
    app.globalData.userInfo.points += 20;
    app.globalData.userInfo.hasSignedIn = true;
    app.saveData();
    http('/user/userinfo/','post',{"points":app.globalData.userInfo.points}).then(res=>{
      console.log('res0000000',res)
      this.setData({ userInfo: app.globalData.userInfo });
      wx.showToast({ title: '签到成功 +20', icon: 'success' });
    })
  },

  handleShareTap() {
    if (!this.data.userInfo.isLoggedIn) {
      return wx.showToast({ title: '请先登录', icon: 'none' });
  }
    if(this.data.userInfo.hasSharedToday) return;
    wx.navigateTo({ url: '/pages/share/share' });
    app.globalData.userInfo.points += 15;
    app.globalData.userInfo.hasSharedToday = true;
    app.saveData();
    this.setData({ userInfo: app.globalData.userInfo });
    http('/user/userinfo/','post',{"points":app.globalData.userInfo.points}).then(res=>{
      this.setData({ userInfo: app.globalData.userInfo });
      wx.showToast({ title: '分享奖励 +15', icon: 'success' });
    })
  },

  onShareAppMessage() {
    return {
      title: '我正在用坦坦斯语学习斯瓦西里语，快来一起吧！',
      path: '/pages/index/index',
      // imageUrl: 'https://images.unsplash.com/photo-1547471080-7541e89a43ca?w=600&q=80'
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
    if (!this.data.userInfo.isLoggedIn) {
      return wx.showToast({ title: '请先登录', icon: 'none' });
    }
    wx.navigateTo({ url: '/pages/purchase/purchase' });
  },

  navigateToContribute() {
    if (!this.data.userInfo.isLoggedIn) {
      return wx.showToast({ title: '请先登录', icon: 'none' });
    }
    wx.navigateTo({ url: '/pages/contribute/contribute' });
  },
  
  notImplemented() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
})