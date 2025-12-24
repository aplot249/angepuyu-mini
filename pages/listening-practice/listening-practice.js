const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    currentIndex: 0,
    isPlaying: false,
    checkStatus: 'idle', // idle, correct, wrong
    
    // 当前题目状态
    currentQuestion: null,
    shuffledWords: [], // 乱序后的单词池 {id, text, selected}
    answerSlots: [],   // 用户已填入的单词 {id, text}
    
    // 模拟题库
    questions: [
      {
        id: 1,
        audio: 'https://.../audio1.mp3', // 实际开发替换为真实地址
        sentence: 'Jina langu ni Simba',
        translation: '我的名字是辛巴',
        words: ['Jina', 'langu', 'ni', 'Simba']
      },
      {
        id: 2,
        audio: 'https://.../audio2.mp3',
        sentence: 'Habari ya asubuhi',
        translation: '早上好',
        words: ['Habari', 'ya', 'asubuhi']
      },
      {
        id: 3,
        audio: 'https://.../audio3.mp3',
        sentence: 'Ninakupenda sana rafiki yangu',
        translation: '我非常喜欢你，我的朋友',
        words: ['Ninakupenda', 'sana', 'rafiki', 'yangu']
      },
      {
        id: 4,
        audio: 'https://.../audio4.mp3',
        sentence: 'Unatoka wapi wewe',
        translation: '你来自哪里？',
        words: ['Unatoka', 'wapi', 'wewe']
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

  onLoad() {
    this.initQuestion(0);
  },

  // 初始化题目
  initQuestion(index) {
    if (index >= this.data.questions.length) {
      wx.showToast({ title: '恭喜通关！', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    const q = this.data.questions[index];
    
    // 生成带唯一ID的单词对象以便处理重复单词
    const wordObjects = q.words.map((word, idx) => ({
      id: `${index}-${idx}`,
      text: word,
      selected: false
    }));

    // 打乱顺序
    const shuffled = this.shuffleArray([...wordObjects]);

    this.setData({
      currentIndex: index,
      currentQuestion: q,
      shuffledWords: shuffled,
      answerSlots: [],
      checkStatus: 'idle',
      isPlaying: false
    });
    
    // 自动播放一次音频（模拟）
    this.playAudio();
  },

  // 洗牌算法
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // 播放音频
  playAudio() {
    if (this.data.isPlaying) return;
    
    this.setData({ isPlaying: true });
    
    // 模拟音频播放过程
    // 实际开发中使用 wx.createInnerAudioContext()
    setTimeout(() => {
      this.setData({ isPlaying: false });
    }, 2000);
  },

  // 选择单词（从下方移入上方）
  selectWord(e) {
    if (this.data.checkStatus !== 'idle') return; // 已提交不可操作

    const idx = e.currentTarget.dataset.index;
    const wordObj = this.data.shuffledWords[idx];

    if (wordObj.selected) return; // 已经选过

    // 更新下方状态
    const key = `shuffledWords[${idx}].selected`;
    
    // 添加到上方
    const newSlots = [...this.data.answerSlots, wordObj];

    this.setData({
      [key]: true,
      answerSlots: newSlots
    });
  },

  // 移除单词（从上方移回下方）
  removeWord(e) {
    if (this.data.checkStatus !== 'idle') return;

    const slotIdx = e.currentTarget.dataset.index;
    const wordObj = this.data.answerSlots[slotIdx];

    // 在下方列表中找到对应的单词并恢复状态
    const shuffleIdx = this.data.shuffledWords.findIndex(w => w.id === wordObj.id);
    const key = `shuffledWords[${shuffleIdx}].selected`;

    // 从上方移除
    const newSlots = [...this.data.answerSlots];
    newSlots.splice(slotIdx, 1);

    this.setData({
      [key]: false,
      answerSlots: newSlots
    });
  },

  // 检查答案
  checkAnswer() {
    if (this.data.answerSlots.length === 0) return;

    const userSentence = this.data.answerSlots.map(w => w.text).join(' ');
    const correctSentence = this.data.currentQuestion.sentence;

    // 忽略大小写比较（可选）
    // const isCorrect = userSentence.toLowerCase() === correctSentence.toLowerCase();
    
    // 严格比较
    const isCorrect = userSentence === correctSentence;

    this.setData({
      checkStatus: isCorrect ? 'correct' : 'wrong'
    });

    if (isCorrect) {
      wx.vibrateShort({ type: 'light' });
    } else {
      wx.vibrateLong();
    }
  },

  // 下一题
  nextQuestion() {
    this.initQuestion(this.data.currentIndex + 1);
  },

  // 重试当前题
  retryQuestion() {
    // 重置状态但保留乱序
    const resetWords = this.data.shuffledWords.map(w => ({ ...w, selected: false }));
    this.setData({
      answerSlots: [],
      shuffledWords: resetWords,
      checkStatus: 'idle'
    });
  }
})