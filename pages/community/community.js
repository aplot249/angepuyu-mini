const app = getApp();
import {http,baseImgUrl} from '../../requests/index.js'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentTab: 0,
    baseImgUrl:baseImgUrl,
    // [修改] 扩展 tabs 结构，包含每个 tab 独立的数据列表和状态
    tabs: [
      // { id: 0, name: '全部', list: [], page: 1, isLoading: false, hasMore: true },
      // { id: 1, name: '求助悬赏', list: [], page: 1, isLoading: false, hasMore: true },
      // { id: 2, name: '经验分享', list: [], page: 1, isLoading: false, hasMore: true }
    ],
    allcan:false,
    showFatie:app.globalData.userInfo.is_superuser,
    // 基础演示数据池 (用于生成模拟数据)
    mockDataPool: [
      {
        nickname: 'Simba Fan',
        avatar: 'https://ui-avatars.com/api/?name=SF&background=FF7043&color=fff',
        title: '这个词怎么发音更地道？',
        content: '刚学到 "Ninakupenda"，但是发音总感觉怪怪的，有大佬可以发语音指导一下吗？悬赏20积分！',
        bounty: 20,
        images: [],
        topic: '语音纠正',
        type: 1
      },
      {
        nickname: 'Tanzania Explorer',
        avatar: 'https://ui-avatars.com/api/?name=TE&background=009688&color=fff',
        content: '分享几张在桑给巴尔岛拍的照片，这里的海真的很蓝！推荐大家周末去玩。石头城的咖啡也不错。',
        bounty: 0,
        images: [
          'https://images.unsplash.com/photo-1547471080-7541e89a43ca?w=200&q=80',
          'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200&q=80',
          'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=200&q=80'
        ],
        topic: '生活分享',
        type: 2
      },
      {
        nickname: 'Kifaru 007',
        avatar: 'https://ui-avatars.com/api/?name=K7&background=3F51B5&color=fff',
        title: '语法求助：mimi ni 和 ni 的区别',
        content: '请问在自我介绍的时候，说 "Mimi ni Mchina" 和直接说 "Ni Mchina" 有什么区别吗？哪种更常用？',
        bounty: 10,
        images: [],
        topic: '语法答疑',
        type: 1
      },
      {
        nickname: 'Foodie Tz',
        avatar: 'https://ui-avatars.com/api/?name=FT&background=E91E63&color=fff',
        content: '达累斯萨拉姆最好吃的 Nyama Choma (烤肉) 在哪里？我推荐一家在 Masaki 的店，味道绝了！',
        bounty: 0,
        images: [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80'
        ],
        topic: '美食探店',
        type: 2
      },
      {
        nickname: 'New Comer',
        avatar: 'https://ui-avatars.com/api/?name=NC&background=9C27B0&color=fff',
        title: '关于工作签证办理周期',
        content: '大家办理 Class C 签证一般多久能下来？我已经等了两个月了，还是显示处理中，正常吗？急！',
        bounty: 50,
        images: [],
        topic: '签证咨询',
        type: 1
      },
      {
        nickname: 'Hakuna Matata',
        avatar: 'https://ui-avatars.com/api/?name=HM&background=FFC107&color=fff',
        content: '终于把《斯瓦希里语基础》这本书看完了！整理了一些高频词汇表，需要的可以私信我或者在评论区留邮箱。',
        bounty: 0,
        images: [],
        topic: '学习资源',
        type: 2
      }
    ]
  },

  onLoad() {

  },

  onShow() {
    this.setData({ 
      isDarkMode: app.globalData.isDarkMode,
      fontSizeLevel: app.globalData.fontSizeLevel 
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    http('/web/topictype/','GET').then(res=>{
      console.log('res',res)
      this.setData({
        tabs:res,
        allcan:res[0].allcan
      })
      let currentTab = app.globalData.currentTab ? app.globalData.currentTab : 0
      // 初始化加载第一个Tab的数据
      console.log('currentTab',currentTab)
      // 选中那个tab
      this.setData({ currentTab: currentTab });
      this.loadDataForTab(currentTab);
    })
  },

  // 切换 Tab (点击顶部)
  switchTab(e) {
    const idx = e.currentTarget.dataset.index;
    app.globalData.currentTab = idx
    this.setData({ currentTab: idx });
  },

  // Swiper 切换回调 (滑动)
  onSwiperChange(e) {
    const idx = e.detail.current;
    this.setData({ currentTab: idx });
    app.globalData.currentTab = idx
    // 如果该Tab没有数据，则自动加载
    if (this.data.tabs[idx].list.length === 0) {
      this.loadDataForTab(idx);
    }
  },

  // 加载更多
  loadMore() {
    console.log('fffffffffffff')
    this.loadDataForTab(this.data.currentTab);
  },

  // 核心数据加载逻辑
  loadDataForTab(tabIndex) {
    // 切到某一个id了，得到这一个分类
    const tab = this.data.tabs[tabIndex];
    console.log('tab',tab)
    let hasMore = tab.hasMore === undefined ? true :tab.hasMore
    console.log('hasMore',hasMore)
    if (tab.isLoading || !hasMore) return;
    // 设置加载状态
    const loadingKey = `tabs[${tabIndex}].isLoading`;
    this.setData({ [loadingKey]: true });  //这一个分类正在加载
    let page = tab.page === undefined ? 1: tab.page
    console.log('currentPage',page)
    http(`/web/topic/?id=${tab.id}&page=${page}`,'GET').then(res=>{
        console.log('articles',res)
        const articlesKey = `tabs[${tabIndex}].list`;
        const pageKey = `tabs[${tabIndex}].page`;
        const loadingKey = `tabs[${tabIndex}].isLoading`;
        const hasMoreKey = `tabs[${tabIndex}].hasMore`;
        this.setData({
          [articlesKey]: tab.list.concat(res.results), //当前分类的文章，增加6条数据
          [pageKey]: page +1 , //当前分类的页码加1
          [loadingKey]: false,  //停止加载
          // 模拟最多加载3页
          [hasMoreKey]: page < res.totalPageNum //模拟最多加载3页面 
        });
    })
  },

  onSearch(e) {
    const keyword = e.detail.value;
    if (!keyword) return;
    wx.showToast({ title: '搜索：' + keyword, icon: 'none' });
  },

  goToPost() {
    wx.navigateTo({ url: '/pages/community-post/community-post' });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community-detail/community-detail?id=${id}` });
  },

  onLike(e) {
    const tabIdx = this.data.currentTab;
    const itemIdx = e.currentTarget.dataset.index;
    const tabItem = this.data.tabs[tabIdx].list[itemIdx];
    
    const likeKey = `tabs[${tabIdx}].list[${itemIdx}].isLiked`;
    const numKey = `tabs[${tabIdx}].list[${itemIdx}].likes`;
    
    if(tabItem.isLiked){  //就是取消
      http('/web/topiclike/','DELETE',{"topic":tabItem.id}).then(res=>{
        console.log('itemid',res)
      })
    }else{
      http('/web/topiclike/','POST',{"topic":tabItem.id}).then(res=>{
        console.log('itemid',res)
      })
    }
    this.setData({
      [likeKey]: !tabItem.isLiked,
      [numKey]: tabItem.isLiked ? tabItem.likes - 1 : tabItem.likes + 1
    });
  },
  
  previewImage(e) {
    const current = e.currentTarget.dataset.current;
    const urls = e.currentTarget.dataset.urls;
    wx.previewImage({ current, urls });
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
      title: '安哥拉华人学葡语，快来一起进步吧。',
      path: '/pages/index/index',
      // imageUrl: '/images/share-cover.png', // 假设有分享图
    }
  // else{
  //   wx.showToast({ title: '一天领取一次', icon: 'none' });
  // }
  },
})