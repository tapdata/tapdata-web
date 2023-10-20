// 批量导入svg
import { importIcon } from '@tap/assets/icons'
importIcon()

import.meta.glob(['@/assets/icons/svg/*.svg', '@/assets/icons/colorSvg/*.svg'], { eager: true })
