<template>
  <div class="tcpNode nodeStyle">
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
          :label="$t('editor.choose') + ' TCP/IP'"
          prop="connectionId"
          :rules="rules"
          required
        >
          <el-select
            :filterable="!databaseLoading"
            :loading="databaseLoading"
            v-model="model.connectionId"
            :placeholder="$t('message.placeholderSelect') + 'TCP/IP'"
            :clearable="true"
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
        <el-form-item :label="$t('editor.cell.data_node.tcpTip')" required>
        </el-form-item>
      </el-form>
    </div>
    <!-- <div class="e-entity-wrap" style="text-align: center; overflow: auto">
      <entity
        :schema="convertSchemaToTreeData(mergedSchema)"
        :editable="false"
      ></entity>
    </div> -->
  </div>
</template>
<script>
import _ from 'lodash'
import factory from '../../../api/factory'
// import Entity from '../link/Entity'
import { convertSchemaToTreeData } from '../../util/Schema'
let connections = factory('connections')

// let editorMonitor = null;
export default {
  name: 'tcpNode',
  // components: { Entity },
  data() {
    return {
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
        ]
      },
      model: {
        connectionId: '',
        type: 'tcp'
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
          database_type: 'tcp'
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
    }
  },

  methods: {
    convertSchemaToTreeData,

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
            self.schemas = schemas
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
      result.name = result.tableName || 'TCP/IP'
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
  }
}
</script>
<style lang="scss">
.apiNode {
  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
