// pages/create/create.js
import {
  http,
  fileupload,
} from '../../requests/index'

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    chinese: '',
    english: '',
    swahili: 'Karibu',
    xieyin: '',
    fayin: '',

    portrait: [],
    portrait_url: [],
    recordTmpFile:'',

    audioShow:false,
    texts: { 
      start: "开始录音",
      stop: "结束录音",
      continue: "继续录音",
      reset: "重录",
      play: "回放",
      playPause: "暂停",
      playContinue: "继续",
    },
  },
  portraitRead(event) {
    const {
      file
    } = event.detail;
    this.data.portrait.push({
      url: file.url,
    })
    console.log("file", file)
    var that = this
    fileupload('/web/imageupload/', file.url, 'img',{"ctitem":"1"}).then(res => {
      // 上传完成需要更新 fileList
      that.setData({
        portrait_url: res.img,
        portrait: this.data.portrait,
      })
    })
  },
  // 删除头像
  deletePortrait(obj) {
    console.log(obj)
    let img = obj.detail.file.url.split('/').slice(-1)[0]
    http(`/web/imageupload/?img=${img}`, 'delete').then(res => {
      console.log("1111", res)
    })
    this.data.portrait.shift({
      url: obj.detail.file.url,
    })
    this.setData({
      portrait: this.data.portrait,
      portrait_url: ''
    })
  },

  submit() {
    var formData = {
      chinese: this.data.chinese,
      english: this.data.english,
      swahili: this.data.swahili,
      xieyin: this.data.xieyin,
    }
    http('/web/updatectitem/1/', 'patch', formData).then(res => {
      console.log("提交成功", res)
      wx.showToast({
        title: '发布成功',
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