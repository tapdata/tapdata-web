<template>
  <div class="paper-scroller" @mouseup="mouseUp">
    <div class="paper-scroller-background" :style="scrollerBgStyle">
      <div ref="paper" class="paper" :style="paperStyle">
        <div class="paper-content-translate">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/util'
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'PaperScroller',

  props: ['eventBus'],

  data() {
    return {
      options: {
        width: 800,
        height: 800
      },
      visibleArea: {
        width: 0,
        height: 0
      },
      translate: {
        x: 0,
        y: 0
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', ['getCtor']),

    scrollerBgStyle() {
      let paper = this.paperStyle
      return {
        width: parseInt(paper.left) * 2 + parseInt(paper.width) + 'px',
        height: parseInt(paper.top) * 2 + parseInt(paper.height) + 'px'
      }
    },
    paperOffset() {
      return {
        left: this.visibleArea.width - 50,
        top: this.visibleArea.height - 50
      }
    },
    paperStyle() {
      return {
        left: this.paperOffset.left + 'px',
        top: this.paperOffset.top + 'px',
        width: this.options.width + 'px',
        height: this.options.height + 'px'
      }
    }
  },

  created() {
    this.bindEvent()
  },

  async mounted() {
    this.initVisibleArea()
    await this.$nextTick()
    this.center()
  },

  destroyed() {
    this.offEvent()
  },

  methods: {
    ...mapMutations('dataflow', ['addNode']),

    bindEvent() {
      this.eventBus.$on('drop-node', (item, position) => {
        const bound = this.$refs.paper.getBoundingClientRect()
        console.log('bound', bound)
        let [x, y] = position
        x -= bound.x
        y -= bound.y

        const Ctor = this.getCtor(item.constructor)
        const ins = new Ctor(item)
        const node = {
          id: uuid(),
          name: item.name,
          type: item.type,
          position: [x, y],
          ...ins.getExtraAttr() // 附加属性
        }

        Object.defineProperty(node, '__Ctor', {
          value: ins,
          enumerable: false
        })

        this.addNode(node)
      })
    },

    offEvent() {
      this.eventBus.$off('drop-node')
    },

    initVisibleArea() {
      this.visibleArea = {
        width: this.$el.clientWidth,
        height: this.$el.clientHeight
      }
    },

    center() {
      const paper = this.$refs.paper
      const scrollLeft = this.paperOffset.left - (this.visibleArea.width - paper.offsetWidth) / 2
      const scrollTop = this.paperOffset.top - (this.visibleArea.height - paper.offsetHeight) / 2
      this.$el.scrollLeft = scrollLeft
      this.$el.scrollTop = scrollTop
    },

    mouseUp() {
      console.log('mouseUp', arguments)
    }
  }
}
</script>

<style scoped lang="scss">
.paper-scroller {
  width: 100%;
  height: 100%;
  overflow: scroll;
  .paper-scroller-background {
    position: relative;
    .paper {
      position: absolute;
      background: linear-gradient(45deg, black, transparent);
    }
  }
}
</style>
