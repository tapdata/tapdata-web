import StatusItem from './StatusItem'
import SchemaProgress from './SchemaProgress'
import StatusTag from './StatusTag'
import SelectClassify from './SelectClassify'
import UploadDialog from './UploadDialog'
import Log from './logs/Index.vue'
import TablePage from './TablePage.vue'
import ConnectionTypeSelectorAll from './ConnectionTypeSelector.vue'
import ConnectionTypeSelectorSort from './ConnectionTypeSelectorSort'
import TaskStatus from './TaskStatus'
import PageHeader from './PageHeader'

const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
const ConnectionTypeSelector = isDaas ? ConnectionTypeSelectorAll : ConnectionTypeSelectorSort

export {
  StatusItem,
  SchemaProgress,
  StatusTag,
  SelectClassify,
  UploadDialog,
  Log,
  TablePage,
  ConnectionTypeSelector,
  TaskStatus,
  PageHeader
}
