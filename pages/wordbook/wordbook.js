const app = getApp();

// 模拟一个更充实的数据库
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
    {id:112, swahili:'Samaki', chinese:'鱼', homonym:'萨马基'},
    {id:113, swahili:'Wali', chinese:'米饭', homonym:'瓦利'},
    {id:114, swahili:'Ugali', chinese:'玉米糊', homonym:'乌噶里'},
    {id:115, swahili:'Bia', chinese:'啤酒', homonym:'比尔'},
    {id:116, swahili:'Daktari', chinese:'医生', homonym:'达克塔里'},
    {id:117, swahili:'Dawa', chinese:'药', homonym:'达瓦'},
    {id:118, swahili:'Polisi', chinese:'警察', homonym:'波利斯'},
    {id:119, swahili:'Mwizi', chinese:'小偷', homonym:'姆威兹'},
    {id:120, swahili:'Uwanja wa ndege', chinese:'机场', homonym:'乌万贾 瓦 恩德格'}
  ],
  phrases: [
    {id:501, swahili:'Habari gani?', chinese:'你好吗？', homonym:'哈巴里 噶尼'},
    {id:502, swahili:'Asante sana', chinese:'非常感谢', homonym:'阿三忒 萨那'},
    {id:503, swahili:'Unakwenda wapi?', chinese:'你去哪里？', homonym:'乌纳昆达 瓦皮'},
    {id:504, swahili:'Nataka kununua hii', chinese:'我想买这个', homonym:'纳塔卡 库努努阿 希'},
    {id:505, swahili:'Punguza bei', chinese:'便宜一点', homonym:'彭古扎 贝伊'},
    {id:506, swahili:'Sina pesa', chinese:'我没有钱', homonym:'希纳 佩萨'},
    {id:507, swahili:'Nimechoka sana', chinese:'我很累', homonym:'尼梅乔卡 萨那'},
    {id:508, swahili:'Njaa inauma', chinese:'肚子饿了', homonym:'恩贾 伊纳乌马'},
    {id:509, swahili:'Mimi ni Mchina', chinese:'我是中国人', homonym:'咪咪 尼 姆其纳'},
    {id:510, swahili:'Usiwe na wasiwasi', chinese:'别担心', homonym:'乌西韦 纳 瓦西瓦西'}
  ]
};

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentTab: 'words',
    searchText: '',
    fullList: [],      
    paginatedList: [], 
    currentPage: 1,
    totalPages: 1,
    pageSize: 8,
    checkedIds: []     
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    this.loadFavorites();
  },

  loadFavorites() {
    // 模拟：如果全局没有收藏，默认收藏一些ID以供展示
    let favIds = app.globalData.userInfo.favorites;
    if (!favIds || favIds.length === 0) {
        favIds = [101, 102, 103, 104, 105, 106, 111, 112, 501, 502, 503, 504];
        app.globalData.userInfo.favorites = favIds; // 临时写入以便演示
    }

    let sourceData = this.data.currentTab === 'words' ? MOCK_DB.words : MOCK_DB.phrases;
    let list = sourceData.filter(item => favIds.includes(item.id)).map(item => ({
      ...item,
      checked: this.data.checkedIds.includes(item.id)
    }));

    if (this.data.searchText) {
      const key = this.data.searchText.toLowerCase();
      list = list.filter(item => 
        item.chinese.includes(key) || item.swahili.toLowerCase().includes(key)
      );
    }

    this.setData({ 
      fullList: list,
      totalPages: Math.ceil(list.length / this.data.pageSize) || 1,
      currentPage: 1
    });
    
    this.updatePagination();
  },

  updatePagination() {
    const { fullList, currentPage, pageSize } = this.data;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    this.setData({
      paginatedList: fullList.slice(start, end)
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    this.setData({ currentTab: tab, searchText: '', checkedIds: [] });
    this.loadFavorites();
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value });
    this.loadFavorites();
  },

  prevPage() {
    if (this.data.currentPage > 1) {
      this.setData({ currentPage: this.data.currentPage - 1 });
      this.updatePagination();
    }
  },

  nextPage() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.updatePagination();
    }
  },

  toggleCheck(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.paginatedList;
    const idx = list.findIndex(i => i.id === id);
    
    const key = `paginatedList[${idx}].checked`;
    const newVal = !list[idx].checked;
    this.setData({ [key]: newVal });

    let ids = this.data.checkedIds;
    if (newVal) ids.push(id);
    else ids = ids.filter(i => i !== id);
    this.setData({ checkedIds: ids });
  },

  playAudio(e) {
    const item = e.currentTarget.dataset.item;
    const cost = this.data.currentTab === 'words' ? 1 : 3;
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