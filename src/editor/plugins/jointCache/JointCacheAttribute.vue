<template>
  <section class="join-cache-wrap">
    <!-- <div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div> -->
    <form-builder ref="form" v-model="model" :config="config">
      <el-table
        border
        size="mini"
        slot="joinSettings"
        :data="model.joinSettings"
      >
        <el-table-column
          :label="
            $t('editor.cell.processor.jointCache.form.joinSettings.cacheKey')
          "
          prop="cacheKey"
        ></el-table-column>
        <el-table-column
          :label="
            $t(
              'editor.cell.processor.jointCache.form.joinSettings.sourceKey.label'
            )
          "
        >
          <template slot-scope="scope">
            <el-select
              class="source-key-selection"
              v-model="scope.row.sourceKey"
              :placeholder="
                $t(
                  'editor.cell.processor.jointCache.form.joinSettings.sourceKey.placeholder'
                )
              "
            >
              <el-option
                v-for="name in sourceFields"
                :key="name"
                :label="name"
                :value="name"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </form-builder>
    <div class="schema-mapping">
      <Mapping
        ref="mappingComp"
        :filterFields="model.removeFields"
        @check="checkHandler"
      ></Mapping>
    </div>
  </section>
</template>

<script>
import Mapping from '../link/Mapping'
import {
  mergeJoinTablesToTargetSchema,
  mergeSchema,
  removeDeleted
} from '../../util/Schema'
// import log from '../../../log';
import _ from 'lodash'
// let editorMonitor = null;
export default {
  name: 'JointCache',
  components: {
    Mapping
  },
  data() {
    let self = this
    return {
      disabled: false,
      model: {
        name: '',
        cacheId: '',
        joinSettings: [],
        joinKey: '',
        type: 'cache_lookup_processor',
        removeFields: [],
        script: ''
      },
      config: {
        items: [
          {
            type: 'input',
            field: 'name',
            label: this.$t('editor.cell.processor.jointCache.form.name.label'),
            placeholder: this.$t(
              'editor.cell.processor.jointCache.form.name.placeholder'
            ),
            required: true
          },
          {
            type: 'select',
            field: 'cacheId',
            label: this.$t(
              'editor.cell.processor.jointCache.form.cacheId.label'
            ),
            placeholder: this.$t(
              'editor.cell.processor.jointCache.form.cacheId.placeholder'
            ),
            required: true,
            options: [],
            clearable: false,
            on: {
              change(val) {
                let cache = self.cacheMap[val]
                if (cache) {
                  let settings = cache.cacheKeys
                    .split(',')
                    .map(it => ({ cacheKey: it, sourceKey: '' }))
                  self.$set(self.model, 'joinSettings', settings)
                }
                self.showMapping()
              }
            }
          },
          {
            type: 'slot',
            label: this.$t(
              'editor.cell.processor.jointCache.form.joinSettings.label'
            ),
            required: true,
            field: 'joinSettings',
            slot: 'joinSettings'
          },
          {
            type: 'input',
            label: this.$t(
              'editor.cell.processor.jointCache.form.joinKey.label'
            ),
            field: 'joinKey',
            placeholder: this.$t(
              'editor.cell.processor.jointCache.form.joinKey.placeholder'
            ),
            on: {
              change() {
                self.showMapping()
              }
            }
          }
        ],
        sourceFields: [],
        cacheMap: {},
        inputSchema: null
      }
    }
  },
  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    }
  },
  mounted() {},
  methods: {
    getCacheList(editor) {
      let cells = editor.getAllCells()
      let cacheList = []
      let map = {}
      cells.forEach(cell => {
        let attr = cell.attributes
        if (attr.type === 'app.MemCache') {
          let formData = attr.form_data
          cacheList.push({ label: formData.name, value: attr.id })
          map[attr.id] = {
            fields: attr.outputSchema ? attr.outputSchema.fields : [],
            cacheKeys: formData.cacheKeys,
            cell: cell,
            name: formData.name
          }
        }
      })
      this.cacheMap = map
      this.config.items.find(it => it.field === 'cacheId').options = cacheList
    },
    getSourceFields(schema) {
      let fields = schema.fields || []
      let sourceFields = []
      fields.forEach(f => {
        if (f.field_name) {
          sourceFields.push(f.field_name)
        }
      })
      this.sourceFields = sourceFields
      this.inputSchema = schema
    },
    showMapping() {
      if (this.model.cacheId) {
        let cacheCell = this.cacheMap[this.model.cacheId]
        if (!cacheCell) {
          this.model.cacheId = ''
          this.model.joinSettings = []
          this.model.joinKey = ''
          this.model.removeFields = []
          return
        }
        let cacheOutputSchema = cacheCell.cell.getInputSchema()[0].sourceSchema
        let joinPath = this.model.joinKey.trim()
        let mergedTargetSchema = mergeSchema(
          _.cloneDeep(this.inputSchema),
          cacheOutputSchema,
          {
            joinType: joinPath ? 'merge_embed' : 'upsert',
            joinPath
          }
        )
        //过滤删除的字段
        if (mergedTargetSchema && mergedTargetSchema.fields) {
          mergedTargetSchema.fields = removeDeleted(mergedTargetSchema.fields)
        }
        if (
          this.model.removeFields.length &&
          mergedTargetSchema &&
          mergedTargetSchema.fields
        ) {
          let removeIds = this.model.removeFields.map(f => f.id)
          mergedTargetSchema.fields = mergedTargetSchema.fields.filter(f => {
            return !removeIds.includes(f.id)
          })
        }
        this.$refs.mappingComp.setSchema(cacheOutputSchema, mergedTargetSchema)
        this.$emit('schemaChange', _.cloneDeep(mergedTargetSchema))
      }
    },
    checkHandler(checkedArr) {
      let cacheCell = this.cacheMap[this.model.cacheId]
      let cacheOutputSchema = cacheCell.cell.getInputSchema()[0].sourceSchema
      let checkedIds = checkedArr.map(it => it.id)
      let removeFields = []
      cacheOutputSchema.fields.forEach(f => {
        if (!checkedIds.includes(f.id) && f.field_name) {
          removeFields.push(f)
        }
      })
      this.model.removeFields = removeFields
      this.showMapping()
    },
    setData(data, cell, isSourceDataNode, vueAdapter) {
      let schema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema())
      if (data) {
        _.merge(this.model, data)
        this.$set(this.model, 'joinSettings', data.joinSettings)
      }

      //如果源表的类型是关系型表，则不允许填写写入路径，无法内嵌字段
      if (schema.meta_type === 'table') {
        this.config.items.find(it => it.field === 'joinKey').show = false
      }

      this.getCacheList(vueAdapter.editor)
      this.getSourceFields(schema)
      this.showMapping()

      // editorMonitor = vueAdapter.editor;
    },
    getScript() {
      let { cacheId, joinSettings, joinKey, removeFields } = this.model
      if (
        !cacheId ||
        !joinSettings.length ||
        joinSettings.some(it => !it.sourceKey)
      ) {
        return ''
      }
      let cacheCell = this.cacheMap[cacheId]

      let sourceFieldStr = joinSettings
        .map(it => 'record.' + it.sourceKey)
        .join(',')

      let removeFieldsStr = removeFields
        .map(f => {
          return `MapUtils.removeKey(cachedRow, '${f.field_name}');`
        })
        .join('')
      let joinPath = joinKey.trim()
      let script = `
				function process(record) {
					var isCdc = context.syncType == 'cdc';
					var cachedRow = CacheService.getAndSetCache( '${cacheCell.name}', isCdc, ${sourceFieldStr} );
					if (cachedRow) {
						${removeFieldsStr}
						if ('${joinPath}') {
							record.put('${joinPath}', cachedRow);
						} else {
							record.putAll(cachedRow);
						}
					}

					return record;
				}
			`
      return script
    },
    getData() {
      this.model.script = this.getScript()
      return _.cloneDeep(this.model)
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
.join-cache-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  .source-key-selection {
    width: 100%;
    input.el-input__inner {
      border: none;
    }
  }
  .schema-mapping {
    flex: 1;
    overflow: hidden;
    margin-top: 10px;
  }
}
</style>
