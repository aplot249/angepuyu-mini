const app = getApp();
import {http} from '../../requests/index'

// 模拟数据库 (Mock Data)
const MOCK_DB = {
  words: [
    {id:101, swahili:'Saruji', chinese:'水泥', homonym:'撒鲁机'},
    {id:102, swahili:'Mchanga', chinese:'沙子', homonym:'母畅噶'},
    {id:103, swahili:'Kofia', chinese:'帽子', homonym:'科菲亚'},
    {id:104, swahili:'Maji', chinese:'水', homonym:'马及'},
    {id:105, swahili:'Matofali', chinese:'砖块', homonym:'马托法利'},
    {id:106, swahili:'Nondo', chinese:'钢筋', homonym:'农多'},
    {id:107, swahili:'Kokoto', chinese:'石子', homonym:'科科托'},
    {id:108, swahili:'Mbao', chinese:'木材', homonym:'姆包'},
    {id:109, swahili:'Rangi', chinese:'油漆', homonym:'朗吉'},
    {id:110, swahili:'Misumari', chinese:'钉子', homonym:'米苏玛丽'},
    {id:111, swahili:'Nyama', chinese:'肉', homonym:'尼亚马'},
    {id:112, swahili:'Samaki', chinese:'鱼', homonym:'萨马基'}
  ],
  phrases: [
    {id:501, swahili:'Habari gani?', chinese:'你好吗？', homonym:'哈巴里 噶尼'},
    {id:502, swahili:'Asante sana', chinese:'非常感谢', homonym:'阿三忒 萨那'},
    {id:503, swahili:'Unakwenda wapi?', chinese:'你去哪里？', homonym:'乌纳昆达 瓦皮'},
    {id:504, swahili:'Nataka kununua hii', chinese:'我想买这个', homonym:'纳塔卡 库努努阿 希'},
    {id:505, swahili:'Punguza bei', chinese:'便宜一点', homonym:'彭古扎 贝伊'},
    {id:506, swahili:'Sina pesa', chinese:'我没有钱', homonym:'希纳 佩萨'}
  ]
};

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    currentTab: 0, // 0: Words, 1: Phrases
    searchText: '',
    
    // 数据列表
    wordList: [],
    phraseList: [],
    
    // 分页状态 (用于模拟无限加载)
    pageWord: 1,
    pagePhrase: 1,
    hasMoreWords: true,
    hasMorePhrases: true,
    pageSize: 6,

    wordsCount:'',
    phraseCount:'',
    wordsTotalPageNum:'',
    phraseTotalPageNum:'',

    // 选中的ID集合 (跨Tab共享)
    checkedIds: []     
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    
    let myFav = JSON.stringify(wx.getStorageSync('favorites'))
    http(`/web/ctiemByFav/?page=1`,'POST',{"q":myFav,'wp':'0'}).then(res=>{
      console.log(res)
      let list = res.results.map(item => ({
        ...item,
        checked: false
      }));

      this.setData({
        wordList:[...this.data.wordList,...list],
        pageSize:res.page_size,
        wordsCount:res.count,
        wordsTotalPageNum:res.totalPageNum,
      })
    })

    http(`/web/ctiemByFav/?page=1`,'POST',{"q":myFav,'wp':'1'}).then(res=>{
      console.log(res)
      let list = res.results.map(item => ({
        ...item,
        checked: false
      }));
      this.setData({
        phraseList:[...this.data.phraseList,...list],
        pageSize:res.page_size,
        phraseCount:res.count,
        phraseTotalPageNum:res.totalPageNum,
      })
    })
  },

  // 加载数据核心逻辑
  loadFavorites(type) {
    if (type == 'word') {
      let myFav = JSON.stringify(wx.getStorageSync('favorites'))
      http(`/web/ctiemByFav/?page=${this.data.pageWord}&search=${this.data.searchText}`,'POST',{"q":myFav,'wp':'0'}).then(res=>{
        console.log(res)
        let list = res.results.map(item => ({
          ...item,
          checked: false
        }));
  
        this.setData({
          wordList:[...this.data.wordList,...list],
          pageSize:res.page_size,
          wordsCount:res.count,
          hasMoreWords:this.data.pageWord < res.totalPageNum,
          wordsTotalPageNum:res.totalPageNum,
        })
      })
    } else {
      let myFav = JSON.stringify(wx.getStorageSync('favorites'))
      http(`/web/ctiemByFav/?page=${this.data.pagePhrase}&search=${this.data.searchText}`,'POST',{"q":myFav,'wp':'1'}).then(res=>{
        console.log(res)
        let list = res.results.map(item => ({
          ...item,
          checked: false
        }));
        this.setData({
          phraseList:[...this.data.phraseList,...list],
          pageSize:res.page_size,
          hasMorePhrases:this.data.pagePhrase < res.totalPageNum,
          phraseCount:res.count,
          phraseTotalPageNum:res.totalPageNum,
        })
      })
    }
  },

  // --- 交互事件 ---
  onSearchInput(e) {
    this.setData({ searchText: e.detail.value });
    // 搜索时重置列表
    this.setData({
      wordList: [], 
      phraseList: [], 
      pageWord: 1, 
      pagePhrase: 1,
      hasMoreWords: true, 
      hasMorePhrases: true
    });
    this.loadFavorites('word');
    this.loadFavorites('phrase');
  },

  switchTab(e) {
    const idx = parseInt(e.currentTarget.dataset.idx);
    this.setData({ currentTab: idx });
  },

  onSwiperChange(e) {
    this.setData({ currentTab: e.detail.current });
  },

  // 触底加载更多
  loadMoreWords() {
    if (!this.data.hasMoreWords) return;
    this.setData({ pageWord: this.data.pageWord + 1 });
    this.loadFavorites('word');
  },

  loadMorePhrases() {
    if (!this.data.hasMorePhrases) return;
    this.setData({ pagePhrase: this.data.pagePhrase + 1 });
    this.loadFavorites('phrase');
  },

  // 勾选/取消勾选
  toggleCheck(e) {
    const { id, type } = e.currentTarget.dataset;
    let ids = this.data.checkedIds;
    
    // 更新全局ID列表
    if (ids.includes(id)) {
      ids = ids.filter(i => i !== id);
    } else {
      ids.push(id);
    }
    this.setData({ checkedIds: ids });

    // 更新视图状态 (局部更新，性能优化)
    const listKey = type === 'word' ? 'wordList' : 'phraseList';
    const list = this.data[listKey];
    const idx = list.findIndex(i => i.id === id);
    if(idx > -1) {
       this.setData({
         [`${listKey}[${idx}].checked`]: ids.includes(id)
       });
    }
  },

  // 全选 (针对当前 Tab 已加载的数据)
  selectAll() {
    const isWord = this.data.currentTab === 0;
    const currentList = isWord ? this.data.wordList : this.data.phraseList;
    const listKey = isWord ? 'wordList' : 'phraseList';

    // 提取当前列表所有ID
    const newIds = currentList.map(item => item.id);
    // 合并到全局 checkedIds (去重)
    const combinedIds = [...new Set([...this.data.checkedIds, ...newIds])];

    this.setData({ checkedIds: combinedIds });

    // 更新当前列表视图为全选
    const updatedList = currentList.map(item => ({...item, checked: true}));
    this.setData({ [listKey]: updatedList });

    wx.showToast({ title: '当前页全选', icon: 'none' });
  },

  // 全不选 (重置所有)
  unselectAll() {
    this.setData({ checkedIds: [] });
    
    // 更新两个列表视图
    const resetList = (list) => list.map(item => ({...item, checked: false}));
    this.setData({
      wordList: resetList(this.data.wordList),
      phraseList: resetList(this.data.phraseList)
    });

    wx.showToast({ title: '已取消选择', icon: 'none' });
  },

  playAudio(e) {
    const item = e.currentTarget.dataset.item;
    const isWord = this.data.currentTab === 0;
    const cost = isWord ? 1 : 3;
    
    if (app.globalData.userInfo.points < cost) {
      wx.showToast({ title: '点数不足', icon: 'none' });
      return;
    }
    app.globalData.userInfo.points -= cost;
    app.saveData();
    wx.showToast({ title: `播放: ${item.swahili}`, icon: 'none' });
  },

  exportDoc() {
    const count = this.data.checkedIds.length;
    if (count === 0) return wx.showToast({ title: '请先勾选词条', icon: 'none' });
    
    const cost = count * 5;
    if (app.globalData.userInfo.points < cost) return wx.showToast({ title: `需 ${cost} 点数`, icon: 'none' });

    wx.showModal({
      title: '确认导出',
      content: `导出 ${count} 条记录将消耗 ${cost} 点数`,
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo.points -= cost;
          app.saveData();
          wx.showToast({ title: '文档已保存至手机', icon: 'success' });
        }
      }
    });
  },

  playStream() {
    if (this.data.checkedIds.length === 0) return wx.showToast({ title: '请先勾选词条', icon: 'none' });
    wx.showToast({ title: '开始语音串读...', icon: 'none' });
  }
});