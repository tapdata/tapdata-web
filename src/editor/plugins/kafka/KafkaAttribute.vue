<template>
  <div class="kafkaNode nodeStyle">
    <head>
      <span class="headIcon iconfont icon-you2" type="primary"></span>
      <span class="txt">{{ $t('editor.nodeSettings') }}</span>
    </head>
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form
        class="e-form"
        label-position="top"
        :model="model"
        ref="form"
        :disabled="disabled"
      >
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item
          :label="$t('editor.choose') + ' kafka'"
          prop="connectionId"
          :rules="rules"
          required
        >
          <el-select
            :filterable="!databaseLoading"
            :loading="databaseLoading"
            v-model="model.connectionId"
            :placeholder="$t('message.placeholderSelect') + 'kafka'"
          >
            <el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${
                $t('connection.status.' + item.status) || item.status
              })`"
              :value="item.id"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('editor.cell.data_node.table.form.table.label')"
          prop="tableName"
          :rules="rules"
          required
        >
          <div class="flex-block">
            <!-- <FbSelect class="e-select" v-model="model.tableName" :config="schemaSelectConfig"></FbSelect> -->
            <el-select
              v-model="model.tableName"
              :filterable="!schemasLoading"
              :loading="schemasLoading"
              default-first-option
              clearable
              :placeholder="
                $t(
                  'editor.cell.data_node.collection.form.collection.placeholder'
                )
              "
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
      </el-form>
    </div>
    <div class="e-entity-wrap" style="text-align: center; overflow: auto">
      <el-button
        class="fr marR20"
        type="success"
        size="mini"
        v-if="model.connectionId && model.tableName"
        @click="hanlderLoadSchema"
      >
        <i class="el-icon-loading" v-if="reloadModelLoading"></i>
        <span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
        <span v-else>{{ $t('dataFlow.updateModel') }}</span>
      </el-button>
      <entity
        :schema="convertSchemaToTreeData(mergedSchema)"
        :editable="false"
      ></entity>
    </div>
    <el-dialog
      :title="$t('message.prompt')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="30%"
    >
      <span>{{ $t('editor.ui.nodeLoadSchemaDiaLog') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" size="mini" @click="confirmDialog">{{
          $t('message.confirm')
        }}</el-button>
      </span>
    </el-dialog>
    <CreateTable
      v-if="addtableFalg"
      :dialog="dialogData"
      @handleTable="getAddTableName"
    ></CreateTable>
  </div>
</template>
<script>
import _ from 'lodash'
import factory from '../../../api/factory'
import Entity from '../link/Entity'
import { convertSchemaToTreeData } from '../../util/Schema'
import ClipButton from '@/components/ClipButton'
import CreateTable from '@/components/dialog/createTable'

import ws from '@/api/ws'
const connections = factory('connections')

// let editorMonitor = null;
export default {
  name: 'ApiNode',
  components: { Entity, ClipButton, CreateTable },
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
        tableName: ''
        // primaryKeys: ''
      },
      schemasLoading: false,
      mergedSchema: null
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
            let schema = this.schemas.filter(
              s => s.table_name === this.model.tableName
            )
            schema =
              schema && schema.length > 0
                ? schema[0]
                : {
                    table_name: this.model.tableName,
                    cdc_enabled: true,
                    meta_type: 'kafka',
                    fields: []
                  }
            this.$emit('schemaChange', _.cloneDeep(schema))
            this.mergedSchema = schema
          }
        }
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
            let schemas =
              (result.data.schema && result.data.schema.tables) || []
            schemas = schemas.sort((t1, t2) =>
              t1.table_name > t2.table_name
                ? 1
                : t1.table_name === t2.table_name
                ? 0
                : -1
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

    setData(data, cell) {
      if (data) {
        _.merge(this.model, data)
      }
      this.mergedSchema = cell.getOutputSchema()
      cell.on('change:outputSchema', () => {
        this.mergedSchema = cell.getOutputSchema()
      })

      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      let result = _.cloneDeep(this.model)
      result.name = result.tableName || 'Kafka'
      return result
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
            if (
              item.connId === this.model.connectionId &&
              item.tableName === this.model.tableName
            ) {
              schema = item.schema
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
