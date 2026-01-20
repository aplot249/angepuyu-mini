const { http,baseImgUrl } = require("./requests/index");
import { eventBus } from './utils/eventBus.js';

App({
  globalData: {
    userInfo: {
      nickname: "", //默认值
      points:5,
      isRecorder:false,
      hasSignedIn: false, //是否已签到
      hasSharedToday: false, // [新增] 今日是否已分享
      favorites: [],
    },
    FlipautoPlayfayin:true,
    NextautoPlayfayin:true,
    userCreated:null, //判断是不是新用户
    fontSizeLevel: 1, 
    isDarkMode: false,
    currentTab:null //发帖社区的当前tab
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

  playAudio(mp3,title){
    // 仅仅针对首页推荐单词、短语的发音，这种情况是没有登录的
    if(!this.globalData.userInfo.isLoggedIn){
      let innerAudioContext = wx.getBackgroundAudioManager();

      innerAudioContext.onError((res) => {
        console.error('播放失败，详细信息：', res);
        if (res.errCode === 10001 || res.errCode === 10004) {
          wx.showModal({
            title: '播放失败',
            content: '音频格式在当前设备不兼容，建议转码为 MP3',
            showCancel: false
          });
        }
      });
      innerAudioContext.title = title
      let fayin = mp3 ? mp3 : baseImgUrl+'/zanwufayin.mp3'
      innerAudioContext.src = fayin
      let playbackRate = wx.getStorageSync('playRate')
      innerAudioContext.playbackRate = playbackRate
      return false
    }else{
      this.globalData.userInfo.points -= 2
      if(this.globalData.userInfo.points <= 0){
        this.globalData.userInfo.points = 0
        // 如果没有积分了，还想播放语音，那就广播弹窗，展示充值弹窗
        eventBus.emit('OperateNoPointsModal', true);
        return false
      }
      this.saveData()
      http('/user/userinfo/','post',{'points':this.globalData.userInfo.points}).then(res=>{
        console.log('已同步')
      })
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
    const endTime = Date.now();
    // 计算停留秒数
    const duration = Math.floor((endTime - startTime) / 1000); 
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