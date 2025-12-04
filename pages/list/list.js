const app = getApp();
import { http } from '../../requests/index'

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    subid:'',
    subname:'',
    keyword: '',
    currentTab: 0, 
    wordList: [],
    phraseList: [],

    pageWord: 1,
    pagePhrase: 1,
    hasMoreWords: true,
    hasMorePhrases: true,
    pageSize: 6, // 每页加载6条
    wordsCount:'',
    phraseCount:'',
    wordsTotalPageNum:'',
    phraseTotalPageNum:''
  },

  onLoad(options) {
      this.setData({ 
        subid: options.subid,
        subname: options.subname,
      });
      wx.setNavigationBarTitle({ title: options.subname });
      http(`/web/ctiemBySub/?subid=${options.subid}&wp=${this.data.currentTab}&page=1&search=${this.data.keyword}`,'GET').then(res=>{
        let favIds = app.globalData.userInfo.favorites || []  // 'favorites');
        let list = res.results.map(item => ({
          ...item,
          isFav: favIds.includes(item.id)
        }));
        this.setData({
          wordsCount:res.count, //总数
          wordsTotalPageNum:res.totalPageNum, //总页数
          pageSize:res.page_size,
          pageWord:1,
          wordList:[...this.data.wordList,...list]  //这次列表
        })
        http(`/web/ctiemBySub/?subid=${options.subid}&wp=1&page=1&search=${this.data.keyword}`,'GET').then(res=>{
          console.log("res11",res)
          let favIds = app.globalData.userInfo.favorites || [] // 'favorites');
          let list = res.results.map(item => ({
            ...item,
            isFav: favIds.includes(item.id)
          }));
          this.setData({
            phraseCount:res.count, //总数
            phraseTotalPageNum:res.totalPageNum, //总页数
            pageSize:res.page_size,
            hasMorePhrases:this.data.pagePhrase < res.totalPageNum,
            phraseList:[...this.data.phraseList,...list]  //这次列表
          })
        })
      })
  },

  onShow() {
    this.setData({ 
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    this.refreshFavStatus();
  },

  fetchData() {  
    if(this.data.currentTab == 0) {  //是单词
      http(`/web/ctiemBySub/?subid=${this.data.subid}&wp=${this.data.currentTab}&page=${this.data.pageWord}&search=${this.data.keyword}`,'GET').then(res=>{
        console.log("res",res)
        let favIds = app.globalData.userInfo.favorites || [] 
        let list = res.results.map(item => ({
          ...item,
          isFav: favIds.includes(item.id)
        }));
        this.setData({
          wordsCount:res.count, //总数
          wordsTotalPageNum:res.totalPageNum, //总页数
          pageSize:res.page_size,
          hasMoreWords:this.data.pageWord < res.totalPageNum,
          wordList:[...this.data.wordList,...list]  //这次列表
        })
      })
    }else{  //是短语
      http(`/web/ctiemBySub/?subid=${this.data.subid}&wp=${this.data.currentTab}&page=${this.data.pagePhrase}&search=${this.data.keyword}`,'GET').then(res=>{
        console.log("res",res)
        let favIds = app.globalData.userInfo.favorites  || [] 
        let list = res.results.map(item => ({
          ...item,
          isFav: favIds.includes(item.id)
        }));
        this.setData({
          phraseCount:res.count, //总数
          phraseTotalPageNum:res.totalPageNum, //总页数
          pageSize:res.page_size,
          hasMorePhrases:this.data.pagePhrase < res.totalPageNum,
          phraseList:[...this.data.phraseList,...list]  //这次列表
        })
      })
    }
    this.refreshFavStatus();
  },

  refreshFavStatus() {
    const favs = app.globalData.userInfo.favorites || [];
    const updateList = (listKey) => {
      const list = this.data[listKey].map(item => ({
        ...item,
        isFav: favs.includes(item.id)
      }));
      this.setData({ [listKey]: list });
    };
    updateList('wordList');
    updateList('phraseList');
  },

  onSearch(e) {
    const val = e.detail.value.toLowerCase();
    this.setData({ 
      keyword: val,
      wordList:[],
      phraseList:[],
      pageWord: 1, 
      pagePhrase: 1
    });
    this.fetchData()
  },

  switchTab(e) {
    const idx = parseInt(e.currentTarget.dataset.idx);
    this.setData({ currentTab: idx });
  },

  onSwiperChange(e) {
    this.setData({ 
      currentTab: e.detail.current,
      keyword: this.data.keyword,
      wordList:[],
      phraseList:[],
      pageWord: 1, 
      pagePhrase: 1
    });
    this.fetchData()
  },

  loadMore() {
    if(this.data.currentTab === 0) {
      if(!this.data.hasMoreWords) return; //确实没有了，就不做操作
      this.setData({ pageWord: this.data.pageWord + 1 }); //否则页码加1，获取数据
      this.fetchData();
    } else {
      if(!this.data.hasMorePhrases) return;
      this.setData({ pagePhrase: this.data.pagePhrase + 1 });
      this.fetchData();
    }
  },

  playAudio(e) {
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0
    app.playAudio(item.fayin,xiaohao)
  },

  toggleFav(e) {
    const id = e.currentTarget.dataset.id;
    let op =  e.currentTarget.dataset.isfav;
    console.log(e.currentTarget.dataset)
    console.log("op",op,id)
    if (op){ //已收藏，那就是取消收藏
      http('/web/delfavourite/','DELETE',{'ctitemid':id}).then(res=>{
        wx.showToast({
          title: '已取消收藏',
          icon:'none'
        })
          let favIds = app.globalData.userInfo.favorites  // 'favorites');
          favIds.splice(favIds.indexOf(id),1)
          app.globalData.userInfo.favorites = favIds
          app.saveData()
          if(this.data.currentTab == 0){
            this.data.wordList[this.data.wordList.findIndex(i=>i.id==id)]['isFav'] = false
            this.setData({
              wordList:this.data.wordList
            })
          }else{
            this.data.phraseList[this.data.phraseList.findIndex(i=>i.id==id)]['isFav'] = false
            this.setData({
              phraseList:this.data.phraseList
            })
          }
      })
    }else{ //新建收藏
      // 在这里判断有没有登录，没有登录的话就要登录。登录后再执行新建操作。
      http('/web/favourite/','POST',{"ctitem":id}).then(res=>{
        wx.showToast({
          title: '已收藏',
          icon:'none'
        })
        let favIds = app.globalData.userInfo.favorites || [] // 'favorites');
        favIds.push(id)
        console.log('favIDS',favIds)
        app.globalData.userInfo.favorites = favIds
        app.saveData()
        if(this.data.currentTab == 0){
          this.data.wordList[this.data.wordList.findIndex(i=>i.id==id)]['isFav'] = true
          this.setData({
            wordList:this.data.wordList
          })
        }else{
          this.data.phraseList[this.data.phraseList.findIndex(i=>i.id==id)]['isFav'] = true
          this.setData({
            phraseList:this.data.phraseList
          })
        }
      },
      err=>{
        console.log('err', err.detail)
        if (err.detail == 'JWT Token已过期！' || err.detail == '身份认证信息未提供。') {
          wx.showModal({
              title: '请先登录，才能进行后续操作',
              confirmText: "确认登录",
              success: (res) => {
                if (res.confirm) {
                  wx.getUserProfile({
                    desc: '需微信授权登录',
                    success: (res) => {
                      wx.showToast({
                        title: '正在登录...',
                        icon: "none"
                      })
                      wx.login({
                        timeout: 8000,
                        success: r => {
                          console.log(r.code)
                          http('/user/openid/', 'post', {
                            code: r.code,
                            gender: res.userInfo.gender,
                            wxnickname: res.userInfo.nickName,
                          }).then(res => {
                            console.log('登录信息：', res)
                            const newInfo = {
                              ...res.user,
                              isLoggedIn: true,
                            };
                            app.globalData.userInfo = newInfo;
                            app.saveData();
                            wx.showToast({
                              title: '登录成功',
                              icon: 'none'
                            });
                            wx.setStorageSync('token', res.token)
                            that.onLoad()
                          })
                        }
                      })
                    }
                  })
                }
              }
            }
          )
        }
      }
      )
      
    }
    let favs = app.globalData.userInfo.favorites || [];
    const index = favs.indexOf(id);
    this.refreshFavStatus();
  },

  onCorrection() {
    wx.showToast({ title: '反馈已提交', icon: 'success' });
  }
})

