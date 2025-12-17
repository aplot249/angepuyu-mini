const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    // 图片资源配置
    assets: {
      bg: 'https://siyu.jsxinlingdi.com/static/bg.png',
      logo: 'https://siyu.jsxinlingdi.com/static/logo.jpg',
      qr: 'https://siyu.jsxinlingdi.com/static/mini.png'
    }
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
  },

  // 核心：点击保存海报
  savePoster() {
    wx.showLoading({ title: '绘制海报中...', mask: true });

    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0]) {
          wx.hideLoading();
          return wx.showToast({ title: '画布初始化失败', icon: 'none' });
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 处理高倍屏模糊问题
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 辅助函数：加载图片
        const loadImage = (src) => {
          return new Promise((resolve, reject) => {
            const img = canvas.createImage();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
          });
        };

        try {
          // [新增] 设置全局圆角剪切路径
          // 对应 CSS 中的 border-radius: 40rpx，这里近似取 20px
          this.drawRoundedRect(ctx, 0, 0, 375, 667, 0);
          ctx.clip();

          // 1. 绘制白色背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 375, 667);

          // 2. 绘制头部背景图
          const bgImg = await loadImage(this.data.assets.bg);
          ctx.drawImage(bgImg, 0, 0, 375, 240);
          
          // 3. [修改] 绘制暖色遮罩 (使用混合模式，无需半透明)
          ctx.save(); // 保存当前状态
          
          // 设置混合模式为 'multiply' (正片叠底) 或 'overlay' (叠加)
          // 'multiply' 会让颜色与背景图融合变深，效果类似 Instagram 滤镜
          ctx.globalCompositeOperation = 'multiply'; 
          
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          // 使用不透明的纯色：蜜桃色 -> 暖橙色
          gradient.addColorStop(0, '#FEC99D'); 
          gradient.addColorStop(1, '#FF8A65'); 
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 375, 240);
          
          ctx.restore(); // 恢复混合模式为默认 (source-over)，以免影响后续绘制

          // 4. 绘制 Logo
          const logoImg = await loadImage(this.data.assets.logo);
          const logoX = (375 - 70) / 2;
          this.drawRoundedImage(ctx, logoImg, logoX, 40, 70, 70, 15);

          // 5. 绘制 App 名称与 Slogan
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('坦坦斯语Swahili', 375 / 2, 150);
          
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#FFF3E0';
          ctx.fillText('沟通无界 · 闯荡坦桑更轻松', 375 / 2, 180);

          // 6. 绘制简介文字
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FF7043'; // 珊瑚色高亮
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('专为坦桑尼亚华人打造', 375 / 2, 280);

          ctx.fillStyle = '#8D6E63'; // 浅棕色正文
          ctx.font = '14px sans-serif';
          const introText = '无论你是工程建设、商务考察还是日常生活，\n坦坦斯语都是你最贴心的语言助手。';
          this.drawTextWrapped(ctx, introText, 375 / 2, 310, 300, 22);

          // 7. 绘制功能网格背景
          const gridY = 360;
          this.drawFeatureItem(ctx, 20, gridY, '📚', '行业词库', '覆盖华人多个行业', '#FFF8F3', '#00695C', '#E0F2F1');
          this.drawFeatureItem(ctx, 192, gridY, '🗣️', '真人发音', '地道斯语发音', '#FFF8F3', '#D84315', '#FBE9E7');
          this.drawFeatureItem(ctx, 20, gridY + 110, '💾', '词语收藏', '随时随地复习', '#FFF8F3', '#EF6C00', '#FFF3E0');
          this.drawFeatureItem(ctx, 192, gridY + 110, '👓', '长辈关怀', '超大字体护眼', '#FFF8F3', '#8E24AA', '#F3E5F5');

          // 8. 绘制底部虚线
          ctx.strokeStyle = '#D7CCC8';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(30, 590);
          ctx.lineTo(345, 590);
          ctx.stroke();
          ctx.setLineDash([]); // 恢复实线

          // 9. 绘制二维码
          const qrImg = await loadImage(this.data.assets.qr);
          ctx.drawImage(qrImg, 30, 605, 50, 50);

          // 10. 绘制底部提示文字
          ctx.textAlign = 'left';
          ctx.fillStyle = '#5D4037';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('长按识别小程序码', 100, 625);
          
          ctx.fillStyle = '#A1887F';
          ctx.font = '12px sans-serif';
          ctx.fillText('即刻开启斯瓦西里语学习之旅', 100, 645);

          // --- 导出图片 ---
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: 375,
            height: 667,
            destWidth: 375 * 2, // 导出2倍图更清晰
            destHeight: 667 * 2,
            // [修改] 导出 PNG 格式以支持透明圆角
            fileType: 'png',
            success: (res) => {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  wx.hideLoading();
                  wx.showToast({ title: '已保存到相册', icon: 'success' });
                },
                fail: (err) => {
                  wx.hideLoading();
                  // 处理相册权限拒绝的情况
                  if (err.errMsg.includes('auth')) {
                    wx.showModal({
                      title: '提示',
                      content: '保存海报需要相册权限，请去设置开启',
                      success: (sRes) => {
                        if (sRes.confirm) wx.openSetting();
                      }
                    });
                  } else {
                    wx.showToast({ title: '保存失败', icon: 'none' });
                  }
                }
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '导出失败', icon: 'none' });
            }
          });

        } catch (e) {
          wx.hideLoading();
          console.error('绘制失败', e);
          wx.showToast({ title: '海报绘制出错', icon: 'none' });
        }
      });
  },

  // 辅助：绘制功能项小卡片
  drawFeatureItem(ctx, x, y, icon, title, desc, bgCol, iconCol, iconBgCol) {
    // 卡片背景
    ctx.fillStyle = bgCol;
    this.drawRoundedRect(ctx, x, y, 163, 95, 10);
    ctx.fill();

    // 图标圈
    ctx.fillStyle = iconBgCol;
    ctx.beginPath();
    ctx.arc(x + 81, y + 25, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 图标文字
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '18px sans-serif';
    ctx.fillStyle = iconCol; 
    ctx.fillText(icon, x + 81, y + 25);

    // 标题
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#5D4037';
    ctx.fillText(title, x + 81, y + 65);

    // 描述
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#A1887F';
    ctx.fillText(desc, x + 81, y + 82);
  },

  // 辅助：绘制多行文字
  drawTextWrapped(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * lineHeight);
    });
  },

  // 辅助：绘制圆角图片
  drawRoundedImage(ctx, img, x, y, w, h, r) {
    ctx.save();
    this.drawRoundedRect(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  },

  // 辅助：绘制圆角路径
  drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
    ctx.closePath();
  },

  onShareAppMessage() {
    return {
      title: '我在用坦坦斯语学斯语，工程/生活词汇全都有！',
      path: '/pages/index/index',
      imageUrl: this.data.assets.bg
    }
  }
})