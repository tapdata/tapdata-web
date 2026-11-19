import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

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

// TAP-13319：《告警中心菜单及关联页面调整说明》V2.0 中英文文案统一表
const expected: Record<string, [string, string, string]> = {
  page_title_alarm_notification: ['告警中心', '告警中心', 'Alert Center'],
  page_title_notification_records: ['通知记录', '通知記錄', 'Notifications'],
  page_title_alarm_events: ['告警列表', '告警列表', 'Alerts'],
  page_title_operation_audit: ['审计日志', '審計日誌', 'Audit Logs'],
  daas_setting_settingcenter_gaojingshezhi: [
    '告警设置',
    '告警設置',
    'Alert Settings',
  ],
  notification_record_view_alarm: ['查看告警', '查看告警', 'View Alert'],
  alarm_event_detail: ['告警详情', '告警詳情', 'Alert Details'],
  alarm_event_view_notifications: [
    '查看通知记录',
    '查看通知記錄',
    'View Notifications',
  ],
  notification_view_all_records: [
    '查看全部通知',
    '查看全部通知',
    'View All Notifications',
  ],
}

for (const [key, [cn, tw, english]] of Object.entries(expected)) {
  test(`${key} matches the V2.0 naming table`, () => {
    assert.equal(zhCN[key], cn)
    assert.equal(zhTW[key], tw)
    assert.equal(en[key], english)
  })
}

test('alarm status filter shows an explicit all-status option', () => {
  assert.equal(zhCN.alarm_event_status_all, '全部状态')
  assert.equal(zhTW.alarm_event_status_all, '全部狀態')
  assert.equal(en.alarm_event_status_all, 'All statuses')
})

test('alarm close confirmation refers to audit logs instead of operation audit', () => {
  assert.match(zhCN.alarm_event_close_confirm, /审计日志/)
  assert.doesNotMatch(zhCN.alarm_event_close_confirm, /操作审计/)
  assert.match(zhTW.alarm_event_close_confirm, /審計日誌/)
  assert.match(en.alarm_event_close_confirm, /audit logs/)
})

test('business field names are not replaced by menu names', () => {
  assert.equal(zhCN.notification_record_channel, '通知渠道')
  assert.equal(zhCN.notification_record_delivery_status, '发送状态')
  assert.equal(zhCN.notification_modular_alarm, '告警事件')
})
