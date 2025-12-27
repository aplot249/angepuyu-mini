const app = getApp();
import {http} from '../../requests/index'

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
    startTime:Date.now()
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    
    // 每次进入页面重新加载第一页
    this.loadMistakes(true);
  },
  onReady(){
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#FFAB91',
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
    const item = e.currentTarget.dataset.word;
    wx.vibrateShort(); // 轻微震动反馈
    let xiaohao = item.fayin ? item.xiaohao : 0   //按发音存不存在，确定消耗
    let voiceType = wx.getStorageSync('voiceType')   //确定发音音色
    let fayin = "fayin"+voiceType   //确定发音音色
    console.log(fayin,item[fayin])    //输出发音音色、音色发音链接
    app.playAudio(item[fayin],xiaohao,item.swahili)
    wx.showToast({ title: `播放: ${word}`, icon: 'none' });
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
    console.log('onUnload startTime',this.data.startTime)
    app.saveStudyTime(this.data.startTime);
  }
})