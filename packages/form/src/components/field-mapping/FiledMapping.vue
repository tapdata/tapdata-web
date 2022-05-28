<template>
  <div class="field-mapping flex flex-column">
    <div class="task-form-body">
      <div class="task-form-left flex flex-column">
        <div class="flex mb-2">
          <div class="flex">
            <ElInput
              v-model="searchTable"
              size="mini"
              placeholder="请输入表名"
              suffix-icon="el-icon-search"
              clearable
              @input="getMetadataTransformer(searchTable)"
            ></ElInput>
          </div>
        </div>
        <div class="mb-2 ml-6" v-if="progress.showProgress">
          {{ progress.finished }} / {{ progress.total }} <VIcon size="12">loading</VIcon
          ><span>{{ $t('dag_dialog_field_mapping_loading_schema') }}</span>
        </div>
        <ul class="task-form-left__ul flex flex-column" v-loading="loadingNav" v-if="navData.length > 0">
          <li
            v-for="(item, index) in navData"
            :key="index"
            :class="{ active: position === index }"
            @click="select(item, index)"
          >
            <div class="task-form__img" v-if="item.invalid">
              <img :src="fieldMapping_table_error" alt="" />
            </div>
            <div class="task-form__img" v-else>
              <img :src="fieldMapping_table" alt="" />
            </div>
            <div class="task-form-text-box">
              <OverflowTooltip
                class="w-100 text-truncate source"
                :text="item.sourceObjectName"
                placement="right"
                :open-delay="400"
              />
              <OverflowTooltip
                class="w-100 text-truncate target"
                :text="item.sinkObjectName"
                placement="right"
                :open-delay="400"
              />
              <div class="select">
                {{
                  `${$t('dag_dialog_field_mapping_selected')} ${
                    position === index ? fieldCount : item.sourceFieldCount - item.userDeletedNum
                  }/${item.sourceFieldCount}`
                }}
              </div>
            </div>
          </li>
        </ul>
        <div class="task-form-left__ul flex flex-column align-items-center" v-else>
          <div class="table__empty_img" style="margin-top: 40%"><img style="" :src="noData" /></div>
          <div class="noData">{{ $t('dag_dialog_field_mapping_no_data') }}</div>
        </div>
        <ElPagination
          small
          class="flex mt-3"
          layout="total, prev, slot, next"
          :page-count="3"
          :current-page.sync="page.current"
          :page-size.sync="page.size"
          :total="page.total"
          :pager-count="5"
          @current-change="getMetadataTransformer"
        >
          <div class="text-center">
            <span class="page__current" style="min-width: 22px">{{ page.current }}</span>
            <span class="icon-color" style="min-width: 22px">/</span>
            <span class="icon-color" style="min-width: 22px">{{ page.count }}</span>
          </div>
        </ElPagination>
      </div>
      <div class="main">
        <div class="flex mb-2 ml-2 text-start">
          <div class="flex align-items-center">
            <ElInput
              v-model="searchField"
              size="mini"
              placeholder="请输入字段名"
              suffix-icon="el-icon-search"
              clearable
              @input="search()"
            ></ElInput>
          </div>
          <div class="item ml-2">
            <ElButton plain class="btn-refresh" @click="rest()">
              <VIcon class="text-primary">refresh</VIcon>
            </ElButton>
            <ElButton plain class="btn-refresh" @click.stop="dialogVisible = true">
              <VIcon class="text-primary">edit-outline</VIcon>
            </ElButton>
          </div>
        </div>
        <ElTable
          class="field-mapping-table table-border"
          height="100%"
          border
          :data="viewTableData"
          v-loading="loadingTable"
        >
          <ElTableColumn show-overflow-tooltip :label="$t('dag_dialog_field_mapping_field')" prop="field_name">
            <template slot-scope="scope">
              <span v-if="scope.row.primary_key_position > 0" :show-overflow-tooltip="true"
                >{{ scope.row.field_name }}
                <VIcon size="12" class="color-darkorange">key</VIcon>
              </span>
              <span v-else class="item" :show-overflow-tooltip="true">{{ scope.row.field_name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('dag_dialog_field_mapping_type')"
            prop="data_type"
            :show-overflow-tooltip="true"
          ></ElTableColumn>
          <ElTableColumn :label="$t('meta_table_default')" prop="default_value"></ElTableColumn>
          <div class="field-mapping-table__empty" slot="empty">
            <div class="table__empty_img" style="margin-left: 32%"><img style="" :src="noData" /></div>
            <div class="noData">{{ $t('dag_dialog_field_mapping_no_data') }}</div>
          </div>
        </ElTable>
      </div>
    </div>
    <Dialog :visible.sync="dialogVisible" :dataFlow="dataFlow"></Dialog>
  </div>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import rollback from 'web-core/assets/icons/svg/rollback.svg'
import fieldMapping_table from 'web-core/assets/images/fieldMapping_table.png'
import noData from 'web-core/assets/images/noData.png'
import fieldMapping_table_error from 'web-core/assets/images/fieldMapping_table_error.png'
import refresh from 'web-core/assets/icons/svg/refresh.svg'
import { Task, MetadataTransformer, MetadataInstances } from '@tap/api'
import Dialog from './Dialog'

const taskApi = new Task()
const metadataTransformeApi = new MetadataTransformer()
const metadataInstancesApi = new MetadataInstances()

export default {
  name: 'FieldMappingDialog',
  components: { VIcon, Dialog, OverflowTooltip },
  data() {
    return {
      searchField: '',
      searchTable: '',
      loadingTable: true,
      loadingNav: true,
      dialogVisible: false,
      dataFlow: '',
      navData: [],
      viewTableData: [],
      typeMapping: [],
      position: 0,
      selectRow: '',
      fieldCount: '', //当前选中总数
      target: [],
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1
      },
      progress: {
        total: 0,
        finished: '0',
        progress: '0',
        showProgress: false
      },
      sourceTableName: 'tableName',
      rollback,
      fieldMapping_table,
      fieldMapping_table_error,
      refresh,
      noData
    }
  },
  mounted() {
    this.getMetaData()
    //接收数据
    let id = this.dataFlow.nodeId
    let self = this
    this.$ws.on('metadataTransformerProgress', function (res) {
      if (res?.data?.stageId === id) {
        let { finished, total, status } = res?.data
        self.progress.finished = finished
        self.progress.total = total
        self.page.total = finished
        self.page.count = Math.floor(finished / 10) === 0 ? 1 : Math.floor(finished / 10)
        if (status !== 'done') {
          self.progress.showProgress = true
          if (self.navData?.length < self.page.size && self.page.current === 1) {
            self.getMetadataTransformer()
          }
        } else {
          self.progress.showProgress = false
          self.getMetadataTransformer()
        }
      }
    })
  },
  methods: {
    getDataflowDataToSave() {
      const dag = this.$store.getters['dataflow/dag']
      const editVersion = this.$store.state.dataflow.editVersion
      let dataflow = this.$store.state.dataflow
      return {
        dag,
        editVersion,
        ...dataflow
      }
    },
    getDataFlow() {
      const data = this.getDataflowDataToSave()
      return data
    },
    /*
     * 模型推演
     * 新建任务，首次全部恢复默认
     * 过滤条件：当前目标节点 nodeId
     * 触发父组件：首次条件
     * */
    getMetaData() {
      //点击按钮重新拿值
      if (this.getDataFlow) {
        this.dataFlow = this.getDataFlow()
        this.dataFlow.id = this.dataFlow.id || this.dataFlow?.taskId
        this.dataFlow['syncType'] = 'migrate'
      }

      if (!this.dataFlow) return
      this.dataFlow['nodeId'] = this.dataFlow.activeNodeId //任务同步目标节点nodeId 推演

      let promise = taskApi.getMetadata(this.dataFlow)
      promise
        .then(() => {
          // this.getMetadataTransformer()
          this.initWSSed() //发送ws 监听schema进度
        })
        .finally(() => {
          this.loading = false
        })
    },
    getMetadataTransformer(value) {
      let { size, current } = this.page
      let id = this.dataFlow?.id
      let where = {
        dataFlowId: id,
        sinkNodeId: this.dataFlow['nodeId'] //todo 返回是否为sinkNodeId
      }
      if (value && current !== value) {
        let filterObj = { like: value, options: 'i' }
        where['or'] = [{ sinkQulifiedName: filterObj }, { sourceObjectName: filterObj }]
      }
      let filter = {
        where: where,
        limit: size || 10,
        skip: (current - 1) * size > 0 ? (current - 1) * size : 0
      }
      this.loadingNav = true
      metadataTransformeApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let { total, items } = res
          this.page.total = total
          this.page.count = Math.floor(total / 10) === 0 ? 1 : Math.floor(total / 10)
          this.navData = items
          //请求左侧table数据
          this.selectRow = items?.[0] || {}
          this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
          this.intiFieldMappingTableData(this.selectRow)
        })
        .finally(() => {
          this.loadingNav = false
          this.loadingTable = false
        })
    },
    search() {
      this.$nextTick(() => {
        const { delayTrigger } = this.$util
        delayTrigger(() => {
          if (this.searchField.trim()) {
            this.searchField = this.searchField.trim().toString() //去空格
            this.viewTableData = this.target.filter(v => {
              let str = (v.field_name + '' + v.field_name).toLowerCase()
              return str.indexOf(this.searchField.toLowerCase()) > -1
            })
          } else {
            this.viewTableData = this.target
          }
        }, 100)
      })
    },
    rest() {
      this.searchField = ''
      this.searchTable = ''
      this.getMetadataTransformer()
    },
    async intiFieldMappingTableData(row) {
      if (!row.sinkQulifiedName) return
      this.loadingTable = true
      let data = await metadataInstancesApi.originalData(row.sinkQulifiedName)
      this.target = data && data.length > 0 ? data[0].fields : []
      this.viewTableData = this.target
      this.loadingTable = false
    },
    /*切换表*/
    select(item, index) {
      this.position = '' //再次点击清空去一个样式
      this.searchField = ''
      this.fieldCount = 0
      this.selectRow = item
      this.fieldCount = item.sourceFieldCount - item.userDeletedNum || 0
      this.position = index
      this.intiFieldMappingTableData(this.selectRow)
    },
    //实时获取schema加载进度
    initWSSed() {
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let msg = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: id,
          stageId: this.dataFlow['nodeId']
        }
      }
      this.$ws.ready(() => {
        this.$ws.send(msg)
      }, true)

      //总任务
      let msgData = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: id
        }
      }
      this.$ws.ready(() => {
        this.$ws.send(msgData)
      }, true)
    }
  }
}
</script>

<style lang="scss">
.field-mapping {
  .el-table .delete-row {
    background: #f2f2f2;
  }
  .el-table .error-row {
    background: rgba(255, 0, 0, 0.3);
    color: #fff;
  }
  .el-table th {
    background: #f4f5f7;
  }
}
.field-mapping-data-type {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}
</style>
<style scoped lang="scss">
.field-mapping {
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon {
    color: #6dc5e8;
  }
  .icon-error {
    color: red;
  }
  .icon-color {
    color: map-get($iconFillColor, normal);
  }
  .page__current {
    width: 22px;
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: map-get($color, primary);
    line-height: 22px;
    background-color: map-get($bgColor, pageCount);
  }
  .task-form__text {
    display: inline-block;
    width: 130px;
    text-align: left;
  }
  .table__empty_img {
    width: 80px;
    height: 80px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .noData {
    font-size: 12px;
    color: map-get($bgColor, special);
  }
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    min-width: 32px;
    font-size: 16px;
    &:hover,
    &.is-plain:focus:hover {
      border-color: map-get($color, primary);
      background-color: map-get($color, disable);
    }
  }
  .task-form-body {
    display: flex;
    flex: 1;
    height: 0;
    min-height: 350px;
    max-height: 350px;
    .task-form-left__ul {
      flex: 1;
      border-top: 1px solid map-get($borderColor, light);
      border-right: 1px solid map-get($borderColor, light);
      max-width: 190px;
      overflow-x: hidden;
      overflow-y: auto;
      li {
        background: map-get($color, white);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        border-bottom: 1px solid map-get($borderColor, light);
        display: flex;
        padding: 16px 0 10px 10px;
        &:hover {
          background: rgba(44, 101, 255, 0.05);
          cursor: pointer;
          border-left: 2px solid map-get($color, primary);
        }
        &.active {
          background: rgba(44, 101, 255, 0.05);
          border-left: 2px solid map-get($color, primary);
          cursor: pointer;
        }
        .task-form__img {
          width: 25px;
          height: 31px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .task-form-text-box {
          margin-left: 16px;
          width: 128px;
          .source {
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            line-height: 10px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .target {
            font-size: 12px;
            font-weight: 400;
            color: #ef9868;
            line-height: 10px;
            margin-top: 13px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .select {
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            line-height: 17px;
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }

    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
      flex-direction: column;
    }
    .color-darkorange {
      color: darkorange;
    }
    .field-mapping-table__default_value {
      display: inline-block;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 9px;
    }
  }
}
::v-deep {
  .field-maping-table-dialog {
    .table-box {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .table-form {
        width: 56%;
        .el-form-item {
          margin-bottom: 12px;
        }
        .tip {
          padding-left: 40px;
        }
      }
      .table-example {
        width: 36%;
        h3 {
          padding-bottom: 20px;
        }
        p {
          padding-bottom: 10px;
        }
      }
    }
  }
}
</style>
