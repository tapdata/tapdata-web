/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Http from './Http'

export default class Paid extends Http {
  constructor() {
    super('/api/paid')
  }
  //检查当前用户付费计划是否有效接口
  getUserPaidPlan() {
    return this.axios.get(`${this.url}/plan`)
  }
}
export { Paid }
