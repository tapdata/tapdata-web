import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost/:8080', // api的base_url
  timeout: 10000 // 请求超时时间
})

//请求拦截器
instance.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

//响应拦截器
instance.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})
//post请求
const post = function (url, params) {
  return new Promise((resolve, reject) => {
    instance({
      url: url,
      method: 'post',
      params: params
    }).then( res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
//get请求
const get = function (url, params) {
  return new Promise((resolve, reject) => {
    instance({
      url: url,
      method: 'get',
      params: params
    }).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })
  })
}
//暴露post、get方法
export default {post,get}
