const { http,baseImgUrl } = require("./requests/index");
import { eventBus } from './utils/eventBus.js';

App({
  globalData: {
    userInfo: {
      nickname: "", //默认值
      isRecorder:false,
      hasSignedIn: false, //是否已签到
      hasSharedToday: false, // [新增] 今日是否已分享
      favorites: []
    },
    userCreated:null,
    fontSizeLevel: 1, 
    isDarkMode: false,
    currentTab:null
  },

  onLaunch() {
    // 如果代码发布新版本，小程序里自动提示更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(res => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => { // 新包下载完成
            wx.showModal({
              title: '更新提示',
              content: '新版本已就绪，点击重启体验',
              showCancel: false,
              success: res => res.confirm && updateManager.applyUpdate() // 强制重启应用新版
            });
          });
          updateManager.onUpdateFailed(() => { // 下载失败
            wx.showModal({
              title: '更新失败',
              content: '请删除小程序后重新搜索打开',
              showCancel: false
            });
          });
        }
      });
    } else { // 兼容低版本基础库（<1.9.90）
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请升级后重试',
        success: res => res.confirm && wx.updateWeChatApp() // 跳转微信更新
      });
    }
    // 读取本地存储
    const user = wx.getStorageSync('ts_user');
    const font = wx.getStorageSync('ts_font');
    const dark = wx.getStorageSync('ts_dark'); 
    // 读取本地storage的数据，并把user放在全局数据里，如果没有也不会报错。
    if (user) this.globalData.userInfo = user;
    // 把字体等级放在全局数据里
    if (font === 0 || font === 1 || font === 2 || font === 3) {
      this.globalData.fontSizeLevel = font;
    }
    // 把白天黑夜模式状态放在全局数据里
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
    const lastDate = wx.getStorageSync('ts_last_active_date');  //上次日期
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

  playAudio(mp3,xiaohao,title){
    if(!this.globalData.userInfo.isLoggedIn){
      // wx.showModal({
      //   title: '请先登录，才能进行后续操作',
      //   confirmText: "确认登录",
      //   success: (res) => {
      //     if (res.confirm) {
      //       wx.getUserProfile({
      //         desc: '需微信授权登录',
      //         success: (res) => {
      //           wx.login({
      //             timeout: 8000,
      //             success: r => {
      //               wx.showToast({
      //                 title: '正在登录...',
      //                 icon: "none"
      //               })
      //               console.log(r.code)
      //               http('/user/openid/', 'post', {
      //                 code: r.code,
      //                 gender: res.userInfo.gender,
      //                 wxnickname: res.userInfo.nickName,
      //               }).then(res => {
      //                 console.log('登录信息：', res)
      //                 const newInfo = {
      //                   ...res.user,
      //                   isLoggedIn: true,
      //                 };
      //                 this.globalData.userInfo = newInfo;
      //                 this.globalData.userCreated =  res.created
      //                 eventBus.emit('userNewCreated', this.globalData.userCreated);
      //                 this.saveData();
      //                 wx.showToast({
      //                   title: '登录成功',
      //                   icon: 'none'
      //                 });
      //                 wx.setStorageSync('token', res.token)
      //               })
      //             }
      //           })
      //         }
      //       })
      //     }
      //   }
      // }
      // )
      return
    }else{
      wx.showToast({
        title: mp3 == null ? '暂无发音' : '正在播放',
        icon:'none'
      })
      let innerAudioContext = wx.getBackgroundAudioManager();
      innerAudioContext.title = title
      let fayin = mp3 ? mp3 : baseImgUrl+'/zanwufayin.mp3'
      innerAudioContext.src = fayin
      // console.log('app.js ',fayin)
      // 设置音速
      let playbackRate = wx.getStorageSync('playRate')
      innerAudioContext.playbackRate = playbackRate
      this.globalData.userInfo.points -= xiaohao
      if(this.globalData.userInfo.points < 0){
        this.globalData.userInfo.points = 0
      }
      this.saveData()
      http('/user/userinfo/','post',{'points':this.globalData.userInfo.points}).then(res=>{
        console.log('已同步')
        // innerAudioContext.destroy()
      })
    } // 没登录的结尾
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
  },

  // [新增] 计算并保存时长逻辑
  saveStudyTime(startTime) {
    // if (!this.startTime) return;
    const now = Date.now();
    // 计算停留秒数
    const duration = Math.floor((now - startTime) / 1000); 
    if (duration > 0) {
        // 累加到全局数据
        this.globalData.userInfo.totalStudyTime = (this.globalData.userInfo.totalStudyTime || 0) + duration;
        this.saveData();
        http('/user/userinfo/','post',{"totalStudyTime":this.globalData.userInfo.totalStudyTime}).then(res=>{
            console.log('已记录学习时长')
        })
    }
  },

  // [新增] 格式化显示时长
  updateTimeDisplay() {
    // 把 app里的全局统计秒数时间转为可读时间
    const totalSeconds = app.globalData.userInfo.totalStudyTime || 0;
    let displayStr = '';
    if (totalSeconds < 60) {
        displayStr = '少于1分钟';
    } else if (totalSeconds < 3600) {
        displayStr = `${Math.floor(totalSeconds / 60)}分钟`;
    } else {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        displayStr = `${h}小时 ${m}分钟`;
    }
    // this.setData({ studyTimeDisplay: displayStr });
    return displayStr
  }

})