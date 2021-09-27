/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/4/19
 * @description
 */
import Vue from 'vue'
let MyPlugin = {}
// 定义全局指令
export default MyPlugin.install = function () {
  // loadmore 是定义的指令 名称 ， 使用时 用 v-loadmore = "dosomethingFun or data"
  Vue.directive('loadmore', {
    // bind只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置
    bind(el, binding) {
      // 获取element-ui定义好的scroll盒子  Select 选择器的下拉盒子
      const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
      SELECTWRAP_DOM.addEventListener('scroll', function () {
        // 判断滚动到底部
        const CONDITION = this.scrollHeight - this.scrollTop <= this.clientHeight
        if (CONDITION) {
          // binding.value 是指令的绑定值，该值可能是字符串，数字、函数
          // binding.value() 表示执行 v-loadmore 绑定的函数
          binding.value()
        }
      })
    }
  })
}
