import { ElMessage, ElMessageBox } from 'element-plus'
export const setupElement = app => {
  app.use(ElMessage)
  app.use(ElMessageBox)
}
