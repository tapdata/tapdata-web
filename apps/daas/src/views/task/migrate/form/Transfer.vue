<template>
  <section class="tapdata-transfer-wrap">
    <div class="reload-schema flex justify-content-between mb-5">
      <div class="text-wrap" style="width: 400px">
        {{ this.$t('task_form_no_table_available') }}
        <el-button
          class="border-0"
          type="text"
          :disabled="stateIsReadonly"
          :loading="reloadLoading"
          @click="reload()"
          >{{ this.$t('task_form_reload') }}</el-button
        >
        <span v-if="showProgress" class="ml-2"><VIcon>loading</VIcon> {{ progress }} %</span>
      </div>
      <div>
        <el-button class="mr-2" size="mini" @click="dialogTableVisible = true">{{
          $t('task_mapping_table_rename')
        }}</el-button>
        <el-button
          type="primary"
          class="mr-2"
          size="mini"
          :loading="loading"
          v-if="!transferData.showBtn"
          @click="getFieldMapping"
          >{{ $t('dag_link_button_field_mapping') }}</el-button
        >
        <FieldMapping
          v-if="showFieldMapping"
          ref="fieldMapping"
          class="fr"
          :transform="transferData"
          :getDataFlow="getTask"
          @update-first="returnModel"
          @returnPreFixSuffix="returnFieldMappingData"
          @returnFieldMapping="saveFieldProcess"
        ></FieldMapping>
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
        <span>{{ getTableLabel(option.label) }}</span>
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
        <span>{{ getTableLabel(option.label) }}</span>
      </template>
    </MqTransfer>
    <!-- E MQ穿梭框 -->
    <ConnectionTest ref="test"></ConnectionTest>
    <TableFieldFilter
      :visible.sync="dialogTableVisible"
      :transform="transferData"
      @save="handleTableName"
    ></TableFieldFilter>
  </section>
</template>

<script>
import VIcon from '@/components/VIcon'
import VirtualTransfer from 'web-core/components/virtual-transfer'
import MqTransfer from 'web-core/components/mq-transfer'
import TableFieldFilter from './TableFieldFilter'
import FieldMapping from '@tapdata/field-mapping'

export default {
  components: { VIcon, MqTransfer, VirtualTransfer, TableFieldFilter, FieldMapping },
  props: {
    transferData: Object,
    isTwoWay: Boolean,
    mqTransferFlag: Boolean,
    sourceId: String,
    getTask: Function,
    saveTask: Function
  },

  data() {
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      transferLoading: false,
      showOperationBtn: false,
      dialogTableVisible: false,
      sourceData: [],
      titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
      mqTitles: [this.$t('editor.cell.link.migrationObjece'), 'Topic', 'Queue'],
      type: '',
      progress: 0,
      showProgress: '',
      bidirectional: '',
      loadFieldsStatus: 'finished',
      reloadCount: 0,
      reloadLoading: false, // 重新加载
      loading: false,
      //字段映射
      showFieldMapping: true,
      taskId: ''
    }
  },
  mounted() {
    this.getTable(this.sourceId)
    this.tranModelVersionControl()
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
    //表改名（前缀，后缀，大小写）
    handleTableName(form) {
      this.transferData.tableNameTransform = form.tableNameTransform
      this.transferData.tablePrefix = form.tablePrefix
      this.transferData.tableSuffix = form.tableSuffix
      this.dialogTableVisible = false
    },

    // 穿梭框值改变的时候 (重命名 或者还原)
    handleChangeTransfer() {
      this.$emit('select-table')
    },
    //字段映射
    tranModelVersionControl() {
      let data = this.getTask()
      this.taskId = data.id
      if (this.taskId) {
        this.transferData.showBtn = true
      }
      //查找目标节点
      //是否显示字段推演
      let nodeId = data?.dag?.edges?.[0]?.target || ''
      let param = {
        nodes: data?.dag?.nodes,
        nodeId: nodeId
      }
      this.$api('Task')
        .tranModelVersionControl(param)
        .then(res => {
          this.showFieldMapping = res?.data[nodeId]
        })
    },
    //保存任务
    getFieldMapping() {
      this.loading = true
      this.saveTask().then(() => {
        this.$refs.fieldMapping.getMetaData()
        this.loading = false
      })
    },
    //接收是否第一次打开
    returnModel(value) {
      this.transferData.isFirst = value
    },
    // 字段处理器返回前后缀
    returnFieldMappingData(data) {
      this.transferData.fieldsNameTransform = data.fieldsNameTransform
      this.transferData.batchOperationList = data.batchOperationList
    },
    saveFieldProcess(data) {
      this.transferData.fieldProcess = data
    },
    //重新加载模型
    async reload() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      } else {
        let config = {
          title: this.$t('connection.reloadTittle'),
          Message: this.$t('connection.reloadMsg'),
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel')
        }
        this.confirm(
          () => {
            this.showProgress = true
            this.reloadLoading = true
            this.progress = 0
            this.reloadCount++
            this.testSchema()
          },
          () => {},
          config
        )
      }
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
    },
    //请求测试
    testSchema() {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading'
      }
      this.loadFieldsStatus = 'loading'
      this.$api('connections')
        .updateById(this.sourceId, parms)
        .then(res => {
          if (!this?.$refs?.test) {
            return
          }
          let data = res?.data
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          this.$refs.test.start(data, false, true)
          this.getProgress()
        })
    },
    getProgress() {
      this.$api('connections')
        .getNoSchema(this.sourceId)
        .then(res => {
          let data = res?.data
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.reloadLoading = false
              this.progress = 0 //加载完成
              this.getTable(this.sourceId) //更新schema
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            setTimeout(() => {
              if (this?.$refs?.test) {
                this.getProgress()
              }
            }, 1000)
          }
        })
        .catch(() => {
          this.$message.error('schema 加载失败')
          this.showProgress = false
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
