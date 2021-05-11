<template>
  <div class="logminer">
    <!-- <div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div> -->

    <el-form
      ref="model"
      :model="model"
      label-position="top"
      label-width="200px"
      :disabled="disabled"
    >
      <el-col :span="21" class="aggregateName">
        <el-form-item :label="$t('dataFlow.nodeName')" required>
          <el-input
            v-model="model.name"
            maxlength="20"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-col>
      <el-row :gutter="30">
        <el-col :span="11">
          <el-form-item
            :label="$t('editor.cell.data_node.logminer.miningLogTime')"
            required
          >
            <!-- <el-tooltip placement="left-start">
							<span>111111</span>
						</el-tooltip> -->
            <el-popover
              class="aggtip"
              placement="top-start"
              width="400"
              trigger="hover"
            >
              <ul>
                <li style="word-break: keep-all">
                  {{ $t('dataFlow.SyncInfo.localTZ') }}
                </li>
                <li style="word-break: keep-all">
                  {{ $t('dataFlow.SyncInfo.connTZ') }}
                </li>
                <li style="word-break: keep-all">
                  {{ $t('dataFlow.SyncInfo.current') }}
                </li>
              </ul>
              <span class="icon iconfont icon-tishi1" slot="reference"></span>
            </el-popover>
            <el-select v-model="model.syncPoint.type" @change="changeTimeZone">
              <el-option
                v-for="item in timeZoneList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item style="margin-top: 26px">
            <el-date-picker
              format="yyyy-MM-dd HH:mm:ss"
              v-model="model.syncPoint.date"
              type="datetime"
              :disabled="model.syncPoint.type === 'current'"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-col :span="21" class="aggregateName">
        <el-form-item
          :label="'Oracle' + $t('editor.cell.data_node.logminer.logSaveTime')"
          required
        >
          <el-select
            v-model="model.logTtl"
            @change="changeAggFunction(item, index)"
          >
            <el-option
              v-for="item in logSaveList"
              :key="item"
              :label="item + $t('editor.cell.data_node.logminer.day')"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-row
        :gutter="20"
        class="loopFrom"
        v-for="(item, index) in model.logCollectorSettings"
        :key="index"
      >
        <el-col :span="21" class="fromLoopBox">
          <el-form-item
            :label="$t('editor.cell.data_node.logminer.logSourceSetting')"
            :prop="'logCollectorSettings.' + index + '.connectionId'"
            required
          >
            <el-select
              v-model="item.connectionId"
              filterable
              :placeholder="
                $t('editor.cell.data_node.logminer.tableFilter.placeSletSource')
              "
              @change="changeConnectionId(item)"
            >
              <el-option
                v-for="(item, index) in connectionList"
                :key="index"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :prop="'logCollectorSettings.' + index + '.selectType'"
            required
          >
            <el-select v-model="item.selectType">
              <el-option
                v-for="item in tableTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="item.selectType !== 'allTables'"
            :prop="'logCollectorSettings.' + index + '.selectTables'"
            required
          >
            <MultiSelection
              v-model="item.selectTables"
              :showCopyBtn="false"
              :options="item.includeTablesList"
              :placeholder="
                item.selectType === 'reservationTable'
                  ? $t('editor.cell.data_node.logminer.tableFilter.tableFilter')
                  : $t(
                      'editor.cell.data_node.logminer.tableFilter.placeholderDelete'
                    )
              "
              @change="changeIncludeTables(item)"
            ></MultiSelection>
          </el-form-item>
        </el-col>
        <el-col :span="2" class="right">
          <span
            @click="removeRow(item, index)"
            class="iconfont icon-quxiao remove"
          ></span>
        </el-col>
      </el-row>
      <el-form-item class="btnClass">
        <el-button @click="addRow"
          >+ {{ $t('editor.cell.data_node.logminer.add') }}</el-button
        >
      </el-form-item>
    </el-form>
    <div class="functionDescription">
      <h3>{{ $t('editor.cell.data_node.logminer.nodeFunDes') }}</h3>
      <el-row :gutter="5" class="e-row">
        <el-col :span="4"
          >{{ $t('editor.cell.data_node.logminer.function') }}:</el-col
        >
        <el-col :span="20">{{
          $t('editor.cell.data_node.logminer.functionContent')
        }}</el-col>
      </el-row>
      <el-row :gutter="5" class="e-row">
        <el-col :span="4"
          >{{ $t('editor.cell.data_node.logminer.connectionTarget') }}:</el-col
        >
        <el-col :span="20">{{
          $t('editor.cell.data_node.logminer.connectionText')
        }}</el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import log from '../../../log'
import factory from '../../../api/factory'
import MultiSelection from '../../../components/MultiSelection'

let connectionApi = factory('connections')

// let editorMonitor = null;
let tempSchemas = []
export default {
  name: 'Aggregate',
  components: {
    MultiSelection
  },
  data() {
    return {
      model: {
        connectionId: '',
        name: '',
        logTtl: 0,
        syncPoint: {},
        // date: '',
        // timezone: '',
        // type: '',
        logCollectorSettings: [
          {
            connectionId: '',
            selectType: '',
            includeTables: [], // 保留表
            selectTables: '', // 排除表
            includeTablesList: [] // 表数组
          }
        ]
      },
      disabled: false,
      connectionList: [], // 连接数组

      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      timeZoneList: [
        {
          label: this.$t('dataFlow.SyncInfo.localTZType'),
          value: 'localTZ'
        },
        {
          label: this.$t('dataFlow.SyncInfo.connTZType'),
          value: 'connTZ'
        },
        {
          label: this.$t('dataFlow.SyncInfo.currentType'),
          value: 'current'
        }
      ],
      tableTypeList: [
        {
          label: this.$t('editor.cell.data_node.logminer.allTables'),
          value: 'allTables'
        },
        {
          label: this.$t('editor.cell.data_node.logminer.reservationTable'),
          value: 'reservationTable'
        },
        {
          label: this.$t('editor.cell.data_node.logminer.exclusionTable'),
          value: 'exclusionTable'
        }
      ]
    }
  },
  async mounted() {
    await this.loadDataSource()
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    }
  },

  methods: {
    /**改变时区**/
    changeTimeZone(val) {
      if (val === 'connTZ') {
        this.model.syncPoint.timezone = ''
      } else {
        let timeZone = new Date().getTimezoneOffset() / 60
        if (timeZone > 0) {
          this.model.syncPoint.timezone = 0 - timeZone
        } else {
          this.model.syncPoint.timezone = '+' + -timeZone
        }
      }
      if (this.model.syncPoint.type === 'current') {
        this.model.syncPoint.date = ''
      } else {
        this.model.syncPoint.date = this.model.syncPoint.date
          ? this.model.syncPoint.date
          : this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
    },

    /**改变表类型**/
    changeTableType(data) {
      this.changeIncludeTables(data)
    },

    /**改变连接**/
    changeConnectionId(data) {
      this.loadDataModels([data.connectionId])
      let arr = []
      this.model.logCollectorSettings.forEach(item => {
        arr.push(item.connectionId)
      })
      if (new Set(arr).size !== arr.length) {
        data.connectionId = ''
        this.$message.error(
          this.$t('editor.cell.data_node.logminer.validate.sameConnection')
        )
      }
    },

    /**获取表数据**/
    changeIncludeTables(data) {
      let includeArr = []
      let selectTables = data.selectTables.split(',') || []
      if (data.selectType === 'exclusionTable') {
        includeArr = data.includeTablesList.filter(item => {
          return selectTables.indexOf(item) == -1
        })
        data.includeTables = includeArr
      } else if (data.selectType === 'reservationTable') {
        data.includeTables = selectTables
      } else {
        data.includeTables = data.includeTablesList
        data.selectTables = ''
      }
    },

    /**获取连接信息**/
    async loadDataSource() {
      // this.databaseSelectConfig.loading = true;
      let result = await connectionApi.get({
        filter: JSON.stringify({
          where: {
            database_type: { in: ['oracle'] }
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1
          }
        })
      })

      // this.databaseSelectConfig.loading = false;
      if (result.data) {
        this.connectionList = result.data.map(item => {
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} (${item.status})`,
            value: item.id
          }
        })
      }
    },

    /**获取连接表**/
    loadDataModels(ids) {
      if (!ids || !ids.length) {
        return
      }
      let self = this,
        includeTablesList = []

      connectionApi.get(ids).then(result => {
        if (result.data) {
          let schemas = (result.data.schema && result.data.schema.tables) || []
          if (schemas.length) {
            tempSchemas = schemas.sort((t1, t2) =>
              t1.table_name > t2.table_name
                ? 1
                : t1.table_name === t2.table_name
                ? 0
                : -1
            )
            tempSchemas.forEach(item => {
              includeTablesList.push(item.table_name)
            })
            // self.includeTablesList = [...new Set(self.includeTablesList)];
            self.model.logCollectorSettings.forEach(i => {
              if (i.connectionId === ids[0]) {
                i.includeTablesList = includeTablesList
                if (i.selectType === 'allTables') {
                  i.includeTables = i.includeTablesList
                }
              }
            })
          }
        }
      })
    },

    addRow() {
      let list = {
        connectionId: '',
        selectType: 'allTables',
        includeTables: [],
        selectTables: '',
        includeTablesList: []
      }
      this.model.logCollectorSettings.push(list)
      // this.changeAggFunction(list);
      log('length', this.model.logCollectorSettings.length)
    },

    removeRow(item, index) {
      this.index = this.model.logCollectorSettings.indexOf(item)
      if (index !== -1) {
        this.model.logCollectorSettings.splice(index, 1)
      }
    },

    handleForceUpdate() {
      this.$forceUpdate()
    },

    setData(data) {
      let timeZone = new Date().getTimezoneOffset() / 60
      if (timeZone > 0) {
        timeZone = 0 - timeZone
      } else {
        timeZone = '+' + -timeZone
      }
      this.model = {
        name: 'Oracle' + this.$t('editor.cell.data_node.logminer.name'),
        syncPoint: {
          type: 'localTZ',
          timezone: timeZone,
          date: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        },
        logTtl: 3,
        logCollectorSettings: [
          {
            connectionId: '',
            selectType: 'allTables',
            includeTables: [],
            selectTables: '',
            includeTablesList: []
          }
        ]
      }
      // let self = this;
      if (data) {
        _.merge(this.model, data)
        if (this.model.syncPoint.type === 'current') {
          this.model.syncPoint.date = ''
        }

        this.model.connectionId = this.model.logCollectorSettings[0]
          .connectionId
          ? this.model.logCollectorSettings[0].connectionId
          : ''
        this.model.logCollectorSettings.map((item, index) => {
          if (item.selectType === 'exclusionTable') {
            item.selectTables = item.includeTablesList
              .filter(table => {
                return item.includeTables.indexOf(table) == -1
              })
              .join(',')
          }
          this.$set(this.model.logCollectorSettings, index, item)
        })
      }

      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      let result = _.cloneDeep(this.model)
      result.connectionId = result.logCollectorSettings[0].connectionId
        ? result.logCollectorSettings[0].connectionId
        : ''
      this.model.syncPoint.date = result.syncPoint.date
        ? this.$moment(result.syncPoint.date).format('YYYY-MM-DD HH:mm:ss')
        : ''
      return result
    },

    setDisabled(disabled) {
      this.disabled = disabled
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>

<style scoped lang="scss">
.logminer {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
  box-sizing: border-box;
  background-color: #fafafa;

  .loopFrom {
    margin: 0 !important;

    .fromLoopBox {
      padding: 10px;
      margin-bottom: 12px;
      box-sizing: border-box;
      background-color: #fff;
      border: 1px solid #dedee4;
    }

    .remove {
      font-weight: bold;
      cursor: pointer;
      border: 1px solid #dedee4;
    }
  }
  .functionDescription {
    padding-top: 30px;
    font-size: 12px;
    color: #aaa;
    h3 {
      padding-bottom: 12px;
    }
    .e-row {
      padding-bottom: 5px;
    }
  }
  .flex-block {
    padding-bottom: 10px;
  }
}
</style>
<style lang="scss">
.logminer {
  .aggtip {
    position: absolute;
    top: -34px;
    left: 120px;
    .iconfont {
      display: inline-block;
      color: #999;
      cursor: pointer;
      transform: rotate(-180deg);
    }
  }
  .aggtips {
    padding-left: 12px;
    .iconfont {
      display: inline-block;
      color: #999;
      cursor: pointer;
      transform: rotate(-180deg);
    }
  }
  .el-form--label-top .el-form-item__label {
    padding: 0;
    line-height: 26px;
  }

  .el-select {
    width: 100%;
  }

  .el-form-item {
    margin-bottom: 0;
    .el-form-item__label,
    .el-input__inner {
      font-size: 12px;
    }
    .el-input__inner {
      height: 30px;
      line-height: 30px;
    }
  }

  .aggregateName .el-form-item__content {
    z-index: 2;
  }

  .el-form-item__content {
    .el-button {
      padding: 8px 15px;
      font-size: 12px;
    }
    .el-input__inner[style='height: 40px;'] {
      height: 30px !important;
    }
  }
  .btnClass .el-form-item__content {
    line-height: 30px !important;
  }
}
</style>
