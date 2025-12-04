// const baseHOST = 'http://127.0.0.1:8000'
const baseHOST = 'https://siyu.jsxinlingdi.com'
// const baseHOST = 'http://192.168.1.181:8000'
const baseImgUrl = baseHOST + '/media'

const app = getApp();

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
        // wx.hideLoading()
        if (res.statusCode == 403) {
          reject(res.data)
          // wx.clearStorageSync()
          wx.removeStorageSync('ts_user')
          wx.removeStorageSync('token')
          // wx.reLaunch({
          //   url: '/pages/profile/profile',
          // })
        }
        if (res.statusCode == 429) {
          reject(res.data)
        }
        // 返回的事json
        resolve(res.data)
      }
    },err=>{
        // wx.hideLoading()
        reject(err.data)
    })
  })
}

function fileupload(url,filePath,name,formData={}) {
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
        // wx.hideLoading()
        // token过期提跳转
        if (res.statusCode == 403) {
          wx.showToast({
            title: '请先登录',
          })
          wx.switchTab({
            url: '/pages/profile/profile',
          })
          app.globalData.userInfo.isLoggedIn = false;
          wx.clearStorageSync()
          // 返回的是字符串
          reject(JSON.parse(res.data)
          )}
        if (res.statusCode == 429) {
          reject(res)
        }
        resolve(JSON.parse(res.data))
      },
    })
  })
}

module.exports = {
  http: request,
  baseUrl: baseHOST,
  baseImgUrl: baseImgUrl,
  fileupload: fileupload,
}