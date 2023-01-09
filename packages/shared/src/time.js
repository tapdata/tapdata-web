// 设置和获取服务器时间
const current = Date.now()
let Time = {
  serverTime: current,
  systemTime: current,
  setTime(t) {
    Time.systemTime = Date.now()
    Time.serverTime = t || Time.systemTime
  },
  getTime() {
    const { serverTime, systemTime } = Time
    return Date.now() - systemTime + serverTime
  }
}

export default Time
