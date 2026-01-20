import {http} from '../../requests/index'
import { eventBus } from '../../utils/eventBus.js';
const app = getApp();

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    beidong:{
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    plans:[],
    prepay_id:'',
    isLoop: false, // 控制轮询开关
    waitTimes: 0, // 记录轮询次数
    maxWait: 10, // 最大轮询次数
    timerId: null, // 存储定时器ID
  },
  lifetimes: {
    attached() {
      console.log('组件挂载到页面树，可进行初始化');
      http('/user/price/','get').then(res=>{
          console.log('price',res)
          this.setData({
            plans:res
          })
      })
    },
    detached() {
      console.log('组件被移除，进行清理');
      clearInterval(this.timer); // 清除定时器
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {   
    buyPoints(e){
      console.log(e.currentTarget.dataset.item)
      let item = e.currentTarget.dataset.item
      let price = item['price']
      let title = `${item['name']}#${item['points']}`
      // wx.showToast({
      //   title:"调起支付...",
      //   icon:"none"
      // })
      this.doWXpay(price,title)
    },
    onClose() {
      this.setData({ visible: false });
      // this.triggerEvent('close');
    },
    closeNoPointsModal(){
      this.setData({
        visible:false
      })
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
      http(`/user/transcation/${this.data.prepay_id}/`,'get').then(res=>{
        this.setData({
          waitTimes: newWait
        });
        if(res.status == '1'){
          console.log('拿到数据，停止轮询',res)
          this.stopLooping();
          wx.showToast({
            title: '支付成功',
          })
          // app.globalData.userInfo.isvip = true
          // app.saveData()
          // this.setData({
          //   userInfo:this.data.userInfo
          // })
          app.globalData.userInfo.points += Number(res.title.split('#')[1])
          app.saveData()
          http('/user/userinfo/','post',{'points':app.globalData.userInfo.points,'isvip':true}).then(res=>{
            console.log('已更新points')
            eventBus.emit('UserInfoPointsChange', app.globalData.userInfo.points)
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

    // 这里调用微信支付接口
    doWXpay(price,title){
      let that = this
      http('/user/pay/', 'post',{"price":price,"title":title}).then(res => {
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
    },
    //支付结束

    onPurchase() {
      const plan = this.data.plans.find(p => p.id === this.data.selectedId);
      // 触发购买事件，将选中的套餐信息传递给父页面
      this.triggerEvent('purchase', {
        planId: plan.id,
        price: plan.price,
        name: plan.name
      });
      // 演示效果：关闭弹窗
      this.setData({ visible: false });
      // 实际开发中可以在父页面处理支付逻辑，这里仅做 Toast 提示
      wx.showToast({
        title: '正在调起支付...',
        icon: 'loading'
      });
      this.doWXpay(plan.price,plan.name)
    }
    
  }

})