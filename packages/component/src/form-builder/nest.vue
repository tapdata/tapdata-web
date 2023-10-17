<script>
import * as Vue from 'vue'
import mixins from './mixin'
import TYPE_MAPPING from './constant'

export default {
  name: 'FbNest',
  mixins: [mixins],
  props: {
    value: [String, Array],
    config: {
      require: true,
      type: Object
    }
  },
  methods: {
    getNestItems(h, items, itemValues, values, level, removeFunc) {
      let limit = this.config.limit || 3
      let nestValues = itemValues.slice(items.length, itemValues.length)
      let nestEl = h('div', { class: 'fb-nest' }, [
        h('div', { class: 'fb-nest-header' }, [
          limit <= level
            ? null
            : h('ElButton', {
                style: {
                  height: '28px',
                  padding: '7px'
                },
                props: {
                  icon: 'el-icon-plus'
                },
                on: {
                  click: () => {
                    itemValues.push(items.map(() => ''))
                    this.on.input(values)
                  }
                }
              }),
          removeFunc
            ? h('ElButton', {
                style: {
                  marginLeft: '10px',
                  height: '28px',
                  padding: '7px'
                },
                props: {
                  icon: 'el-icon-minus'
                },
                on: {
                  click: () => {
                    removeFunc && removeFunc()
                    this.on.input(values)
                  }
                }
              })
            : null
        ]),
        h('div', { class: 'fb-nest-body' }, [
          ...items.map((it, index) =>
            h(TYPE_MAPPING[it.type], {
              class: 'fb-nest-item',
              props: {
                value: itemValues[index],
                config: it
              },
              on: Object.assign({}, this.on, {
                input: val => {
                  itemValues[index] = val
                  this.on.input(values)
                }
              })
            })
          ),
          ...nestValues.map((it, idx) => {
            return this.getNestItems(h, items, it, values, level + 1, () => {
              itemValues.splice(items.length + idx, 1)
            })
          })
        ])
      ])
      return nestEl
    }
  },
  render() {
    let config = this.config
    let values = this.value || config.items.map(() => '')
    return this.getNestItems(Vue.h, config.items, values, values, [])
  },
  emits: ['update:value']
}
</script>

<style lang="scss">
.fb-nest {
  padding: 0 10px 10px 10px;
  border: 1px solid #dedee4;
  margin-bottom: 10px;
}
.fb-nest-header {
  padding: 5px;
  text-align: right;
}
.fb-nest-item {
  padding: 5px 0;
}
</style>
