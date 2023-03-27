<template>
  <ElDialog
    width="980px"
    append-to-body
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div slot="title" class="mb-6 font-color-dark fs-3 fw-bold">{{ options.title }}</div>
    <p class="mt-n10 mb-4 font-color-sslight">{{ options.desc }}</p>

    <VTable
      :columns="options.columns"
      :remoteMethod="options.remoteMethod"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      :has-pagination="false"
      ref="table"
      class="mt-4 v-table"
    >
    </VTable>

    <span slot="footer" class="dialog-footer">
      <ElButton size="mini" type="primary" @click="submit">订阅</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import { tcmApi } from '@tap/api'
import { VTable } from '@tap/component'

export default {
  name: 'SelectList',

  components: { VTable },

  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'code'
    }
  },

  data() {
    return {
      visible: false,
      map: {
        code: {
          title: '选择授权码?',
          desc: '授权码是在阿里云市场购买生成的授权码',
          columns: [
            {
              type: 'selection'
            },
            {
              label: '授权码',
              prop: 'licenseCode'
            },
            {
              label: '有效期',
              prop: 'expiredTime',
              dataType: 'time'
            },
            {
              label: '实例规格',
              prop: 'extendArray'
            },
            {
              label: '绑定实例状态',
              prop: 'licenseStatus'
            }
          ]
        },
        order: {
          title: '选择订阅？',
          desc: '可以选择已有未使用的订阅创建实例，可以创建新订阅选择更多规格',
          columns: [
            {
              type: 'selection'
            },
            {
              label: '授权码',
              prop: 'productName'
            },
            {
              label: '有效期',
              prop: 'activateTime',
              dataType: 'time'
            },
            {
              label: '实例规格',
              prop: 'extendArray'
            },
            {
              label: '绑定实例状态',
              prop: 'licenseStatus'
            }
          ]
        }
      }
    }
  },

  computed: {
    options() {
      return Object.assign(this.map[this.type], {
        remoteMethod: this.type === 'code' ? this.codeRemoteMethod : this.orderRemoteMethod
      })
    }
  },

  watch: {
    value(v) {
      this.visible = v
      v && this.init()
    }
  },

  methods: {
    init() {},

    codeRemoteMethod() {
      return this.$axios.get('api/tcm/aliyun/market/license/available').then(data => {
        return {
          total: data.length,
          data: data || []
        }
      })
    },

    orderRemoteMethod() {
      return this.$axios.get('api/tcm/paid/subscriptions/available').then(data => {
        return {
          total: data.length,
          data: data || []
        }
      })
    },

    handleCancel() {
      this.visible = false
      this.$emit('input', this.visible)
    },

    submit() {
      console.log('submit')
    }
  }
}
</script>

<style lang="scss" scoped>
.v-table {
  height: 400px;
}
</style>
