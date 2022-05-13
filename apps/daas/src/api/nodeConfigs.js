/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
// import axios from '@/plugins/axios';
import PublicAPI from './publicApi'

export default class NodeConfigs extends PublicAPI {
  constructor() {
    super('/api/nodeConfigs')
  }
}
