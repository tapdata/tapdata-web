import { getSamlLogoutUrl } from '@tap/api/src/core/sso'
import { getUserInfoByToken } from '@tap/api/src/core/users'
import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import i18n from '@/i18n'

type PermissionResource = { code?: string } & Record<string, any>

const PERMISSIONS_STORAGE_KEY = 'tapdata_permissions'

let cachedPermissions: PermissionResource[] | null = null
let permissionsRequest: Promise<PermissionResource[]> | null = null

function getPermissionDebugContext() {
  const navigation = performance.getEntriesByType?.('navigation')?.[0] as
    | PerformanceNavigationTiming
    | undefined

  return {
    href: location.href,
    navigationType: navigation?.type,
    visibilityState: document.visibilityState,
    wasDiscarded: (document as Document & { wasDiscarded?: boolean })
      .wasDiscarded,
  }
}

function debugPermissions(message: string, details: Record<string, any> = {}) {
  // eslint-disable-next-line no-console
  console.debug('[tapdata_permissions]', message, {
    ...getPermissionDebugContext(),
    ...details,
  })
}

function flattenPermissions(user: Record<string, any> = {}) {
  const permissions: PermissionResource[] = []
  const list = user?.permissions || []

  list.forEach((permission: Record<string, any>) => {
    if (permission.resources && permission.resources.length > 0) {
      permission.resources.forEach((res: PermissionResource) => {
        permissions.push(res)
      })
    }
  })

  return permissions
}

function setPermissions(permissions: PermissionResource[]) {
  cachedPermissions = permissions
  sessionStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions))

  if (!permissions.length) {
    debugPermissions('wrote empty permissions cache')
  }
}

export function clearPermissions() {
  cachedPermissions = null
  permissionsRequest = null
  sessionStorage.removeItem(PERMISSIONS_STORAGE_KEY)
  debugPermissions('cleared permissions cache')
}

export function getCachedPermissions() {
  const permissionsStr = sessionStorage.getItem(PERMISSIONS_STORAGE_KEY)

  if (permissionsStr !== null) {
    try {
      const permissions = JSON.parse(permissionsStr)

      if (Array.isArray(permissions)) {
        cachedPermissions = permissions
        return permissions as PermissionResource[]
      }
      debugPermissions('removed invalid permissions cache', {
        valueType: typeof permissions,
      })
      sessionStorage.removeItem(PERMISSIONS_STORAGE_KEY)
    } catch (error) {
      debugPermissions('removed unparsable permissions cache', {
        errorMessage: error?.message,
        valueLength: permissionsStr.length,
      })
      sessionStorage.removeItem(PERMISSIONS_STORAGE_KEY)
    }
  }

  if (cachedPermissions) {
    debugPermissions('using in-memory permissions cache', {
      permissionsCount: cachedPermissions.length,
    })
    return cachedPermissions
  }

  return null
}

export function configUser(user: Record<string, any> = {}) {
  Cookie.set('email', user.email)
  Cookie.set('username', user.username || '')
  Cookie.set('isAdmin', String(Number.parseInt(user.role) || 0))
  Cookie.set('user_id', user.id)
  const permissions = flattenPermissions(user)

  setPermissions(permissions)

  return permissions
}

export function ensurePermissions() {
  const permissions = getCachedPermissions()

  if (permissions) {
    return Promise.resolve(permissions)
  }

  debugPermissions('permissions cache missing, refetching user permissions')

  if (!permissionsRequest) {
    permissionsRequest = getUserInfoByToken()
      .then((user) => {
        const nextPermissions = configUser(user || {})

        debugPermissions('refetched user permissions', {
          hasUser: Boolean(user),
          permissionsCount: nextPermissions.length,
          userId: user?.id,
        })

        return nextPermissions
      })
      .catch((error) => {
        debugPermissions('failed to refetch user permissions', {
          errorMessage: error?.message,
          status: error?.response?.status,
        })

        throw error
      })
      .finally(() => {
        permissionsRequest = null
      })
  }

  return permissionsRequest
}

export function signOut() {
  // Capture SSO state before clearing cookies so a SAML session can trigger
  // SP-initiated Single Logout at the IdP.
  const isSamlSession = Cookie.get('auth_method') === 'saml'
  const accessToken = Cookie.get('access_token')
  Cookie.remove('access_token')
  Cookie.remove('email')
  Cookie.remove('username')
  Cookie.remove('isAdmin')
  Cookie.remove('user_id')
  Cookie.remove('auth_method')
  clearPermissions()
  if (isSamlSession) {
    // The backend terminates the local session, then redirects to the IdP SLO
    // endpoint (or straight back to the login page when SLO is not configured).
    window.location.href = getSamlLogoutUrl(accessToken)
    return null
  }
  sessionStorage.setItem('lastLocationHref', location.href)
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
