import routes from '@/router/routes'
import { MENU, DropdownList, SettingList } from '@/router/menu'
import './styles/index.scss'
import { setCurrentLanguage } from '@tap/i18n/src/shared/util'

// S-重写路由
const parentRoute = routes.find(r => r.path === '/')
const loginRoute = routes.find(r => r.path === '/login')

parentRoute.children.push({
  path: 'about',
  name: 'about',
  component: () => import('./components/About'),
  meta: {
    hideTitle: true
  }
})
loginRoute.component = () => import('./components/Login')
// E-重写路由

export function install(router, i18n) {
  // 菜单
  MENU.find(m => m.name === 'dataConsole').hidden = true
  MENU.find(m => m.name === 'advancedFeatures').hidden = true
  MENU.find(m => m.name === 'dataService').hidden = true
  MENU.find(m => m.name === 'system').children.find(m => m.name === 'externalStorage').hidden = true
  MENU.find(m => m.name === 'system').children.push(
    { name: 'License' },
    { name: 'settings', code: 'system_settings_menu' },
    { name: 'notificationSetting', code: 'home_notice_settings' }
  )

  // 顶部下拉菜单
  DropdownList.find(item => item.name === 'version').route = '/about'
  DropdownList.find(item => item.name === 'license').hidden = true

  // 系统设置
  SettingList.find(item => item.key === 'webhookAlerts').hidden = true

  setCurrentLanguage('zh-CN', i18n)

  // 国际化
  i18n.merge({
    'zh-CN': {
      page_title_data_pipeline: '任务管理',
      app_account: '用户信息',
      account_accountSettings: '用户信息',
      app_version: '关于',
      page_title_license: '授权管理'
    },
    'zh-TW': {
      page_title_data_pipeline: '任务管理'
    },
    en: {
      page_title_data_pipeline: '任务管理'
    }
  })

  // 全局配置
  window._TAPDATA_OPTIONS_.logoUrl = require('./images/app_logo.png')
  window._TAPDATA_OPTIONS_.logoHeight = 36
}
