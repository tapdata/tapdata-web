import { connect, mapProps, useForm } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue-demi'
import { VIcon } from '@tap/component'

const SyncObjectItem = observer(
  defineComponent({
    props: {
      value: Array,
      disabled: Boolean,
      loading: Boolean,
      data: Object,
      options: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        syncTypes: [],
        sourceData: [],
        tables: [],
        titles: [this.$t('editor_cell_link_migrationObjece'), this.$t('editor_cell_link_chosen')],

        transferLoading: false,
        currentName: null,
        databaseName: '',
        modifyNameDialog: false,
        dialogVisible: false,
        logsFlag: false,
        exampleName: 'tableName',

        configJoinTable: false,
        targetDatabaseType: '',
        model: {
          // label: '',
          table_prefix: '',
          table_suffix: '',
          dropType: 'no_drop',
          type: 'databaseLink',
          selectSourceArr: [],
          selectSourceDatabase: {
            table: true,
            view: false,
            function: false,
            procedure: false
          }
        }

        // table_prefix: '',
        // table_suffix: ''
      }
    },

    watch: {
      data() {
        this.initTables()
      }
    },

    mounted() {
      if (this.value.length) {
        this.syncTypes = [...this.value.map(item => item.type)]
        const item = this.value.find(item => item.type === 'table')
        this.tables = item.objectNames || []
      }
    },

    setup() {
      const form = useForm()?.value
      return {
        form,
        table_prefix: form.values.table_prefix || '',
        table_suffix: form.values.table_suffix || ''
      }
    },

    render() {
      if (!this.data) return
      // const formRef = useForm()
      // const form = this.form
      const t = this.t.bind(this)

      return (
        <div class="sync-object-item-wrap">
          <el-form-item>
            <div class="e-label">
              <label class="el-form-item__label">{$t('editor_cell_link_copySourceDatabase')}</label>
              <el-popover
                class="align-middle"
                placement="top-start"
                width="400"
                trigger="hover"
                scopedSlots={{
                  reference: () => <VIcon color="#999">tishi</VIcon>
                }}
              >
                <span>{$t('editor_cell_link_formTip')}</span>
              </el-popover>
            </div>
            <el-checkbox-group v-model={this.syncTypes} on={{ change: this.syncTypesChanged }}>
              {this.options.map((option, i) => (
                <el-checkbox key={i} label={option.value} disabled={option.disabled}>
                  {option.label}
                  {option.tooltip && (
                    <el-popover
                      class="align-middle"
                      placement="top-start"
                      width="400"
                      trigger="hover"
                      scopedSlots={{
                        reference: () => <VIcon color="#999">tishi</VIcon>
                      }}
                    >
                      <span>{$t(option.tooltip)}</span>
                    </el-popover>
                  )}
                </el-checkbox>
              ))}
            </el-checkbox-group>
          </el-form-item>
          <el-form-item class="transfer-item">
            <div class="el-form-item is-required flex">
              <label class="el-form-item__label flex-grow-1">{$t('editor_cell_link_migrationSetting')}</label>
              <el-button
                class="e-button"
                size="mini"
                disabled={this.syncTypes.includes('view')}
                onClick={this.handDialog}
              >
                {$t('dataFlow_changeName')}
              </el-button>
              <el-button
                size="mini"
                class="e-button ml-2"
                disabled={this.syncTypes.includes('view')}
                on={{ click: this.handleReduction }}
              >
                {$t('editor_cell_link_reduction')}
              </el-button>
            </div>
            <div class="transfer flex-fill">
              <el-transfer
                filterable
                titles={this.titles}
                filter-method={this.filterMethod}
                filter-placeholder={$t('editor_cell_link_searchContent')}
                v-model={this.tables}
                data={this.sourceData}
                on={{
                  change: this.handleChangeTransfer
                }}
                scopedSlots={{
                  default: ({ option }) => (
                    <span class="box" slot-scope="{ option }">
                      <span title={option.label} class={['text', { active: option.label !== option.key }, 'text']}>
                        {this.getTransferLabel(option)}
                      </span>
                    </span>
                  )
                }}
              />
            </div>
          </el-form-item>

          <el-dialog
            title={$t('editor_cell_link_batchRename')}
            visible={this.dialogVisible}
            on={{ 'update:visible': v => (this.visible = v) }}
            modal-append-to-body={false}
            custom-class="databaseLinkDialog"
            close-on-click-modal={false}
          >
            {
              <el-form props={{ model: this.model }} disabled={this.disabled}>
                <el-row gutter={80} class="e-row">
                  <el-col span={12}>
                    <el-form-item label={$t('editor_cell_link_prefixPlaceholder')}>
                      <el-input
                        v-model={this.model.table_prefix}
                        autocomplete="off"
                        maxlength="20"
                        show-word-limit={true}
                        placeholder={$t('editor_cell_link_prefixPlaceholder')}
                      />
                    </el-form-item>
                  </el-col>
                  <el-col span={12}>
                    <el-form-item label={$t('editor_cell_link_suffixPlaceholder')}>
                      <el-input
                        v-model={this.model.table_suffix}
                        autocomplete="off"
                        maxlength="20"
                        show-word-limit
                        placeholder={$t('editor_cell_link_suffixPlaceholder')}
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            }
            <div class="text">
              {$t('editor_cell_link_tableNameExample')}: {this.model.table_prefix}
              {this.exampleName}
              {this.table_suffix}
            </div>
            <div slot="footer" class="dialog-footer">
              <el-button on={{ click: () => (this.dialogVisible = false) }}>{$t('dataVerify_cancel')}</el-button>
              <el-button type="primary" onClick={this.confirm}>
                {$t('dataVerify_confirm')}
              </el-button>
            </div>
          </el-dialog>
        </div>
      )
    },

    methods: {
      getTransferLabel(option) {
        const { table_prefix, table_suffix } = this
        return this.tables.includes(option.key) ? `${table_prefix}${option.label}${table_suffix}` : option.label
      },
      valueChanged() {
        this.$emit(
          'change',
          this.syncTypes.map(type => {
            return {
              type,
              objectNames: type === 'table' ? this.tables : []
            }
          })
        )
        this.$nextTick(() => {
          console.log('valueChanged', this.form.values) // eslint-disable-line
        })
      },

      syncTypesChanged() {
        this.valueChanged()
      },

      // 添加前后缀弹窗开关
      handDialog() {
        const form = this.form.values
        console.log('handDialog', this.form) // eslint-disable-line
        this.model.table_prefix = form.table_prefix || ''
        this.model.table_suffix = form.table_suffix || ''
        this.dialogVisible = true
      },

      // 还原
      handleReduction() {
        this.model.table_suffix = ''
        this.model.table_prefix = ''
        if (this.sourceData.length) {
          for (let i = 0; i < this.sourceData.length; i++) {
            // for (let j = 0; j < selectKeepArr.length; j++) {
            for (let k = 0; k < this.model.selectSourceArr.length; k++) {
              if (
                // this.sourceData[i].label === selectKeepArr[j] &&
                this.sourceData[i].key === this.model.selectSourceArr[k]
              ) {
                this.sourceData[i].label = this.sourceData[i].key
                // this.sourceData[i].key = this.sourceData[i].label;
                // this.model.selectSourceArr[k] = this.sourceData[i].value;
              }
              // 	}
            }
          }
        }
      },
      // 穿梭框搜索
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1
      },

      /*// 已选择的表
      handleSelectTable(data) {
        // selectKeepArr = data
      },*/

      // 穿梭框值改变的时候
      handleChangeTransfer() {
        // this.sourceData.forEach(el => {
        //   if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
        //     el.label = el.key
        //   }
        // })
        this.preFixSuffixData()
        this.valueChanged()
        /*const syncObjects = [...this.node.syncObjects]
      const syncItem = syncObjects.find(item => item.type === 'table')

      syncItem.objectNames = tables

      this.valueChanged(syncObjects, 'syncObjects')*/
      },

      // 弹窗确认
      confirm() {
        this.dialogVisible = false
        this.form.setValuesIn('table_prefix', this.model.table_prefix)
        this.form.setValuesIn('table_suffix', this.model.table_suffix)
        this.table_prefix = this.model.table_prefix
        this.table_suffix = this.model.table_suffix
        // this.valueChanged(this.table_prefix, 'table_prefix')
        // this.valueChanged(this.table_suffix, 'table_suffix')
        this.preFixSuffixData()
      },

      preFixSuffixData() {
        // FIXME 临时逻辑
        let { tables } = this
        let len = tables.length
        if (len) {
          const sourceKeys = this.sourceData.map(item => item.key)
          tables = this.tables.filter(t => sourceKeys.includes(t))
          if (len !== tables.length) {
            this.tables = tables
            // FIXME 临时逻辑
            // 如果表不存在，更新syncObjects
            this.valueChanged()
          }
        }
      },

      initTables() {
        let tables = this.data.schema?.tables || []
        tables = tables.sort((t1, t2) => (t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1))

        if (tables && tables.length) {
          this.sourceData = tables.map(table => ({
            label: table.table_name,
            key: table.table_name,
            // value: table.table_name,
            disabled: this.disabled
          }))
          if (this.sourceData.length) {
            this.preFixSuffixData()
          }
        }
      }
    }
  })
)

export const SyncObjects = connect(SyncObjectItem, mapProps({ dataSource: 'options', data: true, loading: true }))

export default SyncObjects
