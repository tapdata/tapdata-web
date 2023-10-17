import { ElLoading as Loading } from 'element-plus'

export const loading = async (loadingText = 'Loading...', processor) => {
  let loadingInstance = null
  let loading = setTimeout(() => {
    loadingInstance = Loading.service({
      text: loadingText,
      background: 'transparent'
    })
  }, 100)
  const results = await processor()
  loadingInstance?.close()
  clearTimeout(loading)
  return results
}
