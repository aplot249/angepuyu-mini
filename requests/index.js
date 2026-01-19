import { eventBus } from '../utils/eventBus.js';
import {encrypt,decrypt} from '../utils/encryption.js';

// const baseHOST = 'http://192.168.0.67:8000' //公司
const baseHOST = 'https://puyu.jsxinlingdi.com'
// const baseHOST =  'http://192.168.1.181:8000'  //住宿
// const baseHOST =  'http://127.0.0.1:8000'

// const isJiami = false
const isJiami = true
const baseImgUrl = baseHOST + '/media'

function request(url, method = 'POST', data = {}) {
  let header = {
    'Authorization': wx.getStorageSync('token') ? 'JWT ' + wx.getStorageSync('token') : {}
  }
  var URL = baseHOST + url
  // 如果是 POST/PUT，加密整个 body
  const encryptedData = isJiami ? encrypt(data) : data;
  // wx.showLoading()
  return new Promise((resolve, reject) => {
    wx.request({
      url: URL,
      header: header,
      method: method,
      // data: data,
      data: isJiami ? {
        payload: encryptedData
      } : data,
      timeout: '8000',
      success: res => {
        const { statusCode, data } = res;
        // console.log('eeeeeeeeeee',statusCode)
        if(isJiami){
          const decryptedData = decrypt(data.payload);
          var res = decryptedData; // 替换原本的密文
        }else{
          var res = data
        }
        console.log(res)
        switch(statusCode){
          case 200:
            resolve(res)
            break;
          case 201:
            resolve(res)
            break;       
          // case 87014:
          //   reject(data)
          //   break;     
          case 204:
            resolve(res)
            break;            
          case 401:
            var errMsg = '未授权，请重新登录';
            reject(res); // 将错误抛出
            break;
          case 403:
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
            console.log('data',res)
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const currentRoute = '/'+currentPage.route; // 例如：'pages/index/index'
            console.log('currentRoute',currentRoute)
            if (res.detail == 'JWT Token已过期！' || res.detail == '身份认证信息未提供。' || res.detail =='用户不存在！') {
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
                              let data = {
                                code: r.code,
                                gender: res.userInfo.gender,
                                wxnickname: res.userInfo.nickName,
                              }
                              var encryptedData = isJiami ? encrypt(data) : data;
                              wx.request({
                                url: baseHOST+'/user/openid/',
                                header: header,
                                method: 'post',
                                // data: isJiami ? encrypt(data) : data,
                                data: isJiami ? {
                                  payload: encryptedData
                                } : data,
                                timeout: '8000',
                                success: res => {
                                  if(isJiami){
                                    const decryptedData = decrypt(res.data.payload);
                                    var rr = decryptedData; // 替换原本的密文
                                  }else{
                                    var rr = res.data
                                  }
                                  console.log('rrrrrrr',rr)
                                  console.log('登录信息：', rr)
                                  const newInfo = {
                                    ...rr.user,
                                    isLoggedIn: true,
                                  };
                                  app.globalData.userInfo = newInfo;
                                  app.globalData.userCreated =  rr.created
                                  eventBus.emit('userNewCreated', app.globalData.userCreated);
                                  app.saveData();
                                  wx.showToast({
                                    title: '登录成功',
                                    icon: 'none'
                                  });
                                  // wx.setStorageSync('points',res.user.points)
                                  wx.setStorageSync('token', rr.token)
                                  wx.reLaunch({
                                    // url: currentRoute,
                                    url: '/pages/index/index',
                                  })
                                }
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
            reject(res); // 将错误抛出
            break;  
          case 404:
            var errMsg = '资源不存在';
            console.error('404错误: 接口不存在或资源未找到', res);
            wx.showToast({
              title: '内容不存在',
              icon: 'none'
            });
            reject(res); // 将错误抛出
            break;           
          case 429:
            var errMsg = '频率太快';
            reject(res); // 将错误抛出
            break;
          default:
            var errMsg = '服务器错误';
            reject(res); // 将错误抛出
        }
      },
      fail: err => {
        // 这里处理的是网络超时、域名未配置等真正的请求失败
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err)
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
  const encryptedData = isJiami ? encrypt(formData) : formData;

  // wx.showLoading()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: URL,
      header: header,
      filePath: filePath,
      name: name,
      // formData: formData,
      formData: isJiami ? {
        payload: encryptedData
      } : formData,
      timeout: '5000',
      success: res => {
        console.log('333333333333333',res)
        const { statusCode, data } = res;
        // console.log('eeeeeeeeeee',statusCode)
        if(isJiami){
          const decryptedData = decrypt(JSON.parse(data).payload);
          var res = decryptedData; // 替换原本的密文
        }else{
          var res = JSON.parse(data)
        }
        console.log('eeeeeeeeeee',res)
        // console.log('eeeeeeeeeee',statusCode)
        switch(statusCode){
          case 200:
            resolve(res)
            break;
          case 201:
            resolve(res)
            break;            
          case 204:
            resolve(res)
            break;            
          case 401:
            var errMsg = '未授权，请重新登录';
            reject(res); // 将错误抛出
            break;
          case 403:
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
            console.log('data',res)
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const currentRoute = '/'+currentPage.route; // 例如：'pages/index/index'
            console.log('currentRoute',currentRoute)
            if (res.detail == 'JWT Token已过期！' || res.detail == '身份认证信息未提供。' || res.detail =='用户不存在！') {
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
                              let data = {
                                code: r.code,
                                gender: res.userInfo.gender,
                                wxnickname: res.userInfo.nickName,
                              }
                              var encryptedData = isJiami ? encrypt(data) : data;
                              wx.request({
                                url: baseHOST+'/user/openid/',
                                header: header,
                                method: 'post',
                                data: isJiami ? {
                                    payload: encryptedData
                                  } : data,
                                timeout: '8000',
                                success: res => {
                                  if(isJiami){
                                    const decryptedData = decrypt(res.data.payload);
                                    var rr = decryptedData; // 替换原本的密文
                                  }else{
                                    var rr = res.data
                                  }
                                  console.log('登录信息：', rr)
                                  const newInfo = {
                                    ...rr.user,
                                    isLoggedIn: true,
                                  };
                                  // 这里会把后端的point返回给前端，
                                  app.globalData.userInfo = newInfo;
                                  app.globalData.userCreated =  rr.created
                                  eventBus.emit('userNewCreated', app.globalData.userCreated);
                                  app.saveData();
                                  wx.showToast({
                                    title: '登录成功',
                                    icon: 'none'
                                  });
                                  wx.setStorageSync('token', rr.token)
                                  // wx.setStorageSync('points',rr.user.points)
                                  wx.reLaunch({
                                    // url: currentRoute,
                                    url: '/pages/index/index',
                                  })
                                }
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
            reject(res); // 将错误抛出
            break;  
          case 404:
            var errMsg = '资源不存在';
            console.error('404错误: 接口不存在或资源未找到', res);
            wx.showToast({
              title: '内容不存在',
              icon: 'none'
            });
            reject(res); // 将错误抛出
            break;           
          case 429:
            var errMsg = '频率太快';
            reject(res); // 将错误抛出
            break;
          default:
            var errMsg = '服务器错误';
            reject(res); // 将错误抛出
        }
      },
      fail: err => {
        // 这里处理的是网络超时、域名未配置等真正的请求失败
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err); // 将错误抛出
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