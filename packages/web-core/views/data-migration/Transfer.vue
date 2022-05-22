<template>
  <section class="tapdata-transfer-wrap">
    <div class="reload-schema flex justify-content-between mb-5">
      <div class="text-wrap" style="width: 240px">
        {{ this.$t('task_form_no_table_available') }}
        <el-button class="border-0" type="text" :loading="reloadLoading" @click="reload()">{{
          this.$t('task_form_reload')
        }}</el-button>
        <span v-if="showProgress" class="ml-2"><VIcon>loading</VIcon> {{ progress }} %</span>
      </div>
    </div>

    <VirtualTransfer
      v-if="!mqTransferFlag"
      v-loading="transferLoading"
      v-model="transferData.selectSourceArr"
      :props="{ key: 'key' }"
      :item-size="30"
      :titles="titles"
      :filter-placeholder="$t('editor.cell.link.searchContent')"
      :data="sourceData"
      class="transfer-buttons-horizontal"
      filterable
      @change="handleChangeTransfer"
    >
      <template #right="{ option }">
        <span>
          <span>{{ transferData.table_prefix }}</span>
          <span>{{ option.label }}</span>
          <span>{{ transferData.table_suffix }}</span>
        </span>
      </template>
    </VirtualTransfer>

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
        <span>
          <span>{{ transferData.table_prefix }}</span>
          <span>{{ option.label }}</span>
          <span>{{ transferData.table_suffix }}</span>
        </span>
      </template>
    </MqTransfer>
    <!-- E MQ穿梭框 -->

    <ConnectionTest ref="test"></ConnectionTest>
  </section>
</template>

<script>
import VIcon from '@/components/VIcon'
import { VirtualTransfer } from '@tap/component'
import MqTransfer from 'web-core/components/mq-transfer'

export default {
  components: { VIcon, MqTransfer, VirtualTransfer },

  props: ['transferData', 'isTwoWay', 'mqTransferFlag'],

  data() {
    return {
      transferLoading: false,
      showOperationBtn: false,
      sourceData: [],
      titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
      mqTitles: [this.$t('editor.cell.link.migrationObjece'), 'Topic', 'Queue'],
      type: '',
      progress: 0,
      showProgress: '',
      sourceId: '',
      bidirectional: '',
      loadFieldsStatus: 'finished',
      reloadCount: 0,
      reloadLoading: false // 重新加载
    }
  },

  methods: {
    //获取左边数据
    getTable(id, bidirectional) {
      this.transferLoading = true
      this.sourceId = id
      this.bidirectional = bidirectional
      this.$axios
        .get(`tm/api/Connections/${id}/customQuery`, {
          params: { schema: true }
        })
        .then(data => {
          if (data) {
            this.loadFieldsStatus = data.loadFieldsStatus
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
                  disabled: this.disabled,
                  id: table.id
                }))
                .reduce((item, next) => {
                  obj[next.key] ? '' : (obj[next.key] = true && item.push(next))
                  return item
                }, [])
            }

            if (bidirectional && (this.transferData.table_prefix !== '' || this.transferData.table_suffix !== '')) {
              //true 表示 双向且有修改过前后缀
              this.transferData.table_prefix = ''
              this.transferData.table_suffix = ''
              this.transferData.selectSourceArr = []
            }
          }
        })
        .finally(() => {
          this.transferLoading = false
        })
    },

    // 穿梭框值改变的时候 (重命名 或者还原)
    handleChangeTransfer() {
      this.$emit('select-table')
    },

    //重新加载模型
    async reload() {
      this.$checkAgentStatus(() => {
        let config = {
          title: this.$t('connection.reloadTittle'),
          Message: this.$t('connection.reloadMsg'),
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
          id: this.sourceId
        }
        this.$confirm(config.Message + '?', config.title, {
          confirmButtonText: config.confirmButtonText,
          cancelButtonText: config.cancelButtonText,
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (resFlag) {
            this.showProgress = true
            this.reloadLoading = true
            this.progress = 0
            this.reloadCount++
            this.reloadApi('first')
          }
        })
      })
    },

    reloadApi(type) {
      let parms = {}
      if (type === 'first') {
        parms = {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        }
        this.loadFieldsStatus = 'loading'
      }
      this.$axios
        .patch('tm/api/Connections/' + this.sourceId, parms)
        .then(data => {
          if (type === 'first') {
            this.$refs.test.start(data, false, true)
          }
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            this.getTable(this.sourceId, this.bidirectional) //重新加载表
            setTimeout(() => {
              this.showProgress = false
              this.reloadLoading = false
              this.progress = 0 //加载完成
            }, 800)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            setTimeout(() => {
              this.reloadApi()
            }, 800)
          }
        })
        .catch(() => {
          this.$message.error(this.$t('task_form_reloadFail'))
          this.showProgress = false
          this.reloadLoading = false
          this.progress = 0 //加载完成
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
        flex-direction: row;
        padding: 0 16px;
        .el-transfer__button {
          margin-bottom: 0;
          & + .el-transfer__button {
            margin-left: 16px;
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
