import { defineComponent, reactive } from '@vue/composition-api'
import { TableList } from '@tap/component'
import './object.scss'

export default defineComponent({
  setup() {
    const data = reactive({
      activeName: 'first',
      activeUser: 'admin'
    })
    return {
      data
    }
  },
  render() {
    return (
      <div class="drawer-content">
        <div class="flex align-items-center ml-4">
          <header class="font-weight-bold mr-4">
            <span class="drawer__header_text inline-block">对象详情</span>
          </header>
          <el-tabs v-model={this.data.activeName} type="card">
            <el-tab-pane label="概览" name="first"></el-tab-pane>
            <el-tab-pane label="预览" name="second"></el-tab-pane>
          </el-tabs>
        </div>
        {this.data.activeName === 'first' ? (
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
                  <span class="ml-2">Personinfo</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={'8'}>
                  <span class="max-label inline-block">创建时间</span>
                  <span class="ml-2">2022-06-08</span>
                </el-col>
                <el-col span={'8'}>
                  <span class="max-label inline-block">变更时间</span>
                  <span class="ml-2">2022-06-08</span>
                </el-col>
                <el-col span={'8'}>
                  <span class="max-label inline-block">数据项</span>
                  <span class="ml-2">7</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={'8'}>
                  <span class="max-label inline-block">数据量</span>
                  <span class="ml-2">1000</span>
                </el-col>
                <el-col span={'8'}>
                  <span class="max-label inline-block">来源信息</span>
                  <span class="ml-2">无</span>
                </el-col>
                <el-col span={'8'}>
                  <span class="max-label inline-block">来源类型</span>
                  <span class="ml-2">数据连接</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={'8'}>
                  <span class="max-label inline-block">连接名</span>
                  <span class="ml-2">fannie_test</span>
                </el-col>
                <el-col span={'8'}>
                  <span class="max-label inline-block">连接类型</span>
                  <span class="ml-2">Orcale</span>
                </el-col>
                <el-col span={'8'}>
                  <span class="max-label inline-block">连接描述</span>
                  <span class="ml-2">地址、端口</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span={'8'}>
                  <span class="max-label inline-block">业务名称</span>
                  <span class="ml-2">1234</span>
                </el-col>
              </el-row>
            </div>
            <div class="mt-4">
              <span class="drawer__header_text inline-block">数据项</span>
              <TableList columns="columns" hide-on-single-page="true"></TableList>
            </div>
          </div>
        ) : (
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
                  <span class="ml-2">Personinfo</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span="8">
                  <span class="max-label inline-block">创建时间</span>
                  <span class="ml-2">2022-06-08</span>
                </el-col>
                <el-col span="8">
                  <span class="max-label inline-block">变更时间</span>
                  <span class="ml-2">2022-06-08</span>
                </el-col>
                <el-col span="8">
                  <span class="max-label inline-block">数据项</span>
                  <span class="ml-2">7</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span="8">
                  <span class="max-label inline-block">数据量</span>
                  <span class="ml-2">1000</span>
                </el-col>
                <el-col span="8">
                  <span class="max-label inline-block">来源信息</span>
                  <span class="ml-2">无</span>
                </el-col>
                <el-col span="8">
                  <span class="max-label inline-block">来源类型</span>
                  <span class="ml-2">数据连接</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span="8">
                  <span class="max-label inline-block">连接名</span>
                  <span class="ml-2">fannie_test</span>
                </el-col>
                <el-col span="8">
                  <span class="max-label inline-block">连接类型</span>
                  <span class="ml-2">Orcale</span>
                </el-col>
                <el-col span="8">
                  <span class="max-label inline-block">连接描述</span>
                  <span class="ml-2">地址、端口</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span="8">
                  <span class="max-label inline-block">业务名称</span>
                  <span class="ml-2">1234</span>
                </el-col>
              </el-row>
              <el-row class="mt-2">
                <el-col span="8">
                  <span class="max-label inline-block">业务描述</span>
                  <span class="ml-2">3456</span>
                </el-col>
              </el-row>
            </div>
            <div class="mt-4">
              <span class="drawer__header_text inline-block">数据预览</span>
              <TableList columns="columns" hide-on-single-page="true"></TableList>
            </div>
          </div>
        )}
      </div>
    )
  }
})
