const app = getApp();

// 获取录音管理器
const recorderManager = wx.getRecorderManager();
// 创建音频上下文
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    // 表单字段
    swahili: '',
    english: '',
    chinese: '',
    homonym: '',
    
    // 录音状态
    isRecording: false,
    tempAudioPath: '',
    recordDuration: 0,
    isPlaying: false,
    
    // 计时器引用
    timer: null
  },

  onLoad() {
    this.setupRecorder();
    this.setupAudioPlayer();
  },

  onShow() {
    // 同步全局样式设置
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
  },

  onUnload() {
    this.cleanUp();
  },

  // --- 初始化监听器 ---

  setupRecorder() {
    recorderManager.onStart(() => {
      console.log('recorder start');
      this.setData({ isRecording: true, recordDuration: 0 });
      
      // 启动计时器
      this.data.timer = setInterval(() => {
        this.setData({ recordDuration: this.data.recordDuration + 1 });
      }, 1000);
    });

    recorderManager.onStop((res) => {
      console.log('recorder stop', res);
      clearInterval(this.data.timer);
      
      const { tempFilePath, duration } = res;
      // 持续时间可能是毫秒，转换为秒（向上取整）
      const seconds = Math.ceil(duration / 1000);
      
      this.setData({
        isRecording: false,
        tempAudioPath: tempFilePath,
        recordDuration: seconds < 1 ? this.data.recordDuration : seconds
      });
      
      wx.showToast({ title: '录制完成', icon: 'success' });
    });
    
    recorderManager.onError((err) => {
      console.error('recorder error', err);
      this.setData({ isRecording: false });
      clearInterval(this.data.timer);
      wx.showToast({ title: '录音失败', icon: 'none' });
    });
  },

  setupAudioPlayer() {
    innerAudioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });
    innerAudioContext.onStop(() => {
      this.setData({ isPlaying: false });
    });
    innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });
    innerAudioContext.onError((res) => {
      console.error(res.errMsg);
      wx.showToast({ title: '播放失败', icon: 'none' });
      this.setData({ isPlaying: false });
    });
  },

  // --- 交互操作 ---

  startRecord() {
    // 申请权限并开始录音
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        const options = {
          duration: 60000, // 最长1分钟
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: 'mp3'
        };
        recorderManager.start(options);
        wx.vibrateShort(); // 震动反馈
      },
      fail: () => {
        wx.showModal({
          title: '权限提示',
          content: '需要麦克风权限才能录音，请在设置中开启。',
          showCancel: false,
          success: (res) => {
            if (res.confirm) wx.openSetting();
          }
        });
      }
    });
  },

  stopRecord() {
    recorderManager.stop();
    wx.vibrateShort();
  },

  playRecord() {
    if (!this.data.tempAudioPath) return;

    if (this.data.isPlaying) {
      innerAudioContext.pause();
      this.setData({ isPlaying: false });
    } else {
      innerAudioContext.src = this.data.tempAudioPath;
      innerAudioContext.play();
    }
  },

  reRecord() {
    wx.showModal({
      title: '确认重录',
      content: '当前的录音将被清除，确定吗？',
      success: (res) => {
        if (res.confirm) {
          // 停止正在播放的声音
          if(this.data.isPlaying) innerAudioContext.stop();
          
          this.setData({
            tempAudioPath: '',
            recordDuration: 0,
            isPlaying: false
          });
        }
      }
    });
  },

  submitForm() {
    const { swahili, english, chinese, homonym, tempAudioPath } = this.data;

    // 1. 简单校验
    if (!swahili || !english || !chinese) {
      return wx.showToast({ title: '请填写完整文本信息', icon: 'none' });
    }
    if (!tempAudioPath) {
      return wx.showToast({ title: '请录制语音', icon: 'none' });
    }

    // 2. 模拟提交过程
    wx.showLoading({ title: '正在上传...', mask: true });

    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟成功
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });

      // 3. 重置表单或返回上一页
      setTimeout(() => {
        // 选项 A: 清空表单继续录入
        this.cleanUp();
        this.setData({
          swahili: '', english: '', chinese: '', homonym: '',
          tempAudioPath: '', recordDuration: 0
        });
        
        // 选项 B: 返回
        // wx.navigateBack();
      }, 1500);
      
    }, 1500);
  },

  cleanUp() {
    clearInterval(this.data.timer);
    if(this.data.isPlaying) innerAudioContext.stop();
    if(this.data.isRecording) recorderManager.stop();
  }
})