const app = getApp();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    activeIdx: 0, 
    categories: [
      { id: 1, name: "工程建设", sub: ["土建基础", "道路施工", "设备操作", "安全用语", "测量测绘", "电气安装"] },
      { id: 2, name: "工厂制造", sub: ["生产线", "原料库", "包装车间", "质检", "机械维修", "员工管理"] },
      { id: 3, name: "矿产能源", sub: ["地质勘探", "矿山开采", "爆破作业", "运输车辆", "设备维修", "安全警示"] },
      { id: 4, name: "餐饮服务", sub: ["点餐服务", "食材名称", "厨房用具", "烹饪方法", "结账买单", "口味评价"] },
      { id: 5, name: "清关物流", sub: ["港口提货", "海关申报", "集装箱", "陆路运输", "仓储管理", "税务发票"] },
      { id: 6, name: "农业种植", sub: ["农作物", "肥料农药", "农用工具", "灌溉系统", "季节气候", "收割储存"] },
      { id: 7, name: "日常生活", sub: ["见面问候", "数字货币", "市场购物", "交通出行", "医院看病", "租房住宿"] }
    ]
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
  },

  switchCat(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.activeIdx) return;
    this.setData({ activeIdx: index });
  },

  goToList(e) {
    const subCategory = e.currentTarget.dataset.sub;
    wx.navigateTo({
      url: `/pages/list/list?sub=${encodeURIComponent(subCategory)}`
    });
  }
})