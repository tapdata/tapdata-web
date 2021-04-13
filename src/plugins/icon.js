// 批量导入svg
const req = require.context('@/assets/icons/svg/', false, /\.svg$/)
const requireAll = (requireContext) => {
  return requireContext.keys().map(requireContext)
}
requireAll(req)
