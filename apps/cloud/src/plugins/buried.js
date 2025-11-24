import { setPageTitle } from '@tap/shared'
import Time from '@tap/shared/src/time'
import i18n from '@/i18n'
import axios from '@/plugins/axios'
const TIME_ON_SITE_KEY = 'TAPDATA_SITE_SESSTION'
const TIME_ON_PAGE_KEY = 'TAPDATA_PAGE_SESSTION'

export const buried = (code, page, attrs, sid) => {
  const userInfo = window.__USER_INFO__ || {}
  const data = {
    user_id: userInfo.userId || '',
    code,
    page,
  }
  attrs = Object.assign({}, attrs)
  if (sid) {
    attrs.sid = sid
  }
  data.attrs = attrs
  let queryStr = `?data=${encodeURIComponent(JSON.stringify(data))}`
  if (sid) {
    const where = {
      'attrs.sid': sid,
    }
    queryStr = `${queryStr}&where=${encodeURIComponent(JSON.stringify(where))}`
  }
  // eslint-disable-next-line
   import.meta.env.NODE_ENV !== 'production' &&
    console.log(
      i18n.global.t('dfs_plugins_buried_chufamaidianc', { val1: code }),
      attrs,
    )

  axios.get(`api/tcm/user/behavior${queryStr}`)
}

export const startTimeOnSite = () => {
  let sessionId = sessionStorage.getItem(TIME_ON_SITE_KEY)
  if (!sessionId) {
    sessionId = Time.now()
    sessionStorage.setItem(TIME_ON_SITE_KEY, sessionId)
  }
  setInterval(() => {
    updateTimeOnSite()
  }, 30000)
}

export const updateTimeOnSite = () => {
  const sessionId = sessionStorage.getItem(TIME_ON_SITE_KEY)
  if (sessionId) {
    const count = Time.now() - Number(sessionId)
    buried(
      'timeOnSite',
      '/',
      {
        times: `${Math.floor(count / 1000)}s`,
      },
      sessionId,
    )
  } else {
    console.error(i18n.global.t('dfs_plugins_buried_wangzhantingliushi'))
  }
}

export const startTimeOnPage = (router) => {
  let count = 1

  router.beforeEach((to, from, next) => {
    let sessionId = sessionStorage.getItem(TIME_ON_PAGE_KEY)
    const arr = sessionId?.split('_') || []
    const createSessionItem = () => {
      sessionId = `${to.path}_${Time.now()}`
      sessionStorage.setItem(TIME_ON_PAGE_KEY, sessionId)
      buried('accessPage', to.path || '/', null, sessionId)
    }
    if (arr.length) {
      count = 1
      updateTimeOnPage()
      if (arr[0] !== to.path) {
        createSessionItem()
      }
    } else {
      createSessionItem()
    }

    if (to.meta.title) {
      setPageTitle(i18n.global.t(to.meta.title))
    }

    // 隐藏客服控件
    const blackList = [
      'DataflowNew',
      'DataflowEditor',
      'MigrateCreate',
      'MigrateEditor',
      'Welcome',
      'WelcomeTask',
    ]
    if (!blackList.includes(to.name)) {
      document.body.classList.remove('hide-chart')
    } else {
      document.body.classList.add('hide-chart')
    }

    next()
  })
  setInterval(() => {
    if (++count === 30) {
      count = 0
      updateTimeOnPage()
    }
  }, 1000)
}

export const updateTimeOnPage = () => {
  const sessionId = sessionStorage.getItem(TIME_ON_PAGE_KEY)
  const arr = sessionId?.split('_') || []
  if (arr.length) {
    const path = arr[0] || '/'
    const time = Time.now() - Number(arr[1] || 0)
    const second = Math.floor(time / 1000)
    if (second > 5) {
      buried(
        'timeOnPage',
        path,
        {
          times: `${second}s`,
          pid: sessionId,
        },
        sessionId,
      )
    }
  } else {
    console.error(i18n.global.t('dfs_plugins_buried_wangzhantingliushi'))
  }
}
