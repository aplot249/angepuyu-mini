// pages/create/create.js
import {
  http,
  fileupload,
} from '../../requests/index'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    ctid:'',
    chinese: '',
    english: '',
    swahili: '',
    xieyin: '',
    fayin: '',
    texts: { 
      start: "Start Record",
      stop: "Finish Record",
      continue: "Continue",
      reset: "Restore",
      play: "Play",
      playPause: "Pause",
      playContinue: "PlayContinue",
    },
  },
  recordEnd(event){
    console.log(event)
    this.setData({
      fayin:event.detail.tempFilePath
    })
  },
  nextWord(){
    this.onLoad()
  },
  submit() {
    if(!this.data.fayin){
      wx.showToast({
        title: 'no voice',
        icon:'error'
      })
      return false
    }
    var formData = {
      chinese: this.data.chinese,
      english: this.data.english,
      swahili: this.data.swahili,
      xieyin: this.data.xieyin,
      status:1
    }
    fileupload(`/web/updatectitem/${this.data.ctid}/`, this.data.fayin, 'fayin',formData).then(res => {
      console.log("提交成功", res)
      wx.showToast({
        title: '提交成功',
      })
      setTimeout(function () {
        // wx.navigateBack()
      }, 2000);
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) { 
    http('/web/getctitem/','GET').then(res=>{
        console.log(res)
        this.setData({
          ctid:res.id,
          chinese: res.chinese,
          english: res.english,
          swahili: res.swahili,
          xieyin:res.xieyin,
          portrait:res.portrait,
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})