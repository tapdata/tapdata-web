// 批量导入svg
const req = require.context('@/assets/icons/svg/', false, /\.svg$/)
const colorful = require.context(
  '@/assets/icons/svg-colorful/',
  false,
  /\.svg$/
)
const requireAll = requireContext => {
  return requireContext.keys().map(requireContext)
}
requireAll(req)
requireAll(colorful)
