1.目录结构
build ----------------- webpack 相关配置文件
config ----------------- vue 基本配置文件
node_modules ----------- 依赖包
src -------------------- 项目核心文件
assets --------------- 静态资源（样式类文件）
commponents ---------- 公共组件
router --------------- 路由
i18n ----------------- 国际化
view ----------------- vue 页面
vuex ----------------- 状态管理
main.js -------------- 入口文件
App.vue -------------- 根组件
static ----------------- 静态资源（放图片）

2.css
2.1 class 命名
（1）class 名称中只能出现小写字符和破折号（dashe）（不是下划线，也不是驼峰命名法）。破折号应当用于相关 class 的命名（类似于命名空间）（例如，.btn 和 .btn-danger）。
（2）避免过度任意的简写。.btn 代表 button，但是 .s 不能表达任何意思。
（3）class 名称应当尽可能短，并且意义明确。
（4）使用有意义的名称。使用有组织的或目的明确的名称，不要使用表现形式（presentational）的名称。
（5）基于最近的父 class 或基本（base） class 作为新 class 的前缀。
（6）使用 .js-\* class 来标识行为（与样式相对），并且不要将这些 class 包含到 CSS 文件中。

2.2 样式顺序
（1）定位属性：position  display  float  left  top  right  bottom   overflow  clear   z-index
（2）自身属性：width  height  padding  border  margin   background
（3）文字样式：font-family   font-size   font-style   font-weight   font-varient   color   
（4）文本属性：text-align   vertical-align   text-wrap   text-transform   text-indent    text-decoration  letter-spacing    word-spacing    white-space   text-overflow
（5）css3 中新增属性：content   box-shadow   border-radius  transform……

3.3 样式区块
fun-area 工具栏
