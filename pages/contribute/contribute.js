const app = getApp();
import { http, fileupload } from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    id: '',
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
    timer: null,
  },

  // 页面实例变量（不需要用于渲染，不放在data中）
  recorderManager: null,
  innerAudioContext: null,

  onLoad() {
    http('/web/getctitem/', 'GET').then(res => {
      console.log(res)
      this.setData({
        id: res.id,
        homonym: res.xieyin,
        chinese: res.chinese,
        english: res.english,
        swahili: res.swahili
      })
    })

    // [修改] 在页面加载时初始化管理器和音频上下文
    this.initMediaManager();
  },

  onShow() {
    // 同步全局样式设置
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    if (app.updateThemeSkin) {
      app.updateThemeSkin(app.globalData.isDarkMode);
    }
  },

  onUnload() {
    // [修改] 页面卸载时彻底清理
    this.cleanUp();
  },

  // --- 初始化与资源管理 ---

  initMediaManager() {
    // 1. 获取全局录音管理器 (单例)
    this.recorderManager = wx.getRecorderManager();
    // 2. 创建当前页面的音频播放器 (新实例)
    this.innerAudioContext = wx.createInnerAudioContext();

    // 设置监听器
    this.setupRecorder();
    this.setupAudioPlayer();
  },

  setupRecorder() {
    // 这里的 this 指向当前页面实例
    this.recorderManager.onStart(() => {
      console.log('recorder start');
      this.setData({ isRecording: true, recordDuration: 0 });

      // 清除旧定时器（防御性编程）
      if (this.data.timer) clearInterval(this.data.timer);

      // 启动计时器
      this.data.timer = setInterval(() => {
        this.setData({ recordDuration: this.data.recordDuration + 1 });
      }, 1000);
    });

    this.recorderManager.onStop((res) => {
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

    this.recorderManager.onError((err) => {
      console.error('recorder error', err);
      this.setData({ isRecording: false });
      clearInterval(this.data.timer);
      
      // 优化错误提示
      let errMsg = '录音失败';
      if (err.errMsg && err.errMsg.includes('auth')) errMsg = '未获得麦克风权限';
      wx.showToast({ title: errMsg, icon: 'none' });
    });
  },

  setupAudioPlayer() {
    this.innerAudioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });
    this.innerAudioContext.onStop(() => {
      this.setData({ isPlaying: false });
    });
    this.innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });
    this.innerAudioContext.onError((res) => {
      console.error('Audio Error:', res.errMsg);
      wx.showToast({ title: '播放失败', icon: 'none' });
      this.setData({ isPlaying: false });
    });
  },

  // --- 交互操作 ---

  startRecord() {
    // 确保之前的音频停止
    if (this.data.isPlaying && this.innerAudioContext) {
      this.innerAudioContext.stop();
    }

    // 申请权限并开始录音
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        const options = {
          duration: 60000, // 最长1分钟
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: 'mp3' // [修改] 确保格式为 mp3
        };
        // 使用 this.recorderManager
        this.recorderManager.start(options);
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
    if (this.recorderManager) {
      this.recorderManager.stop();
      wx.vibrateShort();
    }
  },

  playRecord() {
    if (!this.data.tempAudioPath || !this.innerAudioContext) return;
    
    if (this.data.isPlaying) {
      this.innerAudioContext.pause();
      this.setData({ isPlaying: false });
    } else {
      this.innerAudioContext.src = this.data.tempAudioPath;
      this.innerAudioContext.play();
    }
  },

  reRecord() {
    wx.showModal({
      title: '确认重录',
      content: '当前的录音将被清除，确定吗？',
      success: (res) => {
        if (res.confirm) {
          // 停止正在播放的声音
          if (this.data.isPlaying && this.innerAudioContext) this.innerAudioContext.stop();

          this.setData({
            tempAudioPath: '',
            recordDuration: 0,
            isPlaying: false
          });
        }
      }
    });
  },

  nextForm() {
    // 为了稳健性，重新加载前清理一次
    this.cleanUp();
    // 重新初始化
    this.onLoad();
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
    let formData = {
      xieyin: this.data.homonym,
      chinese: this.data.chinese,
      english: this.data.english,
      swahili: this.data.swahili,
      // status:'1', //状态从未录音变成未发布。
    }

    wx.showLoading({ title: '正在上传...', mask: true });
    let fayin = 'siyufayin' + app.globalData.userInfo.luyinpindao //确定音频频道
    console.log('fayin00000', fayin)

    fileupload(`/web/updatectitem/${this.data.id}/`, this.data.tempAudioPath, fayin, formData).then(res => {
      console.log('res', res)
      wx.hideLoading();
      // 上传成功提示
      wx.showToast({ title: '上传成功', icon: 'success' });
    })

    setTimeout(() => {
      // 选项 A: 清空表单继续录入
      // 提交后也建议清理一下播放状态
      if (this.data.isPlaying && this.innerAudioContext) this.innerAudioContext.stop();
      
      this.setData({
        swahili: '', english: '', chinese: '', homonym: '',
        tempAudioPath: '', recordDuration: 0
      });
      // 重新加载获取新条目
      this.onLoad();
    }, 1500);
  },

  cleanUp() {
    // 1. 清理计时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    // 2. 停止并销毁播放器 (关键：释放音频焦点)
    if (this.innerAudioContext) {
      try {
        this.innerAudioContext.stop();
        this.innerAudioContext.destroy(); // 销毁实例
      } catch (e) {
        console.error('Audio destroy error', e);
      }
      this.innerAudioContext = null;
    }

    // 3. 停止录音 (如果正在录)
    if (this.data.isRecording && this.recorderManager) {
      this.recorderManager.stop();
    }
    
    // recorderManager 是单例，不需要 destroy，但停止操作是必要的
  }
})