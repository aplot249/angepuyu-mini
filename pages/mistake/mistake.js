const app = getApp();
import {http} from '../../requests/index'
import { eventBus } from '../../utils/eventBus.js';
Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    masteredCount: '', // 模拟已消灭错题数
    nomasteredCount:'',

    // 分页相关
    mistakeList: [],
    page: 1,
    pageSize: 10,
    totalCount:null,
    currentPage:1,
    totalPageNum:null,
    isLoading: false,
    hasMore: true,
  },
  OperateNoPointsModal(value){
    console.log(value)
    this.setData({
      showNoPointsModal:value
    })
  },
  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      startTime:Date.now()
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    
    eventBus.on('OperateNoPointsModal', this.OperateNoPointsModal);
    // 每次进入页面重新加载第一页
    this.loadMistakes(true);
  },
  onReady(){
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      // backgroundColor: '#FFAB91',
      backgroundColor: '#FEC99D',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  },
  // 触底加载更多
  onReachBottom() {
    console.log('fffffff')
    if (this.data.hasMore && !this.data.isLoading) {
      if(this.data.hasMore){
        this.loadMistakes(false);
      }
    }
  },

  // 加载数据 (模拟分页)
  loadMistakes(reset = false) {
    // if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    if (reset) {
      this.setData({ 
        page: 1, 
        mistakeList: [], 
        hasMore: true 
      });
    }
    http(`/web/mistake/?page=${this.data.currentPage}`,'get').then(res=>{
      console.log(res)
      this.setData({
        mistakeList:[...this.data.mistakeList,...res.results.data],
        totalCount:res.count,
        totalPageNum:res.totalPageNum,
        currentPage:this.data.currentPage+1,
        isLoading:false,
        hasMore:this.data.currentPage < res.totalPageNum,
        masteredCount:res.results.yigongke,
        nomasteredCount:res.results.weigongke,
      })
    })
  },

  // 点击卡片播放音频
  playAudio(e) {
    let item = e.currentTarget.dataset.word; // 这个词条数据
    let voiceType = wx.getStorageSync('voiceType')  //拿到后台给的推荐的发音频道
    let fayin = "siyufayin"+voiceType   //拼接出发音频道，完整版
    console.log(fayin,item[fayin])  //输出发音音色完整名称、并输出对应的发音链接
    app.playAudio(item[fayin],item.swahili)
  },

  // 标记为已学会 (移除) - 使用 catchtap 阻止冒泡
  markAsMastered(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认',
      content: '确定已经掌握这个词了吗？移出后可以在单词本找回。',
      success: (res) => {
        if (res.confirm) {
          const newList = this.data.mistakeList.filter(item => item.id !== id);
          this.setData({ 
            mistakeList: newList,
            masteredCount: this.data.masteredCount + 1,
            nomasteredCount: this.data.nomasteredCount - 1
          });
          http(`/web/mistake/${id}/`,'put',{"isGongke":"1"}).then(res=>{
            console.log('res',res)
          })
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  },
  onUnload(){
    if(!app.globalData.userInfo.isLoggedIn){
      return false
    }
    eventBus.off('OperateNoPointsModal', this.OperateNoPointsModal);
    console.log('onUnload startTime',this.data.startTime)
    app.saveStudyTime(this.data.startTime);
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