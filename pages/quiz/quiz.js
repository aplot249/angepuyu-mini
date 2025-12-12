const app = getApp();
import {http} from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    
    // 统计数据
    score: 60,         // 初始积分 (模拟)
    points:null,

    completedCount: 0, // 已做题数
    wrongCount: 0,     // 错题数
    
    isFinished: false,
    showNoPointsModal: false, // 积分不足弹窗控制

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
      // }
    ],
    noLoad:false
  },
  onLoad(){
      http('/web/randomquestion/','get').then(res=>{
      // console.log(res)
      this.setData({
        noLoad:res.tip,
        quizList:res.data,
        eachItemScore:Math.round(100/this.data.quizList.length),
        points:app.globalData.userInfo.points
      })
      let lingyu = this.data.quizList[this.data.currentIndex].lingyu
      this.getRelatedAnswer(lingyu,this.data.currentIndex)
    })
  },
  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      points:app.globalData.userInfo.points,
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    wx.setNavigationBarTitle({ title: '每日练习' });
  },
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
  onSwiperChange(e) {
    // if(e.detail.source === 'touch') {
    //   console.log('currentIndex',this.data.currentIndex)
    //   console.log("e.detail.current",e.detail.current)
    //   // 向后才去请求新数据
    //   if(e.detail.current > this.data.currentIndex){
    //     this.setData({ currentIndex: e.detail.current });
    //     let lingyu = this.data.quizList[this.data.currentIndex].lingyu
    //     this.getRelatedAnswer(lingyu,this.data.currentIndex)
    //   }
    // }
    console.log('e.detail.current',e.detail.current)
    // 以前序列小于这次积分，就是向后刷
    if (this.data.currentIndex < e.detail.current){
      if(app.globalData.userInfo.points <= 0){
        app.globalData.userInfo.points = 0
        app.saveData()
        this.setData({
          currentIndex:e.detail.current - 1,
          showNoPointsModal:true
        })
      }else{
        app.globalData.userInfo.points -= 3
        app.saveData()
        http('/user/userinfo/','post',{'points':app.globalData.userInfo.points}).then(res=>{
          console.log('res',res)
        })
        // if (e.detail.source === 'touch') {
          this.setData({
            currentIndex: e.detail.current,
          });
          this.setData({ currentIndex: e.detail.current });
          let lingyu = this.data.quizList[this.data.currentIndex].lingyu
          this.getRelatedAnswer(lingyu,this.data.currentIndex)
        // }
      }
    }
  },

  playAudio(e) {
    const item = e.currentTarget.dataset.item;
    let xiaohao = item.fayin ? item.xiaohao : 0
    app.playAudio(item.fayin,xiaohao,item.title)
  },

  // 答题逻辑
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
      app.globalData.userInfo.points -= 3 
      if(app.globalData.userInfo.points < 0){
        app.globalData.userInfo.points = 0
      }
      this.setData({
        completedCount: this.data.completedCount + 1,
        points:app.globalData.userInfo.points
      })
      // 答对自动跳下一题 (延迟体验更好)
      // setTimeout(() => {
      //   this.autoNext();
      // }, 1000);
    } else {
      wx.vibrateLong();
      console.log('dacuo',question)
      http('/web/mistake/','post',{'ctitemid':question.id,'answers':JSON.stringify(question.options)}).then(res=>{
        console.log('ress9',res)
        app.globalData.userInfo.points -= 3
        this.setData({
          wrongCount:res.count, //错题总数
          points:app.globalData.userInfo.points
        })
      })
      // [修复] 如果是最后一题，答错也需要在延迟后进入结算，否则用户无路可走
      // if (qindex === this.data.quizList.length - 1) {
        // setTimeout(() => {
        //   this.autoNext();
        // }, 1000); // 留1.5秒看错误解析
      // }
    }
  },
  goMistake(){
    wx.navigateTo({
      url: '/pages/mistake/mistake',
    })
  },
  goPurchase(){
    wx.navigateTo({
      url: '/pages/purchase/purchase',
    })
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
      // console.log("num",num)
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
    if(this.data.noLoad==true){
      wx.showToast({
        title: '这是最后一题',
        icon:'none'
      })
    }else{
      http('/web/randomquestion/','get').then(res=>{
        this.data.quizList.push(...res.data)
        this.setData({
          noLoad:res.tip,
          quizList:this.data.quizList,
          currentIndex:this.data.currentIndex+1,
          eachItemScore:Math.round(100/this.data.quizList.length)
        })
        let lingyu = this.data.quizList[this.data.currentIndex].lingyu
        this.getRelatedAnswer(lingyu,this.data.currentIndex)
      })
    }
  },

  // --- 积分不足处理 ---

  buyPoints() {
    this.setData({ showNoPointsModal: false });
    wx.navigateTo({ url: '/pages/purchase/purchase' });
  },

  closeNoPointsModal() {
    this.setData({ showNoPointsModal: false });
  },

  // 分享配置
  onShareAppMessage(res) {
    // 关闭弹窗（如果是从弹窗点击分享）
    if (this.data.showNoPointsModal) {
      this.setData({ showNoPointsModal: false });
      // 这里可以模拟分享成功后增加积分，实际需后端回调
      setTimeout(() => {
        this.setData({ score: this.data.score + 20 });
        wx.showToast({ title: '分享成功 +20分', icon: 'success' });
      }, 2000);
    }

    return {
      title: '坦坦斯语”针对在坦华人提供学斯语，我做了20道题，得了60分，快来一起学斯语吧。',
      path: '/pages/quiz/quiz',
      imageUrl: '/images/share-cover.png' // 假设有分享图
    }
  }
})