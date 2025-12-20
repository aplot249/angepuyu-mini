const app = getApp();
import {http,fileupload} from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    
    isBounty: false,
    bountyAmount: 10,
    content: '',
    title: '',
    
    // [新增] 图片和话题数据
    images: [],
    topic: '#日常交流'
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode 
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // [新增] 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath);
        // 这里处理图片上传
        fileupload('/web/topicimg/',tempFiles[0],'img').then(res=>{
          console.log('img',res.img)
          this.setData({
            images: this.data.images.concat(res.img)
          });
        })
      }
    });
  },

  // [新增] 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.images
    });
  },

  // [新增] 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const newImages = this.data.images;
    let ss = newImages[index].split('/').pop()
    console.log(ss)
    http('/web/topicimg/','delete',{"img":ss}).then(res=>{
      console.log('sss',res)
    })
    newImages.splice(index, 1);
    this.setData({ images: newImages });
  },

  // [新增] 选择话题
  chooseTopic() {
    const topics = ['#日常交流', '#语音纠正', '#生活分享', '#求助提问', '#资源互换'];
    wx.showActionSheet({
      itemList: topics,
      success: (res) => {
        this.setData({
          topic: topics[res.tapIndex]
        });
      }
    });
  },

  onBountyChange(e) {
    this.setData({ isBounty: e.detail.value });
  },

  selectBounty(e) {
    this.setData({ bountyAmount: e.currentTarget.dataset.amount });
  },

  submitPost() {
    if (!this.data.content) {
      return wx.showToast({ title: '请输入内容', icon: 'none' });
    }
    const postData = {
      title: this.data.title,
      content: this.data.content,
      images: this.data.images,
      topic: this.data.topic,
      isBounty: this.data.isBounty,
      bountyAmount: this.data.bountyAmount
    };
    if (this.data.isBounty) {
      wx.showModal({
        title: '确认发布',
        content: `发布此帖将消耗 ${this.data.bountyAmount} 积分，确认吗？`,
        success: (res) => {
          if (res.confirm) {
            this.doPost(postData);
          }
        }
      });
    } else {
      this.doPost(postData);
    }
  },

  doPost(data) {
    console.log('Posting data:', data);
    wx.showLoading({ title: '发布中...' });
    http('/web/topic/','post',data).then(res=>{
      console.log('results',res)
      wx.hideLoading();
    })
    // setTimeout(() => {
    //   wx.hideLoading();
    //   wx.showToast({ title: '发布成功', icon: 'success' });
    //   setTimeout(() => {
    //     wx.navigateBack();
    //   }, 1000);
    // }, 1000);
  }
})