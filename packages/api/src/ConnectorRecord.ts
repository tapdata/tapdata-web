import Http from './Http'
import {AxiosResponse} from "axios";

export default class ConnectorRecord extends Http {
  constructor() {
    super('/api/ConnectorRecord')
  }

  downloadConnector(params: unknown) {
    return this.axios.post(`${this.url}/downloadConnector`, params)
  }

  delete(id: string){
    return this.axios.delete(`${this.url}/${id}`)
  }
}

export { ConnectorRecord }
