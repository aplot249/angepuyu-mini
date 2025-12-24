const app = getApp();
import {http} from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    // 导航栏适配数据
    statusBarHeight: 20,
    navBarHeight: 44,
    totalNavHeight: 64,
    menuButtonHeight: 32, 

    greeting: 'Jambo!',
    exchangeRate: '385.5', 
    
    // 顶部主轮播图 [已更新]
    banners: [],
    hh:null,
    // 中间小轮播图
    // middleBanners: [
    //   'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    //   'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80'
    // ],

    announcements: [
      '今日汇率更新：1人民币 ≈ 385.5坦先令',
      '新版本增加了“短语纠错”功能，快来试试吧。',
      '每日签到可领取积分奖励，别忘记哦。'
    ],
    dailyWords:[],
    dailyPhrase:[],
    fayintype:[]
  },
  onLoad() {
    this.calcNavBar();
    this.setGreeting();
    http('/web/index/','get').then(res=>{
      console.log(res)
      this.setData({
        banners:res.carousel,
        announcements:res.noticeBar,
        dailyWords:res.tuijianWords,
        dailyPhrase:res.tuijianPhrases,
        // fayintype:res.fayintype
      })
      wx.setStorageSync('fayintype', JSON.stringify(res.fayintype))
      app.globalData.fayintype = res.fayintype

      http('/web/sq/','get').then(res=>{
        console.log(res)
        this.setData({
          hh:res.status
        })
      })
    })
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
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

  setGreeting() {
    const hour = new Date().getHours();
    let text = 'Jambo!';
    if (hour >= 5 && hour < 12) text = 'Habari za asubuhi!'; 
    else if (hour >= 12 && hour < 18) text = 'Habari za mchana!'; 
    else text = 'Habari za jioni!'; 
    this.setData({ greeting: text });
  },

  // [修改] 轮播图点击跳转
  onBannerTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/article/article?id=${id}`
      });
    }
  },

  // [新增] 跳转到卡片复习
  navigateToReview() {
    wx.navigateTo({ url: '/pages/review/review' });
  },
  // [新增] 跳转到每日练习
  navigateToQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' })
  },
  navigateToMistake() {
    wx.navigateTo({ url: '/pages/mistake/mistake' })
  },   
  navigateToWordbook(){
    wx.navigateTo({ url: '/pages/wordbook/wordbook' })
  }, 
  navigateToListening() {
    wx.showToast({
      title: '即将上线',
      icon:"none"
    })
    return
    wx.navigateTo({ url: '/pages/listening-practice/listening-practice' });
  },
  navigateToCommunity() {
    wx.navigateTo({ url: '/pages/community/community' });
  },
  playAudio(e) {
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0 //按发音存不存在，确定消耗
    let voiceType = wx.getStorageSync('voiceType')  //确定发音音色
    let fayin = "fayin"+voiceType   //确定发音音色
    console.log(fayin,item[fayin])  //输出发音音色、音色发音链接
    app.playAudio(item[fayin],xiaohao,item.swahili)
  },

  refreshDaily() {
    this.onLoad()
  },
  onUnload(){
  }
})