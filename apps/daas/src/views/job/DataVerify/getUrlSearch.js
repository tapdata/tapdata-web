/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2020/7/15
 * @description
 */
export default {
  getUrlSearch: function (name) {
    // 未传参，返回空
    if (!name) return null
    // 查询参数：先通过search取值，如果取不到就通过hash来取
    var after = window.location.search
    after = after.substr(1) || window.location.hash.split('?')[1]
    // 地址栏URL没有查询参数，返回空
    if (!after) return null
    // 如果查询参数中没有"name"，返回空
    if (after.indexOf(name) === -1) return null
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    // 当地址栏参数存在中文时，需要解码，不然会乱码
    var r = decodeURI(after).match(reg)
    // 如果url中"name"没有值，返回空
    if (!r) return null
    return r[2]
  }
}
