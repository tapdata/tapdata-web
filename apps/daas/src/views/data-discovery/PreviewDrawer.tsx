import i18n from '@/i18n'
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { TableList, OverflowTooltip } from '@tap/component'
import { discoveryApi } from '@tap/api'
import './index.scss'
import dayjs from 'dayjs'

export default defineComponent({
  setup() {
    const preview = ref('')
    const data = reactive({
      activeName: 'first',
      activeUser: 'admin',
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
        data.loading = true
        discoveryApi
          .overView(row.id)
          .then(res => {
            let data = res
            data['fields'] = format(res.fields)
            preview.value = data || ''
          })
          .finally(() => {
            data.loading = false
          })
      }
    }
    return {
      data,
      preview,
      loadData
    }
  },
  render() {
    return (
      <div class="drawer-content" v-loading={this.data.loading}>
        <div class="flex align-items-center ml-4 drawer-header-h">
          <header class="font-weight-bold mr-4 drawer-header-mt">
            <span class="drawer__header_text inline-block">
              {i18n.t('datadiscovery_previewdrawer_duixiangxiangqing')}
            </span>
          </header>
          <el-tabs v-model={this.data.activeName} class="drawer-header-mt">
            <el-tab-pane label={i18n.t('page_title_overview')} name="first">
              <div style="width:40px"></div>
            </el-tab-pane>
          </el-tabs>
        </div>
        {this.preview ? (
          <section class="discovery-page-wrap">
            <div class="discovery-page-main-box">
              <div class="discovery-page-right" v-loading={this.data.tableLoading}>
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
                        <span class="ml-2">{this.preview.name}</span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('column_create_time')}</span>
                        <span class="ml-2">{dayjs(this.preview.createAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">
                          {i18n.t('datadiscovery_previewdrawer_biangengshijian')}
                        </span>
                        <span class="ml-2">{dayjs(this.preview.lastUpdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('datadiscovery_previewdrawer_shujuxiang')}</span>
                        <span class="ml-2">{this.preview.fieldNum}</span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('datadiscovery_previewdrawer_shujuliang')}</span>
                        <span class="ml-2">{this.preview.rowNum}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('object_list_source_type')}</span>
                        <span class="ml-2">{this.preview.sourceType}</span>
                      </el-col>
                      <el-col class="flex" span={8}>
                        <span class="max-label inline-block">{i18n.t('object_list_source_information')}</span>
                        <span class="ml-2">
                          <OverflowTooltip
                            class="cursor-pointer"
                            style="width:190px"
                            text={this.preview.sourceInfo}
                            placement="right"
                            open-delay={400}
                          ></OverflowTooltip>
                        </span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('connection_list_name')}</span>
                        <span class="ml-2">{this.preview.connectionName}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">{i18n.t('connection_list_type')}</span>
                        <span class="ml-2">{this.preview.connectionType}</span>
                      </el-col>
                      <el-col span={8}>
                        <span class="max-label inline-block">
                          {i18n.t('datadiscovery_previewdrawer_lianjiemiaoshu')}
                        </span>
                        <span class="ml-2">{this.preview.connectionDesc}</span>
                      </el-col>
                    </el-row>
                    <el-row class="mt-2">
                      <el-col span={8}>
                        <span class="max-label inline-block">
                          {i18n.t('datadiscovery_previewdrawer_yewumingcheng')}
                        </span>
                        <span class="ml-2">{this.preview.businessName}</span>
                      </el-col>
                    </el-row>
                  </div>
                </div>
                <div class="mt-5">
                  <span class="drawer__header_text inline-block">
                    {i18n.t('datadiscovery_previewdrawer_shujuxiang')}
                  </span>
                  <TableList
                    class="discovery-page-table"
                    columns={this.data.columns}
                    data={this.preview.fields}
                    has-pagination={false}
                  ></TableList>
                </div>
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
