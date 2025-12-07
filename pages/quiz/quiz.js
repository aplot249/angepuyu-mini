const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    score: 0,
    isFinished: false, // 新增：是否完成标记
    
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
    // 仅在用户触摸滑动时更新索引
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
      // [修复] 如果是最后一题，答错也需要在延迟后进入结算，否则用户无路可走
      if (qindex === this.data.quizList.length - 1) {
        setTimeout(() => {
          this.autoNext();
        }, 1500); // 留1.5秒看错误解析
      }
    }
  },

  autoNext() {
    if (this.data.currentIndex < this.data.quizList.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    } else {
      // 最后一题答完，设置完成状态，显示弹窗
      this.setData({ isFinished: true });
      wx.vibrateLong();
    }
  },

  forceNext() {
    this.autoNext();
  },

  // 新增：重新开始
  restartQuiz() {
    // 重置所有题目状态
    const resetList = this.data.quizList.map(item => ({
      ...item, answered: false, userChoice: -1, isCorrect: false
    }));
    this.setData({
      quizList: resetList,
      currentIndex: 0,
      score: 0,
      isFinished: false
    });
  },

  // 新增：分享配置
  onShareAppMessage() {
    return {
      title: `我在每日练习中得了${this.data.score}分！快来挑战斯瓦西里语吧！`,
      path: '/pages/quiz/quiz'
    }
  }
})