const app = getApp();
import { http } from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    activeIdx: 0, 
    categories: [
      // { 
      //   id: 1, 
      //   name: "工程建设", 
      //   sub: ["土建基础", "道路施工", "设备操作", "安全用语", "测量测绘", "电气安装", "钢筋工程", "混凝土"] 
      // },
      // { 
      //   id: 2, 
      //   name: "工厂制造", 
      //   sub: ["生产线", "原料库", "包装车间", "质检", "机械维修", "员工管理", "消防安全", "仓库盘点"] 
      // },
      // { 
      //   id: 3, 
      //   name: "矿产能源", 
      //   sub: ["地质勘探", "矿山开采", "爆破作业", "运输车辆", "设备维修", "安全警示", "燃料油品"] 
      // },
      // { 
      //   id: 4, 
      //   name: "餐饮服务", 
      //   sub: ["点餐服务", "食材名称", "厨房用具", "烹饪方法", "结账买单", "口味评价", "酒水饮料"] 
      // },
      // { 
      //   id: 5, 
      //   name: "清关物流", 
      //   sub: ["港口提货", "海关申报", "集装箱", "陆路运输", "仓储管理", "税务发票", "罚款处理"] 
      // },
      // { 
      //   id: 6, 
      //   name: "农业种植", 
      //   sub: ["农作物", "肥料农药", "农用工具", "灌溉系统", "季节气候", "收割储存", "畜牧养殖"] 
      // },
      // { 
      //   id: 7, 
      //   name: "日常生活", 
      //   sub: ["见面问候", "数字货币", "市场购物", "交通出行", "医院看病", "租房住宿", "警察局"] 
      // },
      // { 
      //   id: 8, 
      //   name: "旅游度假", 
      //   sub: ["酒店入住", "景点咨询", "购买纪念品", "草原Safari", "潜水", "小费"] 
      // },
      // { 
      //   id: 9, 
      //   name: "家政服务", 
      //   sub: ["打扫卫生", "洗衣做饭", "照看孩子", "园艺修剪", "清洁用品", "工资休假"] 
      // }
    ]
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode,
      favcatList:  app.globalData.userInfo.favcat || [] 
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    http('/web/lingyu/','GET').then(
      res=>{
        console.log(res)
        res.forEach(item=>{
          item.sublingyu.forEach(i=>{
            i.isFaved = this.data.favcatList.includes(i.id)
          })
        })
        this.setData({
          categories:res
        })
    })
  },

  switchCat(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.activeIdx) return;
    this.setData({ activeIdx: index });
  },

  goToList(e) {
    const subid = e.currentTarget.dataset.subid;
    const subname = e.currentTarget.dataset.subname;
    wx.navigateTo({
      url: `/pages/list/list?subid=${subid}&subname=${subname}`
    });
  },

  toggleSubFav(e){
    // console.log(e)
    console.log(e.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id
    var isFaved = e.currentTarget.dataset.isfaved
    console.log('isFaved',isFaved)
    if(isFaved){//就是取消收藏
      http('/web/sublingyufav/','delete',{'id':id}).then(res=>{
          console.log(res)
          // 更新收到影响的子分类，还有处理返回的词条id
          this.data.categories.forEach(item=>{
            item.sublingyu.forEach(i=>{
              if(i.id==id){
                i.isFaved = false
              }
            })
          })
          this.data.favcatList.splice(this.data.favcatList.indexOf(id),1)
          this.setData({
            categories:this.data.categories,
            favcatList:this.data.favcatList
          })
          // 使用 Set 的 has() 方法，时间复杂度 O(1)
          function arraySubtractFast(arrA, arrB) {
            let setB = new Set(arrB)
            console.log('BBB',arrB)
            return arrA.filter(item => !setB.has(item));
          }
          let favIds = app.globalData.userInfo.favorites
          console.log('res.res',res.res)
          let result = arraySubtractFast(favIds , res.res)
          console.log(result)
          app.globalData.userInfo.favorites = result
          app.globalData.userInfo.favcat = this.data.favcatList
          app.saveData()
      })
    }else{
        http('/web/sublingyufav/','post',{'id':id}).then(res=>{
          // console.log("res词条id",res)
          let favIds = app.globalData.userInfo.favorites
          let ss = new Set(favIds)
          // console.log(111,ss)
          let sss = new Set([...ss,...res.res])
          // console.log(222,sss)
          let ssss = Array.from(sss)
          // console.log(333,ssss)
          app.globalData.userInfo.favorites = ssss
          app.saveData()
          // 更新收到影响的子分类，还有处理返回的词条id
          this.data.categories.forEach(item=>{
            item.sublingyu.forEach(i=>{
              if(i.id==id){
                i.isFaved = true
              }
            })
          })
          this.setData({
            categories:this.data.categories,
            favcatList:[...this.data.favcatList,id]
          })
          app.globalData.userInfo.favcat = this.data.favcatList
          app.saveData()
      })
    }
  }
})