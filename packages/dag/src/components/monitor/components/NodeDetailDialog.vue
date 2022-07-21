<template>
  <ElDialog
    title="节点详情"
    width="774px"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :append-to-body="true"
    @close="$emit('input', false)"
  >
    <div>
      <span>节点</span>
      <ElSelect v-model="selectNode">
        <ElOption v-for="(item, index) in nodeItems" :key="index" :label="item.label" :value="item.value"></ElOption>
      </ElSelect>
    </div>
    <div>
      <div>
        <div>事件统计</div>
        <EventChart :total="eventTotal" :xData="eventData"></EventChart>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import EventChart from './EventChart'
import { mapGetters } from 'vuex'

export default {
  name: 'NodeDetailDialog',

  components: { EventChart },

  props: {
    value: {
      type: Boolean,
      default: false
    },

    samples: {
      type: Object,
      default: () => {
        return {
          input: {
            inserted: 39,
            updated: 20,
            deleted: 10,
            ddl: 12,
            other: 50,
            total: 33
          },
          output: {
            inserted: 1,
            updated: 20,
            deleted: 10,
            ddl: 4,
            other: 6,
            total: 56
          }
        }
      }
    },
    nodeId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      visible: false,
      selectNode: '',
      // nodeItems: [
      //   {
      //     label: '源节点',
      //     value: ''
      //   },
      //   {
      //     label: '目标节点',
      //     value: ''
      //   },
      //   {
      //     label: '处理节点',
      //     value: ''
      //   }
      // ],
      eventData: [],
      eventTotal: null
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    nodeItems() {
      console.log('this', this.allNodes)
      return (
        this.allNodes.map(t => {
          return {
            label: t.name,
            value: t.id
          }
        }) || []
      )
    }
  },

  watch: {
    value(v) {
      this.visible = !!v
    },
    nodeId(v) {
      this.init()
    }
  },

  methods: {
    init() {
      this.loadEventData()
      this.selectNode = this.nodeId
    },

    loadEventData() {
      let re = [
        {
          label: '插入',
          key: 'inserted'
        },
        {
          label: '更新',
          key: 'updated'
        },
        {
          label: '删除',
          key: 'deleted'
        },
        {
          label: 'DDL',
          key: 'ddl'
        },
        {
          label: '其他',
          key: 'other'
        }
      ]
      const { input, output } = this.samples
      let inputTotal = 0
      let outputTotal = 0
      this.eventData = re.map(t => {
        inputTotal += input[t.key]
        outputTotal += output[t.key]
        return {
          label: t.label,
          value: [input[t.key], output[t.key]]
        }
      })
      this.eventTotal = [
        {
          label: '总输入',
          value: inputTotal
        },
        {
          label: '总输出',
          value: outputTotal
        }
      ]
    }
  }
}
</script>

<style scoped></style>
