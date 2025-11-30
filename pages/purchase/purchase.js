const app = getApp();
import {
  http
} from '../../requests/index'

Page({
  data: {
    userInfo: {},
    fontSizeLevel: 1,
    isDarkMode: false,

    prepay_id:'',
    isLoop: false, // 控制轮询开关
    waitTimes: 0, // 记录轮询次数
    maxWait: 10, // 最大轮询次数
    timerId: null, // 存储定时器ID
    priceList:[]
  },
  onLoad(){
    http('/web/pricelist/','get').then(res=>{
        console.log(res)
        this.setData({
          priceList:res
        })
    })
  },
  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });

    // [特殊处理] 充值页面单独的导航栏逻辑
    if (app.globalData.isDarkMode) {
      // 夜间模式：统一黑色风格
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1C1917', // Stone 900
        animation: {
          duration: 300
        }
      });
      wx.setBackgroundColor({
        backgroundColor: '#1C1917'
      });
    } else {
      // 白天模式：恢复该页面特色的橙色导航栏
      wx.setNavigationBarColor({
        frontColor: '#ffffff', // 橙色背景配白字
        backgroundColor: '#F59E0B', // Amber 500
        animation: {
          duration: 300
        }
      });
      wx.setBackgroundColor({
        backgroundColor: '#FAFAF9'
      });
    }
  },

  buyPoints(e) {
    const {
      amount,
      price,
      desp
    } = e.currentTarget.dataset;
    const isUnlimited = parseInt(amount) > 10000;

    const content = isUnlimited ?
      `确认支付 ¥${price} 购买 ${amount} 点数？` :
      `确认支付 ¥${price} 购买 ${amount} 点数？`;

    let that = this
    wx.showModal({
      title: '确认支付',
      content: content,
      confirmColor: '#2DD4BF', // 主题色
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '支付中...'
          });
          http('/web/pay/', 'post',{"price":price,"points":amount,"desp":desp}).then(res => {
            if (res.code === 0) {
              const payment = res.payment;
              this.setData({"prepay_id":payment.prepay_id})
              // 调起微信支付
              wx.requestPayment({
                timeStamp: payment.timeStamp,
                nonceStr: payment.nonceStr,
                package: payment.package,
                signType: payment.signType,
                paySign: payment.paySign,
                success: (payRes) => {
                  // console.log('支付成功', payRes);
                  // 支付成功后的逻辑
                  // 在这里进行 回调
                  that.startLooping()
                },
                fail: (err) => {
                  console.error('支付失败', err);
                  // 支付失败或用户取消的逻辑
                }
              });
            } else {
              console.error('获取支付参数失败', res.message);
            }
          }, err => {
            console.error('请求后端接口失败', err);
          })
        }
      }
    });
  },

  // 轮询的核心函数
  autoUpdate() {
    // 检查是否满足停止条件
    if (!this.data.isLoop) return;

    const newWait = this.data.waitTimes + 1;

    // 超时检查
    if (newWait >= this.data.maxWait) {
      console.log('轮询超时');
      this.stopLooping();
      return;
    }
    let that = this
    http(`/web/transcation/${this.data.prepay_id}/`,'get').then(res=>{
      this.setData({
        waitTimes: newWait
      });
      if(res.status == '1'){
        console.log('拿到数据，停止轮询',res)
        this.stopLooping();
        wx.showToast({
          title: '支付成功',
        })
        app.globalData.userInfo.points = app.globalData.userInfo.points+res.points
        app.saveData()
        this.setData({
          userInfo:this.data.userInfo
        })
      }else{
        const timerId = setTimeout(() => this.autoUpdate(), 1000);
        this.setData({
          timerId
        });
      }
    })
  },

  // 开始轮询
  startLooping() {
    this.setData({
      isLoop: true,
      waitTimes: 0
    });
    const timerId = setTimeout(() => this.autoUpdate(), 1000);
    this.setData({
      timerId
    });
  },

  // 停止轮询
  stopLooping() {
    this.setData({
      isLoop: false
    });
    if (this.data.timerId) {
      clearTimeout(this.data.timerId);
      this.setData({
        timerId: null
      });
    }
  },

  onHide() {
    // 页面隐藏时停止轮询
    this.stopLooping();
  },

  onUnload() {
    // 页面卸载时停止轮询
    this.stopLooping();
  }
})