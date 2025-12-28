const app = getApp();
import {http,fileupload } from '../../requests/index'

Page({
  data: {
    userInfo: {},
    fontSizeLevel: 1,
    fontSizeLabel: '标准',
    isDarkMode: false,
    totalStudyTime:'',
    // 弹窗相关数据
    showFeedbackModal: false,
    feedbackContent: '',
    feedbackLen: 0,

    FlipautoPlayfayin:app.globalData.userInfo.FlipautoPlayfayin || true,
    NextautoPlayfayin:app.globalData.userInfo.NextautoPlayfayin || true,

    // [新增] 播放倍速配置相关
    playRateValue: 1.0,
    playRateIndex: 3, // 默认对应 1.0x
    playRateOptions: ['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'],
    
    // [新增] 发音音色配置相关
    voiceIndex: '',  //做到后台推荐
    // voiceOptions: ['标准女声', '标准男声', '温柔女声', '磁性男声'],
    // voiceOptions: ['男声1号', '男声2号', '女声1号'],
    // voiceOptionsJSON: app.globalData.fayintype,
    voiceOptions:[],
    // [修改] 做题数量配置相关
    quizCountOption: 10,
    quizCountIndex: 0, // 默认索引
    quizOptions: ['10道', '20道', '50道'],
  },

  onShow() {
    let tmp = []
    app.globalData.fayintype.forEach(i=>tmp.push(i.name))
    this.setData({ 
      userInfo: app.globalData.userInfo,
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      voiceOptions:tmp,
    });
    this.updateTimeDisplay()
    this.updateFontLabel(app.globalData.fontSizeLevel);

    // 读取本地存储的设置并同步 Picker 索引
    const savedCount = wx.getStorageSync('quizCountOption');
    if (savedCount) {
      // 查找对应的索引，如 '10道' 对应 10
      const idx = this.data.quizOptions.findIndex(item => parseInt(item) === savedCount);
      this.setData({ 
        quizCountOption: savedCount,
        quizCountIndex: idx >= 0 ? idx : 0 
      });
    }

    // [新增] 读取播放倍速设置
    const savedRate = wx.getStorageSync('playRate');
    if (savedRate) {
      const idx = this.data.playRateOptions.findIndex(item => parseFloat(item) === savedRate);
      this.setData({
        playRateValue: savedRate,
        playRateIndex: idx >= 0 ? idx : 2
      });
    }

  },

  // [新增] 格式化显示时长
  updateTimeDisplay() {
    const totalSeconds = app.globalData.userInfo.totalStudyTime || 0;
    let displayStr = '';
    if (totalSeconds < 60) {
        displayStr = '少于1分';
    } else if (totalSeconds < 3600) {
        displayStr = `${Math.floor(totalSeconds / 60)}分`;
    } else {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        displayStr = `${h}时 ${m}分`;
    }
    this.setData({ studyTimeDisplay: displayStr });
  },

  // [修改] 处理 Picker 选择器变更
  bindQuizCountChange(e) {
    const idx = e.detail.value;
    const optionStr = this.data.quizOptions[idx];
    const val = parseInt(optionStr); // 从 '10道' 提取数字 10
    this.setData({
      quizCountIndex: idx,
      quizCountOption: val
    });
    // 保存设置到本地缓存
    wx.setStorageSync('quizCountOption', val);
    wx.showToast({
      title: `已设置为 ${optionStr}`,
      icon: 'none'
    });
  },

  // [新增] 处理播放倍速选择
  bindPlayRateChange(e) {
    const idx = e.detail.value;
    const optionStr = this.data.playRateOptions[idx];
    const val = parseFloat(optionStr); // 提取数值，如 1.5
    this.setData({
      playRateIndex: idx,
      playRateValue: val
    });
    // 保存设置
    wx.setStorageSync('playRate', val);
    // 如果有全局 globalData 也可以同步
    if (app.globalData) {
      app.globalData.playRate = val;
    }
    wx.showToast({ title: `倍速已设为 ${optionStr}`, icon: 'none' });
  },

  // [新增] 处理音色选择
  bindVoiceChange(e) {
    const idx = e.detail.value;
    const voice = this.data.voiceOptions[idx];
    this.setData({ voiceIndex: idx });
    // 保存设置
    let voiceSet = app.globalData.fayintype.filter(i=>i.name==voice)[0].xuhao
    wx.setStorageSync('voiceType', voiceSet ? voiceSet : '');
    if (app.globalData) { app.globalData.voiceType = voice; }
    wx.showToast({ title: `已切换为 ${voice}`, icon: 'none' });
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
                  hasSignedIn:wx.getStorageSync('ts_user').hasSignedIn,
                  hasSharedToday:wx.getStorageSync('ts_user').hasSharedToday,
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
  SetFlipautoPlayfayin(){
    this.setData({FlipautoPlayfayin:!this.data.FlipautoPlayfayin})
    app.globalData.userInfo.FlipautoPlayfayin = this.data.FlipautoPlayfayin
    app.saveData()
  },
  SetNextautoPlayfayin(){
    this.setData({NextautoPlayfayin:!this.data.NextautoPlayfayin})
    app.globalData.userInfo.NextautoPlayfayin = this.data.NextautoPlayfayin
    app.saveData()
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
            isLoggedIn: false,
            hasSharedToday: this.data.userInfo.hasSharedToday,
            hasSignedIn: this.data.userInfo.hasSignedIn,
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
      wx.showToast({ title: '今日已签到，请明日再试', icon: 'none' });
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
    app.globalData.userInfo.points += 50;
    app.globalData.userInfo.hasSharedToday = true;
    app.saveData();
    this.setData({ userInfo: app.globalData.userInfo });
    http('/user/userinfo/','post',{"points":app.globalData.userInfo.points}).then(res=>{
      this.setData({ userInfo: app.globalData.userInfo });
      wx.showToast({ title: '分享奖励 +50', icon: 'success' });
    })
  },

  onShareAppMessage() {
    return {
      title: '我正在用坦坦斯语学习斯瓦希里语，快来一起吧！',
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

  navigateToShare() {
    wx.navigateTo({ url: '/pages/share/share' });
  },

  navigateToContribute() {
    if (!this.data.userInfo.isLoggedIn) {
      return wx.showToast({ title: '请先登录', icon: 'none' });
    }
    wx.navigateTo({ url: '/pages/contribute/contribute' });
  },
  navigateToMistake(){
    wx.navigateTo({ url: '/pages/mistake/mistake' });
  },
  navigateToShare(){
    wx.navigateTo({ url: '/pages/share/share' });
  },
  notImplemented() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
    // 分享配置
    onShareAppMessage(res) {
      if(!app.globalData.userInfo.hasSharedToday){
        app.globalData.userInfo.hasSharedToday = true
        this.setData({ points: this.data.points+20 });
        app.globalData.userInfo.points = this.data.points
        app.saveData()
        wx.showToast({ title: '分享积分 +20', icon: 'none' });
  
        return {
          title: '坦桑华人学斯语，快来一起进步吧。',
          path: '/pages/review/review',
          // imageUrl: '/images/share-cover.png', // 假设有分享图
        }
      }
      // else{
      //   wx.showToast({ title: '一天领取一次', icon: 'none' });
      // }
    },
})