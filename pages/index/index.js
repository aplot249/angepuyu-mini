const app = getApp();
import { http } from '../../requests/index';
// 模拟一个较大的每日推荐词库
const WORD_POOL = [
  {id:1, swahili:'Saruji', chinese:'水泥', homonym:'撒鲁机'},
  {id:2, swahili:'Mchanga', chinese:'沙子', homonym:'母畅噶'},
  {id:3, swahili:'Jambo', chinese:'你好', homonym:'酱爆'},
  {id:4, swahili:'Asante', chinese:'谢谢', homonym:'阿三忒'},
  {id:10, swahili:'Rafiki', chinese:'朋友', homonym:'拉菲基'},
  {id:11, swahili:'Polisi', chinese:'警察', homonym:'波利斯'},
  {id:12, swahili:'Chakula', chinese:'食物', homonym:'查库拉'},
  {id:13, swahili:'Maji', chinese:'水', homonym:'马及'},
  {id:14, swahili:'Gari', chinese:'车', homonym:'噶里'},
  {id:15, swahili:'Pesa', chinese:'钱', homonym:'佩萨'},
  {id:16, swahili:'Kazi', chinese:'工作', homonym:'卡兹'},
  {id:17, swahili:'Leo', chinese:'今天', homonym:'雷欧'}
];

const PHRASE_POOL = [
  {id:5, swahili:'Habari gani?', chinese:'你好吗？'},
  {id:6, swahili:'Vaa kofia', chinese:'戴上帽子'},
  {id:20, swahili:'Bei gani?', chinese:'多少钱？'},
  {id:21, swahili:'Naenda kazini', chinese:'我去上班'},
  {id:22, swahili:'Nataka kula', chinese:'我想吃饭'},
  {id:23, swahili:'Pole sana', chinese:'非常抱歉/辛苦了'},
  {id:24, swahili:'Hakuna matata', chinese:'没问题/无忧无虑'},
  {id:25, swahili:'Subiri kidogo', chinese:'稍等一下'}
];

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    banners: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80', // Kilimanjaro
      'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80', // Zanzibar
    ],
    notices: [
      "✨ 新手礼包：注册即送50积分！", 
      "🔥 热门：工程行业常用语200句更新", 
      "💡 贴士：点击发音图标可跟读",
      "📢 通知：达累斯萨拉姆线下交流会报名中"
    ],
    dailyWords: [],
    dailyPhrases: []
  },
  onLoad(){
    // http('/web/index/',"GET").then(res=>{
    //     console.log(res)
    //     this.setData({
    //       notices:res.noticeBar,
    //       banners:res.carousel,
    //       dailyWords:res.tuijianWords,
    //       dailyPhrases:res.tuijianPhrases,
    //     })
    // })
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    if(this.data.dailyWords.length === 0) this.shuffleDaily();
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
  })

  //   // 随机抽取4个单词
  //   const shuffledWords = [...WORD_POOL].sort(() => 0.5 - Math.random()).slice(0, 4);
  //   // 随机抽取4个短语
  //   const shuffledPhrases = [...PHRASE_POOL].sort(() => 0.5 - Math.random()).slice(0, 4);
  //   this.setData({ 
  //     dailyWords: shuffledWords,
  //     dailyPhrases: shuffledPhrases
  //   });
  //   wx.showToast({ title: '已更新', icon: 'none' });
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