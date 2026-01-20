const app = getApp()

Component({
  properties: {
    // 可以从父页面传入初始值，也可以组件内部自己读取 Storage
  },

  data: {
    visible: false,
    // 音色选项
    // voiceOptions: [
    //   { id: '1', name: '男声1号', icon: '👨' },
    //   { id: '2', name: '女声1号', icon: '👩' }, 
    //   { id: '3', name: '男声2号', icon: '🧔' }
    // ],
    voiceOptions:wx.getStorageSync('fayintype')?JSON.parse(wx.getStorageSync('fayintype')):{} ,

    // 倍速选项
    speedOptions: [
      { value: 0.75, label: '0.75x' },
      { value: 1.0, label: '1.0x' },
      { value: 1.25, label: '1.25x' },
      { value: 1.5, label: '1.5x' }
    ],

    // 当前设置
    settings: {
      voice: wx.getStorageSync("voiceType"),
      speed: wx.getStorageSync('playRate')
    }
  },

  // 组件生命周期
  lifetimes: {
    attached() {
<<<<<<< HEAD
      // 初始化时读取缓存配置
      const cached = wx.getStorageSync('audioSettings');
      if (cached) {
        this.setData({ settings: cached });
=======
      console.log('dddddddddddddddddd')
      let fayintype = JSON.parse(wx.getStorageSync('fayintype'));
      console.log('fayintype',fayintype);
      // 初始化时读取缓存配置
      this.setData({
        voiceOptions:fayintype
      })
      const cached = wx.getStorageSync('audioSettings');
      if (cached) {
        this.setData({ 
          settings: cached,
        });
>>>>>>> 14c6bad965ecc8c0d23cda5cfc66898b8cc7bbcb
        // 触发一次事件确保父页面同步
        // this.triggerEvent('change', cached);
      }
    }
  },

  methods: {
    toggleModal() {
      this.setData({ visible: !this.data.visible });
    },

    closeModal() {
      this.setData({ visible: false });
    },

    preventScroll() {
      // 防止滚动穿透
      return;
    },

    changeVoice(e) {
      const id = e.currentTarget.dataset.id;
      this._updateSettings('voice', id);
    },

    changeSpeed(e) {
      const val = e.currentTarget.dataset.val;
      this._updateSettings('speed', val);
    },

    _updateSettings(key, value) {
      const newSettings = {
        ...this.data.settings,
        [key]: value
      };
      console.log(newSettings)
      this.setData({ settings: newSettings });
      // 1. 保存到本地存储
      wx.setStorageSync('audioSettings', newSettings);
      wx.setStorageSync('voiceType',newSettings.voice)
      // 保存设置
      wx.setStorageSync('playRate', newSettings.speed);
      // 如果有全局 globalData 也可以同步
      if (app.globalData) {
        app.globalData.playRate = newSettings.speed;
      }     
      // 震动反馈
      wx.vibrateShort({ type: 'light' });
    }
  }
})