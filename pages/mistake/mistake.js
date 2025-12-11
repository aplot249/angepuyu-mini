const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    masteredCount: 45, // 模拟已消灭错题数

    // 错题数据 (模拟)
    mistakeList: [
      {
        id: 1,
        question: 'Rafiki',
        answerStr: '朋友',
        errorCount: 5, // 错误次数高
        lastDate: '10分钟前'
      },
      {
        id: 4,
        question: 'Simba',
        answerStr: '狮子',
        errorCount: 2,
        lastDate: '昨天'
      },
      {
        id: 104,
        question: 'Hapana',
        answerStr: '不 / No',
        errorCount: 1,
        lastDate: '2天前'
      }
    ]
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
  },

  playAudio(e) {
    const word = e.currentTarget.dataset.word;
    wx.showToast({ title: `播放: ${word}`, icon: 'none' });
  },

  // 标记为已学会 (移除)
  markAsMastered(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认',
      content: '确定已经掌握这个词了吗？移出后可以在单词本找回。',
      success: (res) => {
        if (res.confirm) {
          // 前端模拟删除
          const newList = this.data.mistakeList.filter(item => item.id !== id);
          this.setData({ 
            mistakeList: newList,
            masteredCount: this.data.masteredCount + 1
          });
          wx.showToast({ title: '太棒了！继续加油', icon: 'success' });
        }
      }
    });
  },

  // 去攻克 (跳转到 Quiz)
  goToQuiz(e) {
    const id = e.currentTarget.dataset.id;
    // 这里我们假设 quiz 页面支持 mode=review 参数
    // 实际项目中需要在 quiz.js 的 onLoad 中处理 options.id
    wx.navigateTo({
      url: `/pages/quiz/quiz?mode=review&id=${id}`,
      success: () => {
        wx.showToast({ title: '进入专项复习', icon: 'none' });
      }
    });
  },

  goHomeQuiz() {
    wx.navigateTo({ url: '/pages/quiz/quiz' });
  }
})