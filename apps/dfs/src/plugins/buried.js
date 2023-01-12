import i18n from '@/i18n'
import { setPageTitle } from '@tap/shared'
const TIME_ON_SITE_KEY = 'TAPDATA_SITE_SESSTION'
const TIME_ON_PAGE_KEY = 'TAPDATA_PAGE_SESSTION'

export const buried = (code, page, attrs, sid) => {
  let userInfo = window.__USER_INFO__ || {}
  let data = {
    user_id: userInfo.user_id || '',
    code,
    page
  }
  attrs = Object.assign({}, attrs)
  if (sid) {
    attrs.sid = sid
  }
  data.attrs = attrs
  let queryStr = '?data=' + encodeURIComponent(JSON.stringify(data))
  if (sid) {
    let where = {
      'attrs.sid': sid
    }
    queryStr = queryStr + '&where=' + encodeURIComponent(JSON.stringify(where))
  }
  // eslint-disable-next-line
  process.env.NODE_ENV !== 'production' &&
    console.log(i18n.t('dfs_plugins_buried_chufamaidianc', { val1: code }), attrs)

  window.axios.get('api/tcm/user/behavior' + queryStr)
}

export const startTimeOnSite = () => {
  let sessionId = sessionStorage.getItem(TIME_ON_SITE_KEY)
  if (!sessionId) {
    sessionId = new Date().getTime()
    sessionStorage.setItem(TIME_ON_SITE_KEY, sessionId)
  }
  setInterval(() => {
    updateTimeOnSite()
  }, 30000)
}

export const updateTimeOnSite = () => {
  let sessionId = sessionStorage.getItem(TIME_ON_SITE_KEY)
  if (sessionId) {
    let count = new Date().getTime() - Number(sessionId)
    buried(
      'timeOnSite',
      '/',
      {
        times: Math.floor(count / 1000) + 's'
      },
      sessionId
    )
  } else {
    // eslint-disable-next-line
    console.error(i18n.t('dfs_plugins_buried_wangzhantingliushi'))
  }
}

export const startTimeOnPage = router => {
  let count = 1

  router.beforeEach((to, from, next) => {
    let sessionId = sessionStorage.getItem(TIME_ON_PAGE_KEY)
    let arr = sessionId?.split('_') || []
    const createSessionItem = () => {
      sessionId = to.path + '_' + new Date().getTime()
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
      setPageTitle(i18n.t(to.meta.title))
    }

    // 隐藏客服控件
    if (to.path.split('/').length < 3 || to.matched[0].path === '') {
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
  let sessionId = sessionStorage.getItem(TIME_ON_PAGE_KEY)
  let arr = sessionId?.split('_') || []
  if (arr.length) {
    let path = arr[0] || '/'
    let time = new Date().getTime() - Number(arr[1] || 0)
    let second = Math.floor(time / 1000)
    if (second > 5) {
      buried(
        'timeOnPage',
        path,
        {
          times: second + 's'
        },
        sessionId
      )
    }
  } else {
    // eslint-disable-next-line
    console.error(i18n.t('dfs_plugins_buried_wangzhantingliushi'))
  }
}
