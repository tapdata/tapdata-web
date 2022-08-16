import { defineComponent, reactive, ref } from '@vue/composition-api'
import { TableList } from '@tap/component'
import { discoveryApi } from '@tap/api'
import './index.scss'
import dayjs from 'dayjs'

export default defineComponent({
  setup() {
    const overview = ref('')
    const preview = ref('')
    const data = reactive({
      activeName: 'first',
      activeUser: 'admin',
      currentRow: '',
      loading: false,
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '类型',
          prop: 'dataType'
        },
        {
          label: '主键',
          prop: 'primaryKey'
        },
        {
          label: '外键',
          prop: 'foreignKey'
        },
        {
          label: '索引',
          prop: 'index'
        },
        {
          label: '非空',
          prop: 'notNull'
        },
        {
          label: '默认值',
          prop: 'defaultValue'
        },
        {
          label: '业务名称',
          prop: 'businessName'
        },
        {
          label: '业务类型',
          prop: 'businessType'
        },
        {
          label: '业务描述',
          prop: 'businessDesc'
        }
      ]
    })
    const loadData = row => {
      data.currentRow = row
      if (data.activeName === 'first') {
        data.loading = true
        discoveryApi
          .overView(row.id)
          .then(res => {
            preview.value = res || ''
          })
          .finally(() => {
            data.loading = false
          })
      }
    }
    return {
      data,
      preview,
      overview,
      loadData
    }
  },
  render() {
    return (
      <div class="drawer-content" v-loading={this.data.loading}>
        <div class="flex align-items-center ml-4">
          <header class="font-weight-bold mr-4">
            <span class="drawer__header_text inline-block">对象详情</span>
          </header>
          <el-tabs v-model={this.data.activeName} type="card">
            <el-tab-pane label="概览" name="first"></el-tab-pane>
            {/*<el-tab-pane label="预览" name="second"></el-tab-pane>*/}
          </el-tabs>
        </div>
        {this.preview ? (
          <div class="ml-4">
            <div class="user">
              <span class="mr-4">管理员</span>
              <el-select v-model={this.data.activeUser}>
                <el-option label="admin" value="admin"></el-option>
              </el-select>
            </div>
            <div class="details_data_info mt-4 p-5">
              <el-row class="mt-2">
                <el-col>
                  <span class="drawer__header_text inline-block">数据表</span>
                  <span class="ml-2">{this.preview.name}</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={8}>
                  <span class="max-label inline-block">创建时间</span>
                  <span class="ml-2">{dayjs(this.preview.createAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                </el-col>
                <el-col span={8}>
                  <span class="max-label inline-block">变更时间</span>
                  <span class="ml-2">{dayjs(this.preview.lastUpdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                </el-col>
                <el-col span={8}>
                  <span class="max-label inline-block">数据项</span>
                  <span class="ml-2">{this.preview.fieldNum}</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={8}>
                  <span class="max-label inline-block">数据量</span>
                  <span class="ml-2">{this.preview.rowNum}</span>
                </el-col>
                <el-col span={8}>
                  <span class="max-label inline-block">来源信息</span>
                  <span class="ml-2">{this.preview.sourceInfo}</span>
                </el-col>
                <el-col span={8}>
                  <span class="max-label inline-block">来源类型</span>
                  <span class="ml-2">{this.preview.sourceType}</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={8}>
                  <span class="max-label inline-block">连接名</span>
                  <span class="ml-2">{this.preview.connectionName}</span>
                </el-col>
                <el-col span={8}>
                  <span class="max-label inline-block">连接类型</span>
                  <span class="ml-2">{this.preview.connectionType}</span>
                </el-col>
                <el-col span={8}>
                  <span class="max-label inline-block">连接描述</span>
                  <span class="ml-2">{this.preview.connectionDesc}</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={8}>
                  <span class="max-label inline-block">业务名称</span>
                  <span class="ml-2">{this.preview.businessName}</span>
                </el-col>
              </el-row>
            </div>
            <div class="mt-4">
              <span class="drawer__header_text inline-block">数据项</span>
              <TableList columns={this.data.columns} data={this.preview.fields} has-pagination={false}></TableList>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
})
