const app = getApp();

const MOCK_DB = {
  words: [
    {id:101, swahili:'Saruji', chinese:'水泥', homonym:'撒鲁机'},
    {id:102, swahili:'Mchanga', chinese:'沙子', homonym:'母畅噶'},
    {id:103, swahili:'Kofia', chinese:'帽子', homonym:'科菲亚'},
    {id:104, swahili:'Maji', chinese:'水', homonym:'马及'}
  ],
  phrases: [
    {id:501, swahili:'Habari gani?', chinese:'你好吗？', homonym:'哈巴里 噶尼'},
    {id:502, swahili:'Asante sana', chinese:'非常感谢', homonym:'阿三忒 萨那'}
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
    this.loadFavorites();
  },

  loadFavorites() {
    const favIds = app.globalData.userInfo.favorites || [101, 102, 501];
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