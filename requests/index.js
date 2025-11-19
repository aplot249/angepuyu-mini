const baseHOST = 'http://127.0.0.1:8000'
const baseImgUrl = baseHOST + '/media'

function request(url, method = 'POST', data = {}) {
  let header = {
    'Authorization': wx.getStorageSync('token') ? 'JWT ' + wx.getStorageSync('token') : {}
  }
  var URL = baseHOST + url

  wx.showLoading()
  return new Promise((resolve, reject) => {
    wx.request({
      url: URL,
      header: header,
      method: method,
      data: data,
      timeout: '5000',
      success: res => {
        wx.hideLoading()
        console.log(res.data.status)
        // token过期提跳转
        if (res.statusCode == 403) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/ruku/ruku',
          })
          reject(res.data)
        }
        if (res.statusCode == 429) {
          reject(res)
        }
        // 用户名或密码错误
        if (res.data.status == 401) {
          reject(res)
        }
        // 返回的事json
        resolve(res.data)
      }
    })
  })
}

function fileupload(url,filePath,name,formData={}) {
  let header = {
    'Authorization': wx.getStorageSync('token') ? 'JWT ' + wx.getStorageSync('token') : {}
  }
  var URL = baseHOST + url
  wx.showLoading()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: URL,
      header: header,
      filePath: filePath,
      name: name,
      formData: formData,
      timeout: '5000',
      success: res => {
        wx.hideLoading()
        // token过期提跳转
        if (res.statusCode == 403) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/ruku/ruku',
          })
          // 返回的是字符串
          reject(JSON.parse(res.data))
        }
        if (res.statusCode == 429) {
          reject(res)
        }
        resolve(JSON.parse(res.data))
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