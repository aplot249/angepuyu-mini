const app = getApp();
import {http} from '../../requests/index.js'
import { eventBus } from '../../utils/eventBus.js';

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    startTime:Date.now(),
    currentIndex: 0, // 当前 Swiper 索引
    isPlaying: false,
    score:0,
    points:app.globalData.userInfo.points ? app.globalData.userInfo.points : 5,
    // 本次做题统计数据
    correctCount: 0,
    wrongCount: 0,
    rightNum:0,
    wrongNum:0,

    completedCount: 0, // 已做题数
    isFinished: false,
    showNoPointsModal: false, // 积分不足弹窗控制
    noLoad:'',
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

  UserInfoPointsChange(value){
    console.log(value)
    this.setData({
      points:value,
      isvip:true
    })
    app.globalData.userInfo.isvip = true
  },
  goPurchase(){
    if(this.data.isLoggedIn & !this.data.isvip){
      this.setData({
        showNoPointsModal:true,
        beidong:false
      })
    }
  },
  onShow() {
    eventBus.on('UserInfoPointsChange', this.UserInfoPointsChange);
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      listenPracticeCountOption:wx.getStorageSync('quizCountOption') || 10,
      points:app.globalData.userInfo.points,
      isLoggedIn:app.globalData.userInfo.isLoggedIn,
      isvip:app.globalData.userInfo.isvip
    });
    if (app.updateThemeSkin) {
      app.updateThemeSkin(app.globalData.isDarkMode);
    }
  },

  onLoad() {
    this.initAllQuestions('first');
  },

  // 初始化所有题目
  initAllQuestions() {
    http(`/web/listenpractice/?allownologin=${!app.globalData.userInfo.isLoggedIn}`,'get').then(res=>{
      console.log('ressss',res)
      const initializedQuestions = res.data.map((q, qIndex) => {
        // 生成带唯一ID的单词对象
        // console.log('q.swahili',q.swahili.split(' '))
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
        }
      })
      this.setData({ 
        questions: this.data.questions.concat(initializedQuestions),
        rightNum: res.rightNum,
        wrongNum: res.wrongNum,
        noLoad:res.tip,
        isFinished:false
      })
    })
  },

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
      // 以前序列小于这次积分，就是向后刷
    if (this.data.currentIndex < e.detail.current){
      // 向后刷积分小于0时候
      if(!app.globalData.userInfo.isLoggedIn){
        this.setData({points:5})
      }
      if(this.data.points <= 0){
        this.setData({
          points:0,
          currentIndex:e.detail.current - 1,
          showNoPointsModal:true
        })
        app.globalData.userInfo.points = this.data.points
        app.saveData()
        // 为0 ，更新积分
        http('/user/userinfo/','post',{'points':app.globalData.userInfo.points}).then(res=>{
          console.log('已更新积分')
        })
      }else{
        // 遍历题，扣2积分
        this.setData({
          points:this.data.points - 2 > 0 ? this.data.points - 2 : 0,
          currentIndex: e.detail.current 
        })
        app.globalData.userInfo.points = this.data.points
        app.saveData()
        const idx = e.detail.current;
        this.setData({ 
          currentIndex: idx,
        })
        if(app.globalData.NextautoPlayfayin){    //开启了滑下一个自动发音
          let item = this.data.questions[this.data.currentIndex] // 这个词条数据
          console.log('item',item)
          let voiceType = wx.getStorageSync('voiceType')  //拿到后台给的推荐的发音频道
          let fayin = "siyufayin"+voiceType   //拼接出发音频道，完整版
          console.log(fayin,item[fayin])  //输出发音音色完整名称、并输出对应的发音链接
          app.playAudio(item[fayin],item.swahili)
        }
        if(this.data.currentIndex === this.data.questions.length-1){ 
          if(this.data.noLoad==true){ //noLoad为true就不增加
              wx.showToast({
                title: '这是最后一张',
                icon:'none'
              })
          }else{  //否则就增加
            if(this.data.currentIndex == this.data.questions.length - 1){
              // this.initAllQuestions()
              http(`/web/listenpractice/?allownologin=${app.globalData.userInfo.isLoggedIn}`,'get').then(res=>{
                console.log('ressss',res)
                const initializedQuestions = res.data.map((q, qIndex) => {
                  // 生成带唯一ID的单词对象
                  // console.log('q.swahili',q.swahili.split(' '))
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
                  }
                })
                this.setData({ 
                  questions: this.data.questions.concat(initializedQuestions),
                  rightNum: res.rightNum,
                  wrongNum: res.wrongNum,
                  noLoad:res.tip,
                  isFinished:false
                })
              })
            }
          }
        }
      }
    }else{
        this.setData({
          currentIndex:e.detail.current
        })
      if(e.detail.current == 0){
          this.setData({
            currentIndex:0
          })
      }
    }
  },

  onUnload(){
    if(!app.globalData.userInfo.isLoggedIn){
      return false
    }
    console.log('onUnload startTime',this.data.startTime)
    app.saveStudyTime(this.data.startTime);
    // 移除本页面的积分购买事件监听
    eventBus.off('UserInfoPointsChange', this.UserInfoPointsChange);
    // 更新后端积分
    http('/user/userinfo/','post',{'points':app.globalData.userInfo.points}).then(res=>{
      console.log('已更新积分')
    })
    app.globalData.userInfo.points = this.data.points
    app.saveData()
    this.setData({
      questions:[],
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0,
      completedCount: 0, // 已做题数
      isFinished: false,
      showNoPointsModal: false, // 积分不足弹窗控制
      score:0,
    })
  },

  caculateScore(){
    console.log("每组做题结束，弹起弹窗，计算得分")
    this.setData({
      isFinished:true
    })
    let score = Math.floor(100 / this.data.completedCount * this.data.correctCount)
    this.setData({
      score:score
    })
    http('/user/scorerecord/','post',{"score":score,'type':'1'}).then(res=>{
        console.log('score',res)
    })
  },

  // 播放当前题目的音频
  playAudio(e) {
    if (this.data.isPlaying) return;
    // this.setData({ isPlaying: true });
    let item = e.currentTarget.dataset.item // 这个词条数据
    let voiceType = wx.getStorageSync('voiceType')  //拿到后台给的推荐的发音频道
    let fayin = "siyufayin"+voiceType   //拼接出发音频道，完整版
    console.log(fayin,item[fayin])  //输出发音音色完整名称、并输出对应的发音链接
    app.playAudio(item[fayin],item.swahili)
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
    })
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
    })
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
    let that = this;
    if (!isCorrect) {
      if (wx.vibrateLong) wx.vibrateLong();
      http('/web/listenpracticeupdate/','POST',{'ctitem':question.id,'action':'0'}).then(res=>{
        console.log('做错的',res)
        this.setData({
          completedCount:this.data.completedCount+1,
          wrongCount:this.data.wrongCount+1,
          rightNum:res.rightNum,
          wrongNum:res.wrongNum,
        })
        // 完成的数量是每组数量的整数倍时候，出现弹窗计算得分。
        if(this.data.completedCount % this.data.listenPracticeCountOption === 0){
          console.log('xxxxxxxxxxxxxxxxxxxx')
          that.caculateScore()
        }
      })
    }else{
      http('/web/listenpracticeupdate/','POST',{'ctitem':question.id,'action':'1'}).then(res=>{
        console.log('做对的',res)
        this.setData({
          completedCount:this.data.completedCount+1,
          correctCount:this.data.correctCount+1,
          rightNum:res.rightNum,
          wrongNum:res.wrongNum,
        })
        if(this.data.completedCount % this.data.listenPracticeCountOption === 0){
          console.log('rrrrrrrrrrrrrrr')
          that.caculateScore()
        }
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
      [`questions[${idx}].status`]: 'idle',
      isFinished:false
    });
  },

  // // 下一题（滑动到下一页）
  nextQuestion() {
    const nextIdx = this.data.currentIndex + 1;
    if (nextIdx < this.data.questions.length) {
      this.setData({ currentIndex: nextIdx });
    } else {
      wx.showToast({ title: '已是最后一题', icon: 'none' });
    }
  },
  
  onShareAppMessage(res) {
    // 关闭弹窗（如果是从弹窗点击分享）
    if (this.data.showNoPointsModal) {
      this.setData({ showNoPointsModal: false });
    }
    if(!app.globalData.userInfo.hasSharedToday){
      app.globalData.userInfo.hasSharedToday = true
      this.setData({ points: this.data.points + 20});
      app.globalData.userInfo.points = this.data.points
      app.saveData()
      wx.showToast({ title: '分享积分 +20', icon: 'none' });
    }
    return {
      title: '坦桑华人学斯语，快来一起进步吧。',
      path: '/pages/index/index',
      // imageUrl: '/images/share-cover.png', // 假设有分享图
    }
  }
})