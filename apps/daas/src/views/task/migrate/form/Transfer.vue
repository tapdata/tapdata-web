<template>
  <section class="tapdata-transfer-wrap">
    <TableSelector
      v-if="!mqTransferFlag"
      v-model="transferData.selectSourceArr"
      :connection-id="sourceId"
      @input="handleChangeTransfer"
    ></TableSelector>

    <!-- S MQ穿梭框 -->
    <MqTransfer
      v-else
      v-loading="transferLoading"
      :titles="mqTitles"
      :props="{ key: 'key' }"
      :item-size="30"
      :data="sourceData"
      :top-value.sync="transferData.topicData"
      :bottom-value.sync="transferData.queueData"
      :filter-placeholder="$t('editor.cell.link.searchContent')"
      filterable
      @change="handleChangeTransfer"
    >
      <template #right="{ option }">
        <span>{{ getTableLabel(option.label) }}</span>
      </template>
    </MqTransfer>
    <!-- E MQ穿梭框 -->
  </section>
</template>

<script>
import MqTransfer from 'web-core/components/mq-transfer'
import TableSelector from '@/components/table-selector'

export default {
  components: { MqTransfer, TableSelector },
  props: {
    transferData: Object,
    isTwoWay: Boolean,
    mqTransferFlag: Boolean,
    sourceId: String
  },

  data() {
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      transferLoading: false,
      showOperationBtn: false,
      sourceData: [],
      titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
      mqTitles: [this.$t('editor.cell.link.migrationObjece'), 'Topic', 'Queue'],
      type: '',
      bidirectional: ''
    }
  },
  mounted() {
    this.getTable(this.sourceId)
    if (!this.transferData.automaticallyCreateTables || this.stateIsReadonly) {
      this.transferData.mode = 'readOnly'
    } else this.transferData.mode = 'all'
  },

  methods: {
    //获取左边数据
    getTable(id, bidirectional) {
      this.transferLoading = true
      this.bidirectional = bidirectional
      this.$api('connections')
        .customQuery(id, { schema: true })
        .then(res => {
          if (res) {
            let data = res.data
            let tables = data?.schema?.tables || []
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
            )
            if (tables && tables.length) {
              let obj = {}
              this.sourceData = tables
                .map(table => ({
                  label: table.table_name,
                  key: table.table_name,
                  disabled: this.stateIsReadonly,
                  id: table.id
                }))
                .reduce((item, next) => {
                  obj[next.key] ? '' : (obj[next.key] = true && item.push(next))
                  return item
                }, [])
              //是否selectSourceArr在当前tables存在
              let arr = this.transferData.selectSourceArr
              if (arr?.length > 0) {
                this.transferData.selectSourceArr = tables
                  .filter(v => arr.some(s => v.table_name === s))
                  .map(r => r.table_name)
              }
            }

            if (bidirectional && (this.transferData.tablePrefix !== '' || this.transferData.tableSuffix !== '')) {
              //true 表示 双向且有修改过前后缀
              this.transferData.tablePrefix = ''
              this.transferData.tableSuffix = ''
              this.transferData.selectSourceArr = []
            }
          }
        })
        .finally(() => {
          this.transferLoading = false
        })
    },
    getTableLabel(label) {
      if (this.transferData.tableNameTransform === 'toUpperCase') {
        label = (this.transferData.tablePrefix + label + this.transferData.tableSuffix).toUpperCase()
      } else if (this.transferData.tableNameTransform === 'toLowerCase') {
        label = (this.transferData.tablePrefix + label + this.transferData.tableSuffix).toLowerCase()
      } else {
        label = (this.transferData.tablePrefix || '') + label + (this.transferData.tableSuffix || '')
      }
      return label
    },

    // 穿梭框值改变的时候 (重命名 或者还原)
    handleChangeTransfer() {
      this.$emit('select-table')
    },
    confirm(callback, catchCallback, config) {
      this.$confirm(config.Message + '?', config.title, {
        confirmButtonText: config.confirmButtonText,
        cancelButtonText: config.cancelButtonText,
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          callback()
        } else {
          catchCallback()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.tapdata-transfer-wrap {
  display: flex;
  flex-direction: column;

  .box-btn {
    display: flex;
    justify-content: flex-end;
    width: 88.5%;
    margin-bottom: 10px;
    padding: 4px 10px;
  }

  .tip {
    color: #999;
    font-size: 12px;
    margin-bottom: 10px;
  }
  .text-wrap {
    /*position: absolute;*/
    top: 68px;
    left: 120px;
    z-index: 1;
    height: 30px;
    line-height: 30px;
  }
  .field-transfer__icon {
    display: inline-block;
    margin-left: 15px;
  }
  ::v-deep {
    .transfer-buttons-horizontal {
      .el-transfer__buttons {
        flex-direction: column;
        padding: 0 16px;
        .el-transfer__button {
          width: 36px;
          min-width: 36px;
          margin-bottom: 0;
          & + .el-transfer__button {
            margin-top: 16px;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.tapdata-transfer-wrap {
  height: 100%;

  .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label {
    height: 30px;
    font-size: 12px;
    padding-right: 6px;
  }

  .el-transfer {
    flex: 1;
    overflow: hidden;
    .el-transfer-panel {
      width: 300px;

      .el-transfer-panel__body {
        padding-top: 0;
        .box {
          display: inline-block;

          .nameStyle {
            display: none;
            color: #48b6e2;
            float: right;
            font-size: 12px;
            padding-left: 10px;
          }

          .text {
            width: 230px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .el-transfer-panel__header {
        height: 28px;
        line-height: 28px;
        background: #f5f5f5;

        .el-checkbox {
          height: 28px;
          line-height: 28px;
        }
      }

      .el-transfer-panel__filter {
        margin: 10px;

        .el-input__inner {
          border-radius: 3px;
        }
      }

      .el-transfer__button {
        border-radius: 3px;
      }

      .el-transfer__button.is-disabled,
      .el-transfer__button.is-disabled:hover {
        background-color: #f5f5f5;
      }
    }

    .el-transfer-panel:nth-child(3) {
      .el-transfer-panel__body {
        .el-transfer-panel__item .el-checkbox__label:hover {
          .box .nameStyle {
            display: block;
          }

          .active {
            color: rgb(253, 176, 28);
          }
        }
      }
    }
  }

  .el-transfer-panel__item:hover {
    color: #666;
  }

  .transfer {
    height: calc(100% - 32px);
  }

  .el-transfer-panel__body {
    height: calc(100% - 80px);
  }

  .el-checkbox-group {
    height: calc(100% - 32px);
    padding-bottom: 5px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .el-transfer-panel__item {
    width: 100%;
    margin-right: 10px;
    box-sizing: border-box;
  }

  .el-transfer-panel__list.is-filterable {
    height: calc(100% - 38px);
  }
}
</style>
