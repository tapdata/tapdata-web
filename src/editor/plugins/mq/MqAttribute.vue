<template>
  <div class="mqNode nodeStyle">
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
          :label="$t('editor.cell.data_node.table.form.database.label')"
          prop="connectionId"
          :rules="rules"
          required
        >
          <div style="display: flex">
            <FbSelect
              v-model="model.connectionId"
              :config="databaseSelectConfig"
            ></FbSelect>
          </div>
        </el-form-item>

        <el-form-item
          :label="$t('editor.cell.data_node.table.form.table.label')"
          prop="tableName"
          required
        >
          <div class="flex-block">
            <FbSelect
              class="e-select"
              v-model="model.tableName"
              :config="schemaSelectConfig"
            ></FbSelect>
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
        <el-form-item
          v-if="mqType === '0'"
          :label="$t('editor.cell.data_node.mqTableType')"
          prop="table_type"
          required
        >
          <el-select
            v-model="model.table_type"
            placeholder="$t('editor.cell.data_node.mqTableTypeTip')"
          >
            <el-option label="topic" value="topic"> </el-option>
            <el-option label="queue" value="queue"> </el-option>
          </el-select>
        </el-form-item>
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
      <entity
        :schema="convertSchemaToTreeData(mergedSchema)"
        :editable="false"
      ></entity>
    </div>
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
import ClipButton from '@/components/ClipButton'
import CreateTable from '@/components/dialog/createTable'
import { convertSchemaToTreeData } from '../../util/Schema'
let connections = factory('connections')

// let editorMonitor = null;
export default {
  name: 'ApiNode',
  components: { Entity, ClipButton, CreateTable },
  data() {
    let self = this
    return {
      addtableFalg: false,
      dialogData: null,
      disabled: false,
      databases: [],
      databaseLoading: false,
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
        type: 'mq',
        tableName: '',
        table_type: 'topic'
        // primaryKeys: ''
      },
      mqType: '',
      databaseSelectConfig: {
        size: 'mini',
        placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
        loading: false,
        filterable: true,
        clearable: true,
        on: {
          change() {
            self.handlerConnectionChange()
          }
        },
        options: []
      },
      schemaSelectConfig: {
        size: 'mini',
        placeholder: this.$t(
          'editor.cell.data_node.table.form.table.placeholder'
        ),
        loading: false,
        filterable: true,
        options: [],
        allowCreate: false,
        defaultFirstOption: false,
        clearable: true
      },
      schemas: [],
      schemasLoading: false,
      mergedSchema: null
    }
  },

  async mounted() {
    this.databaseLoading = true
    let result = await connections.get({
      filter: JSON.stringify({
        where: {
          database_type: 'mq'
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          connection_type: 1,
          status: 1,
          schema: 1
        }
      })
    })

    this.databaseLoading = false
    if (result.data) {
      // this.databases = result.data
      this.databaseSelectConfig.options = result.data.map(item => {
        let statusName = this.$t(`connection.status.${item.status}`)
        return {
          id: item.id,
          name: item.name,
          database_type: item.database_type,
          label: `${item.name} (${statusName})`,
          value: item.id
        }
      })
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
        // 截取表类型
        let reg = /\([^\)]+\)/g
        let table_type = this.model.tableName.match(reg)[0]
        table_type = table_type.substring(1, table_type.length - 1)
        this.model.table_type = table_type

        if (this.schemas.length > 0) {
          if (this.model.tableName) {
            let schema = this.schemaSelectConfig.options.filter(
              s => s === this.model.tableName
            )
            schema =
              schema && schema.length > 0
                ? schema[0]
                : {
                    table_name: this.model.tableName,
                    cdc_enabled: true,
                    meta_type: 'mq',
                    fields: []
                  }

            this.$emit('schemaChange', _.cloneDeep(schema))
          }
        }
      }
    }
    // mergedSchema: {
    // 	handler() {
    // 		if (
    // 			!this.model.primaryKeys &&
    // 			this.mergedSchema &&
    // 			this.mergedSchema.fields &&
    // 			this.mergedSchema.fields.length > 0
    // 		) {
    // 			let primaryKeys = this.mergedSchema.fields
    // 				.filter(f => f.primary_key_position > 0)
    // 				.map(f => f.field_name);
    // 			let unique = {};
    // 			primaryKeys.forEach(key => (unique[key] = 1));
    // 			primaryKeys = Object.keys(unique);
    // 			if (primaryKeys.length > 0) this.model.primaryKeys = primaryKeys.join(',');
    // 		}
    // 	}
    // }
  },

  methods: {
    convertSchemaToTreeData,

    // 新建表弹窗
    addNewTable() {
      this.addtableFalg = true
      this.dialogData = {
        type: 'mq',
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
        meta_type: 'mq',
        table_name: this.model.tableName,
        fields: []
      }
      this.$emit('schemaChange', _.cloneDeep(schema))
    },

    // 获取表
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
            let schemas = []
            this.mqType = result.data.mqType
            if (this.mqType === '0') {
              result.data.mqQueueSet = result.data.mqQueueSet.map(
                item => item + '(queue)'
              )
              result.data.mqTopicSet = result.data.mqTopicSet.map(
                item => item + '(topic)'
              )
              let data = [...result.data.mqQueueSet, ...result.data.mqTopicSet]
              schemas = [...new Set(data)]
            } else if (this.mqType === '1') {
              schemas = result.data.mqQueueSet
            } else {
              schemas = result.data.mqTopicSet
            }
            schemas = schemas.sort((t1, t2) =>
              t1 > t2 ? 1 : t1 === t2 ? 0 : -1
            )
            self.schemas = schemas
            self.schemaSelectConfig.options = schemas.map(item => ({
              label: item,
              value: item
            }))
          }
        })
        .finally(() => {
          this.schemasLoading = false
        })
    },

    // 切换数据源清空表
    handlerConnectionChange() {
      this.model.tableName = ''
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
      result.name = result.tableName || 'Mq'
      // if (result.connectionId) {
      // 	let database = this.databases.filter(db => db.id === result.connectionId);
      // 	if (database && database.length > 0) {
      // 		result.name = database[0].name;
      // 	}
      // }
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
<style lang="scss">
.mqNode {
  .el-form-item {
    margin-bottom: 10px;
    .flex-block {
      display: flex;
      align-items: center;
    }
  }
}
</style>
