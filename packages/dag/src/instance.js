import './styles/jsplumb.scss'
import { jsPlumb } from 'jsplumb'
import config from './config'

export { jsPlumb, config }

export default jsPlumb.getInstance(config)
