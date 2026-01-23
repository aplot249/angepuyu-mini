const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,

    // 页面资源数据 (对应 WXML 中的 {{assets.xxx}})
    assets: {
      bg: 'https://siyu.jsxinlingdi.com/static/bg.png',
      logo: 'https://siyu.jsxinlingdi.com/static/logo.jpg',
//       qr: 'https://siyu.jsxinlingdi.com/static/mini.png'
      qr: app.globalData.userInfo.qr_code
    },

    // 功能点数据 (用于 Canvas 绘图循环，内容与 WXML 保持一致)
    canvasFeatures: [
      { icon: '📚', bg: '#E0F2F1', color: '#009688', title: '行业词库', desc: '覆盖华人多种行业词库' },
      { icon: '🗣️', bg: '#FFF3E0', color: '#FF9800', title: '真人发音', desc: '地道斯语发音、语音切换、倍速播放' },
      { icon: '🧩', bg: '#E8EAF6', color: '#3F51B5', title: '学习方式多样', desc: '卡片学习、做题练习、听音组句' },
      { icon: '👓', bg: '#F3E5F5', color: '#9C27B0', title: '长辈关怀', desc: '超大字体、夜间模式，护眼更清晰' },
      { icon: '💾', bg: '#E3F2FD', color: '#2196F3', title: '知识库', desc: '了解更多斯语语法、文化' },
      { icon: '💬', bg: '#E8F5E9', color: '#4CAF50', title: '交流社区', desc: '求助、讨论更简单' }
    ]
  },

  onShow() {
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    this.setData({
      assets: {
              bg: 'https://siyu.jsxinlingdi.com/static/bg.png',
              logo: 'https://siyu.jsxinlingdi.com/static/logo.jpg',
              qr: app.globalData.userInfo.qr_code
            },
    })
  },

  onShareAppMessage() {
    return {
      title: '坦坦斯语：沟通无界 · 闯荡坦桑更轻松',
      path: '/pages/index/index',
      imageUrl: this.data.assets.bg
    }
  },

  // --- 保存海报主逻辑 ---
  async savePoster() {
    wx.showLoading({ title: '正在绘制海报...', mask: true });

    try {
      // 1. 初始化并获取 Canvas 节点
      const canvas = await this.initCanvas();
      
      // 2. 将 Canvas 内容导出为图片路径
      const tempFilePath = await this.canvasToTempFilePath(canvas);
      
      // 3. 保存到系统相册
      await this.saveImageToAlbum(tempFilePath);
      
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      wx.hideLoading();
      console.error('海报生成失败:', error);
      // 这里的错误提示更友好
      const msg = typeof error === 'string' ? error : '保存失败，请重试';
      wx.showToast({ title: msg, icon: 'none' });
    }
  },

  initCanvas() {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res[0]) {
            reject('未找到 Canvas 节点');
            return;
          }
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;
          
          // 设置画布尺寸 (逻辑宽度 375，类似 iPhone 屏幕宽度，方便计算)
          const width = 375;
          // [修改] 增加高度为 780 (原 760)，确保底部容纳更大的二维码
          const height = 780; 
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          // 开始绘制内容
          await this.drawPosterContent(canvas, ctx, width, height);
          resolve(canvas);
        });
    });
  },

  async drawPosterContent(canvas, ctx, w, h) {
    // 1. 绘制背景 (白色)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // 2. 绘制顶部背景图
    const headerH = 220;
    try {
      const bgImg = await this.loadImage(canvas, this.data.assets.bg);
      this.drawImageCover(ctx, bgImg, 0, 0, w, headerH);
    } catch (e) {
      ctx.fillStyle = '#2DD4BF'; // 兜底颜色
      ctx.fillRect(0, 0, w, headerH);
    }

    // 3. 绘制半透明遮罩
    const gradient = ctx.createLinearGradient(0, 0, 0, headerH);
    gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, headerH);

    // 4. 绘制 App Logo & 标题 (底部居中)
    const logoSize = 70;
    const contentBottomY = headerH - 30; // 内容基线
    const logoX = (w - logoSize) / 2;
    const logoY = contentBottomY - 100;

    // Logo
    try {
      const logoImg = await this.loadImage(canvas, this.data.assets.logo);
      // [修复] 关键修复：先保存状态，否则 clip() 会裁剪掉后续所有绘图
      ctx.save(); 
      this.drawRoundRect(ctx, logoX, logoY, logoSize, logoSize, 12);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch(e) {
      ctx.fillStyle = '#fff';
      this.drawRoundRect(ctx, logoX, logoY, logoSize, logoSize, 12);
      ctx.fill();
    }

    // 标题
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'alphabetic'; // 确保基线一致
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('坦坦斯语Swahili', w / 2, logoY + logoSize + 30);

    // Slogan
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText('沟通无界 · 闯荡坦桑更轻松', w / 2, logoY + logoSize + 52);

    // 5. 简介区域
    const introY = headerH + 30;
    ctx.fillStyle = '#009688'; // Teal color
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('专为坦桑尼亚华人打造', w / 2, introY);

    ctx.fillStyle = '#666666';
    ctx.font = '13px sans-serif';
    const subText = '无论你做工程建设、商务考察还是日常生活，\n“坦坦斯语”都是你贴心的语言助手。';
    this.drawTextWrapped(ctx, subText, w / 2, introY + 25, 320, 20);

    // 6. 功能网格区域 (绘制 2列 x 3行)
    const gridStartY = introY + 80;
    const itemW = 155;
    const itemH = 95; // 稍微增加高度
    const gapX = 15;
    const gapY = 15;
    const startX = (w - (itemW * 2 + gapX)) / 2;

    this.data.canvasFeatures.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (itemW + gapX);
      const y = gridStartY + row * (itemH + gapY);

      // 背景框
      ctx.fillStyle = '#F9FAFB';
      this.drawRoundRect(ctx, x, y, itemW, itemH, 8);
      ctx.fill();

      // 圆形图标
      ctx.fillStyle = item.bg;
      ctx.beginPath();
      ctx.arc(x + itemW / 2, y + 22, 16, 0, Math.PI * 2);
      ctx.fill();
      
      // Emoji
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333333'; // 确保 Emoji 有颜色定义，防止透明
      ctx.font = '16px sans-serif';
      ctx.fillText(item.icon, x + itemW / 2, y + 28);

      // 标题
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(item.title, x + itemW / 2, y + 55);

      // 描述 (自动换行，字体设小)
      ctx.fillStyle = '#999999';
      ctx.font = '10px sans-serif';
      // 描述可能会比较长，只显示一行或两行
      this.drawTextWrapped(ctx, item.desc, x + itemW / 2, y + 72, itemW - 10, 14);
    });

    // 7. 底部二维码
    // [修改] 增加 Footer 区域高度 (90 -> 110)
    const footerH = 110;
    const footerY = h - footerH;
    
    // 灰色背景
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, footerY, w, footerH);
    // 虚线
    ctx.strokeStyle = '#EEEEEE';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(w, footerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 二维码
    // [修改] 放大绘制的二维码 (70 -> 90)
    const qrSize = 90;
    try {
      const qrImg = await this.loadImage(canvas, this.data.assets.qr);
      ctx.drawImage(qrImg, 30, footerY + 10, qrSize, qrSize);
    } catch(e) {}

    // 扫码提示 (位置根据二维码尺寸微调)
    // [修改] 文字右移，避免重叠
    const textX = 140; 
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('长按识别微信小程序', textX, footerY + 45);

    ctx.fillStyle = '#999999';
    ctx.font = '11px sans-serif';
    ctx.fillText('即刻开启斯瓦希里语学习之旅', textX, footerY + 67);
  },

  // --- 工具函数 ---

  loadImage(canvas, src) {
    return new Promise((resolve, reject) => {
      const img = canvas.createImage();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  },

  drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const containerRatio = w / h;
    let sw, sh, sx, sy;

    if (imgRatio > containerRatio) {
      sh = img.height;
      sw = img.height * containerRatio;
      sy = 0;
      sx = (img.width - sw) / 2;
    } else {
      sw = img.width;
      sh = img.width / containerRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  },

  drawTextWrapped(ctx, text, x, y, maxWidth, lineHeight) {
    // 简单支持 \n 换行
    const paragraphs = text.split('\n');
    let currentY = y;
    
    paragraphs.forEach(para => {
      // 单词/字符拆分处理长文本
      let line = '';
      for (let n = 0; n < para.length; n++) {
        const testLine = line + para[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = para[n];
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    });
  },

  canvasToTempFilePath(canvas) {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas: canvas,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      });
    });
  },

  saveImageToAlbum(filePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success: resolve,
        fail: (err) => {
          if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied'))) {
            wx.showModal({
              title: '提示',
              content: '需要您授权保存图片到相册',
              success: (res) => { if (res.confirm) wx.openSetting() }
            });
          }
          reject(err);
        }
      });
    });
  }
})