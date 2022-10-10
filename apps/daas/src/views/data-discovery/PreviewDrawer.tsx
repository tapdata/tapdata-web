import i18n from '@/i18n'
import { defineComponent, reactive, ref, computed } from '@vue/composition-api'
import { VTable, OverflowTooltip } from '@tap/component'
import { discoveryApi } from '@tap/api'
import { NodeViewer } from '@tap/dag'
import './index.scss'
import dayjs from 'dayjs'

export default defineComponent({
  setup() {
    const preview = ref('')
    const oldData = ref('')
    const data = reactive({
      activeName: 'first',
      activeUser: 'admin',
      search: '',
      currentRow: '',
      loading: false,
      columns: [
        {
          label: i18n.t('metadata_name'),
          prop: 'name'
        },
        {
          label: i18n.t('metadata_type'),
          prop: 'dataType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_zhujian'),
          prop: 'primaryKey'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_waijian'),
          prop: 'foreignKey'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_suoyin'),
          prop: 'index'
        },
        {
          label: i18n.t('meta_table_not_null'),
          prop: 'notNull'
        },
        {
          label: i18n.t('meta_table_default'),
          prop: 'defaultValue'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumingcheng'),
          prop: 'businessName'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewuleixing'),
          prop: 'businessType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
          prop: 'businessDesc'
        }
      ],
      nodeColumns: [
        {
          label: i18n.t('metadata_name'),
          prop: 'name'
        },
        {
          label: i18n.t('metadata_type'),
          prop: 'type'
        },
        {
          label: '节点描述',
          prop: 'connectionInfo'
        },
        {
          label: '业务描述',
          prop: 'serviceDesc'
        }
      ],
      apiColumns: [
        {
          label: i18n.t('metadata_name'),
          prop: 'name'
        },
        {
          label: i18n.t('metadata_type'),
          prop: 'type'
        },
        {
          label: i18n.t('meta_table_default'),
          prop: 'defaultvalue'
        },
        {
          label: i18n.t('module_form_describtion'),
          prop: 'description'
        }
      ],
      apiInputColumns: [
        {
          label: i18n.t('metadata_name'),
          prop: 'field_name'
        },
        {
          label: i18n.t('metadata_type'),
          prop: 'data_type'
        },
        {
          label: i18n.t('module_form_describtion'),
          prop: 'description'
        }
      ],
      outInput: [
        {
          name: 'page',
          type: 'number',
          defaultvalue: '1',
          description: i18n.t('daas_data_server_drawer_fenyebianhao'),
          required: true
        },
        {
          name: 'limit',
          type: 'number',
          defaultvalue: '20',
          description: i18n.t('daas_data_server_drawer_meigefenyefan'),
          required: true
        }
      ]
    })
    const format = data => {
      for (let i = 0; i < data?.length; i++) {
        data[i].primaryKey = !data[i].primaryKey ? '' : data[i].primaryKey
        data[i].foreignKey = !data[i].foreignKey ? '' : data[i].foreignKey
        data[i].index = !data[i].index ? '' : data[i].index
        data[i].notNull = !data[i].notNull ? '' : data[i].notNull
      }
      return data
    }
    const loadData = row => {
      data.currentRow = row
      if (data.activeName === 'first') {
        switch (row.category || row.table) {
          case 'storage':
            data.loading = true
            discoveryApi
              .overViewStorage(row.id)
              .then(res => {
                let newData = res
                newData['fields'] = format(res.fields)
                preview.value = newData || ''
                oldData.value = JSON.parse(JSON.stringify(newData))
              })
              .finally(() => {
                data.loading = false
              })
            break
          case 'api':
            data.loading = true
            discoveryApi
              .overViewApi(row.id)
              .then(res => {
                let newData = res
                newData['fields'] = format(res.fields)
                preview.value = newData || ''
                oldData.value = JSON.parse(JSON.stringify(newData))
              })
              .finally(() => {
                data.loading = false
              })
            break
          case 'job':
            data.loading = true
            discoveryApi
              .overViewTask(row.id)
              .then(res => {
                let newData = res
                preview.value = newData || ''
                oldData.value = JSON.parse(JSON.stringify(newData))
              })
              .finally(() => {
                data.loading = false
              })
            break
        }
      }
    }
    const filterNames = computed(() => {
      const txt = data.search.trim().toLowerCase()
      if (txt) {
        let fields = preview.value['fields'] || []
        preview.value['fields'] = fields.filter(n => n.name.toLowerCase().includes(txt))
        return preview.value
      }
      preview.value['fields'] = oldData.value['fields'] || []
      return preview.value
    })
    return {
      data,
      previewData: preview,
      filterNames,
      loadData
    }
  },
  render() {
    return (
      <div class="flex flex-column overflow-hidden pt-2 h-100" v-loading={this.data.loading}>
        <div class="flex position-relative">
          <div class="position-absolute top-0 start-0 fs-7 fw-sub px-6 font-color-dark" style="line-height: 36px">
            {i18n.t('datadiscovery_previewdrawer_duixiangxiangqing')}
          </div>
          <el-tabs class="drawer-tabs flex-1" v-model={this.data.activeName}>
            <el-tab-pane label={i18n.t('page_title_overview')} name="first">
              <div style="width:40px"></div>
            </el-tab-pane>
          </el-tabs>
        </div>
        {this.previewData ? (
          <section class="discovery-page-wrap">
            <div class="discovery-page-main-box">
              <div
                class={[
                  this.previewData.category === 'api' ? 'overflow-hidden' : 'overflow-auto',
                  'discovery-page-right'
                ]}
                v-loading={this.data.tableLoading}
              >
                <div>
                  <div class="user">
                    <span class="mr-4">{i18n.t('datadiscovery_previewdrawer_guanliyuan')}</span>
                    <el-select v-model={this.data.activeUser}>
                      <el-option label="admin" value="admin"></el-option>
                    </el-select>
                  </div>
                  <div class="details_data_info mt-4 p-5">
                    <el-row class="mt-2">
                      <el-col>
                        <span class="drawer__header_text inline-block">{i18n.t('metadata_meta_type_table')}</span>
                        <span class="ml-2">{this.previewData.name}</span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('column_create_time')}</span>
                        <span class="ml-2">{dayjs(this.previewData.createAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">
                          {i18n.t('datadiscovery_previewdrawer_biangengshijian')}
                        </span>
                        <span class="ml-2">{dayjs(this.previewData.lastUpdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('datadiscovery_previewdrawer_shujuxiang')}</span>
                        <span class="ml-2">{this.previewData.fieldNum}</span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('datadiscovery_previewdrawer_shujuliang')}</span>
                        <span class="ml-2">{this.previewData.rowNum}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('object_list_source_type')}</span>
                        <span class="ml-2">{this.previewData.sourceType}</span>
                      </el-col>
                      <el-col class="flex" span={8}>
                        <span class="max-label inline-block">{i18n.t('object_list_source_information')}</span>
                        <span class="ml-2">
                          <OverflowTooltip
                            class="cursor-pointer"
                            style="width:190px"
                            text={this.previewData.sourceInfo}
                            placement="right"
                            open-delay={400}
                          ></OverflowTooltip>
                        </span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('connection_list_name')}</span>
                        <span class="ml-2">{this.previewData.connectionName}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('connection_list_type')}</span>
                        <span class="ml-2">{this.previewData.connectionType}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">
                          {i18n.t('datadiscovery_previewdrawer_lianjiemiaoshu')}
                        </span>
                        <span class="ml-2">{this.previewData.connectionDesc}</span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">
                          {i18n.t('datadiscovery_previewdrawer_yewumingcheng')}
                        </span>
                        <span class="ml-2">{this.previewData.businessName}</span>
                      </el-col>
                    </el-row>
                  </div>
                </div>
                {this.previewData.category === 'storage' ? (
                  <div class="mt-5">
                    <div class="flex justify-content-between align-items-center">
                      <span class="drawer__header_text inline-block">
                        {i18n.t('datadiscovery_previewdrawer_shujuxiang')}
                      </span>
                      <el-input
                        class="mb-3"
                        style="width:200px"
                        placeholder="请输入名称"
                        suffix-icon="el-icon-search"
                        v-model={this.data.search}
                        onChange={this.filterNames}
                      ></el-input>
                    </div>
                    <VTable
                      class="discovery-page-table"
                      columns={this.data.columns}
                      data={this.previewData.fields}
                      has-pagination={false}
                    ></VTable>
                  </div>
                ) : (
                  ''
                )}
                {this.previewData.category === 'api' ? (
                  <div>
                    <div class="mt-5">
                      <span class="drawer__header_text inline-block">输入参数</span>
                      <VTable has-pagination={false} columns={this.data.apiColumns} data={this.data.outInput}></VTable>
                    </div>
                    <div class="mt-5">
                      <span class="drawer__header_text inline-block">输出参数</span>
                      <VTable
                        class="discovery-page-api-table"
                        hasPagination={false}
                        columns={this.data.apiInputColumns}
                        data={this.previewData.fields}
                      ></VTable>
                    </div>
                    <div class="mt-5">
                      <ul class="data-api-path">
                        {this.previewData.paths.map(path => (
                          <li class="data-api-path__item">
                            <div class={['method--' + path.method, 'data-api-path__method']}>{path.method}</div>
                            <div class="data-api-path__value line-height">{path.path}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {this.previewData.category === 'job' ? (
                  <div>
                    <div class="mt-5">
                      <span class="drawer__header_text inline-block">节点</span>
                      <NodeViewer id={this.previewData.id}></NodeViewer>
                    </div>
                    <div class="mt-5">
                      <VTable
                        class="discovery-page-api-table mt-4"
                        hasPagination={false}
                        columns={this.data.nodeColumns}
                        data={this.previewData.taskConnections}
                      ></VTable>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </section>
        ) : (
          ''
        )}
      </div>
    )
  }
})
