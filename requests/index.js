// const baseHOST = 'http://127.0.0.1:8000'
// const baseHOST = 'https://siyu.jsxinlingdi.com'
const baseHOST = 'http://192.168.1.181:8000'
const baseImgUrl = baseHOST + '/media'

function request(url, method = 'POST', data = {}) {
  let header = {
    'Authorization': wx.getStorageSync('token') ? 'JWT ' + wx.getStorageSync('token') : {}
  }
  var URL = baseHOST + url
  // wx.showLoading()
  return new Promise((resolve, reject) => {
    wx.request({
      url: URL,
      header: header,
      method: method,
      data: data,
      timeout: '8000',
      success: res => {
        const { statusCode, data } = res;
        if (res.statusCode == 200) {
          resolve(data);
        } else {
          if (statusCode == 401) {
            var errMsg = '未授权，请重新登录';
          } else if (statusCode == 403) {
            var errMsg = '禁止访问';
            const app = getApp();
            const newInfo = {
              // ...this.data.userInfo,
              isLoggedIn: false,
              hasSharedToday: app.globalData.userInfo.hasSharedToday,
              hasSignedIn: app.globalData.userInfo.hasSignedIn,
            }
            wx.setStorageSync('token', '')
            app.globalData.userInfo = newInfo;
            app.saveData();
          } else if (statusCode === 404) {
            var errMsg = '资源不存在';
            console.error('404错误: 接口不存在或资源未找到', res);
            wx.showToast({
              title: '内容不存在',
              icon: 'none'
            });
          } else if (res.statusCode == 429) {
            var errMsg = '频率太快';
          } else {
            var errMsg = '服务器错误';
          }
          // wx.showToast({
          //   title: errMsg,
          //   icon: 'none'
          // });
          console.log(errMsg)
          reject(res.data); // 将错误抛出
        }
      },
      fail: err => {
        // 这里处理的是网络超时、域名未配置等真正的请求失败
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(res.data)
      },
      complete: () => {
        // wx.hideLoading();
      }
    })
  })
}

function fileupload(url, filePath, name, formData = {}) {
  let header = {
    'Authorization': wx.getStorageSync('token') ? 'JWT ' + wx.getStorageSync('token') : {}
  }
  var URL = baseHOST + url
  // wx.showLoading()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: URL,
      header: header,
      filePath: filePath,
      name: name,
      formData: formData,
      timeout: '5000',
      success: res => {
        const { statusCode, data } = res;
        if (res.statusCode == 200) {
          resolve(data);
        } else {
          if (statusCode == 401) {
            var errMsg = '未授权，请重新登录';
          } else if (statusCode == 403) {
            var errMsg = '禁止访问';
            const app = getApp();
            const newInfo = {
              isLoggedIn: false,
              hasSharedToday: app.globalData.userInfo.hasSharedToday,
              hasSignedIn: app.globalData.userInfo.hasSignedIn,
            }
            wx.setStorageSync('token', '')
            app.globalData.userInfo = newInfo;
            app.saveData();
          } else if (statusCode === 404) {
            var errMsg = '资源不存在';
            console.error('404错误: 接口不存在或资源未找到', res);
            wx.showToast({
              title: '内容不存在',
              icon: 'none'
            });
          } else if (res.statusCode == 429) {
            var errMsg = '频率太快';
          } else {
            var errMsg = '服务器错误';
          }
          // wx.showToast({
          //   title: errMsg,
          //   icon: 'none'
          // })
          // console.log(errMsg)
          reject(res.data) // 将错误抛出
        }
      },
      fail: err => {
        // 这里处理的是网络超时、域名未配置等真正的请求失败
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(res.data)
      },
      complete: () => {
        // wx.hideLoading();
      }
    })
  })
}

module.exports = {
  http: request,
  baseUrl: baseHOST,
  baseImgUrl: baseImgUrl,
  fileupload: fileupload,
}