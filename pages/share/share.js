const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    widget: null // 存储组件实例
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    
    // 获取组件实例
    this.widget = this.selectComponent('.widget');
  },

  // 1. 定义 Canvas 专用的 WXML 结构
  // 修复：移除 Emoji，改用纯文字；简化结构
  renderPosterWXML() {
    return `
<view class="container">
  <view class="header">
    <image class="headerBg" src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80"></image>
    <view class="branding">
      <view class="logoBox">
        <text class="logoText">TS</text>
      </view>
      <text class="appName">坦桑通 Swahili</text>
      <text class="slogan">沟通无界 · 闯荡非洲更轻松</text>
    </view>
  </view>
  
  <view class="intro">
    <text class="highlight">专为坦桑尼亚华人打造</text>
    <text class="sub">无论你是工程建设、商务考察还是日常生活，坦桑通都是你最贴心的语言助手。</text>
  </view>
  
  <view class="features">
    <view class="row">
      <view class="item">
        <view class="iconCircle teal"><text class="iconText">词</text></view>
        <text class="featTitle">行业词库</text>
        <text class="featDesc">覆盖工程/餐饮/物流等七大行业</text>
      </view>
      <view class="item">
        <view class="iconCircle orange"><text class="iconText">音</text></view>
        <text class="featTitle">真人发音</text>
        <text class="featDesc">地道斯语朗读，边听边学不露怯</text>
      </view>
    </view>
    <view class="row">
      <view class="item">
        <view class="iconCircle blue"><text class="iconText">藏</text></view>
        <text class="featTitle">离线收藏</text>
        <text class="featDesc">一键加入生词本，随时随地复习</text>
      </view>
      <view class="item">
        <view class="iconCircle purple"><text class="iconText">大</text></view>
        <text class="featTitle">长辈关怀</text>
        <text class="featDesc">超大字体+夜间模式，护眼更清晰</text>
      </view>
    </view>
  </view>
  
  <view class="footer">
    <image class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tanzania-swahili-app.com"></image>
    <view class="tip">
      <text class="tipTitle">长按识别小程序码</text>
      <text class="tipDesc">即刻开启斯瓦西里语学习之旅</text>
    </view>
  </view>
</view>
`;
  },

  // 2. 定义 Canvas 专用的样式
  // 修复：lineHeight 使用数字，branding 使用 absolute 定位
  renderPosterStyle() {
    return {
      container: {
        width: 375,
        height: 667,
        backgroundColor: '#ffffff',
      },
      header: {
        width: 375,
        height: 200,
        position: 'relative',
        backgroundColor: '#0D9488',
      },
      headerBg: {
        width: 375,
        height: 200,
      },
      branding: {
        width: 375,
        height: 200,
        position: 'absolute', // 关键：覆盖在背景图之上
        top: 0,
        left: 0,
        backgroundColor: 'rgba(13, 148, 136, 0.85)',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      logoBox: {
        width: 60,
        height: 60,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row', // 必须显式声明
      },
      logoText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#0D9488',
        width: 60,
        textAlign: 'center',
        lineHeight: 60, // 修正为数字，垂直居中关键
      },
      appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
        width: 300,
      },
      slogan: {
        fontSize: 14,
        color: '#eeeeee',
        textAlign: 'center',
        width: 300,
      },
      intro: {
        width: 375,
        padding: 20,
        flexDirection: 'column',
        alignItems: 'center',
      },
      highlight: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2DD4BF',
        marginBottom: 10,
        textAlign: 'center',
        width: 300,
      },
      sub: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        width: 320,
        lineHeight: 20,
      },
      features: {
        width: 375,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'column',
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
      },
      item: {
        width: 160,
        height: 100,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
      },
      iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      },
      teal: { backgroundColor: '#CCFBF1' },
      orange: { backgroundColor: '#FFEDD5' },
      blue: { backgroundColor: '#DBEAFE' },
      purple: { backgroundColor: '#F3E8FF' },
      iconText: {
        fontSize: 18,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'center',
        lineHeight: 40,
        color: '#333333', // 确保文字有颜色
      },
      featTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 3,
        textAlign: 'center',
        width: 150,
      },
      featDesc: {
        fontSize: 10,
        color: '#999999',
        textAlign: 'center',
        width: 140,
        lineHeight: 14,
      },
      footer: {
        width: 375,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        borderStyle: 'dashed',
        marginTop: 5,
      },
      qr: {
        width: 70,
        height: 70,
        marginRight: 20,
      },
      tip: {
        flexDirection: 'column',
        justifyContent: 'center',
      },
      tipTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
        width: 200,
      },
      tipDesc: {
        fontSize: 12,
        color: '#999999',
        width: 200,
      }
    };
  },

  // 3. 执行保存逻辑
  savePoster() {
    if (!this.widget) {
      this.widget = this.selectComponent('.widget');
    }
    
    wx.showLoading({ title: '生成海报中...' });

    const p1 = this.widget.renderToCanvas({
      wxml: this.renderPosterWXML(),
      style: this.renderPosterStyle()
    });

    p1.then((res) => {
      // canvasToTempFilePath 生成图片
      return this.widget.canvasToTempFilePath();
    }).then(res => {
      // 保存到相册
      return wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath
      });
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
      if (err.errMsg && err.errMsg.includes('auth')) {
         wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存海报，请去设置中开启',
            success: (res) => {
               if(res.confirm) wx.openSetting();
            }
         });
      } else {
         wx.showToast({ title: '生成失败，请重试', icon: 'none' });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '我在用坦桑通学斯语，工程/生活词汇全都有！',
      path: '/pages/index/index',
      imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'
    }
  }
})