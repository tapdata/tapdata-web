import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'

import i18n from '@tap/i18n'

dayjs.extend(relativeTime)
dayjs.locale(i18n.locale || 'zh-cn')

export { dayjs }
