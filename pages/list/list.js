const app = getApp();
import { http } from '../../requests/index'
// 真实场景模拟数据池
const WORDS_DB = [
  { swahili: 'Saruji', english: 'Cement', chinese: '水泥', homonym: '撒鲁机', image: 'https://images.unsplash.com/photo-1518709414768-a8c79b06dbaa?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Mchanga', english: 'Sand', chinese: '沙子', homonym: '母畅噶', image: 'https://images.unsplash.com/photo-1605112525264-6c39f074d6df?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Matofali', english: 'Bricks', chinese: '砖块', homonym: '马托法利', image: 'https://images.unsplash.com/photo-1590074943477-0c48e28285b7?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Nondo', english: 'Steel bar', chinese: '钢筋', homonym: '农多', image: 'https://images.unsplash.com/photo-1535050602035-6e37b053683f?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Kokoto', english: 'Gravel', chinese: '石子', homonym: '科科托', image: 'https://images.unsplash.com/photo-1524246789873-164e9625d79c?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Mbao', english: 'Timber', chinese: '木材', homonym: '姆包', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Rangi', english: 'Paint', chinese: '油漆', homonym: '朗吉', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Misumari', english: 'Nails', chinese: '钉子', homonym: '米苏玛丽', image: 'https://images.unsplash.com/photo-1580651695201-94a36a46483e?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Nyundo', english: 'Hammer', chinese: '锤子', homonym: '纽多', image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Koleo', english: 'Pliers', chinese: '钳子', homonym: '科莱奥', image: 'https://images.unsplash.com/photo-1545626057-5f6036a78061?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Sementi', english: 'Cement', chinese: '水泥(同Saruji)', homonym: '塞门蒂', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Bomba', english: 'Pipe', chinese: '管子', homonym: '博姆巴', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Waya', english: 'Wire', chinese: '电线', homonym: '瓦亚', image: 'https://images.unsplash.com/photo-1549925245-c980617d17d2?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Kioo', english: 'Glass', chinese: '玻璃', homonym: '基奥', image: 'https://images.unsplash.com/photo-1598885511440-218a568c60c5?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Mlango', english: 'Door', chinese: '门', homonym: '姆兰戈', image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=150&q=80' },
  { swahili: 'Dirisha', english: 'Window', chinese: '窗户', homonym: '迪里沙', image: 'https://images.unsplash.com/photo-1502005229766-52835294e311?auto=format&fit=crop&w=150&q=80' }
];

const PHRASES_DB = [
  { swahili: 'Vaa kofia yako', english: 'Wear your helmet', chinese: '戴上你的安全帽', homonym: '瓦 科菲亚 亚科' },
  { swahili: 'Funga mkanda', english: 'Fasten belt', chinese: '系好安全带', homonym: '丰噶 姆坎达' },
  { swahili: 'Washa mashine', english: 'Turn on machine', chinese: '开启机器', homonym: '瓦沙 马希内' },
  { swahili: 'Zima mashine', english: 'Turn off machine', chinese: '关闭机器', homonym: '齐马 马希内' },
  { swahili: 'Leta hapa', english: 'Bring here', chinese: '拿来这里', homonym: '雷塔 哈帕' },
  { swahili: 'Peleka kule', english: 'Take there', chinese: '拿到那边', homonym: '佩雷卡 库莱' },
  { swahili: 'Hii ni mbaya', english: 'This is bad', chinese: '这个坏了', homonym: '希 尼 姆巴亚' },
  { swahili: 'Hii ni nzuri', english: 'This is good', chinese: '这个很好', homonym: '希 尼 恩祖里' },
  { swahili: 'Usivute sigara', english: 'No smoking', chinese: '禁止吸烟', homonym: '乌西武忒 西噶拉' },
  { swahili: 'Angalia chini', english: 'Watch below', chinese: '小心脚下', homonym: '安噶利亚 七尼' },
  { swahili: 'Punguza mwendo', english: 'Slow down', chinese: '减速', homonym: '彭古扎 姆温多' },
  { swahili: 'Simama hapa', english: 'Stop here', chinese: '停在这里', homonym: '希玛玛 哈帕' }
];

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    subCategory: '',
    subid:'',
    subname:'',
    keyword: '',
    currentTab: 0, 
    wordList: [],
    phraseList: [],
    pageWord: 1,
    pagePhrase: 1,
    hasMoreWords: true,
    hasMorePhrases: true,
    pageSize: 6, // 每页加载6条

    wordsCount:'',
    phraseCount:''
  },

  onLoad(options) {
      this.setData({ 
        subCategory: options.sub,
        subid: options.subid,
        subname: options.subname,
      });
      wx.setNavigationBarTitle({ title: options.subname });
      // this.fetchData();
      http(`/web/ctiemBySub/?subid=${options.subid}&wp=${this.data.currentTab}`,'GET').then(res=>{
        console.log("res",res)
        this.setData({
          wordsCount:res.count,
          wordList:res.results
        })
      })
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    this.refreshFavStatus();
  },

  fetchData() {
    // 单词分页加载
    const startW = (this.data.pageWord - 1) * this.data.pageSize;
    const endW = startW + this.data.pageSize;
    const newWordsRaw = WORDS_DB.slice(startW, endW);
    
    const newWords = newWordsRaw.map((item, index) => ({
      ...item,
      id: 10000 + startW + index, // 生成唯一ID
      isFav: false
    }));

    // 短语分页加载
    const startP = (this.data.pagePhrase - 1) * this.data.pageSize;
    const endP = startP + this.data.pageSize;
    const newPhrasesRaw = PHRASES_DB.slice(startP, endP);

    const newPhrases = newPhrasesRaw.map((item, index) => ({
      ...item,
      id: 50000 + startP + index, // 生成唯一ID
      isFav: false
    }));


    this.setData({
      wordList: [...this.data.wordList, ...newWords],
      phraseList: [...this.data.phraseList, ...newPhrases],
      hasMoreWords: endW < WORDS_DB.length,
      hasMorePhrases: endP < PHRASES_DB.length
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
    const val = e.detail.value.toLowerCase();
    this.setData({ keyword: val });
    
    // 简单的前端过滤演示 (实际应重置列表并调用后端)
    if (val) {
        const filteredW = WORDS_DB.filter(i => i.chinese.includes(val) || i.swahili.toLowerCase().includes(val)).map((item, idx) => ({...item, id: 9000+idx, isFav: false}));
        const filteredP = PHRASES_DB.filter(i => i.chinese.includes(val) || i.swahili.toLowerCase().includes(val)).map((item, idx) => ({...item, id: 8000+idx, isFav: false}));
        this.setData({ wordList: filteredW, phraseList: filteredP, hasMoreWords: false, hasMorePhrases: false });
        this.refreshFavStatus();
    } else {
        // 清空搜索恢复初始状态
        this.setData({ wordList: [], phraseList: [], pageWord: 1, pagePhrase: 1, hasMoreWords: true, hasMorePhrases: true });
        this.fetchData();
    }
  },

  switchTab(e) {
    const idx = parseInt(e.currentTarget.dataset.idx);
    this.setData({ currentTab: idx });
  },

  onSwiperChange(e) {
    this.setData({ currentTab: e.detail.current });
    http(`/web/ctiemBySub/?subid=${this.data.subid}&wp=${this.data.currentTab}`,'GET').then(res=>{
      console.log("res",res)
      if(this.data.currentTab == '0'){
        this.setData({
          wordList:res.results
        })
      }else{
        this.setData({
          phraseList:res.results
        })
      }
    })
  },

  loadMore() {
    if(this.data.currentTab === 0) {
      if(!this.data.hasMoreWords) return;
      this.setData({ pageWord: this.data.pageWord + 1 });
      this.fetchData();
    } else {
      if(!this.data.hasMorePhrases) return;
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

