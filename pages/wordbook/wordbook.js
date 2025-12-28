const app = getApp();
import {
  http
} from '../../requests/index'
const XLSX = require('../../utils/xlsx.mini.min.js');
const bgAudio = wx.getBackgroundAudioManager();

Page({
  data: {
    fontSizeLevel: 1,
    isDarkMode: false,
    currentTab: 0, // 0: Words, 1: Phrases

    searchText: '',
    // 数据列表
    wordList: [],
    phraseList: [],

    // 分页状态 (用于模拟无限加载)
    pageWord: 1,
    pagePhrase: 1,
    hasMoreWords: true,
    hasMorePhrases: true,

    pageSize: 6,

    wordsCount: '',
    phraseCount: '',

    wordsTotalPageNum: '',
    phraseTotalPageNum: '',

    checkedIds: [], // 选中的ID集合 (跨Tab共享)
    checkedItems:[],

    studyTimeDisplay: '0分钟' ,

    isFabOpen: false, // 悬浮按钮相关状态，菜单是否展开
    fabPos: { x: 0, y: 0 }, // 按钮位置
    windowWidth: 0,
    windowHeight: 0,

    currentAudioIndex:0, //当前播放序号
  },
  
  onLoad(){
      this.setData({isFabOpen:true})
      // 获取屏幕尺寸，初始化按钮位置到右下角
      const sys = wx.getSystemInfoSync();
      this.setData({
        windowWidth: sys.windowWidth,
        windowHeight: sys.windowHeight,
        fabPos: { // 默认位置：右下角，留出一些边距
          // x: sys.windowWidth * 0.6,
          // y: sys.windowHeight * 0.5
          x: sys.windowWidth * 0.8,
          y: sys.windowHeight * 0.8
        }
      })
      this.initAudioListener(); //播音监听
  },

  // --- 2. 初始化监听器 (只执行一次) ---
  initAudioListener() {
    // 监听自然播放结束 -> 核心：自动切下一首
    bgAudio.onEnded(() => {
      console.log('本首播放结束，自动下一首');
      this.playNext();
    });
    // 监听错误 -> 建议：如果出错，自动跳过播放下一首
    bgAudio.onError((err) => {
      console.error('播放出错', err);
      // 可选：出错后自动切下一首，防止卡死
      this.playNext();
    });
    // 监听上一曲/下一曲 (用户在锁屏界面点的)
    // bgAudio.onPrev(() => this.playPrev());
    // bgAudio.onNext(() => this.playNext());
    // UI同步
    bgAudio.onPlay(() => this.setData({ isPlaying: true }));
    bgAudio.onPause(() => this.setData({ isPlaying: false }));
    bgAudio.onStop(() => this.setData({ isPlaying: false }));
  },

  // 串联播放音乐
  playMusic(index) {
    const list = this.data.checkedItems;
    // 边界检查
    if (index < 0 || index >= list.length) {
      console.log('列表播放完毕或索引越界');
      return; 
    }
    const item = list[index];
    // 更新数据索引
    this.setData({ currentAudioIndex: index });

    let xiaohao = item.fayin ? item.xiaohao : 0
    let voiceType = wx.getStorageSync('voiceType')
    let fayin = "fayin"+voiceType
    console.log(fayin,item[fayin])
    app.playAudio(item[fayin],xiaohao,item.swahili)
  },

  // 串联播放下一条音频
  playNext() {
    let nextIndex = this.data.currentAudioIndex + 1;
    // 判断是否到达列表末尾
    if (nextIndex >= this.data.checkedItems.length) {
      // 策略A：停止播放
      return;
      // 策略B：循环播放（回到第0首）
      // nextIndex = 0; 
    }
    this.playMusic(nextIndex);
  },

  jiucuoCtitem(e){
    console.log('e',e)
    let id = e.target.dataset.dd
    http(`/web/updatectitem/${id}/`,'post',{'isWrong':true}).then(res=>{
      console.log('已反馈')
      wx.showToast({
        title:"已反馈，谢谢",
        icon:"none"
      })
    })
  },

  onShow() {
    this.setData({
      fontSizeLevel: app.globalData.fontSizeLevel,
      isDarkMode: app.globalData.isDarkMode
    });
    app.updateThemeSkin(app.globalData.isDarkMode);
    // this.resetAndLoad() 相当于重置作用
    // this.setTabBarBadge(); // 设置徽标的没用
    // [新增] 记录开始时间并更新显示
    this.setData({
      wordList: [],
      phraseList: [],
      pageWord: 1,
      pagePhrase: 1,
      startTime:Date.now()
    })

    let myFav = JSON.stringify(app.globalData.userInfo.favorites) || []
    http(`/web/ctiemByFav/?page=1`, 'POST', {
      "q": myFav,
      'wp': '0' //请求单词的第一页
    }).then(
      res => {
        console.log(res)
        let list = res.results.map(item => ({
          ...item,
          checked: false  // 没有被选中
        }));
        this.setData({
          wordList: [...this.data.wordList, ...list],
          pageSize: res.page_size,
          wordsCount: res.count,
          wordsTotalPageNum: res.totalPageNum,
          hasMoreWords: this.data.pageWord < res.totalPageNum,
        })
        http(`/web/ctiemByFav/?page=1`, 'POST', {
          "q": myFav,
          'wp': '1' //请求短语的第一页
        }).then(res => {
          let list = res.results.map(item => ({
            ...item,
            checked: false  // 没有被选中
          }));
          this.setData({
            phraseList: [...this.data.phraseList, ...list],
            pageSize: res.page_size,
            phraseCount: res.count,
            phraseTotalPageNum: res.totalPageNum,
            hasMorePhrases: this.data.pagePhrase < res.totalPageNum,
          })
        })
      }
    )
  },

  // --- 拖拽与菜单逻辑 ---
  // 触摸开始
  // 触摸移动的
  onFabTouchStart(e) {
    this.dragData = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      initialX: this.data.fabPos.x,
      initialY: this.data.fabPos.y,
      isDragging: false // 标记是否发生了拖动
    };
  },

  // 触摸移动
  onFabTouchMove(e) {
    const { clientX, clientY } = e.touches[0];
    const { startX, startY, initialX, initialY } = this.dragData;
    // 计算位移
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    // 如果移动距离很小，不算拖动（防误触）
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.dragData.isDragging = true;
      // 拖动时自动收起菜单
      if (this.data.isFabOpen) {
        this.setData({ isFabOpen: false });
      }
    }
    // 计算新位置 (限制在屏幕范围内)
    let newX = initialX + deltaX;
    let newY = initialY + deltaY;
    // 边界限制 (按钮宽高假设约 60px)
    const btnSize = 60; 
    if (newX < 0) newX = 0;
    if (newX > this.data.windowWidth - btnSize) newX = this.data.windowWidth - btnSize;
    if (newY < 0) newY = 0;
    if (newY > this.data.windowHeight - btnSize) newY = this.data.windowHeight - btnSize;
    this.setData({
      fabPos: { x: newX, y: newY }
    });
  },

  // 触摸结束
  onFabTouchEnd(e) {
    // 如果没有发生明显的拖动，则视为点击，切换菜单状态
    if (!this.dragData.isDragging) {
      this.toggleFabMenu();
    }
  },

  toggleFabMenu() {
    this.setData({ isFabOpen: !this.data.isFabOpen });
    // 震动反馈
    if(this.data.isFabOpen) wx.vibrateShort();
  },

  // 加载数据核心逻辑
  loadFavorites(type) {
    let that = this
    if (type == 'word') {
      let myFav = JSON.stringify(app.globalData.userInfo.favorites)
      http(`/web/ctiemByFav/?page=${this.data.pageWord}&search=${this.data.searchText}`, 'POST', {
        // "q": myFav,
        'wp': '0'
      }).then(
        res => {
        console.log(res)
        let list = res.results.map(item => ({
          ...item,
          checked: false
        }));
        this.setData({
          wordList: [...this.data.wordList, ...list],
          pageSize: res.page_size,
          wordsCount: res.count,
          hasMoreWords: this.data.pageWord < res.totalPageNum,
          wordsTotalPageNum: res.totalPageNum,
        })
      })
    } else {
      let myFav = JSON.stringify(app.globalData.userInfo.favorites)
      http(`/web/ctiemByFav/?page=${this.data.pagePhrase}&search=${this.data.searchText}`, 'POST', {
        // "q": myFav,
        'wp': '1'
      }).then(
        res => {
        console.log(res)
        let list = res.results.map(item => ({
          ...item,
          checked: false
        }));
        this.setData({
          phraseList: [...this.data.phraseList, ...list],
          pageSize: res.page_size,
          hasMorePhrases: this.data.pagePhrase < res.totalPageNum,
          phraseCount: res.count,
          phraseTotalPageNum: res.totalPageNum,
        })
      })
    }
  },

  // 只有取消收藏
  toggleFav(e) {
    wx.showModal({
      title: '确认',
      content: '确定已经掌握这个词了吗？移出后可在词库分类中找到。',
      success: (res) => {
        const id = e.currentTarget.dataset.id;
        // 当点击我已掌握按钮后，对这个单词从不认识变成为已经认识
        http(`/web/updateusercard/${id}/`,'PUT',{'action':'0'}).then(res=>{
          console.log('rererr',res)
          if(this.data.currentTab == 0){
            this.data.wordList.splice(this.data.wordList.findIndex(i=>i.id==res.ctitem),1)
            this.setData({
              wordList:this.data.wordList
            })
          }else{
            this.data.phraseList.splice(this.data.phraseList.findIndex(i=>i.id==res.ctitem),1)
            console.log('this.data.phraseList',this.data.phraseList)
            this.setData({
              phraseList:this.data.phraseList
            })
          }
        })
      }
    })
  },

  // --- 交互事件 ---
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    });
    // 搜索时重置列表
    this.setData({
      wordList: [],
      phraseList: [],
      pageWord: 1,
      pagePhrase: 1,
      hasMoreWords: true,
      hasMorePhrases: true
    });
    this.loadFavorites('word');
    this.loadFavorites('phrase');
  },

  // 手动点击切换
  switchTab(e) {
    const idx = parseInt(e.currentTarget.dataset.idx);
    this.setData({
      currentTab: idx,
    });
  },

  // 窗口滑动切换
  onSwiperChange(e) {
    this.setData({
      currentTab: e.detail.current,
    });
  },

  // 触底加载更多
  loadMoreWords() {
    if (!this.data.hasMoreWords) return;
    this.setData({
      pageWord: this.data.pageWord + 1
    });
    this.loadFavorites('word');
  },

  loadMorePhrases() {
    if (!this.data.hasMorePhrases) return;
    this.setData({
      pagePhrase: this.data.pagePhrase + 1
    });
    this.loadFavorites('phrase');
  },

  // [新增] 跳转到卡片复习
  navigateToReview() {
    wx.navigateTo({ url: '/pages/review/review' });
  },

  // [新增] 跳转到每日练习
  navigateToQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' });
  },
    
  // 单个勾选/取消勾选
  toggleCheck(e) {
    const {id,type,item} = e.currentTarget.dataset;
    let ids = this.data.checkedIds;
    let checkedItems = this.data.checkedItems
    // 更新全局ID列表
    if (ids.includes(id)) {
      ids = ids.filter(i => i !== id);
      checkedItems = checkedItems.filter(i => i.id !== id);
      console.log('ids',ids)
    } else {
      ids.push(id);
      checkedItems.push(item)
    }
    console.log('item',item)
    this.setData({
      checkedIds: ids,
      checkedItems:checkedItems,
    });
    console.log("this.data.checkedItems",this.data.checkedItems)
    // console.log("this.data.List",this.data.wordList)
    // 更新视图状态 (局部更新，性能优化)
    const listKey = type === 'word' ? 'wordList' : 'phraseList';
    const list = this.data[listKey];
    const idx = list.findIndex(i => i.id === id);
    if (idx > -1) {
      this.setData({
        [`${listKey}[${idx}].checked`]: ids.includes(id)
      });
    }
  },

  // 全选 (针对当前 Tab 已加载的数据)
  selectAll() {
    const isWord = this.data.currentTab === 0;
    const currentList = isWord ? this.data.wordList : this.data.phraseList;
    let tmpcurrentList = currentList
    const listKey = isWord ? 'wordList' : 'phraseList';
    // 提取当前列表所有ID
    const newIds = currentList.map(item => item.id);
    // 合并到全局 checkedIds (去重)
    const combinedIds = [...new Set([...this.data.checkedIds, ...newIds])];
    console.log("tmpcurrentList",tmpcurrentList)
    this.setData({
      checkedIds: combinedIds,
      checkedItems:tmpcurrentList
    });

    // 更新当前列表视图为全选
    const updatedList = currentList.map(item => ({
      ...item,
      checked: true
    }));
    this.setData({
      [listKey]: updatedList
    });

    wx.showToast({
      title: '当前页全选',
      icon: 'none'
    });
  },

  onUnload(){
    if(!app.globalData.userInfo.isLoggedIn){
      return false
    }
    console.log('onUnload startTime',this.data.startTime)
    app.saveStudyTime(this.data.startTime);
    this.setData({
      wordList: [],
      phraseList: [],
      pageWord: 1,
      pagePhrase: 1,
      hasMoreWords: true,
      hasMorePhrases: true
    });
  },

  // 全不选 (重置所有)
  unselectAll() {
    this.setData({
      checkedIds: [],
      checkedItems:[]
    });

    // 更新两个列表视图
    const resetList = (list) => list.map(item => ({
      ...item,
      checked: false
    }));
    this.setData({
      wordList: resetList(this.data.wordList),
      phraseList: resetList(this.data.phraseList)
    });

    wx.showToast({
      title: '已取消选择',
      icon: 'none'
    });
  },

  // 单条发音
  playAudio(e) {
    let item = e.currentTarget.dataset.item
    let xiaohao = item.fayin ? item.xiaohao : 0
    let voiceType = wx.getStorageSync('voiceType')
    let fayin = "fayin"+voiceType
    console.log(fayin,item[fayin])
    app.playAudio(item[fayin],xiaohao,item.swahili)
    // app.playAudio(item.fayin,xiaohao,item.swahili)
  },

  // 导出文档
  exportDoc() {
    const count = this.data.checkedIds.length;
    if (count === 0) return wx.showToast({
      title: '请先勾选词条',
      icon: 'none'
    });

    wx.showModal({
      title: '确认导出',
      // content: `导出 ${count} 条记录将消耗 ${cost} 点数`,
      success: (res) => {
        if (res.confirm) {
          // app.globalData.userInfo.points -= cost;
          // app.saveData();
          // wx.showToast({
          //   title: '文档已保存至手机',
          //   icon: 'success'
          // });
          this.setData({isFabOpen:false})
          this.onExportExcel()
        }
      }
    });
  },

  // 串联播音
  playStream() {
    if (this.data.checkedIds.length === 0) return wx.showToast({
      title: '请先勾选词条',
      icon: 'none'
    });
    wx.showToast({
      title: '开始语音串读...',
      icon: 'none'
    });
    this.setData({isFabOpen:false})
    this.playMusic(0)
  },

  // 2. 导出按钮的响应函数
  onExportExcel() {
    const that = this;
    // 给予用户友好提示
    wx.showLoading({
      title: '生成文件中...',
    });

    // 模拟一个异步过程，避免复杂计算阻塞UI
    setTimeout(() => {
      try {
        // 3. 准备要导出的数据 (通常是一个二维数组)
        const data = that.prepareExcelData(that.data.checkedItems);
        // 4. 调用核心方法生成并保存Excel文件
        that.createAndSaveExcel(data, `${new Date().getTime()}.xlsx`);
        wx.showToast({
          title: '文件生成成功',
          icon: 'success',
          duration: 2000
        });
      } catch (error) {
        console.error('导出失败:', error);
        wx.showToast({
          title: `导出失败: ${error.message}`,
          icon: 'none',
          duration: 3000
        });
      } finally {
        wx.hideLoading();
      }
    }, 100);
  },

  // 5. 准备Excel数据 (将对象数组转换为二维数组)
  prepareExcelData(list) {
    // 表头 (Excel第一行)
    const header = ['中文', '英语', '斯语','中文谐音'];
    // 数据行
    const rows = list.map(item => [item.chinese, item.english, item.swahili,item.xieyin]);
    // 合并表头和数据行
    return [header, ...rows];
  },

  // 6. 【核心】使用 SheetJS 创建 Excel 文件并保存到本地
  createAndSaveExcel(data, fileName) {
    // 6.1 创建一个新的工作簿 (workbook)
    const wb = XLSX.utils.book_new();
    // 6.2 将二维数组数据转换成工作表 (worksheet)
    // XLSX.utils.aoa_to_sheet 专门用于转换“数组的数组”(array of arrays)
    const ws = XLSX.utils.aoa_to_sheet(data);
    // 6.3 将工作表添加到工作簿，并命名为“Sheet1”
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // 6.4 将工作簿写入二进制数据
    // type: 'array' 表示生成 ArrayBuffer 格式的数据
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    // 6.5 获取小程序用户文件目录路径
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
    // 6.6 将二进制数据写入到小程序的本地文件系统
    const fs = wx.getFileSystemManager();
    fs.writeFile({
      filePath: filePath,
      data: wbout, // 这里写入的是ArrayBuffer
      encoding: 'binary', // 指定编码为binary，对Excel文件至关重要
      success: (res) => {
        console.log('Excel文件已保存到:', filePath);
        // 7. 文件保存成功后，调用通用方法处理后续（预览/分享/保存）
        this.handleSavedFile(filePath, fileName);
      },
      fail: (err) => {
        console.error('文件写入失败:', err);
        throw new Error(`写入文件失败: ${err.errMsg}`);
      }
    });
  },

  // 8. 处理已保存的文件 (根据平台和环境调用不同API)
  handleSavedFile(filePath, fileName) {
    // 注意：在PC微信上，可以调用更直接的保存API
    // 判断是否在PC微信环境（这是一个简易判断，实际开发中可能有更严谨的方法）
    const systemInfo = wx.getSystemInfoSync();
    const isPC = systemInfo.platform === 'windows' || systemInfo.platform === 'mac';
    if (isPC && wx.saveFileToDisk) {
      // PC微信端：可以直接调用API将文件保存到磁盘
      wx.saveFileToDisk({
        filePath: filePath,
        success: () => {
          console.log('已触发保存到磁盘');
        },
        fail: (err) => {
          console.warn('直接保存磁盘失败，尝试打开文档:', err);
          this.openDocument(filePath);
        }
      });
    } else {
      // 手机端或其他环境：打开文档进行预览，用户可点击右上角菜单“保存到手机”
      this.openDocument(filePath);
    }
  },

  // 9. 打开文档进行预览
  openDocument(filePath) {
    wx.openDocument({
      filePath: filePath,
      showMenu: true, // 关键！必须为true，用户才能看到“保存到手机”等菜单
      success: (res) => {
        console.log('打开文档成功');
      },
      fail: (err) => {
        console.error('打开文档失败:', err);
        wx.showToast({
          title: `打开文件失败，请重试`,
          icon: 'none'
        });
      }
    });
  },

    // 分享配置
    onShareAppMessage(res) {
      if(!app.globalData.userInfo.hasSharedToday){
        app.globalData.userInfo.hasSharedToday = true
        this.setData({ points: this.data.points+20 });
        app.globalData.userInfo.points = this.data.points
        app.saveData()
        wx.showToast({ title: '分享积分 +20', icon: 'none' });
  
        return {
          title: '坦桑华人学斯语，快来一起进步吧。',
          path: '/pages/review/review',
          // imageUrl: '/images/share-cover.png', // 假设有分享图
        }
      }
      // else{
      //   wx.showToast({ title: '一天领取一次', icon: 'none' });
      // }
    }

});