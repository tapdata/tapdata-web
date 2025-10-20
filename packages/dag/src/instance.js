import { jsPlumb } from 'jsplumb'
import config from './config'
import './styles/jsplumb.scss'

export { config, jsPlumb }

export default jsPlumb.getInstance(config)
