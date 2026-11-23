import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PERMISSION_TITLE_KEYS } from '../src/views/role/permission-titles.ts'

// 语言包依赖 Vite 注入的 import.meta.env；单测只校验静态文案，用空对象代替后按 ES 模块加载
async function loadLocale(name: string): Promise<Record<string, string>> {
  const url = new URL(`../src/i18n/langs/${name}.js`, import.meta.url)
  const source = (await readFile(url, 'utf8')).replaceAll(
    'import.meta.env',
    '({})',
  )
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  )
  return module.default
}

const [zhCN, zhTW, en] = await Promise.all(
  ['zh-CN', 'zh-TW', 'en'].map((name) => loadLocale(name)),
)

const roleSource = await readFile(
  new URL('../src/views/role/Role.vue', import.meta.url),
  'utf8',
)
const pageSortSource = roleSource.slice(
  roleSource.indexOf('const pageSort = ['),
  roleSource.indexOf('// ---- 状态 ----'),
)

// TAP-13319：角色权限页与左侧菜单使用同一组名称
test('alert center permission nodes use the menu names in all locales', () => {
  const expected: Record<string, [string, string, string]> = {
    'v2_message-center': ['告警中心', '告警中心', 'Alert Center'],
    v2_notification_record: ['通知记录', '通知記錄', 'Notifications'],
    v2_alarm_event: ['告警列表', '告警列表', 'Alerts'],
    v2_audit_log: ['审计日志', '審計日誌', 'Audit Logs'],
  }
  assert.deepEqual(
    Object.keys(PERMISSION_TITLE_KEYS).sort(),
    Object.keys(expected).sort(),
  )
  for (const [name, [cn, tw, english]] of Object.entries(expected)) {
    const key = PERMISSION_TITLE_KEYS[name]
    assert.equal(zhCN[key], cn, name)
    assert.equal(zhTW[key], tw, name)
    assert.equal(en[key], english, name)
  }
})

test('permission tree no longer shows the removed ops center group', () => {
  assert.ok(pageSortSource.length > 0)
  assert.doesNotMatch(roleSource, /v2_ops-center/)
})

test('alert center group lists notifications before alerts and keeps alert permissions', () => {
  const group = pageSortSource.slice(
    pageSortSource.indexOf("name: 'v2_message-center'"),
    pageSortSource.indexOf("name: 'v2_system-management'"),
  )
  const notifications = group.indexOf("name: 'v2_notification_record'")
  const alerts = group.indexOf("name: 'v2_alarm_event'")
  assert.ok(notifications > 0, 'notification records under alert center')
  assert.ok(alerts > notifications, 'alerts after notification records')
  assert.match(group, /name: 'v2_alarm_event_ack_close'/)
})

test('audit log permission stays under system management', () => {
  const group = pageSortSource.slice(
    pageSortSource.indexOf("name: 'v2_system-management'"),
  )
  assert.match(group, /name: 'v2_audit_log'/)
  assert.match(group, /name: 'v2_audit_log_export'/)
})
