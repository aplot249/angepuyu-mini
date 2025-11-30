const app = getApp();
import { http } from '../../requests/index';

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    banners: [],
    notices: [],
    dailyWords: [],
    dailyPhrases: []
  },
  onLoad(){
    if(this.data.dailyWords.length === 0) this.shuffleDaily();
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    // if(this.data.dailyWords.length === 0) this.shuffleDaily();
  },

  shuffleDaily() {
    http('/web/index/',"GET").then(res=>{
      console.log(res)
      this.setData({
        notices:res.noticeBar,
        banners:res.carousel,
        dailyWords:res.tuijianWords,
        dailyPhrases:res.tuijianPhrases,
      })
    wx.showToast({ title: '已更新', icon: 'none' });
    })

  //   // 随机抽取4个单词
  //   const shuffledWords = [...WORD_POOL].sort(() => 0.5 - Math.random()).slice(0, 4);
  //   // 随机抽取4个短语
  //   const shuffledPhrases = [...PHRASE_POOL].sort(() => 0.5 - Math.random()).slice(0, 4);
  //   this.setData({ 
  //     dailyWords: shuffledWords,
  //     dailyPhrases: shuffledPhrases
  //   });

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