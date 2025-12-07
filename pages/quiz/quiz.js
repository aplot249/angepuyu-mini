const app = getApp();
import  {http} from '../../requests/index'


Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    score: 0,
    isFinished: false, // 新增：是否完成标记
    eachItemScore:0,
    // 模拟题库
    quizList: [
      // {
      //   id: 1,
      //   question: 'Rafiki',
      //   options: ['敌人', '朋友', '老师', '学生'],
      //   answerIndex: 1,
      //   answered: false,
      //   userChoice: -1,
      //   isCorrect: false
      // },
    ]
  },
  // 洗牌函数（放在Page/Component对象内）
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },
  getRelatedAnswer(lingyu,index){
    http('/web/relatedanswers/','post',{"lingyu":lingyu,'exclude':this.data.quizList[index].chinese}).then(res=>{
      console.log('res',res)
      this.data.quizList[index].answer =  this.data.quizList[index].chinese
      this.data.quizList[index].options = res.data
      this.data.quizList[index].options.push(this.data.quizList[index].chinese)
      // console.log('this.data.quizList[0].options',this.data.quizList[0].options)
      this.shuffle(this.data.quizList[index].options)
      // console.log('this.data.quizList[0].options',this.data.quizList[0].options)
      this.setData({
        quizList:this.data.quizList
      })
    })
  },
  onLoad(option){
    // 如果是选好的单词进来练习
    if(option.from!='index'){
      let checkedItems = wx.getStorageSync('checkedItems')
      this.setData({
        quizList:checkedItems,
        eachItemScore:Math.round(100/this.data.quizList.length)
      })
      let lingyu = this.data.quizList[this.data.currentIndex].lingyu
      this.getRelatedAnswer(lingyu,this.data.currentIndex)
    }else{
      // http('/web/ctiemBySub/?subid=3','get').then(res=>{
      //   console.log("res11111111",res)
      //   this.setData({
      //     quizList:res.results,
      //     eachItemScore:Math.round(100/res.results.length)
      //   })
      //   let lingyu = this.data.quizList[this.data.currentIndex].lingyu
      //   this.getRelatedAnswer(lingyu,this.data.currentIndex)
      // })
      http('/web/randomquestion/','get').then(res=>{
        // console.log(res)
        this.setData({
          quizList:res,
          eachItemScore:Math.round(100/this.data.quizList.length)
        })
        let lingyu = this.data.quizList[this.data.currentIndex].lingyu
        this.getRelatedAnswer(lingyu,this.data.currentIndex)
      })

    }
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
      console.log('currentIndex',this.data.currentIndex)
      console.log("e.detail.current",e.detail.current)
      // 向后才去请求新数据
      if(e.detail.current > this.data.currentIndex){
        this.setData({ currentIndex: e.detail.current });
        let lingyu = this.data.quizList[this.data.currentIndex].lingyu
        this.getRelatedAnswer(lingyu,this.data.currentIndex)
      }
    }
  },

  playAudio(e) {
    const item = e.currentTarget.dataset.item;
    let xiaohao = item.fayin ? item.xiaohao : 0
    app.playAudio(item.fayin,xiaohao)
    wx.showToast({ title: `播放: ${item.swahili}`, icon: 'none' });
  },

  selectOption(e) {
    const { qindex, oindex,oanswer } = e.currentTarget.dataset;
    const question = this.data.quizList[qindex];
    console.log(question.chinese,oanswer,question.chinese===oanswer)
    // 如果已回答，则不可再次点击
    if (question.answered) return;

    const isCorrect = oanswer === question.chinese;
    
    // 更新题目状态
    const answeredKey = `quizList[${qindex}].answered`;
    const choiceKey = `quizList[${qindex}].userChoice`;
    const correctKey = `quizList[${qindex}].isCorrect`;

    this.setData({
      [answeredKey]: true,
      [choiceKey]: oindex,
      [correctKey]: isCorrect,
      // score: isCorrect ? this.data.score + this.data.eachItemScore : this.data.score
    });
    console.log('choiceKey',oindex)
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
      // 滑动切换到下一题
      this.setData({ currentIndex: this.data.currentIndex + 1 });
      let lingyu = this.data.quizList[this.data.currentIndex].lingyu
      console.log('lingyu',lingyu)
      this.getRelatedAnswer(lingyu,this.data.currentIndex)
    } else {
      // 最后一题答完，设置完成状态，显示弹窗
      let num = this.data.quizList.filter(i=>i.isCorrect===true).length
      console.log("num",num)
      let score = Math.floor((100 / this.data.quizList.length)*num) 
      this.setData({ 
        isFinished: true,
        score:score
      });
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
  continueQuiz(){
    this.setData({
      isFinished:false
    })
    http('/web/randomquestion/','get').then(res=>{
      // console.log(res)
      this.data.quizList.push(...res)
      this.setData({
        quizList:this.data.quizList,
        currentIndex:this.data.currentIndex+1,
        eachItemScore:Math.round(100/this.data.quizList.length)
      })
      let lingyu = this.data.quizList[this.data.currentIndex].lingyu
      this.getRelatedAnswer(lingyu,this.data.currentIndex)
    })
  },
  quitQuiz(){
    wx.navigateBack()
  },
  // 新增：分享配置
  onShareAppMessage() {
    return {
      title: `我在每日练习中得了${this.data.score}分！快来挑战斯瓦西里语吧！`,
      path: '/pages/quiz/quiz'
    }
  }
})