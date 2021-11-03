<template>
  <div class="hiveNode nodeStyle">
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
        <el-form-item :label="$t('editor.choose') + ' Vika'" prop="connectionId" :rules="rules" required>
          <el-select
            :filterable="!databaseLoading"
            :loading="databaseLoading"
            v-model="model.connectionId"
            :placeholder="$t('message.placeholderSelect') + 'Vika'"
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

        <el-form-item
          :label="$t('editor.cell.data_node.table.form.table.label')"
          prop="tableName"
          :rules="rules"
          required
        >
          <el-input v-model="model.tableName"></el-input>
          <!-- <FbSelect class="e-select" v-model="model.tableName" :config="schemaSelectConfig"></FbSelect> -->
          <el-tree
            highlight-current
            lazy
            accordion
            :props="props"
            :load="loadNode"
            :data="nodes"
            @node-click="handleNodeClick"
          >
          </el-tree>
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
        ref="fieldMapping"
        class="fr"
        :dataFlow="dataFlow"
        :showBtn="true"
        :isFirst="model.isFirst"
        :isDisable="disabled"
        :hiddenFieldProcess="true"
        :stageId="stageId"
        @update-first="returnModel"
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
import CreateTable from '@/components/dialog/createTable'
import FieldMapping from '@/components/FieldMapping'

import ws from '@/api/ws'
import VIcon from '@/components/VIcon'
const connections = factory('connections')

// let editorMonitor = null;
export default {
  name: 'ApiNode',
  components: { Entity, CreateTable, VIcon, FieldMapping },
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
      dataNodeInfo: {},
      model: {
        connectionId: '',
        type: 'vika',
        dataBaseType: 'vika',
        tableName: '',
        field_process: [],
        isFirst: true
      },
      scope: '',
      dataFlow: '',
      stageId: '',
      showFieldMapping: false,
      schemasLoading: false,
      mergedSchema: null,
      nodes: [],
      vika_space_id: '',
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      spacePath: []
    }
  },

  async mounted() {
    this.databaseLoading = true
    let result = await connections.get({
      filter: JSON.stringify({
        where: {
          database_type: 'vika'
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
                    meta_type: 'Vika',
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
    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }
      this.schemasLoading = true
      connections
        .get([connectionId])
        .then(result => {
          if (result.data) {
            this.vika_space_id = result.data?.vika_space_id
            this.getSpaceVika()
          }
        })
        .finally(() => {
          this.schemasLoading = false
        })
    },

    setData(data, cell, dataNodeInfo, vueAdapter) {
      if (data) {
        this.scope = vueAdapter?.editor?.scope
        this.stageId = cell.id
        this.getDataFlow()
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
      this.dataNodeInfo = dataNodeInfo || {}
      cell.on('change:outputSchema', () => {
        this.mergedSchema = cell.getOutputSchema()
        this.getDataFlow()
      })

      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      let result = _.cloneDeep(this.model)
      result.name = result.tableName || 'Vika'
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
            if (item.connId === this.model.connectionId && item.tableName === this.model.tableName) {
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
    },
    //获取dataFlow
    getDataFlow() {
      this.dataFlow = this.scope.getDataFlowData(true) //不校验
    },
    //接收是否第一次打开
    returnModel(value) {
      this.model.isFirst = value
    },
    //获取维格表空间
    getSpaceVika() {
      let params = {
        load_type: 'node',
        space_id: this.vika_space_id,
        connection_id: this.model.connectionId || ''
      }
      this.$api('connections')
        .getSpace(params)
        .then(data => {
          this.nodes = data.data
        })
        .catch(() => {
          this.$message.error('接口请求失败')
        })
    },
    loadNode(node, resolve) {
      var hasChild
      if (node.data.type === 'Datasheet') {
        hasChild = false
      } else {
        hasChild = true
      }
      if (hasChild) {
        let params = {
          load_type: 'node',
          space_id: this.vika_space_id,
          connection_id: this.model.connectionId || '',
          node_id: node.data.id
        }
        this.$api('connections')
          .getSpace(params)
          .then(data => {
            let children = data.data?.children || []
            for (let i = 0; i < children.length; i++) {
              if (children[i].type === 'Datasheet') {
                children[i]['leaf'] = false
              } else {
                children[i]['leaf'] = true
              }
            }
            resolve(data.data?.children)
          })
      } else {
        resolve([])
      }
    },
    handleNodeClick(data, node) {
      if (data.type === 'Datasheet') {
        this.model.tableName = data.name
        //组装数据 递归寻找当前结构
        let fn = function (node) {
          let item = {
            id: node.data.id,
            name: node.data.name,
            type: node.data.type
          }
          this.spacePath.push(item)
          if (node.level !== 1) {
            fn(node.parent)
          }
        }
        fn(node)
      } else {
        this.model.tableName = ''
      }
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>
<style lang="scss">
.hiveNode {
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
