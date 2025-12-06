const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    score: 0,
    
    // 模拟题库
    quizList: [
      {
        id: 1,
        question: 'Rafiki',
        options: ['敌人', '朋友', '老师', '学生'],
        answerIndex: 1,
        answered: false,
        userChoice: -1,
        isCorrect: false
      },
      {
        id: 2,
        question: 'Karibu',
        options: ['再见', '谢谢', '欢迎', '你好'],
        answerIndex: 2,
        answered: false,
        userChoice: -1,
        isCorrect: false
      },
      {
        id: 3,
        question: 'Asante',
        options: ['谢谢', '对不起', '没关系', '早上好'],
        answerIndex: 0,
        answered: false,
        userChoice: -1,
        isCorrect: false
      },
      {
        id: 4,
        question: 'Simba',
        options: ['大象', '豹子', '狮子', '斑马'],
        answerIndex: 2,
        answered: false,
        userChoice: -1,
        isCorrect: false
      }
    ]
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    wx.setNavigationBarTitle({ title: '每日练习' });
  },

  onSwiperChange(e) {
    // 仅在用户滑动时更新索引
    if(e.detail.source === 'touch') {
      this.setData({ currentIndex: e.detail.current });
    }
  },

  playAudio(e) {
    const word = e.currentTarget.dataset.word;
    wx.showToast({ title: `播放: ${word}`, icon: 'none' });
  },

  selectOption(e) {
    const { qindex, oindex } = e.currentTarget.dataset;
    const question = this.data.quizList[qindex];

    // 如果已回答，则不可再次点击
    if (question.answered) return;

    const isCorrect = oindex === question.answerIndex;
    
    // 更新题目状态
    const answeredKey = `quizList[${qindex}].answered`;
    const choiceKey = `quizList[${qindex}].userChoice`;
    const correctKey = `quizList[${qindex}].isCorrect`;

    this.setData({
      [answeredKey]: true,
      [choiceKey]: oindex,
      [correctKey]: isCorrect,
      score: isCorrect ? this.data.score + 10 : this.data.score
    });

    if (isCorrect) {
      wx.vibrateShort(); // 震动反馈
      // 答对自动跳下一题 (延迟体验更好)
      setTimeout(() => {
        this.autoNext();
      }, 1000);
    } else {
      wx.vibrateLong();
    }
  },

  autoNext() {
    if (this.data.currentIndex < this.data.quizList.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    } else {
      // 最后一题答完，显示完成提示
      wx.showToast({ title: `完成！得分: ${this.data.score}`, icon: 'none', duration: 2000 });
    }
  },

  forceNext() {
    this.autoNext();
  }
})