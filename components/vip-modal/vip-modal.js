import {http} from '../../requests/index'
import { eventBus } from '../../utils/eventBus.js';

const app = getApp();

Component({
  properties: {
    // 控制显示隐藏
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    selectedPlanId: '', // 默认选中年卡
    prepay_id:'',
    isLoop: false, // 控制轮询开关
    waitTimes: 0, // 记录轮询次数
    maxWait: 10, // 最大轮询次数
    timerId: null, // 存储定时器ID
    // VIP 套餐配置 (内部数据)
    vipPlans: [
      // {
      //   id: 'month',
      //   name: '月度会员',
      //   intro: '一个月有效期',
      //   price: '28',
      //   originalPrice: '',
      //   recommend: false
      // },
      // {
      //   id: 'season',
      //   name: '季度会员',
      //   intro: '三个月有效期',
      //   price: '60',
      //   originalPrice: '84',
      //   recommend: false
      // },
      // {
      //   id: 'year',
      //   name: '永久会员',
      //   intro: '一次购买，终身有效',
      //   price: '100',
      //   originalPrice: '199',
      //   recommend: true
      // }
    ]
  },
  lifetimes: {
    attached() {
      console.log('组件挂载到页面树，可进行初始化');
      http('/user/price/','get').then(res=>{
          console.log('price',res)
          this.setData({
<<<<<<< HEAD
            vipPlans:res
=======
            vipPlans:res,
            // selectedPlanId:res[res.length-1]['id']
            selectedPlanId:res.filter(item=>item.isTuijian==true)[0]['id']
>>>>>>> 14c6bad965ecc8c0d23cda5cfc66898b8cc7bbcb
          })
      })
    },
    detached() {
      console.log('组件被移除，进行清理');
      clearInterval(this.timer); // 清除定时器
    }
  },
  methods: {
    // 关闭弹窗
    closeModal() {
      this.setData({ visible: false });
      this.triggerEvent('close'); // 通知父组件
    },

    // 选择套餐
    selectPlan(e) {
      const id = e.currentTarget.dataset.id;
      if (id !== this.data.selectedPlanId) {
        this.setData({ 
          selectedPlanId: id,
        });
        wx.vibrateShort({ type: 'light' });
      }
    },

    // 购买处理
    handleBuyVip() {
      // 可以在这里处理购买逻辑，或者将事件抛出给父组件处理
      this.setData({visible: false})
      const item = this.data.vipPlans.find(p => p.id === this.data.selectedPlanId);
      let price = item['price']
      let title = `${item['name']}#${item['points']}`
      this.doWXpay(price,title)
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
<<<<<<< HEAD
=======
            app.globalData.userInfo.points = res.points
            app.globalData.userInfo.isvip = true
            app.saveData()
>>>>>>> 14c6bad965ecc8c0d23cda5cfc66898b8cc7bbcb
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
      wx.showToast({'title':'正在处理...','icon':'none'})
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

    preventScroll() {
      return;
    }
  }
})