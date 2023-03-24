<template>
  <ElDialog
    width="980px"
    append-to-body
    custom-class="batch-field-type-maping-table-dialog"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div slot="title" class="mb-6 font-color-dark fs-3 fw-bold">选择授权码?</div>
    <p class="mt-n10 mb-4 font-color-sslight">授权码是在阿里云市场购买生成的授权码</p>

    <VTable
      :columns="columns"
      :remoteMethod="remoteMethod"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      :has-pagination="false"
      ref="table"
      height="100"
      class="mt-4"
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
    }
  },

  data() {
    return {
      visible: false,
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
  },

  watch: {
    value(v) {
      this.visible = v
      v && this.init()
    }
  },

  methods: {
    init() {},

    remoteMethod() {
      return tcmApi.licenseAvailable().then(data => {
        console.log('data', data)
        return {
          total: 0,
          data: []
        }
      })
    },

    handleCancel() {
      this.visible = false
      this.$emit('input', this.visible)
    },

    submit() {
      this.$refs.from.validate(valid => {
        if (!valid) return
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.recommend-item {
  border-radius: 10px 10px 10px 0;
  transform: translateY(-50%);
  left: -1px;
}

.packages-item {
  box-shadow: 0px 4px 4px rgba(29, 33, 41, 0.05);
  border-radius: 10px;
  border: 1px solid map-get($borderColor, light);
  &.active {
    border-color: map-get($color, primary);
  }
}

.el-select,
.el-input {
  width: 494px;
}
</style>
