import { eventBus } from '../../utils/eventBus.js';
const app = getApp();

Component({
  properties: {
    // 控制显示隐藏
    // visible: {
    //   type: Boolean,
    //   value: true
    // }
  },
  lifetimes: {
    // wx.setStorageSync('onlongerShow', true)
    attached: function() {
      if(!wx.getStorageInfoSync().keys.includes('onlongerShow') || !wx.getStorageInfoSync('onlongerShow') == true){
        this.setData({
          visible:true,
        })
      }
    // 1. 初始化数据
    // this.setData({ localUserInfo: app.globalData.userInfo });
    // 2. 绑定监听函数
    // this.userNewCreatedListener = (created) => {
    //   console.log('组件监听到 globalData created 变化:', created);
    //   this.setData({ visible: created });
    //   // this.setData({ visible: true });
    // };
    // 3. 注册监听
    // eventBus.on('userNewCreated', this.userNewCreatedListener);
    },
    detached() {
      // 4. 重要：移除监听，防止内存泄漏
      // eventBus.off('userNewCreated', this.userNewCreatedListener);
    }
  },
  methods: {
    onlongerShow(){
      wx.setStorageSync('onlongerShow', true)
      this.setData({
        visible:false
      })
    },
    // 阻止底层页面滚动
    preventTouchMove() {
      return;
    },

    onClose() {
      this.setData({ visible: false });
      this.triggerEvent('close');
    },

    onConfirm() {
      this.setData({ visible: false });
      this.triggerEvent('confirm');
    }
  }
})