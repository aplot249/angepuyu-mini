const app = getApp();
import {http} from '../../requests/index'
import { eventBus } from '../../utils/eventBus.js';

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    
    // 导航栏适配数据
    statusBarHeight: 20,
    navBarHeight: 44,
    totalNavHeight: 64,
    menuButtonHeight: 32,
    
    // 学习统计指标
    knownCount: 0,     // 已认识
    forgotCount: 0,    // 不认识
    completedCount: 0, // 已做题 (已学习)

    points: app.globalData.userInfo.points ? app.globalData.userInfo.points : 5,       // 当前积分

    showNoPointsModal: false, // 积分不足弹窗控制
    allownologin:false,
    // 模拟复习卡片数据
    wordList: [],
    startTime:Date.now(),
  },

  onLoad() {
    // console.log('app.globalData.userInfo.points',app.globalData.userInfo.points)
    this.calcNavBar();
  },

  UserInfoPointsChange(value){
    console.log(value)
    this.setData({
      points:value
    })
  },

  OperateNoPointsModal(value){
    console.log(value)
    this.setData({
      showNoPointsModal:value
    })
  },

  onReady(){
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#FEC99D',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  },

  onShow() {
    eventBus.on('UserInfoPointsChange', this.UserInfoPointsChange);
    eventBus.on('OperateNoPointsModal', this.OperateNoPointsModal)
    http(`/web/randomcard/?allownologin=${!app.globalData.userInfo.isLoggedIn}`,'get').then(res=>{
      this.setData({
        noLoad:res.tip,
        wordList:res.data,
        knownCount: res.knownCount,
        forgotCount: res.forgotCount,
        startTime:Date.now()
      })
    })
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      points:app.globalData.userInfo.points
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    // wx.setNavigationBarTitle({ title: '开始学习' });
  },

  onUnload(){
    if(!app.globalData.userInfo.isLoggedIn){
      return false
    }
    console.log('onUnload startTime',this.data.startTime)
    app.saveStudyTime(this.data.startTime);
    eventBus.off('UserInfoPointsChange', this.UserInfoPointsChange);
    eventBus.off('OperateNoPointsModal', this.OperateNoPointsModal);
    http('/user/userinfo/','post',{'points':app.globalData.userInfo.points}).then(res=>{
      console.log('已更新积分')
    })
    // app.globalData.userInfo.points = this.data.points
    // app.saveData()
    this.setData({
      points:null,
      wordList:[],
      currentIndex: 0,
      knownCount: 0,     // 已认识
      forgotCount: 0,    // 不认识
      showNoPointsModal:false,
    })
  },

  calcNavBar() {
    const sysInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = sysInfo.statusBarHeight;
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
    const totalNavHeight = statusBarHeight + navBarHeight;

    this.setData({
      statusBarHeight,
      navBarHeight,
      totalNavHeight,
      menuButtonHeight: menuButton.height
    });
  },

  onSwiperChange(e) {
    console.log('e.detail.current',e.detail.current)
    // 以前序列小于这次积分，就是向后刷
    if (this.data.currentIndex < e.detail.current){
      this.setData({
        completedCount: this.data.completedCount + 1,
      })
      if(!app.globalData.userInfo.isLoggedIn){
          this.setData({points:5})
      }
      if(this.data.points <= 0){
        //积分不足，退回去，显示要充值
        this.setData({
          points:0,
          currentIndex:e.detail.current - 1,
          showNoPointsModal:true  
        })
        app.globalData.userInfo.points = this.data.points
        app.saveData()
      }else{
        this.setData({
          points: this.data.points - 3 > 0 ? this.data.points - 3 : 0,
          currentIndex: e.detail.current,
        });
        app.globalData.userInfo.points = this.data.points
        app.saveData()
        // 到最后一个了,就增加
        if(this.data.currentIndex === this.data.wordList.length-1){
          if(this.data.noLoad==true){
              wx.showToast({
                title: '这是最后一张',
                icon:'none'
              })
          }else{
            http(`/web/randomcard/?allownologin=${app.globalData.userInfo.isLoggedIn}`,'get').then(res=>{
              this.data.wordList.push(...res.data)
              this.setData({
                noLoad:res.tip,
                wordList:this.data.wordList,
                knownCount: res.knownCount,
                forgotCount: res.forgotCount,
                // currentIndex:this.data.currentIndex+1,
                // completedCount:this.data.completedCount+1
              })
            })
          }
        }
      }
    }
    // 往回刷
    else{
      this.setData({
        currentIndex:e.detail.current
      })
      if(e.detail.current == 0){
          this.setData({
            currentIndex:0
          })
      }
    }
  },

  onConfirmPurchase(e) {
    console.log('用户选择了:', e.detail); // {planId: 3, price: 80, name: "年卡"}
  },

  toggleFlip(e) {
    const index = e.currentTarget.dataset.index;
    const key = `wordList[${index}].isFlipped`;
    // 在这里播放声音
    let item = this.data.wordList[index]
    // 查看斯语答案时候自动发音
    if(!item.isFlipped){
      let xiaohao = item.fayin ? item.xiaohao : 0
      if(app.globalData.userInfo.FlipautoPlayfayin){
        // app.playAudio(item.fayin,xiaohao,item.swahili)
        let voiceType = wx.getStorageSync('voiceType')
        let fayin = "fayin"+voiceType
        console.log(fayin,item[fayin])
        app.playAudio(item[fayin],xiaohao,item.swahili)
      }
    }
    this.setData({
      [key]: !this.data.wordList[index].isFlipped
    });
  },

  playAudio(e) {
    // 阻止冒泡防止翻转
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0
    let voiceType = wx.getStorageSync('voiceType')
    let fayin = "fayin"+voiceType
    console.log(fayin,item[fayin])
    app.playAudio(item[fayin],xiaohao,item.title)
    // app.playAudio(item.fayin,xiaohao,item.title)
    // wx.showToast({ title: `播放: ${item.swahili}`, icon: 'none' });
  },

  // 标记为已认识 (消耗积分)
  markKnown(e) {
    // 1. 检查积分
    // if (this.data.points < 3) {
    //   this.setData({ showNoPointsModal: true });
    //   return;
    // }
    // wx.vibrateShort();
    // 2. 更新数据 (扣除3分)
    console.log('target',this.data.wordList[this.data.currentIndex])
    let cardid = this.data.wordList[this.data.currentIndex].id
    // 逻辑：自动滑到下一，并加入已认识
    http('/web/updateusercard/','post',{'ctitemid':cardid,'action':'0'}).then(res=>{
      console.log('标记为已认识',res)
      wx.showToast({ title: '认识的，跳下一个', icon: 'none' });
      this.setData({
        knownCount: res.knownCount,
        forgotCount: res.forgotCount,
        // currentIndex:this.data.currentIndex + 1,
      }); 
    })
    // wx.showToast({ title: '已掌握', icon: 'none' });
    this.nextCard();
  },

  // 标记为不认识 (消耗积分)
  markForgot(e) {
    // 1. 检查积分
    // if (this.data.points < 3) {
    //   this.setData({ showNoPointsModal: true });
    //   return;
    // }

    wx.vibrateShort();
    // 2. 更新数据 (扣除3分)
    console.log('target',e)
    let cardid = this.data.wordList[this.data.currentIndex].id
    http('/web/updateusercard/','post',{'ctitemid':cardid,'action':'1'}).then(res=>{
      console.log('标记为不认识',res)
      this.setData({
        knownCount: res.knownCount,
        forgotCount: res.forgotCount,
      });
      wx.showToast({ title: '不认识，加入生词本', icon: 'none' });
    })
    // this.nextCard();
  },
  
  nextCard() {
    if (this.data.currentIndex < this.data.wordList.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
      // wx.showToast({ title: '今日任务完成！', icon: 'success' });
    }
  },

  // --- 积分不足处理 ---
  buyPoints() {
    this.setData({ showNoPointsModal: false });
    wx.navigateTo({ url: '/pages/purchase/purchase' });
  },

  closeNoPointsModal() {
    this.setData({ showNoPointsModal: false });
  },

  onShareAppMessage(res) {
    // 关闭弹窗（如果是从弹窗点击分享）
    if (this.data.showNoPointsModal) {
      this.setData({ showNoPointsModal: false });
    }
    if(!app.globalData.userInfo.hasSharedToday){
      app.globalData.userInfo.hasSharedToday = true
      this.setData({ points: this.data.points + 20});
      app.globalData.userInfo.points = this.data.points
      app.saveData()
      wx.showToast({ title: '分享积分 +20', icon: 'none' });
    }
    return {
      title: '坦桑华人学斯语，快来一起进步吧。',
      path: '/pages/index/index',
      // imageUrl: '/images/share-cover.png', // 假设有分享图
    }
  }
})