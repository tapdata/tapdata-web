<template>
  <ElDialog :visible.sync="show" width="60vw" :close-on-click-modal="false" custom-class="novice-guide-dialog">
    <div v-if="myItem" :class="['guide-container', 'flex', 'flex-column', 'step' + step]" :style="myStyle">
      <!-- 标题 -->
      <div v-if="myItem.title" :class="['dialog-header', 'py-5', myItem.title.class]" :style="myItem.title.style">
        <template v-if="typeof myItem.title.text === 'object'">
          <div v-for="(item, index) in myItem.title.text" :key="index" :class="[myItem.title.itemClass]">
            {{ item }}
          </div>
        </template>
        <template v-else :class="[myItem.title.itemClass]">{{ myItem.title.text }}</template>
      </div>
      <!-- 描述 -->
      <div
        :class="['desc-container', 'inline-block', 'px-8', 'py-2', myItem.desc.class]"
        :style="myItem.desc.style"
        v-if="myItem.desc"
      >
        <template v-if="typeof myItem.desc.text === 'object'">
          <div v-for="(item, index) in myItem.desc.text" :key="index" :class="[myItem.desc.itemClass]">
            {{ item }}
          </div>
        </template>
        <template v-else :class="[myItem.desc.itemClass]">{{ myItem.desc.text }}</template>
      </div>
      <!-- 内容 -->
      <div :class="['content-container', 'flex-grow-1', myItem.contentClass]">
        <!-- setion -->
        <div :class="['section-container', 'inline-flex', section.class]" v-if="section">
          <div v-for="(seItem, seIndex) in section" :key="seIndex" :class="[seItem.class]" :style="seItem.style">
            <!-- 图片 -->
            <div class="image-section" v-if="seItem.type === 'image'">
              <div>
                <img :class="seItem.class" :src="getImgByType(seItem.key)" :alt="seItem.key" />
              </div>
            </div>
            <!-- 文字 -->
            <div class="text-section" v-else>
              <template v-if="typeof seItem.text === 'object'">
                <div
                  v-for="(item, index) in seItem.text"
                  :key="index"
                  :class="[seItem.itemClass]"
                  :style="seItem.itemStyle"
                >
                  {{ item }}
                </div>
              </template>
              <template v-else :class="[seItem.itemClass]">{{ seItem.text }}</template>
            </div>
          </div>
        </div>
        <!-- 图片nav -->
        <div class="img-list flex" :class="[imgList.class]" :style="imgList.style" v-if="imgList.items.length">
          <div
            :class="['img-box', { active: selectImg === item.key }, imgList.itemClass]"
            :style="mergeObj(imgList.itemStyle, item.style)"
            v-for="item in imgList.items"
            :key="item.key"
          >
            <div
              :class="['img-item', 'position-relative', imgList.imageItemClass]"
              :style="imgList.imageItemStyle"
              @click="selectImgItem(item)"
            >
              <img
                :class="item.class"
                :style="imgList.imageStyle"
                :src="item.src ? getImgSrc(item.src) : getImgByType(item.key)"
                :alt="item.key"
              />
              <div
                v-if="item.disabledText"
                class="mask flex justify-center align-center position-absolute top-0 bottom-0 start-0 end-0"
                :style="imgList.maskStyle"
              >
                <span class="mask-text">{{ item.disabledText }}</span>
              </div>
            </div>

            <div :class="['img-box-name', imgList.imageTitleClass]" v-if="item.name" :style="item.imageTitleStyle">
              {{ item.name }}
            </div>
            <el-button class="img-btn" v-if="item.btnName" @click="clickBtn(item)">{{ item.btnName }} </el-button>
          </div>
        </div>
      </div>
      <!-- 底部内容 -->
      <div v-if="footerContent" :class="['footer-content-container', footerContent.class]">
        <div v-for="(item, index) in footerContent.text" :key="index">
          {{ item }}
          <span
            v-if="footerContent.extra && index === footerContent.text.length - 1"
            :style="footerContent.extra && footerContent.extra.style"
            @click="clickExtra(footerContent.extra)"
            >{{ footerContent.extra.text }}</span
          >
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        v-if="myItem.btnList && myItem.btnList.items.length > 0"
        :class="['btn-list', 'mb-4', myItem.btnList.class]"
        :style="myItem.btnList.style"
      >
        <div
          v-for="(item, index) in myItem.btnList.items"
          :key="index"
          :class="['btn-item', item.class]"
          :style="item.style"
        >
          <img v-if="item.img" :class="item.img.class" :style="item.img.style" :src="getImgSrc(item.img.src)" alt="" />
          <el-button :class="[item.btnClass]" :style="item.btnStyle" @click="clickBtn(item)"
            >{{ item.name }}
          </el-button>
        </div>
      </div>
    </div>
  </ElDialog>
</template>
<script>
import getConst from './const'
export default {
  props: {
    value: Boolean,
    isClose: Boolean
  },
  data() {
    return {
      show: this.value,
      step: 0, // 步骤
      agentEngineVisible: false,
      list: getConst,
      selectImg: '',
      database: [
        'mysql',
        'oracle',
        'sqlserver',
        'mongodb',
        'db2',
        'postgres',
        'elasticsearch'
        // 'redis',
        // 'gbase-8s',
        // 'sybase ase',
        // 'gaussdb200',
        // 'kafka',
        // 'mariadb',
        // 'mysql pxc',
        // 'jira'
      ]
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
      if (!val) {
        this.resetStep()
      }
    },
    step(val) {
      console.log(val)
      if (val == -1) {
        this.step = this.list.length - 1
      }
    }
  },
  computed: {
    myItem() {
      return this.list[this.step]
    },
    section() {
      return this.myItem.section
    },
    imgList() {
      return (
        this.myItem.imgList || {
          items: []
        }
      )
    },
    footerContent() {
      return this.myItem.footerContent
    },
    myStyle() {
      let bgImg = this.myItem.bgImg
      let style = {}
      if (bgImg) {
        style.background = 'url(' + this.getImgByType(bgImg.key) + ') no-repeat 100% / cover'
      }
      return style
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.changeStep()
    },
    resetStep(value = 0) {
      this.step = value
    },
    getImgByType(type) {
      if (!type) {
        type = 'default'
      }
      try {
        return require(`../../../public/images/guide/${type.toLowerCase()}.png`)
      } catch (e) {
        console.log(e)
      }
    },
    getImgSrc(src) {
      try {
        return require(`../../packages/tapdata-web-core/assets/images/${src}`)
      } catch (e) {
        console.log(e)
      }
    },
    next(type) {
      switch (type) {
        case 'guide':
          this.step = 1
          break
        case 'connection':
          this.step = 4 //跳转到数据源类型选择页面
          break
        case 'dataFlow':
          this.goCreateTask()
          break
      }
    },
    clickBtn(item) {
      if (item.type) {
        this.next(item.type)
      } else if (item.step === '11') {
        this.goCreateTask()
      } else if (item.to) {
        item.to === 'prev' ? this.prevFnc() : this.nextFnc(item.to)
      }
    },
    prevFnc() {
      if (this.step > 0) {
        this.step--
      }
    },
    // to的值：next、数字、key
    nextFnc(to) {
      let len = this.list.length
      switch (to) {
        case 'dataFlow':
          this.goCreateTask()
          break
        case 'next':
          this.step = this.step < len - 1 ? this.step + 1 : len - 1
          break
        case 'toConnection':
          this.step = this.getListIndexByKey('dataSource_select') || 0
          break
        case 'toDataFlow':
          this.goCreateTask()
          break
        case 'dashboard':
          this.goDashboard()
          break
        case 'dataFlowList':
          this.goDataFlowList()
          break
        default:
          this.step = this.getListIndexByKey(to) || 0
          break
      }
    },
    clickExtra(extra) {
      window.open(extra.to, '_blank')
    },
    selectImgItem(item) {
      if (item.disabled) {
        return
      }
      let databaseType = item.type
      // if (!['mysql', 'oracle', 'sqlserver', 'mongodb', 'db2', 'postgres'].includes(databaseType)) return
      this.show = false
      this.$router.push({
        name: 'ConnectionCreate',
        query: {
          // step: this.step,
          databaseType: databaseType
        }
      })
      //检测agent 是否可用
      // this.$axios
      // 	.get('tm/api/Workers//availableAgent')
      // 	.then(res => {
      // 		if (!res.result || res.result.length === 0) {
      // 			this.$message.error('Agent当前状态异常无法创建连接，请检查')
      // 		} else {
      // 			this.show = false
      // 			this.$router.push({
      // 				name: 'ConnectionCreate',
      // 				query: {
      // 					step: this.step,
      // 					databaseType: databaseType
      // 				}
      // 			})
      // 		}
      // 	})
      // 	.catch(error => {
      // 		console.log('error', error)
      // 	})
    },
    goCreateTask() {
      this.show = false
      this.$router.push({
        name: 'DataflowCreate'
      })
    },
    goDashboard() {
      this.show = false
      this.$router.push({ name: 'Home' })
    },
    goDataFlowList() {
      this.show = false
      this.$router.push({
        name: 'Task'
      })
    },
    changeStep() {
      this.$nextTick(() => {
        let self = this
        window.noviceGuideChange = item => {
          self.step = item.step
          self.show = item.visible
        }
      })
    },
    // 通过key，查找该项在列表中的索引index
    getListIndexByKey(key) {
      let index
      this.list.forEach((el, i) => {
        if (el.key === key) {
          index = i
          return index
        }
      })
      return index
    },
    mergeObj(a, b) {
      return Object.assign({}, a, b)
    }
  }
}
</script>
<style lang="scss" scoped>
.guide-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  .dialog-header {
    font-size: 20px;
    font-weight: 700;
    color: #232325;
  }
  .desc-container {
    margin: 0 auto 0;
    background: #3370ff;
    box-shadow: 1px 1px 3px #334b83;
    color: #ffffff;
    font-size: 16px;
  }
  .footer-content-container {
    font-size: 15px;
    font-weight: 400;
    color: #232325;
    line-height: 21px;
  }
  .btn-item {
    position: relative;
    width: 135px;
  }
  .el-button {
    height: 34px;
    background: #2c65ff;
    border-radius: 8px;
    color: #fff;
  }
  .text-section {
    text-align: left;
    line-height: 26px;
  }
  .img-list {
    .img-box {
      position: relative;
      &.active {
        background: #d8e4ff;
        border: 1px solid #3370ff;
      }
      > img {
        display: inline-block;
        vertical-align: middle;
        &.large {
          width: 100%;
        }
      }
      .img-btn {
        width: 100%;
        &:hover {
          background-color: #0b3fc9;
        }
      }
    }
    .mask {
      margin: -1px;
      font-size: 13px;
      background: rgba(0, 0, 0, 0.4);
      .mask-text {
        opacity: 0;
        color: #fff;
        font-weight: bold;
      }
      &:hover {
        .mask-text {
          opacity: 1;
        }
      }
    }
  }
  .btn-list {
    display: flex;
    justify-content: center;
    //text-align: center;
    .el-button {
      width: 100%;
      &.prev-btn {
        width: 135px;
        border: 2px solid #3370ff;
        background-color: #fff;
        color: #3370ff;
      }
    }
  }
}
</style>
<style lang="scss">
.novice-guide-dialog {
  min-width: 1000px;
  .el-dialog__header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
  }
  .el-dialog__body {
    position: relative;
    padding-bottom: 48%;
    text-align: center;
  }
}
</style>
