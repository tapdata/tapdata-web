// 获取验证码
export function getCodeOptions(form, scene, type = 'sms') {
  let params = {
    scene,
  }
  let { current, countryCode } = form
  if (type === 'sms') {
    params.phone = current
    params.countryCode = countryCode || window.__USER_INFO__?.phoneCountryCode || '86'
  } else {
    params.email = current
  }
  return {
    method: 'post',
    url: `api/tcm/${type}/captcha`,
    params,
  }
}
