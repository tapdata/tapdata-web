// 批量导入svg
const req = require.context('@/assets/icons/svg/', false, /\.svg$/)
const colorSvg = require.context('@/assets/icons/colorSvg/', false, /\.svg$/)
const requireAll = requireContext => {
  return requireContext.keys().map(requireContext)
}
requireAll(req)
requireAll(colorSvg)
import { importIcon } from '@tap/assets/icons'
importIcon()
