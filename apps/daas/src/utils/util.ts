import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import i18n from '@/i18n'

export function configUser(user: Record<string, any> = {}) {
  Cookie.set('email', user.email)
  Cookie.set('username', user.username || '')
  Cookie.set('isAdmin', String(Number.parseInt(user.role) || 0))
  Cookie.set('user_id', user.id)
  const permissions: string[] = []
  const list = user?.permissions || []
  if (list.length) {
    list.forEach((permission: Record<string, any>) => {
      if (permission.resources && permission.resources.length > 0) {
        permission.resources.forEach((res: string) => {
          permissions.push(res)
        })
      }
    })
    sessionStorage.setItem('tapdata_permissions', JSON.stringify(permissions))
  }
  return permissions
}

export function signOut() {
  Cookie.remove('access_token')
  Cookie.remove('email')
  Cookie.remove('username')
  Cookie.remove('isAdmin')
  Cookie.remove('user_id')
  sessionStorage.setItem('lastLocationHref', location.href)
  sessionStorage.removeItem('tapdata_permissions')
  location.href = `${location.href.split('#')[0]}#/login`
  return null
}

export function getUrlSearch(name: string) {
  // 未传参，返回空
  if (!name) return null
  // 查询参数：先通过search取值，如果取不到就通过hash来取
  const after = location.search?.slice(1) || location.hash.split('?')[1]
  // 地址栏URL没有查询参数，返回空
  if (!after) {
    return null
  }
  // 如果查询参数中没有"name"，返回空
  if (!after.includes(name)) {
    return null
  }
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`)
  // 当地址栏参数存在中文时，需要解码，不然会乱码
  const r = decodeURI(after ?? '').match(reg)
  // 如果url中"name"没有值，返回空
  if (!r) return null
  return r[2]
}

// TODO 去掉
export const formatTime = (date: string, format = 'YYYY-MM-DD HH:mm:ss') => {
  return date ? dayjs(date).format(format) : ''
}

// TODO 去掉
// 毫秒换算成时分秒
export const formatMs = (msTime = 0, type = 'time') => {
  const time = msTime / 1000
  const arr: { label: string; value: number }[] = []

  arr.push(
    {
      label: i18n.t('public_time_d'),
      value: Math.floor(time / 60 / 60 / 24),
    },
    {
      label: i18n.t('public_time_h'),
      value: Math.floor(time / 60 / 60) % 24,
    },
    {
      label: i18n.t('public_time_m'),
      value: Math.floor(time / 60) % 60,
    },
    {
      label: i18n.t('public_time_s'),
      value: Math.floor(time) % 60,
    },
  )

  let result = ''
  if (type === 'time') {
    result = arr
      .slice(1)
      .map((t) => String(t.value).padStart(2, '0'))
      .join(':')
    return result
  }
  arr.forEach((el) => {
    if (el.value) {
      result += `${el.value}${el.label}`
    }
  })
  if (!result) {
    result = msTime + i18n.t('public_time_ms')
  }
  return result
}

// 转化单位
export function toThousandsUnit(val: any) {
  if ([undefined, null, ''].includes(val)) {
    return '-'
  }
  if (val / (1000 * 1000 * 1000) > 1) {
    return `${(val / (1000 * 1000 * 1000)).toFixed(1)}T`
  } else if (val / (1000 * 1000) > 1) {
    return `${(val / (1000 * 1000)).toFixed(1)}M`
  } else if (val / 1000 > 1) {
    return `${(val / 1000).toFixed(1)}K`
  } else {
    return val
  }
}
