const app = getApp();
import {http} from '../../requests/index'
Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentIndex: 0,
    ctList: [ // 模拟复习卡片数据
      // {
      //   id: 101,
      //   swahili: 'Karibu',
      //   chinese: '欢迎',
      //   english: 'Welcome',
      //   homonym: '卡里布',
      //   image: 'https://images.unsplash.com/photo-1596464716127-f9a86b5b3f4d?w=400&q=80',
      //   isFlipped: false
      // }
    ],
    noLoad:false
  },
  onLoad(){
//     let checkedItems = wx.getStorageSync('checkedItems')
//     if(checkedItems){
//       this.setData({
          // ctList:checkedItems
//       })
//     }
    // http('/web/randomquestion/','get').then(res=>{
    //   console.log('gggggg',res)
    //   this.setData({
    //     ctList:res
    //   })
    // },err=>{
    //   console.log('err',err)
    // })
  },
  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    // 设置标题
    wx.setNavigationBarTitle({ title: '卡片复习' });
    // 直接用我的收藏里取
    http('/web/randomquestion/','get').then(res=>{
        this.setData({
        noLoad:res.tip,
        ctList:res.data
      })
    },err=>{
      console.log('err',err)
    })
  },

  // 翻转卡片
  toggleFlip(e) {
    const index = e.currentTarget.dataset.index;
    const key = `ctList[${index}].isFlipped`;
    this.setData({
      [key]: !this.data.ctList[index].isFlipped
    });
  },

  // 监听滑动切换
  onSwiperChange(e) {
    // [优化] 增加 source 判断，仅在用户手指触摸滑动时更新索引
    // 避免 nextCard() 自动跳转时触发 bindchange 导致的数据冗余更新
    if (e.detail.source === 'touch') {
      this.setData({
        currentIndex: e.detail.current
      });
    }
    // 到最后一个了
    if(this.data.currentIndex === this.data.ctList.length-1){
      if(this.data.noLoad==true){
          wx.showToast({
            title: '这是最后一张',
            icon:'none'
          })
      }else{
        http('/web/randomquestion/','get').then(res=>{
          this.data.ctList.push(...res.data)
          this.setData({
            noLoad:res.tip,
            ctList:this.data.ctList,
            currentIndex:this.data.currentIndex+1
          })
        })
      }
    }
  },

  playAudio(e) {
    // 阻止冒泡防止翻转
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0
    app.playAudio(item.fayin,xiaohao,item.title)
    // wx.showToast({ title: `播放: ${item.swahili}`, icon: 'none' });
  },

  markKnown(e) {
    console.log(e)
    // wx.showToast({ title: '已记住了！', icon: 'success' });
    wx.showToast({ title: '不会再出现', icon: 'none' });

    let questionid = e.currentTarget.dataset.id
    // 逻辑：自动滑到下一，并加入已做过
    http('/web/hasdonequeston/','post',{'question':questionid}).then(res=>{

    })
    this.nextCard();
  },

  markForgot() {
    // wx.showToast({ title: '加入生词本', icon: 'none' });
    // 逻辑：自动滑到下一张
    this.nextCard();
  },
  
  nextCard() {
    if (this.data.currentIndex < this.data.ctList.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
    }
  }
})