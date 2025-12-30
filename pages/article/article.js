const app = getApp();

// 模拟文章数据库
const ARTICLES = {
  1: {
    id: 1,
    image: 'https://siyu.jsxinlingdi.com/media/swiper/1.jpg',
    category: '生活哲学',
    title: 'Hakuna Matata',
    subtitle: '不仅仅是一句电影台词',
    date: '2025-11-28',
    readTime: 3,
    intro: '在《狮子王》中，我们听过这句话。但在东非，这不仅仅是一句口号，更是一种流淌在血液里的乐天精神。',
    content: [
      {
        sw: "Hakuna matata",
        cn: "这句话的字面意思是“没有麻烦”或“没有问题”。在坦桑尼亚，当你因为堵车、延误或小意外感到焦虑时，当地人总会笑着对你说这句话。",
      },
      {
        sw: "Haraka haraka haina baraka",
        cn: "意思是“欲速则不达”（匆忙没有福气）。非洲的时间观念是圆形的，而非线性的。这里的人们相信，慢慢来，享受当下，才是生活的真谛。",
        tip: "在桑给巴尔岛旅行时，你经常会听到 'Pole pole'（慢点，慢点）。尝试放慢脚步，你会发现更多风景。"
      }
    ]
  },
  2: {
    id: 2,
    image: 'https://siyu.jsxinlingdi.com/media/swiper/2.png',
    category: '自然之旅',
    title: 'Safari 的真谛',
    subtitle: '一场关于灵魂的远行',
    date: '2025-11-20',
    readTime: 5,
    intro: '提到 Safari，你想到的是猎枪还是相机？在斯瓦希里语中，这个词原本只是意味着一段旅程。',
    content: [
      {
        sw: "Safari njema",
        cn: "意思是“旅途愉快”。Safari 源自阿拉伯语，在斯瓦希里语中泛指任何旅行。如今，它已成为全世界通用的词汇，特指去非洲看野生动物。",
      },
      {
        sw: "Simba ndiye mfalme wa porini",
        cn: "“狮子是丛林之王”。在塞伦盖蒂大草原，看狮群在金合欢树下休憩，是许多人一生的梦想。",
        tip: "去国家公园时，请记得：带走的只有照片，留下的只有脚印 (Chukua picha tu, acha nyayo tu)。"
      }
    ]
  },
  3: {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
    category: '情感表达',
    title: 'Nakupenda',
    subtitle: '斯瓦希里语中的爱意',
    date: '2025-11-15',
    readTime: 2,
    intro: '非洲的浪漫含蓄而热烈。学会用当地语言表达爱与感谢，能瞬间拉近彼此的距离。',
    content: [
      {
        sw: "Nakupenda sana",
        cn: "意思是“我非常爱你”。这是最直接的表达爱意的方式。Naku- 是主语和宾语的前缀，-penda 是爱。",
      },
      {
        sw: "Rafiki yangu",
        cn: "意思是“我的朋友”。在坦桑尼亚，友谊被视为珍贵的财富。即使是初次见面，人们也常互称 Rafiki。",
      }
    ]
  }
};

Page({
  data: {
    article: {},
    isFav: false,
    fontSizeLevel: 1,
    isDarkMode: false,
    statusBarHeight: 20 // 默认值
  },

  onLoad(options) {
    // 获取系统状态栏高度，用于适配自定义导航栏
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });

    const id = options.id || 1; 
    this.setData({
      article: ARTICLES[id] || ARTICLES[1]
    });
  },

  onShow() {
    // 同步全局设置
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  playAudio(e) {
    const text = e.currentTarget.dataset.text;
    wx.showToast({ title: `播放: ${text}`, icon: 'none' });
  },

  toggleFav() {
    this.setData({ isFav: !this.data.isFav });
    wx.showToast({ title: this.data.isFav ? '已收藏' : '取消收藏', icon: 'none' });
  },
  // 分享配置
  onShareAppMessage(res) {
    if(!app.globalData.userInfo.hasSharedToday){
      app.globalData.userInfo.hasSharedToday = true
      this.setData({ points: this.data.points+20 });
      app.globalData.userInfo.points = this.data.points
      app.saveData()
      wx.showToast({ title: '分享积分 +20', icon: 'none' });
    }
    return {
      title: '坦桑华人学斯语，快来一起进步吧。',
      path: '/pages/review/review',
      // imageUrl: '/images/share-cover.png', // 假设有分享图
    }
  // else{
  //   wx.showToast({ title: '一天领取一次', icon: 'none' });
  // }
  },

})