const app = getApp();
import {http,baseImgUrl} from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    currentTab: 0,
    scrollLeft: 0, // 顶部Tab滚动位置
    baseImgUrl:baseImgUrl,
    // 标签页配置及对应数据
    categories: [
      // { id: 1, name: '语法入门', page: 1, hasMore: true, isLoading: false, articles: [] },
      // { id: 2, name: '文化习俗', page: 1, hasMore: true, isLoading: false, articles: [] },
      // { id: 3, name: '旅游攻略', page: 1, hasMore: true, isLoading: false, articles: [] },
      // { id: 4, name: '商务礼仪', page: 1, hasMore: true, isLoading: false, articles: [] },
    ]
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    wx.setNavigationBarTitle({ title: '知识库' });
    http('/web/knowledgetype/','GET').then(res=>{
      console.log('res',res)
      this.setData({
        categories:res
      })
      // 初始化加载第一个Tab的数据
      // if (this.data.categories[0].articles == undefined || this.data.categories[0].articles.length === 0) {
        this.loadDataForTab(0);
      // }
    })
  },

  // 切换 Tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
  },

  // Swiper 切换回调
  onSwiperChange(e) {
    const idx = e.detail.current;
    console.log('idx',idx)
    this.setData({ currentTab: idx });
    
    // 自动滚动顶部 Tab
    this.setData({ scrollLeft: (idx - 1) * 60 });
    console.log('this.data.categories[idx].articles',this.data.categories[idx])
    // 如果该Tab没有数据，则加载
    // if (this.data.categories[idx].articles.length === 0 || undefined) {
      this.loadDataForTab(idx)
    // }
  },

  // 触底加载更多
  loadMoreData() {
    this.loadDataForTab(this.data.currentTab);
  },

  // 加载数据逻辑 (模拟)
  loadDataForTab(tabIndex) {
    // 切到某一个id了，得到这一个分类
    const category = this.data.categories[tabIndex];
    console.log('category111',category)
    let hasMore = category.hasMore === undefined ? true :category.hasMore
    console.log('hasMore',hasMore)
    if (category.isLoading || !hasMore) return;
    // 设置加载状态
    const loadingKey = `categories[${tabIndex}].isLoading`;
    this.setData({ [loadingKey]: true });  //这一个分类正在加载
    let page = category.page === undefined ? 1: category.page
    console.log('currentPage',page)
    http(`/web/knowledgearticles/?id=${category.id}&page=${page}`,'GET').then(res=>{
        console.log('articles',res)
        const articlesKey = `categories[${tabIndex}].articles`;
        const pageKey = `categories[${tabIndex}].page`;
        const loadingKey = `categories[${tabIndex}].isLoading`;
        const hasMoreKey = `categories[${tabIndex}].hasMore`;
        this.setData({
          [articlesKey]: category.articles.concat(res.results), //当前分类的文章，增加6条数据
          [pageKey]: page +1 , //当前分类的页码加1
          [loadingKey]: false,  //停止加载
          // 模拟最多加载3页
          [hasMoreKey]: page < res.totalPageNum //模拟最多加载3页面 
        });
    })
  },

  // 辅助：生成模拟标题
  // getTitle(tab, page, index) {
  //   const types = ['语法', '文化', '旅游', '商务'];
  //   const type = types[tab] || '资讯';
  //   return `【${type}】第${page}期：斯瓦希里语${type}详解指南 ${index + 1}`;
  // },

  // 辅助：生成模拟封面
  // getCover(tab, index) {
  //   // 随机几张图
  //   const imgs = [
  //     'https://images.unsplash.com/photo-1547471080-7541e89a43ca?w=400&q=80',
  //     'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80',
  //     'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80',
  //     'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80'
  //   ];
  //   return imgs[(tab + index) % imgs.length];
  // },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 复用之前的 article 页面
    wx.navigateTo({ url: `/pages/article/article?id=${id}` });
  }
})