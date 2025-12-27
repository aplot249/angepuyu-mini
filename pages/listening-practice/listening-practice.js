const app = getApp();
import {http} from '../../requests/index.js'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    currentIndex: 0, // 当前 Swiper 索引
    isPlaying: false,

    // [新增] 统计数据
    correctCount: 0,
    wrongCount: 0,
    
    // 题目列表 (包含每道题的独立状态)
    questions: [
      // {
      //   id: 1,
      //   audio: '', 
      //   sentence: 'Jina langu ni Simba',
      //   translation: '我的名字是辛巴',
      //   words: ['Jina', 'langu', 'ni', 'Simba'],
      //   // 下面是每道题的独立状态，初始化时生成
      //   shuffledWords: [], 
      //   answerSlots: [],
      //   status: 'idle' // idle, correct, wrong
      // },
      // {
      //   id: 2,
      //   audio: '',
      //   sentence: 'Habari ya asubuhi',
      //   translation: '早上好',
      //   words: ['Habari', 'ya', 'asubuhi'],
      //   shuffledWords: [],
      //   answerSlots: [],
      //   status: 'idle'
      // },
      // {
      //   id: 3,
      //   audio: '',
      //   sentence: 'Ninakupenda sana rafiki yangu',
      //   translation: '我非常喜欢你，我的朋友',
      //   words: ['Ninakupenda', 'sana', 'rafiki', 'yangu'],
      //   shuffledWords: [],
      //   answerSlots: [],
      //   status: 'idle'
      // },
      // {
      //   id: 4,
      //   audio: '',
      //   sentence: 'Unatoka wapi wewe',
      //   translation: '你来自哪里？',
      //   words: ['Unatoka', 'wapi', 'wewe'],
      //   shuffledWords: [],
      //   answerSlots: [],
      //   status: 'idle'
      // }
    ]
  },

  onShow() {
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    if (app.updateThemeSkin) {
      app.updateThemeSkin(app.globalData.isDarkMode);
    }
  },

  onLoad() {
    this.initAllQuestions();
  },

  // 初始化所有题目
  initAllQuestions() {
    http('/web/listenpractice/','get').then(res=>{
      console.log('ressss',res)
      const initializedQuestions = res.data.map((q, qIndex) => {
        // 生成带唯一ID的单词对象
        console.log('q.swahili',q.swahili.split(' '))
        const wordObjects = q.swahili.split(' ').filter(i=>i !== "").map((word, wIndex) => ({
            id: `${q.id}-${wIndex}`, // 唯一ID
            text: word,
            selected: false
          }));
        const shuffled = this.shuffleArray([...wordObjects]);
        return {
          ...q,
          shuffledWords: shuffled,
          answerSlots: [],
          status: 'idle'
        };
      });
      console.log('initializedQuestions',initializedQuestions)
      this.setData({ 
        questions: initializedQuestions,
        rightCount: res.rightCount,
        wrongCount: res.wrongCount
      });
    })
  },

  // [新增] 更新统计数据
  // updateStats() {
  //   this.data.questions.forEach(q => {
  //     if (q.status === 'correct') {
  //       this.data.rightCount++;
  //     }else{
  //       this.data.wrongCount++;
  //     }
  //   });
  // },

  // 洗牌算法
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // Swiper 切换事件
  onSwiperChange(e) {
    const idx = e.detail.current;
    this.setData({ 
      currentIndex: idx,
      isPlaying: false 
    });
  },

  // 播放当前题目的音频
  playAudio(e) {
    if (this.data.isPlaying) return;
    // this.setData({ isPlaying: true });
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0 //按发音存不存在，确定消耗
    let voiceType = wx.getStorageSync('voiceType')  //确定发音音色
    let fayin = "fayin"+voiceType   //确定发音音色
    console.log(fayin,item[fayin])  //输出发音音色、音色发音链接
    app.playAudio(item[fayin],xiaohao,item.swahili)
  },

  // 选择单词
  selectWord(e) {
    const { qindex, windex } = e.currentTarget.dataset;
    const question = this.data.questions[qindex];
    if (question.status !== 'idle') return; // 已提交不可操作
    const wordObj = question.shuffledWords[windex];
    if (wordObj.selected) return;
    // 构建更新路径
    const selectedKey = `questions[${qindex}].shuffledWords[${windex}].selected`;
    const slotsKey = `questions[${qindex}].answerSlots`;
    this.setData({
      [selectedKey]: true,
      [slotsKey]: [...question.answerSlots, wordObj]
    });
  },

  // 移除单词
  removeWord(e) {
    const { qindex, sindex } = e.currentTarget.dataset;
    const question = this.data.questions[qindex];
    if (question.status !== 'idle') return;
    const wordObj = question.answerSlots[sindex];
    // 找到在乱序数组中的索引以恢复状态
    const shuffleIdx = question.shuffledWords.findIndex(w => w.id === wordObj.id);
    const selectedKey = `questions[${qindex}].shuffledWords[${shuffleIdx}].selected`;
    const slotsKey = `questions[${qindex}].answerSlots`;
    const newSlots = [...question.answerSlots];
    newSlots.splice(sindex, 1);
    this.setData({
      [selectedKey]: false,
      [slotsKey]: newSlots
    });
  },

  // 检查答案
  checkAnswer() {
    const idx = this.data.currentIndex;
    const question = this.data.questions[idx];
    if (question.answerSlots.length === 0) return;
    const userSentence = question.answerSlots.map(w => w.text).join(' ');
    console.log('userSentence',userSentence)
    const isCorrect = userSentence === question.swahili.split(' ').filter(i=>i !== "").join(' ');
    const statusKey = `questions[${idx}].status`;
    if (!isCorrect) {
      if (wx.vibrateLong) wx.vibrateLong();
      http('/web/listenpracticeupdate/','POST',{'ctitem':question.id,'action':'0'}).then(res=>{
        console.log('做错的',res)
      })
    }else{
      http('/web/listenpracticeupdate/','POST',{'ctitem':question.id,'action':'1'}).then(res=>{
        console.log('做错的',res)
      })
    }
    this.setData({
      [statusKey]: isCorrect ? 'correct' : 'wrong'
    });
  },

  // 重试当前题
  retryQuestion() {
    const idx = this.data.currentIndex;
    const question = this.data.questions[idx];
    
    // 重置状态
    const resetWords = question.shuffledWords.map(w => ({ ...w, selected: false }));
    
    this.setData({
      [`questions[${idx}].answerSlots`]: [],
      [`questions[${idx}].shuffledWords`]: resetWords,
      [`questions[${idx}].status`]: 'idle'
    }, () => {
      // [新增] 更新统计 (重试会减少错误/正确计数)
      this.updateStats();
    });
  },

  // 下一题（滑动到下一页）
  nextQuestion() {
    const nextIdx = this.data.currentIndex + 1;
    if (nextIdx < this.data.questions.length) {
      this.setData({ currentIndex: nextIdx });
    } else {
      wx.showToast({ title: '已是最后一题', icon: 'none' });
    }
  }
})