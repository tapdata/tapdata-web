<template>
  <div class="dummy nodeStyle" :class="{ nodeHeight: disabled }">
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
      <el-form class="e-form" label-position="top" :model="model" ref="form" :disabled="disabled">
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item :label="$t('editor.choose') + ' Dummy'" prop="connectionId" :rules="rules" required>
          <el-select
            :filterable="!databaseLoading"
            :loading="databaseLoading"
            v-model="model.connectionId"
            :placeholder="$t('editor.cell.data_node.dummy.chooseDummyName')"
            :clearable="true"
          >
            <el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
              :value="item.id"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('editor.cell.data_node.collection.form.collection.label')" prop="tableName" required>
          <el-select
            v-model="model.tableName"
            :filterable="!schemaLoading"
            :loading="schemaLoading"
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
        </el-form-item>
        <!-- <el-form-item
					:label="$t('editor.cell.data_node.collection.form.pk.label')"
					prop="primaryKeys"
					:rules="rules"
					required
				>
					<el-input
						v-model="model.primaryKeys"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"
						size="mini"
					></el-input>
				</el-form-item> -->
      </el-form>
    </div>
    <div class="e-entity-wrap" style="text-align: center; overflow: auto">
      <!-- <el-button
				class="fr"
				type="success"
				v-if="model.connectionId && model.tableName"
				size="mini"
				@click="hanlderLoadSchema"
			>
				<i class="el-icon-loading" v-if="reloadModelLoading"></i>
				<span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
				<span v-else>{{ $t('dataFlow.updateModel') }}</span>
			</el-button> -->
      <entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
    </div>
    <relatedTasks :taskData="taskData" v-if="disabled"></relatedTasks>
    <el-dialog :title="$t('message.prompt')" :visible.sync="dialogVisible" :close-on-click-modal="false" width="30%">
      <span>{{ $t('editor.ui.nodeLoadSchemaDiaLog') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" @click="confirmDialog">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
import factory from '../../../api/factory'
import Entity from '../link/Entity'
import RelatedTasks from '../../../components/relatedTasks'
import { convertSchemaToTreeData } from '../../util/Schema'
import ws from '@/api/ws'
let connections = factory('connections')
// let editorMonitor = null;
export default {
  name: 'Dummy',
  components: { Entity, RelatedTasks },
  data() {
    return {
      taskData: {
        id: '',
        tableName: ''
      },
      disabled: false,
      reloadModelLoading: false,
      dialogVisible: false,
      databases: [],
      databaseLoading: false,
      rules: {
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.dummy.chooseDummyName')
          }
        ],
        // primaryKeys: [
        // 	{
        // 		required: true,
        // 		trigger: 'blur',
        // 		message: this.$t('editor.cell.data_node.dummy.none_pk')
        // 	}
        // ],
        tableName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.dummy.none_collection')
          }
        ]
      },
      model: {
        connectionId: '',
        type: 'dummy db',
        tableName: ''
        // primaryKeys: ''
      },
      schemas: [],
      schemaLoading: false,
      mergedSchema: null
    }
  },

  async mounted() {
    this.databaseLoading = true
    let result = await connections.get({
      filter: JSON.stringify({
        where: {
          database_type: 'dummy db'
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          connection_type: 1,
          status: 1
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
        if (this.model.connectionId) {
          this.taskData.id = this.model.connectionId
        }
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
                    meta_type: 'rest api',
                    fields: []
                  }
            this.$emit('schemaChange', _.cloneDeep(schema))
          }
        }
        this.taskData.tableName = this.model.tableName
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
    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }
      let self = this
      this.schemaLoading = true
      connections
        .get([connectionId])
        .then(result => {
          if (result.data) {
            let schemas = (result.data.schema && result.data.schema.tables) || []
            schemas = schemas.sort((t1, t2) =>
              t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
            )
            self.schemas = schemas
          }
        })
        .finally(() => {
          this.schemaLoading = false
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
      if (result.connectionId) {
        let database = this.databases.filter(db => db.id === result.connectionId)
        if (database && database.length > 0) {
          result.name = database[0].name
        }
      }
      return result
    },

    setDisabled(disabled) {
      this.disabled = disabled
    },

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // },

    // 更新模型
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
          self.$message.success(this.$t('message.reloadSchemaSuccess'))
        } else {
          self.$message.error(this.$t('message.reloadSchemaError'))
        }
        this.reloadModelLoading = false
        if (templeSchema && templeSchema.length) {
          templeSchema.forEach(item => {
            if (item.connId === this.model.connectionId && item.tableName === this.model.tableName) {
              schema = item.schema
            }
          })
        }
        self.$nextTick(() => {
          self.$emit('schemaChange', _.cloneDeep(schema))
          this.mergedSchema = schema
        })
      })
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
.dummy {
  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
<style scoped lang="scss">
.dummy {
  .e-entity-wrap {
    padding: 0 20px;
  }
}
</style>
