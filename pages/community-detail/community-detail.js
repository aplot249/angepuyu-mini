const app = getApp();
import {
  http
} from '../../requests/index'

Page({
      data: {
        fontSizeLevel: 1,
        isDarkMode: false,
        inputValue: '',
        post: {
          id: 1,
          nickname: 'Simba Fan',
          avatar: 'https://ui-avatars.com/api/?name=SF&background=FF7043&color=fff',
          time: '10分钟前',
          title: '这个词怎么发音更地道？',
          content: '刚学到 "Ninakupenda"，但是发音总感觉怪怪的，有大佬可以发语音指导一下吗？',
          bounty: 20
        },
        comments: [{
            id: 101,
            nickname: '老王在坦桑',
            avatar: 'https://ui-avatars.com/api/?name=W&background=eee',
            content: '重音在倒数第二个音节 pen 上，试试多读几次。',
            time: '5分钟前'
          },
          {
            id: 102,
            nickname: 'Swahili Teacher',
            avatar: 'https://ui-avatars.com/api/?name=ST&background=eee',
            content: '我可以稍后发个语音给你。',
            time: '1分钟前'
          }
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
          console.log('rerrrrr', res)
          this.setData({
            post: res,
            comments: res.comments
          })
        })
      },

      sendComment() {
        if (!this.data.inputValue) return;
        http('/web/topiccomment/', 'post', {
          'topicid': this.data.post.id,
          'content':this.data.inputValue
        }).then(res => {
          console.log('res', res)
        })
        const newComment = {
          id: Date.now(),
          nickname: '我',
          avatar: 'https://ui-avatars.com/api/?name=Me&background=FFCCBC',
          content: this.data.inputValue,
          time: '刚刚'
        };
        this.setData({
          comments: [...this.data.comments, newComment],
          inputValue: ''
        });
        wx.showToast({
          title: '评论成功',
          icon: 'success'
        });
      }
})