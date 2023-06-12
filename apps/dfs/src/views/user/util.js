// 获取验证码
export function getCodeOptions(val, scene, type = 'sms') {
  let params = {
    scene
  }
  if (type === 'sms') {
    params.phone = val
    params.countryCode = window.__USER_INFO__?.phoneCountryCode || '86'
  } else {
    params.email = val
  }
  return {
    method: 'post',
    url: `api/tcm/${type}/captcha`,
    params
  }
}
