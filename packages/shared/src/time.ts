// 设置和获取服务器时间
const current = Date.now()
const Time = {
  serverTime: current,
  systemTime: current,
  setTime(t: number) {
    Time.systemTime = Date.now()
    Time.serverTime = t || Time.systemTime
  },
  now() {
    const { serverTime, systemTime } = Time
    return Date.now() - systemTime + serverTime
  },
}

export { Time }

export default Time
