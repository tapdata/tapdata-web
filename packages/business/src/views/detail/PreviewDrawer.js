import * as Vue from 'vue'
import i18n from '@/i18n'
import { defineComponent, reactive, ref, computed } from 'vue'
import { VTable, OverflowTooltip } from '@tap/component'
import { discoveryApi } from '@tap/api'
import { NodeViewer } from '@tap/dag'
import './index.scss'
import dayjs from 'dayjs'

export const PreviewDrawer = defineComponent({
  setup() {
    const preview = ref('')
    const oldData = ref('')
    const data = reactive({
      activeName: 'first',
      activeUser: 'admin',
      search: '',
      searchApi: '',
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
          label: i18n.t('daas_data_discovery_previewdrawer_jiedianmiaoshu'),
          prop: 'connectionInfo'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
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
      params: [],
      urls: []
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

    const formatTask = data => {
      for (let i = 0; i < data?.length; i++) {
        if (data[i].type === 'calculate') {
          data[i].connectionInfo = `${i18n.t('daas_data_discovery_previewdrawer_shurujiedian')}: ${
            data[i].inputNodeName
          } ; ${i18n.t('daas_data_discovery_previewdrawer_shuchujiedian')}: ${data[i].outputNodeName}`
        }
      }
      return data
    }
    const loadData = row => {
      data.currentRow = row
      if (data.activeName === 'first') {
        switch (row.category || row.type) {
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
                oldData.value = JSON.parse(JSON.stringify(newData)) //前端搜索用
                data.params = res.paths?.[0]?.params || []
                let baseUrl = res.paths?.[0]?.path || ''
                data.urls = [
                  {
                    method: 'POST',
                    path: `http://${res.sourceInfo}${baseUrl}/find`
                  },
                  {
                    method: 'GET',
                    path: `http://${res.sourceInfo}${baseUrl}`
                  },
                  {
                    method: 'TOKEN',
                    path: `${location.origin + location.pathname}oauth/token`
                  }
                ]

                preview.value = newData || ''
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
                //数据格式化
                newData['taskConnections'] = formatTask(res?.taskConnections)
                preview.value = newData || ''
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
    const filterNamesApi = computed(() => {
      const txt = data.searchApi.trim().toLowerCase()
      if (txt) {
        let fields = preview.value['fields'] || []
        preview.value['fields'] = fields.filter(n => n.field_name.toLowerCase().includes(txt))
        return preview.value
      }
      preview.value['fields'] = oldData.value['fields'] || []
      return preview.value
    })
    return {
      data,
      previewData: preview,
      filterNames,
      filterNamesApi,
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
                  this.previewData.category === 'storage' ? 'overflow-hidden' : 'overflow-auto',
                  'discovery-page-right'
                ]}
                v-loading={this.data.tableLoading}
              >
                <div class="user">
                  <span class="mr-4">{i18n.t('datadiscovery_previewdrawer_guanliyuan')}</span>
                  <el-select v-model={this.data.activeUser}>
                    <el-option label="admin" value="admin"></el-option>
                  </el-select>
                </div>
                {this.previewData.category === 'storage' ? (
                  <div>
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
                    <div class="mt-5">
                      <div class="flex justify-content-between align-items-center">
                        <span class="drawer__header_text inline-block">
                          {i18n.t('datadiscovery_previewdrawer_shujuxiang')}
                        </span>
                        <el-input
                          class="mb-3"
                          style="width:200px"
                          placeholder={i18n.t('daas_data_discovery_previewdrawer_qingshurumingcheng')}
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
                      >
                        <div slot="empty">{i18n.t('packages_dag_dag_dialog_field_mapping_no_data')}</div>
                      </VTable>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {this.previewData.category === 'api' ? (
                  <div>
                    <div class="details_data_info mt-4 p-5">
                      <el-row class="mt-2">
                        <el-col>
                          <span class="drawer__header_text inline-block">API</span>
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
                          <span class="max-label inline-block">{i18n.t('daas_data_server_drawer_shurucanshu')}</span>
                          <span class="ml-2">{this.previewData.inputParamNum}</span>
                        </el-col>
                      </el-row>
                      <el-row class="mt-2">
                        <el-col span={8}>
                          <span class="max-label inline-block">
                            {i18n.t('daas_data_discovery_previewdrawer_shuchucanshu')}
                          </span>
                          <span class="ml-2">{this.previewData.outputParamNum}</span>
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
                          <span class="max-label inline-block">{i18n.t('daas_data_server_list_fuwumingcheng')}</span>
                          <span class="ml-2">{this.previewData.name}</span>
                        </el-col>
                        <el-col span={8}>
                          <span class="max-label inline-block">
                            {i18n.t('daas_data_discovery_previewdrawer_fuwumiaoshu')}
                          </span>
                          <span class="ml-2">{this.previewData.description}</span>
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
                    <div class="mt-5">
                      <span class="drawer__header_text inline-block">
                        {i18n.t('daas_data_server_drawer_shurucanshu')}
                      </span>
                      <VTable
                        class="discovery-page-api-table"
                        has-pagination={false}
                        columns={this.data.apiColumns}
                        data={this.data.params}
                      ></VTable>
                    </div>
                    <div class="mt-5">
                      <div class="flex justify-content-between align-items-center">
                        <span class="drawer__header_text inline-block">
                          {i18n.t('daas_data_discovery_previewdrawer_shuchucanshu')}
                        </span>
                        <el-input
                          class="mb-3"
                          style="width:200px"
                          placeholder={i18n.t('daas_data_discovery_previewdrawer_qingshurumingcheng')}
                          suffix-icon="el-icon-search"
                          v-model={this.data.searchApi}
                          onChange={this.filterNamesApi}
                        ></el-input>
                      </div>
                      <VTable
                        class="discovery-page-table"
                        hasPagination={false}
                        columns={this.data.apiInputColumns}
                        data={this.previewData.fields}
                      >
                        <div slot="empty">{i18n.t('packages_dag_dag_dialog_field_mapping_no_data')}</div>
                      </VTable>
                    </div>
                    <div class="mt-5">
                      <span class="drawer__header_text inline-block">
                        {i18n.t('daas_data_server_drawer_fuwufangwen')}
                      </span>
                      <ul class="data-api-path">
                        {this.data.urls.map(path => (
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
                    <div class="details_data_info mt-4 p-5">
                      <el-row class="mt-2">
                        <el-col>
                          <span class="drawer__header_text inline-block">{i18n.t('setting_Job')}</span>
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
                          <span class="max-label inline-block">
                            {i18n.t('daas_data_discovery_previewdrawer_jiedianshu')}
                          </span>
                          <span class="ml-2">{this.previewData.nodeNum}</span>
                        </el-col>
                      </el-row>
                      <el-row class="mt-2">
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
                          <span class="max-label inline-block">
                            {i18n.t('daas_data_discovery_previewdrawer_yinqingmingcheng')}
                          </span>
                          <span class="ml-2">{this.previewData.agentId}</span>
                        </el-col>
                        <el-col span={8}>
                          <span class="max-label inline-block">
                            {i18n.t('daas_data_discovery_previewdrawer_yinqingmiaoshu')}
                          </span>
                          <span class="ml-2">{this.previewData.agentDesc}</span>
                        </el-col>
                        <el-col span={8}>
                          <span class="max-label inline-block">
                            {i18n.t('daas_data_discovery_previewdrawer_renwumiaoshu')}
                          </span>
                          <span class="ml-2">{this.previewData.taskDesc}</span>
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
                    <div class="mt-5">
                      <span class="drawer__header_text inline-block">
                        {i18n.t('daas_data_discovery_previewdrawer_jiedian')}
                      </span>
                      <NodeViewer dag={this.previewData.dag}></NodeViewer>
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
export default PreviewDrawer
