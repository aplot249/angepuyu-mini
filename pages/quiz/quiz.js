const app = getApp();
import {http} from '../../requests/index'
import { eventBus } from '../../utils/eventBus.js';

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    
    // 统计数据20 
    score: 0, //总得分
    rightNum:0,
    // eachItemScore:0,
    points:app.globalData.userInfo.points ? app.globalData.userInfo.points : 5,

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
    noLoad:false,
  },
  UserInfoPointsChange(value){
    console.log(value)
    this.setData({
      points:value
    })
  },
  OperateNoPointsModal(value){
    console.log(value)
    this.setData({
      showNoPointsModal:value
    })
  },
  onShow() {
    // 监听本页面弹窗的积分购买事件
    eventBus.on('UserInfoPointsChange', this.UserInfoPointsChange);
    eventBus.on('OperateNoPointsModal', this.OperateNoPointsModal);
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      points:app.globalData.userInfo.points,
      quizCountOption:wx.getStorageSync('quizCountOption') || 10,
      points:app.globalData.userInfo.points,
      startTime:Date.now()
    });
    http(`/web/randomquestion/?allownologin=${!app.globalData.userInfo.isLoggedIn}`,'get').then(res=>{
      this.setData({
        noLoad:res.tip,
        quizList:res.data,
        wrongCount:res.mistakeCount,
        currentIndex:0,
      })
      let lingyu = this.data.quizList[this.data.currentIndex].lingyu
      this.getRelatedAnswer(lingyu,this.data.currentIndex)
    })
    app.updateThemeSkin(app.globalData.isDarkMode);
    // wx.setNavigationBarTitle({ title: '每日练习' });
  },
  // 从一个tabBar切到另一个TabBar只触发onHide，不触发onUnload
  onHide(){
    if(!app.globalData.userInfo.isLoggedIn){
      return false
    }
    console.log('onUnload startTime',this.data.startTime)
    app.saveStudyTime(this.data.startTime);
    // 移除本页面的积分购买事件监听
    eventBus.off('UserInfoPointsChange', this.UserInfoPointsChange);
    eventBus.off('OperateNoPointsModal', this.OperateNoPointsModal);
    // 更新后端积分
    http('/user/userinfo/','post',{'points':app.globalData.userInfo.points}).then(res=>{
      console.log('已更新积分')
    })
    app.globalData.userInfo.points = this.data.points
    app.saveData()
    this.setData({
      quizList:[],
      currentIndex: 0,
      knownCount: 0,     // 已认识
      forgotCount: 0,    // 不认识
      completedCount: 0, // 已做题数
      wrongCount: 0,     // 错题数
      isFinished: false,
      showNoPointsModal: false, // 积分不足弹窗控制
      score:0,
      rightNum:0
    })
  },
  // 打乱做题选项
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
      this.shuffle(this.data.quizList[index].options)
      this.setData({
        quizList:this.data.quizList
      })
    })
  },
  
  onSwiperChange(e) {
    console.log('e.detail.current',e.detail.current)
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
        });
        app.globalData.userInfo.points = this.data.points
        app.saveData()
        let lingyu = this.data.quizList[this.data.currentIndex].lingyu
        // 判断自动发音
        if(app.globalData.userInfo.NextautoPlayfayin){    //开启了滑下一个自动发音
          let item = this.data.quizList[this.data.currentIndex]
          let xiaohao = item.fayin ? item.xiaohao : 0    //按发音存不存在，确定消耗
          let voiceType = wx.getStorageSync('voiceType')    //确定发音音色
          let fayin = "fayin"+voiceType   //确定发音音色
          console.log(fayin,item[fayin])    //输出发音音色、音色发音链接
          app.playAudio(item[fayin],xiaohao,item.swahili) //进行发音
        }
        this.getRelatedAnswer(lingyu,this.data.currentIndex)
        // 切到最后一个题了,判断要不要增加，
        if(this.data.currentIndex === this.data.quizList.length-1){ 
          if(this.data.noLoad==true){ //noLoad为true就不增加
              wx.showToast({
                title: '这是最后一张',
                icon:'none'
              })
          }else{  //否则就增加
            http(`/web/randomquestion/?allownologin=${app.globalData.userInfo.isLoggedIn}`,'get').then(res=>{
              this.data.quizList.push(...res.data)
              this.setData({
                noLoad:res.tip,
                quizList:this.data.quizList,
                wrongCount:res.mistakeCount,
              })
            })
          }
        }
      }
    }else{
      this.setData({
        currentIndex:e.detail.current
      })
    }
  },

  playAudio(e) {
    const item = e.currentTarget.dataset.item;
    let xiaohao = item.fayin ? item.xiaohao : 0
    let voiceType = wx.getStorageSync('voiceType')
    let fayin = "fayin"+voiceType
    console.log(fayin,item[fayin])
    app.playAudio(item[fayin],xiaohao,item.swahili)
  },

  caculateScore(){
    console.log("每组做题结束，弹起弹窗，计算得分")
    this.setData({
      isFinished:true
    })
    let score = Math.floor(100 / this.data.completedCount * this.data.rightNum)
    this.setData({
      score:score
    })
    http('/user/scorerecord/','post',{"score":score}).then(res=>{
        console.log('score',res)
    })
  },
  // 答题逻辑
  selectOption(e) {
    let that = this
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
    });
    console.log('choiceKey',oindex)
    if (isCorrect) {
      wx.vibrateShort(); // 震动反馈
      // 不管做对还是做错，都扣1积分
      this.setData({
        rightNum:this.data.rightNum + 1,
        completedCount: this.data.completedCount + 1,
        points:this.data.points - 1 > 0 ? this.data.points - 1 : 0  //剩余积分大于0时才减，否则置为0
      })
      // 完成的数量是每组数量的整数倍时候，出现弹窗计算得分。
      if(this.data.completedCount % this.data.quizCountOption === 0){
        console.log('ffffffffff')
        that.caculateScore()
      }
      // 把现在的得分保存
      app.globalData.userInfo.points = this.data.points
      app.saveData()
      // 答对自动跳下一题 (延迟体验更好)
      // setTimeout(() => {
      //   this.autoNext();
      // }, 1000);
    } else {
      // 这是做错
      wx.vibrateLong();
      console.log('dacuo',question)
      // oanswer
      // JSON.stringify(question.options)
      // 做错的题就要后端做记录
      if(app.globalData.userInfo.isLoggedIn){
        http('/web/mistake/','post',{'ctitemid':question.id,'answers':oanswer}).then(res=>{
          console.log('ress9',res)
          // 做对做错，扣1积分
          this.setData({
            completedCount: this.data.completedCount + 1,
            wrongCount:res.count, //错题总数
            points:this.data.points - 1 > 0 ? this.data.points - 1 : 0
          })
          if(this.data.completedCount % this.data.quizCountOption === 0){
            console.log('ffffffffff')
            that.caculateScore()
          }
          app.globalData.userInfo.points = this.data.points
          app.saveData()
        })
      }
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

  onConfirmPurchase(e) {
    console.log('用户选择了:', e.detail); // {planId: 3, price: 80, name: "年卡"}
    // 这里调用微信支付接口
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
      isFinished: false,
      completedCount:0,
      rightNum:0
    });
  },
  // 继续做题
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
          wrongCount:res.mistakeCount,
          currentIndex:this.data.currentIndex+1,
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