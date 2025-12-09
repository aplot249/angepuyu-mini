import {http} from '../requests/index'
const app = getApp()

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// function LoginTip(pageLink){
//   wx.showModal({
//     title: '请先登录，才能进行后续操作',
//     confirmText: "确认登录",
//     success: (res) => {
//       if (res.confirm) {
//         wx.getUserProfile({
//           desc: '需微信授权登录',
//           success: (res) => {
//             wx.showToast({
//               title: '正在登录...',
//               icon: "none"
//             })
//             wx.login({
//               timeout: 8000,
//               success: r => {
//                 console.log(r.code)
//                 http('/user/openid/', 'post', {
//                   code: r.code,
//                   gender: res.userInfo.gender,
//                   wxnickname: res.userInfo.nickName,
//                 }).then(res => {
//                   console.log('登录信息：', res)
//                   const newInfo = {
//                     ...res.user,
//                     isLoggedIn: true,
//                   };
//                   app.globalData.userInfo = newInfo;
//                   app.saveData();
//                   wx.showToast({
//                     title: '登录成功',
//                     icon: 'none'
//                   });
//                   wx.setStorageSync('token', res.token)
//                   wx.reLaunch({
//                     url: pageLink,
//                   })
//                 })
//               }
//             })
//           }
//         })
//       }
//     }
//   })
// }

module.exports = {
  formatTime,
  // LoginTip
}
