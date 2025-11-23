const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    subCategory: '',
    keyword: '',
    currentTab: 0, 
    wordList: [],
    phraseList: [],
    pageWord: 1,
    pagePhrase: 1,
    hasMoreWords: true,
    hasMorePhrases: true
  },

  onLoad(options) {
    if(options.sub) {
      this.setData({ subCategory: options.sub });
      wx.setNavigationBarTitle({ title: options.sub });
    }
    this.fetchData();
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    this.refreshFavStatus();
  },

  fetchData() {
    const newWords = Array.from({length: 8}, (_, i) => ({
      id: 1000 + this.data.pageWord * 10 + i,
      swahili: `Neno ${this.data.pageWord}-${i}`,
      english: `Word ${this.data.pageWord}-${i}`,
      homonym: `内诺`,
      chinese: `测试单词${this.data.pageWord}-${i}`,
      image: `https://placehold.co/150x150?text=IMG`,
      isFav: false
    }));

    const newPhrases = Array.from({length: 8}, (_, i) => ({
      id: 5000 + this.data.pagePhrase * 10 + i,
      swahili: `Sentensi ${this.data.pagePhrase}-${i}`,
      english: `Sentence`,
      homonym: `森滕斯`,
      chinese: `测试句子${this.data.pagePhrase}-${i}`,
      isFav: false
    }));

    this.setData({
      wordList: [...this.data.wordList, ...newWords],
      phraseList: [...this.data.phraseList, ...newPhrases]
    });
    
    this.refreshFavStatus();
  },

  refreshFavStatus() {
    const favs = app.globalData.userInfo.favorites || [];
    const updateList = (listKey) => {
      const list = this.data[listKey].map(item => ({
        ...item,
        isFav: favs.includes(item.id)
      }));
      this.setData({ [listKey]: list });
    };

    updateList('wordList');
    updateList('phraseList');
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
  },

  switchTab(e) {
    const idx = parseInt(e.currentTarget.dataset.idx);
    this.setData({ currentTab: idx });
  },

  onSwiperChange(e) {
    this.setData({ currentTab: e.detail.current });
  },

  loadMore() {
    if(this.data.currentTab === 0) {
      if(this.data.pageWord >= 3) return this.setData({ hasMoreWords: false });
      this.setData({ pageWord: this.data.pageWord + 1 });
      this.fetchData();
    } else {
      if(this.data.pagePhrase >= 3) return this.setData({ hasMorePhrases: false });
      this.setData({ pagePhrase: this.data.pagePhrase + 1 });
      this.fetchData();
    }
  },

  playAudio(e) {
    const type = e.currentTarget.dataset.type;
    const cost = type === 'word' ? 1 : 3;
    if (app.globalData.userInfo.points < cost) {
      return wx.showToast({ title: '点数不足', icon: 'none' });
    }
    app.globalData.userInfo.points -= cost;
    app.saveData();
    wx.showToast({ title: '播放中...', icon: 'none' });
  },

  toggleFav(e) {
    const id = e.currentTarget.dataset.id;
    let favs = app.globalData.userInfo.favorites || [];
    const index = favs.indexOf(id);
    
    if (index > -1) {
      favs.splice(index, 1);
      wx.showToast({ title: '取消收藏', icon: 'none' });
    } else {
      favs.push(id);
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
    
    app.globalData.userInfo.favorites = favs;
    app.saveData();
    this.refreshFavStatus();
  },

  onCorrection() {
    wx.showToast({ title: '反馈已提交', icon: 'success' });
  }
})