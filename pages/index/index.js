const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    banners: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600', 
      'https://images.unsplash.com/photo-1547471080-7541e89a43ca?w=600'
    ],
    notices: ["✨ 新手礼包：注册即送50积分！", "🔥 热门：工程词汇表已更新"],
    dailyWords: [],
    dailyPhrases: []
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    if(this.data.dailyWords.length === 0) this.shuffleDaily();
  },

  shuffleDaily() {
    const words = [
      {id:1, swahili:'Saruji', chinese:'水泥', homonym:'撒鲁机'},
      {id:2, swahili:'Mchanga', chinese:'沙子', homonym:'母畅噶'},
      {id:3, swahili:'Jambo', chinese:'你好', homonym:'酱爆'},
      {id:4, swahili:'Asante', chinese:'谢谢', homonym:'阿三忒'}
    ];
    this.setData({ dailyWords: words });
    
    this.setData({
      dailyPhrases: [
        {id:5, swahili:'Habari gani?', chinese:'你好吗？'},
        {id:6, swahili:'Vaa kofia', chinese:'戴上帽子'}
      ]
    })
  },

  playAudio(e) {
    const type = e.currentTarget.dataset.type;
    const cost = type === 'word' ? 1 : 3;
    
    if (app.globalData.userInfo.points < cost) {
      wx.showToast({ title: '点数不足', icon: 'none' });
      return;
    }
    
    app.globalData.userInfo.points -= cost;
    app.saveData();
    
    wx.showToast({ title: `播放中 -${cost}点`, icon: 'none' });
  }
})