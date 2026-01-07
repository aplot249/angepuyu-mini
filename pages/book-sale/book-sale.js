const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    // 控制弹窗
    showOrderModal: false,
    
    // 表单数据
    orderForm: {
      name: '',
      cnPhone: '',
      tzPhone: '',
      address: ''
    },

    // 书籍数据
    bookInfo: {
      id: 'book_001',
      title: '坦坦斯语：基础入门到精通',
      subtitle: '专为华人打造的斯瓦西里语学习宝典',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', // 示例封面
      author: '李老师 & Juma',
      authorAvatar: 'https://placehold.co/100x100/FF7043/ffffff?text=L',
      quote: '语言是文化的桥梁，希望这本书能助你在坦桑尼亚畅通无阻。',
      price: '50,000',
      originalPrice: '65,000',
      tags: ['零基础', '双语对照', '配套音频'],
      description: '本书历时三年编写，结合了坦桑尼亚当地生活场景与华人工作需求。内容涵盖基础发音、日常问候、工程建设、商务贸易等核心板块。全书采用中斯双语对照，并重点标注了易错点和文化禁忌。',
      targets: [
        '准备前往或刚到坦桑尼亚的华人',
        '从事工程、贸易行业的职场人士',
        '对东非语言文化感兴趣的学习者'
      ],
      detailImages: [
        'https://placehold.co/600x400/eee/999?text=Inner+Page+1',
        'https://placehold.co/600x400/eee/999?text=Inner+Page+2'
      ]
    }
  },

  onShow() {
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    if (app.updateThemeSkin) {
      app.updateThemeSkin(app.globalData.isDarkMode);
    }
  },

  // 显示订单弹窗
  showOrderModal() {
    this.setData({ showOrderModal: true });
  },

  // 关闭订单弹窗
  closeOrderModal() {
    this.setData({ showOrderModal: false });
  },

  // 阻止滚动穿透
  preventScroll() {
    return;
  },

  // 监听输入
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`orderForm.${field}`]: value
    });
  },

  // 提交订单并支付
  submitOrder() {
    const { name, cnPhone, tzPhone, address } = this.data.orderForm;
    
    // 简单校验
    if (!name || !address) {
      wx.showToast({ title: '请填写姓名和地址', icon: 'none' });
      return;
    }
    if (!cnPhone && !tzPhone) {
      wx.showToast({ title: '请至少填写一个手机号', icon: 'none' });
      return;
    }

    // 模拟唤起支付逻辑
    wx.showLoading({ title: '正在创建订单...' });
    
    // 模拟API调用延迟
    setTimeout(() => {
      wx.hideLoading();
      this.closeOrderModal();
      
      // 模拟微信支付成功
      wx.showToast({ title: '支付成功！', icon: 'success' });
      
      // 清空表单
      this.setData({
        orderForm: { name: '', cnPhone: '', tzPhone: '', address: '' }
      });
    }, 1500);
  },
  
  onShareAppMessage() {
    return {
      title: `推荐好书：《${this.data.bookInfo.title}》`,
      imageUrl: this.data.bookInfo.coverUrl
    }
  }
})