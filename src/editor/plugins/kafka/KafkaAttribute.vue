<template>
  <div class="kafkaNode nodeStyle">
    <head>
      <VIcon class="headIcon color-primary">arrow-right-circle</VIcon>
      <span class="txt">{{ $t('editor.nodeSettings') }}</span>
    </head>
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form class="e-form" label-position="top" :model="model" ref="form" :disabled="disabled">
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item :label="$t('editor.choose') + ' kafka'" prop="connectionId" :rules="rules" required>
          <el-select
            :filterable="!databaseLoading"
            :loading="databaseLoading"
            v-model="model.connectionId"
            :placeholder="$t('message.placeholderSelect') + 'kafka'"
            :clearable="true"
            @change="changeFnc"
          >
            <!--           -->
            <el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
              :value="item.id"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('metadata.details.theme')" prop="tableName" :rules="rules" required>
          <div class="flex-block">
            <!-- <FbSelect class="e-select" v-model="model.tableName" :config="schemaSelectConfig"></FbSelect> -->
            <el-select
              v-model="model.tableName"
              filterable
              :loading="schemasLoading"
              default-first-option
              clearable
              :placeholder="$t('message.placeholderSelect') + $t('metadata.details.theme')"
              size="mini"
            >
              <el-option
                v-for="(item, idx) in schemas"
                :label="`${item.table_name}`"
                :value="item.table_name"
                v-bind:key="idx"
              ></el-option>
            </el-select>
            <el-tooltip
              class="item"
              effect="light"
              popper-class=""
              :content="$t('dataForm.createTable')"
              placement="bottom-start"
            >
              <el-button
                size="mini"
                class="el-icon-plus"
                style="padding: 7px; margin-left: 7px"
                v-readonlybtn="'new_model_creation'"
                @click="addNewTable"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="light"
              popper-class="table-tooltips"
              :content="$t('dataForm.copyTable')"
              placement="bottom-start"
            >
              <div class="el-button" style="padding: 7px; margin-left: 7px">
                <ClipButton :value="model.tableName"></ClipButton>
              </div>
            </el-tooltip>
          </div>
        </el-form-item>

        <!-- <el-form-item
					:label="$t('editor.cell.data_node.collection.form.collection.label')"
					prop="tableName"
					required
				>
					<el-select
						v-model="model.tableName"
						:filterable="!schemasLoading"
						:loading="schemasLoading"
						allow-create
						default-first-option
						clearable
						:placeholder="$t('editor.cell.data_node.collection.form.collection.placeholder')"
						size="mini"
					>
						<el-option
							v-for="(item, idx) in schemas"
							:label="`${item.table_name}`"
							:value="item.table_name"
							v-bind:key="idx"
						></el-option>
					</el-select>
				</el-form-item> -->
        <!-- <el-form-item :label="$t('editor.cell.data_node.collection.form.pk.label')" prop="primaryKeys" required>
					<el-input
						v-model="model.primaryKeys"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
						size="mini"
					></el-input>
				</el-form-item> -->
        <!-- <el-form-item label="Partition ID" v-if="dataNodeInfo.isSource" prop="kafkaPartitionKey">
          <el-select
            v-model="model.partitionId"
            default-first-option
            clearable
            :placeholder="$t('message.placeholderSelect') + 'Partition ID'"
            size="mini"
          >
            <el-option
              v-for="(item, idx) in partitionSet"
              :label="`${item}`"
              :value="item"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item> -->

        <el-form-item
          v-if="dataNodeInfo.isTarget"
          :label="$t('dataForm.form.kafka.kafkaPartitionKey')"
          prop="kafkaPartitionKey"
        >
          <el-select
            v-model="model.kafkaPartitionKey"
            filterable
            :loading="schemasLoading"
            default-first-option
            clearable
            multiple
            allow-create
            :placeholder="$t('dataForm.form.kafka.kafkaPartitionKeyTip')"
            size="mini"
          >
            <el-option
              v-for="(item, idx) in tableList"
              :label="`${item.field_name}`"
              :value="item.field_name"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dag_data_node_label_kafka_high_performance_mode')" prop="performanceMode">
          <el-switch
            v-model="model.performanceMode"
            :active-text="model.performanceMode ? $t('dataFlow.yes') : $t('dataFlow.no')"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="Partition ID" v-if="dataNodeInfo.isSource" prop="partitionIdSet">
          <el-select
            v-model="model.partitionIdSet"
            default-first-option
            clearable
            :multiple="model.performanceMode"
            :disabled="model.performanceMode"
            :placeholder="$t('message.placeholderSelect') + 'Partition ID'"
            size="mini"
          >
            <el-option v-for="(item, idx) in partitionSet" :label="item" :value="item" v-bind:key="idx"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="e-entity-wrap" style="text-align: center; overflow: auto" v-if="model.connectionId && model.tableName">
      <el-button
        class="fr"
        type="success"
        size="mini"
        v-if="!dataNodeInfo.isTarget || !showFieldMapping"
        @click="hanlderLoadSchema"
      >
        <VIcon v-if="reloadModelLoading">loading-circle</VIcon>
        <span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
        <span v-else>{{ $t('dataFlow.updateModel') }}</span>
      </el-button>
      <FieldMapping
        v-else
        :dataFlow="dataFlow"
        :showBtn="true"
        :isFirst="model.isFirst"
        @update-first="returnModel"
        :hiddenFieldProcess="true"
        :stageId="stageId"
        ref="fieldMapping"
        class="fr"
      ></FieldMapping>
      <entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
    </div>
    <el-dialog :title="$t('message.prompt')" :visible.sync="dialogVisible" :close-on-click-modal="false" width="30%">
      <span>{{ $t('editor.ui.nodeLoadSchemaDiaLog') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" size="mini" @click="confirmDialog">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
    <CreateTable v-if="addtableFalg" :dialog="dialogData" @handleTable="getAddTableName"></CreateTable>
  </div>
</template>
<script>
import _ from 'lodash'
import factory from '../../../api/factory'
import Entity from '../link/Entity'
import { convertSchemaToTreeData } from '../../util/Schema'
import ClipButton from '@/components/ClipButton'
import CreateTable from '@/components/dialog/createTable'
import VIcon from '@/components/VIcon'
import FieldMapping from '@/components/FieldMapping'

import ws from '@/api/ws'
// import { ALLOW_FIELD_MAPPING } from '@/editor/constants'
const connections = factory('connections')
// let editorMonitor = null;
export default {
  name: 'ApiNode',
  components: { Entity, ClipButton, CreateTable, VIcon, FieldMapping },
  data() {
    return {
      disabled: false,
      databases: [],
      databaseLoading: false,
      reloadModelLoading: false,
      dialogVisible: false,
      addtableFalg: false,
      dialogData: null,
      schemas: [],
      tableList: [],
      partitionSet: [],
      rules: {
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.api.chooseApiName')
          }
        ],
        // primaryKeys: [
        // 	{
        // 		required: true,
        // 		trigger: 'blur',
        // 		message: this.$t('editor.cell.data_node.api.none_pk')
        // 	}
        // ],
        tableName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.api.none_collection')
          }
        ]
      },
      model: {
        connectionId: '',
        type: 'kafka',
        tableName: '',
        // partitionId: [],
        kafkaPartitionKey: '',
        isFirst: true,
        performanceMode: false,
        partitionIdSet: []
      },
      scope: '',
      dataFlow: '',
      stageId: '',
      showFieldMapping: false,
      schemasLoading: false,
      mergedSchema: null,
      dataNodeInfo: {}
    }
  },

  async mounted() {
    this.databaseLoading = true
    let result = await connections.get({
      filter: JSON.stringify({
        where: {
          database_type: 'kafka'
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          connection_type: 1,
          status: 1,
          schema: 1
        },
        order: 'name ASC'
      })
    })

    this.databaseLoading = false
    if (result.data) {
      this.databases = result.data
    }
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    },

    'model.connectionId': {
      immediate: true,
      handler() {
        this.loadDataModels(this.model.connectionId)
      }
    },
    'model.tableName': {
      immediate: true,
      handler() {
        if (this.schemas.length > 0) {
          if (this.model.tableName) {
            let schema = this.schemas.filter(s => s.table_name === this.model.tableName)
            schema =
              schema && schema.length > 0
                ? schema[0]
                : {
                    table_name: this.model.tableName,
                    cdc_enabled: true,
                    meta_type: 'kafka',
                    fields: [],
                    partitionSet: [-1]
                  }
            this.partitionSet = schema.partitionSet ? schema.partitionSet : []
            this.tableList = schema.fields ? schema.fields : []

            this.$emit('schemaChange', _.cloneDeep(schema))
            this.mergedSchema = schema
          }
        }
      }
    },
    'model.performanceMode': {
      immediate: true,
      handler(val) {
        this.model.partitionIdSet = val ? this.partitionSet : []
      }
    }
  },

  methods: {
    convertSchemaToTreeData,

    // 新建表弹窗
    addNewTable() {
      this.addtableFalg = true
      this.dialogData = {
        type: 'table',
        title: this.$t('dialog.createTable'),
        placeholder: this.$t('dialog.placeholderTable'),
        visible: this.addtableFalg
      }
    },

    // 获取新建表名称
    getAddTableName(val) {
      this.model.tableName = val
      this.mergedSchema = null
      let schema = {
        meta_type: 'table',
        table_name: val,
        fields: []
      }
      this.$emit('schemaChange', _.cloneDeep(schema))
    },

    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }
      let self = this
      this.schemasLoading = true
      connections
        .get([connectionId])
        .then(result => {
          if (result.data) {
            let schemas = (result.data.schema && result.data.schema.tables) || []
            schemas = schemas.sort((t1, t2) =>
              t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
            )
            self.schemas = schemas.filter(item => {
              if (item.table_name) {
                return item
              }
            })
          }
        })
        .finally(() => {
          this.schemasLoading = false
        })
    },

    setData(data, cell, dataNodeInfo, vueAdapter) {
      if (data) {
        if (!data.performanceMode) {
          data.partitionIdSet = data.partitionIdSet[0]
        }

        this.scope = vueAdapter?.editor?.scope
        this.stageId = cell.id
        this.getDataFlow()
        if (typeof data.kafkaPartitionKey === 'string') {
          if (!data.kafkaPartitionKey) {
            data.kafkaPartitionKey = []
          } else {
            data.kafkaPartitionKey = data.kafkaPartitionKey.split(',')
          }
        }
        _.merge(this.model, data)
        let param = {
          stages: this.dataFlow?.stages,
          stageId: this.stageId
        }
        this.$api('DataFlows')
          .tranModelVersionControl(param)
          .then(data => {
            this.showFieldMapping = data?.data[this.stageId]
          })
      }
      this.mergedSchema = cell.getOutputSchema()
      this.tableList = this.mergedSchema?.fields || []
      this.partitionSet = this.mergedSchema?.partitionSet || []

      cell.on('change:outputSchema', () => {
        this.mergedSchema = cell.getOutputSchema()
        this.getDataFlow()
      })
      this.dataNodeInfo = dataNodeInfo || {}
      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      let result = _.cloneDeep(this.model)
      result.name = result.tableName || 'Kafka'

      if (!result.performanceMode) {
        result.partitionIdSet = [result.partitionIdSet]
      }

      if (result.kafkaPartitionKey instanceof Array) {
        result.kafkaPartitionKey = result.kafkaPartitionKey.join(',')
      }
      return result
    },

    changeFnc() {
      this.model.tableName = ''
    },

    // 更新模型点击弹窗
    hanlderLoadSchema() {
      this.dialogVisible = true
    },

    // 确定更新模型弹窗
    confirmDialog() {
      this.reloadModelLoading = true
      let params = {
        type: 'reloadSchema',
        data: {
          tables: [
            {
              connId: this.model.connectionId,
              tableName: this.model.tableName
              // userId: this.$cookie.get('user_id')
            }
          ]
        }
      }

      ws.send(params)
      let self = this,
        schema = null,
        templeSchema = []

      ws.on('execute_load_schema_result', res => {
        if (res.status === 'SUCCESS' && res.result && res.result.length) {
          templeSchema = res.result
          this.reloadModelLoading = false
        } else {
          self.$message.error(this.$t('message.reloadSchemaError'))
        }
        this.reloadModelLoading = false
        if (templeSchema && templeSchema.length) {
          templeSchema.forEach(item => {
            if (item.connId === this.model.connectionId && item.tableName === this.model.tableName) {
              schema = item.schema
              this.partitionSet = item.partitionSet ? item.partitionSet : []
              this.tableList = item.fields ? item.fields : []
            }
          })
        }
        self.$nextTick(() => {
          if (schema) {
            self.$emit('schemaChange', _.cloneDeep(schema))
            this.mergedSchema = schema
            self.$message.success(this.$t('message.reloadSchemaSuccess'))
          }
        })
      })
      this.dialogVisible = false
    },

    setDisabled(disabled) {
      this.disabled = disabled
    },
    //获取dataFlow
    getDataFlow() {
      this.dataFlow = this.scope.getDataFlowData(true) //不校验
    },
    //接收是否第一次打开
    returnModel(value) {
      this.model.isFirst = value
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>
<style lang="scss">
.kafkaNode {
  .el-form-item {
    margin-bottom: 10px;
  }
  .flex-block {
    display: flex;
    align-items: center;
  }
  .marR20 {
    margin-right: 20px;
  }
}
</style>
