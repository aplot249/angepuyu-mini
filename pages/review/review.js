const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    
    // 模拟复习卡片数据
    wordList: [
      {
        id: 101,
        swahili: 'Karibu',
        chinese: '欢迎',
        english: 'Welcome',
        homonym: '卡里布',
        image: 'https://images.unsplash.com/photo-1596464716127-f9a86b5b3f4d?w=400&q=80',
        isFlipped: false
      },
      {
        id: 102,
        swahili: 'Asante',
        chinese: '谢谢',
        english: 'Thank you',
        homonym: '阿三忒',
        image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80',
        isFlipped: false
      },
      {
        id: 103,
        swahili: 'Rafiki',
        chinese: '朋友',
        english: 'Friend',
        homonym: '拉菲基',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80',
        isFlipped: false
      },
      {
        id: 104,
        swahili: 'Jambo',
        chinese: '你好',
        english: 'Hello',
        homonym: '江波',
        image: '', // 测试无图情况
        isFlipped: false
      }
    ]
  },
  onLoad(){
    let checkedItems = wx.getStorageSync('checkedItems')
    if(checkedItems){
      this.setData({
        wordList:checkedItems
      })
    }
  },
  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    
    // 设置标题
    wx.setNavigationBarTitle({ title: '卡片复习' });
  },

  // 翻转卡片
  toggleFlip(e) {
    const index = e.currentTarget.dataset.index;
    const key = `wordList[${index}].isFlipped`;
    this.setData({
      [key]: !this.data.wordList[index].isFlipped
    });
  },

  // 监听滑动切换
  onSwiperChange(e) {
    // [优化] 增加 source 判断，仅在用户手指触摸滑动时更新索引
    // 避免 nextCard() 自动跳转时触发 bindchange 导致的数据冗余更新
    if (e.detail.source === 'touch') {
      this.setData({
        currentIndex: e.detail.current
      });
    }
  },

  playAudio(e) {
    // 阻止冒泡防止翻转
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0
    app.playAudio(item.fayin,xiaohao)
    wx.showToast({ title: `播放: ${item.swahili}`, icon: 'none' });
  },

  markKnown() {
    wx.showToast({ title: '已记住了！', icon: 'success' });
    // 逻辑：自动滑到下一张
    this.nextCard();
  },

  markForgot() {
    wx.showToast({ title: '加入生词本', icon: 'none' });
    // 逻辑：自动滑到下一张
    this.nextCard();
  },
  
  nextCard() {
    if (this.data.currentIndex < this.data.wordList.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
  }
})