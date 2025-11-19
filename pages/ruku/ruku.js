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
    textareasize: {
      maxHeight: 400,
      minHeight: 250
    },
    chinese: '',
    english: '',
    swahili: '',
    xieyin: '',
    fayin: '',

    sublingyu: "",
    sublingyuID: '',
    showSelectCategoryPopen: false,
    portrait: [],
    portrait_url: [],
    new: '',
  },
  onClickNav({
    detail = {}
  }) {
    this.setData({
      mainActiveIndex: detail.index || 0,
    });
  },
  onClickItem({
    detail = {}
  }) {
    const activeId = this.data.activeId === detail.id ? null : detail.id;
    this.setData({
      activeId
    });
    console.log(detail)
    this.setData({
      sublingyu: detail['text'],
      sublingyuID: detail['id'],
      showSelectCategoryPopen: false
    })
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
    fileupload('/country/imageupload/', file.url, 'img').then(res => {
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
    http(`/country/imageupload/?img=${img}`, 'delete').then(res => {
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

  //开始录音的时候
  start() {
    var that = this
    const options = {
      duration: 10000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    }
    //开始录音
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log("录音授权成功");
        //第一次成功授权后 状态切换为2
        that.setData({
          status: 2,
        })
        recorderManager.start(options);
        recorderManager.onStart(() => {
          console.log('recorder start')
        });
        //错误回调
        recorderManager.onError((res) => {
          console.log(res);
        })
      },
      fail() {
        console.log("第一次录音授权失败");
        wx.showModal({
          title: '提示',
          content: '您未授权录音，功能将无法使用',
          showCancel: true,
          confirmText: "授权",
          confirmColor: "#52a2d8",
          success: function (res) {
            if (res.confirm) {
              //确认则打开设置页面（重点）
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                  if (!res.authSetting['scope.record']) {
                    //未设置录音授权
                    console.log("未设置录音授权");
                    wx.showModal({
                      title: '提示',
                      content: '您未授权录音，功能将无法使用',
                      showCancel: false,
                      success: function (res) {

                      },
                    })
                  } else {
                    //第二次才成功授权
                    console.log("设置录音授权成功");
                    that.setData({
                      status: 2,
                    })

                    recorderManager.start(options);
                    recorderManager.onStart(() => {
                      console.log('recorder start')
                    });
                    //错误回调
                    recorderManager.onError((res) => {
                      console.log(res);
                    })
                  }
                },
                fail: function () {
                  console.log("授权设置录音失败");
                }
              })
            } else if (res.cancel) {
              console.log("cancel");
            }
          },
          fail: function () {
            console.log("openfail");
          }
        })
      }
    })

  },
  //暂停录音
  pause() {
    recorderManager.pause();
    recorderManager.onPause((res) => {
      console.log('暂停录音')

    })
  },
  //继续录音
  resume() {
    recorderManager.resume();
    recorderManager.onStart(() => {
      console.log('重新开始录音')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },
  //停止录音
  stop() {
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const {
        tempFilePath
      } = res
    })
  },
  //播放声音
  play() {
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.tempFilePath,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  submit() {
    var that = this

    var formData = {
      chinese: this.data.title,
      english: that.data.content,
      swahili: that.data.phone,
      xieyin: that.data.phone,
      fayin: that.data.phone,
      portrait: that.data.portrait_url,
    }
    http('/web/itemlist/', 'POST', formData).then(res => {
      console.log("提交成功", res)
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 2000);
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

      let myarticle = wx.getStorageSync('myarticle')
      this.data.portrait.push({
        url: myarticle.portrait,
      })
      this.setData({
        chinese: myarticle.chinese,
        english: myarticle.english,
        swahili: myarticle.swahili,
        portrait: this.data.portrait,
        portrait_url: myarticle.portrait,
      })

  },

  selectCategory() {
    this.setData({
      showSelectCategoryPopen: true
    })
  },
  onPopenClose() {
    this.setData({
      showSelectCategoryPopen: false,
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