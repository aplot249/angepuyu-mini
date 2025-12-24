const app = getApp();
import {
  http,baseImgUrl
} from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    inputValue: '',
    baseImgUrl:baseImgUrl,
    post: {
      // id: 1,
      // nickname: 'Simba Fan',
      // avatar: 'https://ui-avatars.com/api/?name=SF&background=FF7043&color=fff',
      // time: '10分钟前',
      // title: '这个词怎么发音更地道？',
      // content: '刚学到 "Ninakupenda"，但是发音总感觉怪怪的，有大佬可以发语音指导一下吗？',
      // bounty: 20
    },
    comments: [
      // {
      //   id: 101,
      //   nickname: '老王在坦桑',
      //   avatar: 'https://ui-avatars.com/api/?name=W&background=eee',
      //   content: '重音在倒数第二个音节 pen 上，试试多读几次。',
      //   time: '5分钟前'
      // },
    ]
  },

  onShow() {
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
  },

  onLoad(options) {
    // 实际应根据 options.id 请求详情
    http(`/web/topicdetail/${options.id}/`, 'get').then(res => {
      this.setData({
        post: res,
        comments: res.comments
      })
    })
  },
  // [新增] 图片预览
  previewImage(e) {
    const current = e.currentTarget.dataset.current;
    // const urls = e.currentTarget.dataset.urls;
    console.log('current',current)
    wx.previewImage({
      current: [current],
      urls:[current]
    });
  },
  sendComment() {
    if (!this.data.inputValue) return;
    if (this.data.inputValue.length > 60) {
      wx.showToast({
        title:"不能超过60字",
        icon:"none"
      })
      return
    };
    http('/web/topiccomment/', 'post', {
      'topicid': this.data.post.id,
      'content':this.data.inputValue
    }).then(
      res => {
      console.log('res', res)
      const newComment = {...res}
      this.setData({
        comments: [...this.data.comments, newComment],
        inputValue: ''
      });
      wx.showToast({
        title: '已评论',
        icon: 'success'
      });
    },err=>{
      console.log('xxxxxxxerr',err)
      wx.showToast({
        "title":"评论有敏感词"
      })
    })
  },

  // [新增] 删除评论功能
  deleteComment(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '确定删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          const newComments = [...this.data.comments];
          let commentId = newComments[index].id
          http(`/web/topiccomment/${commentId}/`,'DELETE').then(res=>{
            newComments.splice(index, 1);
            this.setData({ comments: newComments });
            wx.showToast({ title: '已删除', icon: 'none' });
          })
        }
      }
    });
  },

  // [新增] 删除帖子功能
  deletePost(e) {
    const posiId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '警告',
      content: '确定删除这个帖子吗？删除后不可恢复。',
      confirmColor: '#FF5722', // 确认按钮设为警告色
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          // 模拟网络请求
          // setTimeout(() => {
          //   wx.hideLoading();
          //   wx.showToast({ title: '已删除', icon: 'success' });
          //   // 延迟返回上一页，让用户看到成功提示
          //   setTimeout(() => {
          //     wx.navigateBack();
          //   }, 1500);
          // }, 500);
          console.log("posiId",posiId)
          http(`/web/topic/${posiId}/`,'DELETE',{posiId}).then(res=>{
            wx.showToast({ title: '已删除', icon: 'none' });
            wx.navigateBack()
          })
        }
      }
    });
  }

})