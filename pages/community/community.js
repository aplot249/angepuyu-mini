const app = getApp();

Page({
  data: {
    currentTab: 0,
    tabs: [
      { id: 0, name: '全部' },
      { id: 1, name: '求助悬赏' },
      { id: 2, name: '经验分享' }
    ],
    postList: [
      {
        id: 1,
        nickname: 'Simba Fan',
        avatar: 'https://ui-avatars.com/api/?name=SF&background=FF7043&color=fff',
        time: '10分钟前',
        title: '这个词怎么发音更地道？',
        content: '刚学到 "Ninakupenda"，但是发音总感觉怪怪的，有大佬可以发语音指导一下吗？悬赏20积分！',
        bounty: 20,
        images: [],
        topic: '语音纠正',
        comments: 5,
        likes: 12,
        isLiked: false
      },
      {
        id: 2,
        nickname: 'Tanzania Explorer',
        avatar: 'https://ui-avatars.com/api/?name=TE&background=009688&color=fff',
        time: '2小时前',
        content: '分享几张在桑给巴尔岛拍的照片，这里的海真的很蓝！推荐大家周末去玩。',
        bounty: 0,
        images: [
          'https://siyu.jsxinlingdi.com/media/swiper/1.jpg',
          'https://siyu.jsxinlingdi.com/media/swiper/2.png'
        ],
        topic: '生活分享',
        comments: 23,
        likes: 88,
        isLiked: true
      }
    ]
  },

  onShow() {
    this.setData({ 
      isDarkMode: app.globalData.isDarkMode,
      fontSizeLevel: app.globalData.fontSizeLevel 
    });
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.index });
    // 实际应根据Tab重新加载数据
  },

  goToPost() {
    wx.navigateTo({ url: '/pages/community-post/community-post' });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/community-detail/community-detail?id=${id}` });
  },

  onLike(e) {
    const idx = e.currentTarget.dataset.index;
    const post = this.data.postList[idx];
    const keyLike = `postList[${idx}].isLiked`;
    const keyNum = `postList[${idx}].likes`;
    
    this.setData({
      [keyLike]: !post.isLiked,
      [keyNum]: post.isLiked ? post.likes - 1 : post.likes + 1
    });
  }
})