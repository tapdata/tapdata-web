<template>
  <section class="metadata-info section-wrap" v-loading="loading">
    <el-container class="metadata-content">
      <!-- 元数据管理详情 头部信息 start -->
      <el-header class="matadata-head">
        <div class="img-box">
          <img src="@/assets/images/tu.png" />
        </div>
        <div class="table-info">
          <h3 class="fs-7 font-color-dark">
            <span v-if="metadataDataObj.alias_name">
              {{ metadataDataObj.alias_name }}
            </span>

            <span v-if="metadataDataObj.alias_name">(</span>
            {{
              metadataDataObj.meta_type === 'database'
                ? $t('metadata_detail_original_database_name')
                : $t('metadata_detail_original_table_name')
            }}：{{ metadataDataObj.original_name }}
            <span v-if="metadataDataObj.alias_name">)</span>
            <el-button type="text" @click="handleChangeName" style="padding: 0 10px">{{
              $t('metadata.details.renamed')
            }}</el-button>
          </h3>
          <div class="description pt-2">
            <span v-if="metadataDataObj.comment">{{ metadataDataObj.comment }}</span>

            <span v-else>{{ $t('metadata.details.clickAddDes') }}</span>
            <el-button
              class="e-button"
              type="text"
              @click=";(editCommentDialogVisible = true), (editCommentForm.comment = metadataDataObj.comment)"
              >{{ $t('metadata.details.edit') }}</el-button
            >
          </div>

          <!-- <ul>
						<li>来源表：2</li>
						<li>去向表：2</li>
						<li>任务引用：2</li>
						<li>API引用：2</li>
						<li>表分层：MDM</li>
						<li>业务域：2</li>
					</ul> -->
        </div>
      </el-header>
      <!-- 元数据管理详情 头部信息 end -->
      <el-main class="matadata-main mt-4">
        <!-- 元数据管理详情 左侧信息 start -->
        <div class="aside" v-if="!asideFalg">
          <ElLink @click="asideFalg = true" class="iconfont icon-indent"></ElLink>
        </div>
        <el-aside class="metadata-aside" v-show="asideFalg">
          <div class="metadata-aside-box">
            <div class="metadata-aside-head flex justify-content-between">
              <span class="fs-7 font-color-light fw-sub">{{ $t('metadata.details.basicAttributes') }}</span>
              <ElLink type="primary" @click.stop="asideFalg = false" class="iconfont icon-outdent"></ElLink>
            </div>
            <ul class="metadata-aside-main pt-4">
              <li>
                <span class="label">{{ $t('metadata.details.originalTableName') }}：</span>
                <el-tooltip :content="metadataDataObj.original_name" placement="right">
                  <span>{{ metadataDataObj.original_name }}</span>
                </el-tooltip>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.typesOf') }}：</span>
                <span>{{ metadataDataObj.meta_type }}</span>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.owningConnection') }}：</span>
                <template v-if="metadataDataObj.source && metadataDataObj.source.name">
                  <el-tooltip :content="metadataDataObj.source.name" placement="right">
                    <span>{{ metadataDataObj.source.name }}</span>
                  </el-tooltip>
                </template>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.primaryKey') }}：</span>
                <el-tooltip :content="metadataDataObj.qualified_name" placement="right">
                  <span>{{ metadataDataObj.qualified_name }}</span>
                </el-tooltip>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.source') }}：</span>
                <span>{{ metadataDataObj.create_source }}</span>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.creationTime') }}：</span>
                <span>{{ metadataDataObj.createTimeFmt }}</span>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.changeTime') }}：</span>
                <span>{{ metadataDataObj.lastUpdatedFmt }}</span>
              </li>
              <li>
                <span class="label">{{ $t('metadata.details.Modifier') }}：</span>
                <span>{{ metadataDataObj.last_user_name }}</span>
              </li>
            </ul>
          </div>
          <div class="metadata-aside-line"></div>

          <div class="metadata-aside-box">
            <div class="metadata-aside-head flex justify-content-between">
              <span class="fs-7 font-color-light fw-sub">{{ $t('metadata.details.businessAttributes') }}</span>
              <ElLink type="primary" size="mini" @click.stop="creatBusiness"
                >+ {{ $t('metadata.details.creat') }}</ElLink
              >
            </div>
            <ul class="metadata-aside-main pt-4">
              <li class="business" v-for="(item, key, index) in metadataDataObj.custom_properties" :key="index">
                <span>{{ key }} : {{ item }}</span>
                <ElLink type="primary" class="delete" @click="delBusiness(item, key, index)">{{
                  $t('button_delete')
                }}</ElLink>
              </li>
            </ul>
          </div>
        </el-aside>
        <!-- 元数据管理详情 左侧信息 end -->
        <!-- 元数据管理详情 主要内容 start -->
        <div class="metadata-main-content" :class="{ boxWidth: !asideFalg }">
          <!-- tab页面 start -->
          <el-tabs v-model="activePanel">
            <template v-for="item in menuList">
              <el-tab-pane
                v-if="item.mateTypes.includes(metadataDataObj.meta_type)"
                :key="item.key"
                :label="item.name"
                :name="item.key"
              >
                <!-- tab页面 end -->
                <div class="table-box" v-if="activePanel == 'model'">
                  <div class="table-page-topbar">
                    <div class="table-page-search-bar">
                      <ul class="search-bar">
                        <li class="item">
                          <el-input
                            :placeholder="$t('metadata.details.searchPlaceholder')"
                            clearable
                            v-model="searchParams.keyword"
                            size="mini"
                            style="width: 160px"
                          >
                            <span slot="prefix" class="el-input__icon h-100 ml-1">
                              <VIcon size="14">search</VIcon>
                            </span>
                          </el-input>
                        </li>
                        <li class="item">
                          <el-button type="text" class="restBtn" size="mini" @click="reset()">
                            {{ $t('dataFlow.reset') }}
                          </el-button>
                        </li>
                      </ul>
                    </div>
                    <div class="table-page-operation-bar">
                      <div slot="operation" class="operation">
                        <el-button class="btn-create" type="primary" size="mini" @click="hanldCreateFiled">
                          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
                          <span> {{ $t('metadata.details.createFiled') }}</span>
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <!-- 模型 start -->
                  <el-table
                    class="table-page-table"
                    height="100%"
                    v-loading="loading"
                    :element-loading-text="$t('dataFlow.dataLoading')"
                    :data="tableFieldList"
                    :header-cell-style="tableHeaderStyle"
                  >
                    <el-table-column type="expand">
                      <template slot-scope="scope">
                        <ul class="attributes">
                          <li class="more">
                            <label class="label">{{ $t('metadata.details.moreAttributes') }} </label>
                            <span>{{ $t('metadata.details.allowOverwrite') }} : {{ scope.row.is_auto_allowed }}</span>
                            <span>{{ $t('metadata.details.is_nullable') }} : {{ scope.row.is_nullable }}</span>
                            <span>{{ $t('metadata.details.fieldLength') }} : {{ scope.row.columnSize }}</span>
                            <span>{{ $t('metadata.details.accuracy') }} : {{ scope.row.precision }}</span>
                            <span>{{ $t('metadata.details.numberLength') }} : {{ scope.row.scale }}</span>
                            <span>{{ $t('metadata.details.selfIncreasing') }} : {{ scope.row.autoincrement }}</span>
                          </li>
                          <li v-if="scope.row.dictionary && scope.row.dictionary.length">
                            <label class="label">{{ $t('metadata.details.filedDictionary') }}</label>
                            <div class="dropInfo">
                              <span v-for="item in scope.row.dictionary" :key="item.table_name"
                                >{{ item.key }} : {{ item.value }}</span
                              >
                            </div>
                          </li>
                          <li v-if="scope.row.relation && scope.row.relation.length">
                            <label class="label">{{ $t('metadata.details.foreignKeyAssociation') }}</label>
                            <div class="dropInfo">
                              <span v-for="item in scope.row.relation" :key="item.key"
                                >{{ item.table_name }}, {{ item.field_name }},{{
                                  $t('metadata.details.' + item.rel)
                                }}</span
                              >
                            </div>
                          </li>
                        </ul>
                      </template>
                    </el-table-column>
                    <!-- <el-table-column type="selection" width="45" :reserve-selection="true"> </el-table-column> -->
                    <el-table-column prop="field_name" :label="$t('metadata.details.filedAliasName')" width="150">
                      <template slot-scope="scope">
                        <div class="database-text" style="margin-left: 0">
                          <div>
                            {{ scope.row.field_name }}
                            <i
                              v-if="scope.row.primary_key || scope.row.primary_key_position > 0"
                              class="iconfont icon-yuechi1"
                            ></i>
                          </div>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="alias_name" :label="$t('metadata.details.alias')" width="80">
                      <template slot-scope="scope">
                        <div class="database-text" style="margin-left: 0">
                          <div>{{ scope.row.alias_name }}</div>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="data_type" :label="$t('metadata.details.fieldType')" width="150">
                      <template slot-scope="scope">
                        <div>
                          {{ scope.row.data_type }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="columnSize"
                      :label="$t('metadata.details.fieldLength')"
                      width="100"
                    ></el-table-column>
                    <el-table-column prop="comment" :label="$t('metadata.details.description')"></el-table-column>
                    <el-table-column width="120" :label="$t('metadata.details.opera')">
                      <template slot-scope="scope">
                        <el-button
                          v-readonlybtn="'data_catalog_edition'"
                          size="mini"
                          type="text"
                          @click="edit(scope.row)"
                        >
                          {{ $t('metadata.details.edit') }}
                        </el-button>
                        <el-button
                          v-readonlybtn="'meta_data_deleting'"
                          v-if="scope.row.field_name !== '_id'"
                          size="mini"
                          type="text"
                          @click="remove(scope.row, scope.$index, 0)"
                          >{{ $t('button.delete') }}</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-pagination
                    background
                    class="table-page-pagination"
                    layout="->,total, sizes, prev, pager, next"
                    :current-page.sync="pageCurrent"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size.sync="pageSize"
                    :total="pageTotal"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  >
                  </el-pagination>

                  <!-- 模型 end -->
                </div>
                <!-- 版本管理 start -->
                <div class="table-box" v-if="activePanel == 'version'">
                  <VersionList :histories="metadataDataObj"></VersionList>
                </div>
                <!-- 版本管理 end -->
                <!-- 索引 start -->
                <div class="table-box" v-if="activePanel == 'indexes'">
                  <IndexManager :indexData="metadataDataObj" v-if="activePanel == 'indexes'"></IndexManager>
                </div>
                <!-- 索引 end -->
                <!-- 数据校验 start -->
                <div class="table-box" v-if="activePanel == 'validation'">
                  <Validation :validaData="metadataDataObj" v-if="activePanel == 'validation'"></Validation>
                </div>
                <!-- 数据校验 end -->
                <!-- 数据预览 start -->
                <div class="table-box" v-if="activePanel == 'preview'">
                  <Preview :validaData="metadataDataObj" v-if="activePanel == 'preview'"></Preview>
                </div>
                <!-- 数据预览 end -->
                <!-- 管道 start -->
                <div class="table-box" v-if="activePanel == 'pipeline'">
                  <Pipeline :pipelineData="metadataDataObj" v-if="activePanel == 'pipeline'"></Pipeline>
                </div>
                <!-- 管道 end -->
                <!-- 数据集 start -->
                <div class="table-box" v-if="activePanel == 'collections'">
                  <Collections :collectionData="metadataDataObj" v-if="activePanel == 'collections'"></Collections>
                </div>
                <!-- 数据集 end -->
              </el-tab-pane>
            </template>
          </el-tabs>
        </div>
        <!-- 元数据管理详情 主要内容 end -->
      </el-main>
    </el-container>
    <FormPage
      :dialogVisible="dialogFormVisible"
      @dialogVisible="handleDialogVisible"
      :data="fieldObj"
      :metadata="metadataDataObj"
      v-if="dialogFormVisible"
    ></FormPage>
    <el-dialog
      width="600px"
      :title="$t('metadata.details.businessAttrTitle')"
      :close-on-click-modal="false"
      :visible.sync="businessDialogVisible"
      custom-class="dialogForm"
    >
      <FormBuilder ref="form" v-model="businessForm" :config="businessFormConfig"></FormBuilder>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="businessDialogVisible = false" size="small">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="saveBusiness()" size="small">{{ $t('message.save') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      width="600px"
      :title="$t('metadata.details.editAliasNameTitle')"
      :close-on-click-modal="false"
      :visible.sync="editNameDialogVisible"
      custom-class="dialogForm"
    >
      <el-form :model="editNameForm" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="$t('metadata.details.originalTableName')" prop="name">
          {{ editNameForm.original_name }}
        </el-form-item>
        <el-form-item :label="$t('metadata.details.alias')" prop="name">
          <el-input v-model="editNameForm.alias_name" size="small" maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="editNameDialogVisible = false" size="small">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="saveAliasName()" size="small">{{ $t('message.save') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      width="600px"
      :title="$t('metadata.details.editCommentTitle')"
      :close-on-click-modal="false"
      :visible.sync="editCommentDialogVisible"
      custom-class="dialogForm"
    >
      <el-form :model="editCommentForm" ref="ruleForm" label-width="90px" class="demo-ruleForm">
        <el-form-item :label="$t('metadata.details.description')" prop="name">
          <el-input type="textarea" v-model="editCommentForm.comment" maxlength="500" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="editCommentDialogVisible = false" size="small">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="saveComment()" size="small">{{ $t('message.save') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import VersionList from './VersionList'
import FormPage from './Form'
import IndexManager from './IndexManager'
import Validation from './Validation'
import Preview from './Preview'
import Pipeline from './Pipeline'
import Collections from './Collections'
import VIcon from '@/components/VIcon'
import dayjs from 'dayjs'
import { metadataInstancesApi } from '@tap/api'

export default {
  components: {
    VersionList,
    FormPage,
    IndexManager,
    Validation,
    Preview,
    Pipeline,
    Collections,
    VIcon
  },
  data() {
    return {
      editCommentDialogVisible: false,
      loading: false,
      asideFalg: true,
      activePanel: 'version',
      menuList: [
        {
          name: this.$t('metadata.details.model'),
          mateTypes: ['collection', 'table', 'mongo_view'],
          key: 'model'
        },
        {
          name: this.$t('metadata.details.version.version_control'),
          mateTypes: [
            'collection',
            'table',
            'mongo_view',
            'api',
            'database',
            'dataflow',
            'view',
            'job',
            'directory',
            'ftp',
            'apiendpoint'
          ],
          key: 'version'
        }
      ],
      description: '',
      searchParams: {},
      multipleSelection: [],
      tableData: [],
      desFalg: true,
      dialogFormVisible: false,
      databaseModelOptions: [],
      fieldObj: {},
      metadataDataObj: {
        original_name: '',
        comment: ''
      },
      tableFieldList: [],
      pageSize: 20,
      pageCurrent: 1,
      pageTotal: 0,
      tableHeaderStyle: {
        padding: '0',
        lineHeight: '30px'
      },
      businessDialogVisible: false,
      businessForm: {
        key: '',
        value: ''
      },
      businessFormConfig: {
        form: {
          labelPosition: 'right',
          labelWidth: '100px'
        },
        items: [
          {
            type: 'input',
            label: this.$t('metadata.details.attrName'),
            field: 'key'
          },
          {
            type: 'input',
            label: this.$t('metadata.details.attrKey'),
            field: 'value'
          }
        ]
      },
      editNameDialogVisible: false,
      editNameForm: {
        original_name: '',
        alias_name: ''
      },
      editCommentForm: {
        comment: ''
      },
      filterData: []
    }
  },
  created() {
    this.getData()
  },
  watch: {
    'searchParams.keyword'(val) {
      let oldTableData = this.metadataDataObj.fields
      if (val) {
        this.filterData = []
        this.metadataDataObj.fields.filter(item => {
          if (
            String(item.field_name).indexOf(val) > -1 ||
            (item.alias_name && String(item.alias_name).indexOf(val) > -1) ||
            (item.comment && String(item.comment).indexOf(val) > -1)
          ) {
            this.filterData.push(item)
          }
        })
        this.setCurrentPageData(this.filterData)
      } else {
        this.setCurrentPageData(oldTableData)
      }
    },
    $route() {
      this.activePanel = 'model'
      this.getData()
    }
  },
  methods: {
    changePanel(key) {
      this.activePanel = key
    },
    //新建字段
    hanldCreateFiled() {
      this.fieldObj = {}
      this.dialogFormVisible = true
    },
    // 编辑字段
    edit(item) {
      this.fieldObj = item
      this.dialogFormVisible = true
    },
    // 获取数据
    getData() {
      let id = this.$route?.params?.id || ''
      this.loading = true
      return metadataInstancesApi
        .findTablesById([id])
        .then(res => {
          let data = res.data
          data.createTimeFmt = dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss')
          data.lastUpdatedFmt = dayjs(data.last_updated).format('YYYY-MM-DD HH:mm:ss')
          this.metadataDataObj = data
          this.pageTotal = data.fields?.length || 0
          this.setCurrentPageData(this.metadataDataObj.fields || [])
          if (['table', 'collection'].includes(this.metadataDataObj.meta_type)) {
            this.activePanel = 'model'
          } else if (['database'].includes(this.metadataDataObj.meta_type)) {
            this.activePanel = 'collections'
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 重置
    reset() {
      this.searchParams = {
        keyword: ''
      }
      this.setCurrentPageData(this.metadataDataObj.fields)
    },
    // 删除字段
    remove(item, index) {
      let primary_key_position_mum = item.primary_key_position
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#2C65FF' } }, item.field_name)
      ])
      this.$confirm(message, this.$t('message_title_prompt'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        // 分页删除条数
        let delIndex = (this.pageCurrent - 1) * this.pageSize + index
        this.metadataDataObj.fields.splice(delIndex, 1)
        let groupRelation = {}
        let fields = this.metadataDataObj.fields

        if (fields && fields.length) {
          fields.forEach(field => {
            if (
              // 主键值减1
              item.primary_key &&
              field.primary_key_position * 1 > primary_key_position_mum * 1
            ) {
              field.primary_key_position = field.primary_key_position - 1
            }
            field.relation &&
              field.relation.length &&
              field.relation.forEach(item => {
                let key = item.table_name + item.rel
                if (groupRelation[key]) {
                  groupRelation[key].fields.push({
                    local: item.field_name,
                    foreign: field.field_name
                  })
                } else {
                  groupRelation[key] = {
                    table_name: item.table_name,
                    rel: item.rel,
                    fields: [
                      {
                        local: item.field_name,
                        foreign: field.field_name
                      }
                    ]
                  }
                }
              })
          })
        }
        let relation = Object.values(groupRelation)
        let params = {
          fields: fields,
          relation: relation
        }
        metadataInstancesApi.patch(this.metadataDataObj.id, params).then(() => {
          this.getData()
          this.$message.success(this.$t('message.deleteOK'))
        })
        // .catch(() => {
        //   this.$message.info(this.$t('message.deleteFail'))
        // })
      })
    },
    // 关闭弹窗
    handleDialogVisible() {
      this.dialogFormVisible = false
      this.getData()
    },
    // 分页数据处理
    setCurrentPageData(tableData) {
      let begin = (this.pageCurrent - 1) * this.pageSize
      let end = this.pageCurrent * this.pageSize
      tableData = tableData.filter(item => !item.field_name.includes('__tapd8'))
      this.tableFieldList = tableData.slice(begin, end)
    },
    handleSizeChange(val) {
      this.pageSize = val
      if (this.searchParams.keyword) {
        this.setCurrentPageData(this.filterData)
      } else {
        this.setCurrentPageData(this.metadataDataObj.fields)
      }
    },
    handleCurrentChange(val) {
      this.pageCurrent = val
      if (this.searchParams.keyword) {
        this.setCurrentPageData(this.filterData)
      } else {
        this.setCurrentPageData(this.metadataDataObj.fields)
      }
    },
    // 新增业务属性
    creatBusiness() {
      this.businessDialogVisible = true
      this.businessForm = {
        key: '',
        value: ''
      }
    },
    // 删除业务属性
    delBusiness(item, key) {
      const h = this.$createElement
      let message = h('p', [this.$t('message.deleteOrNot') + ' ', h('span', { style: { color: '#409EFF' } }, key)])
      this.$confirm(message, this.$t('message_title_prompt'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(res => {
        if (!res) {
          return
        }
        for (let value in this.metadataDataObj.custom_properties) {
          if (value === key) {
            delete this.metadataDataObj.custom_properties[value]
          }
        }
        let params = {
          custom_properties: this.metadataDataObj.custom_properties
        }
        metadataInstancesApi.patch(this.metadataDataObj.id, params).then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        // .catch(() => {
        //   this.$message.error(this.$t('message_save_fail'))
        // })
        // .finally(() => {
        //   instance.confirmButtonLoading = false
        // })
      })
    },
    // 保存业务属性
    saveBusiness() {
      let obj = {},
        custom_properties = this.metadataDataObj.custom_properties ? this.metadataDataObj.custom_properties : {}
      obj[this.businessForm.key] = this.businessForm.value
      let params = {
        custom_properties: Object.assign(custom_properties, obj)
      }
      metadataInstancesApi
        .patchId(this.metadataDataObj.id, params)
        .then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        // .catch(() => {
        //   this.$message.error(this.$t('message_save_fail'))
        // })
        .finally(() => {
          this.businessDialogVisible = false
        })
    },
    // 修改名称
    handleChangeName() {
      this.editNameForm = {
        original_name: this.metadataDataObj.original_name,
        alias_name: this.metadataDataObj.alias_name
      }
      this.editNameDialogVisible = true
    },
    // 保存改名
    saveAliasName() {
      let params = {
        alias_name: this.editNameForm.alias_name
      }
      // params.alias_name = this.editNameForm.alias_name;

      metadataInstancesApi
        .patchId(this.metadataDataObj.id, params)
        .then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        // .catch(() => {
        //   this.$message.error(this.$t('message_save_fail'))
        // })
        .finally(() => {
          this.editNameDialogVisible = false
        })
    },
    // 编辑描述
    saveComment() {
      let params = {
        comment: this.editCommentForm.comment
      }
      metadataInstancesApi
        .patchId(this.metadataDataObj.id, params)
        .then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        // .catch(() => {
        //   this.$message.error(this.$t('message_save_fail'))
        // })
        .finally(() => {
          this.editCommentDialogVisible = false
        })
    },
    // 返回上一页
    back() {
      this.$router.go(-1)
      // $router.push({ name: 'metadata' })
    }
  }
}
</script>
<style lang="scss" scoped>
.metadata-info {
  // display: flex;
  // flex-direction: column;
  // width: 100%;
  // height: 100%;
  // background-color: rgba(239, 241, 244, 100);
  .icon-yuechi1 {
    color: darkorange;
  }
  .header {
    position: relative;
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    background-color: rgba(250, 250, 250, 100);
    color: rgba(51, 51, 51, 100);
    font-size: 16px;
    text-align: left;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(222, 222, 228, 100);
    border-left: none;
    font-size: 16px;
    font-weight: 600;
    & > span {
      color: map-get($color, primary);
      cursor: pointer;
    }
  }
  .metadata-content {
    box-sizing: border-box;
    overflow: hidden;
    .matadata-head {
      display: flex;
      height: auto !important;
      flex-direction: row;
      padding: 20px;
      background-color: map-get($bgColor, white);
      box-sizing: content-box;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
      .img-box {
        width: 55px;
        height: 55px;
        line-height: 55px;
        border-radius: 50%;
        text-align: center;
        background-color: rgba(44, 101, 255, 0.08);
        img {
          width: 30px;
          vertical-align: middle;
        }
      }
      .table-info {
        padding-left: 20px;
        .description {
          padding: 0 0 5px;
          font-size: 12px;
          span {
            color: rgba(0, 0, 0, 0.2);
          }
          .e-button {
            padding: 5px 12px;
          }
        }
        ul {
          box-sizing: content-box;
          overflow: hidden;
          li {
            float: left;
            margin-right: 12px;
            padding: 3px 10px;
            font-size: 12px;
            color: map-get($fontColor, light);
            border-radius: 3px;
            background-color: #eff1f4;
          }
        }
      }
    }
    .matadata-main {
      display: flex;
      flex-direction: row;
      padding: 0;
      overflow: hidden;
      background-color: map-get($bgColor, white);
      border-radius: 4px;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
      .metadata-aside {
        display: flex;
        flex: 1;
        flex-direction: column;
        width: 360px;
        height: 100%;
        // padding: 20px;
        border-radius: 3px;
        background-color: map-get($bgColor, white);
        box-sizing: border-box;
        border-right: 1px solid map-get($borderColor, light);
        .metadata-aside-box {
          flex: 1;
          padding: 20px;
          .metadata-aside-head {
            display: flex;
            i {
              cursor: pointer;
            }
          }
          .metadata-aside-main {
            font-size: 12px;
            li {
              padding-bottom: 10px;
              overflow: hidden;
              span {
                display: inline-block;
                color: map-get($fontColor, dark);
              }
              .label {
                display: inline-block;
                width: 95px;
                color: map-get($fontColor, light);
              }
              .label + span {
                display: inline-block;
                max-width: calc(100% - 100px);
                width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                text-align: right;
              }
            }
            li.business {
              display: flex;
              justify-content: space-between;
              .delete {
                display: none;
              }

              &:hover {
                .delete {
                  display: inline-block;
                  cursor: pointer;
                  // color: map-get($color, primary);
                }
              }
            }
          }
        }
        .metadata-aside-line {
          height: 1px;
          background-color: #e8e8e8;
        }
      }
      .aside {
        width: 28px;
        height: 100%;
        padding: 23px 0;
        text-align: right;
        font-size: 12px;
        background-color: map-get($bgColor, white);
        border-right: 1px solid map-get($borderColor, light);
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        .iconfont {
          cursor: pointer;
        }
        p {
          padding: 12px 5px;
        }
      }
      .metadata-main-content {
        width: calc(100% - 311px);
        // margin-left: 10px;
        // box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
        background-color: map-get($bgColor, white);
        .tap-nav {
          height: 60px;
          .mune {
            display: inline-block;
            height: 60px;
            line-height: 60px;
            font-size: 12px;
            border-radius: 0px 3px 0px 0px;
            background-color: rgba(244, 245, 247, 100);
            // box-shadow: 0 -1px 10px 0px rgba(0, 0, 0, 0.15);
            li {
              float: left;
              height: 28px;
              padding: 0 15px;
              color: map-get($fontColor, light);
              text-align: center;
              border-right: 1px solid #dedee4;
              cursor: pointer;
              &:last-child {
                border-right: 0;
              }
            }
            li.active {
              height: 29px;
              border-radius: 3px 3px 0px 0px;
              background-color: map-get($bgColor, white);
              border-right: 0;
              border-left: 0;
              // box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
            }
          }
        }

        ::v-deep {
          .el-tabs {
            display: flex;
            flex-direction: column;
            flex: 1;
            height: 100%;
            .el-tabs__header {
              margin: 0;
              .el-tabs__nav-wrap,
              .el-tabs__nav-scroll,
              .el-tabs__nav {
                height: 60px;
                line-height: 6ppx;
              }
              .el-tabs__item {
                height: 60px;
                line-height: 60px;
                padding-left: 20px;
              }
              .el-tabs__nav-prev,
              .el-tabs__nav-next {
                line-height: 60px;
              }
            }

            .el-tabs__content {
              flex: 1;
              .el-tab-pane {
                height: 100%;
                flex: 1;
                .table-box {
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                  padding: 20px;
                  background-color: map-get($bgColor, white);
                  // box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.15);
                  box-sizing: border-box;
                  .table-page-topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap-reverse;
                    // padding: 0 10px;

                    .table-page-search-bar {
                      margin-right: 5px;
                      margin-bottom: 10px;
                      .search-bar {
                        display: flex;
                        flex-direction: row;
                      }
                    }
                    .table-page-operation-bar {
                      margin-bottom: 10px;
                      text-align: right;
                      .operation {
                        .iconfont {
                          font-size: 12px;
                        }
                        .btn {
                          padding: 7px;
                          background: map-get($bgColor, main);
                          i.iconfont {
                            font-size: 12px;
                          }
                          &.btn-create {
                            margin-left: 5px;
                          }
                        }
                      }
                    }
                  }
                  .attributes {
                    li {
                      width: 100%;
                      margin: 5px 0;
                      font-size: 12px;
                      span {
                        display: inline-block;
                        padding: 3px 10px;
                        margin: 3px 5px;
                        color: map-get($fontColor, light);
                        border-radius: 10px;
                        background-color: #f7edee;
                      }
                      .label {
                        display: inline-block;
                        padding: 5px 0;
                        color: #aaa;
                        border-radius: 0;
                        background-color: transparent;
                      }
                      .dropInfo {
                        display: inline-block;
                        width: calc(100% - 60px);
                        white-space: break-spaces;
                        overflow: hidden;
                      }
                    }
                    li.more {
                      span {
                        background-color: #e2f1f9;
                      }
                    }
                  }
                }
              }
            }
          }

          .table-page-table {
            .el-table__header-wrapper {
              height: 40px;
              th {
                padding: 0;
                line-height: 40px !important;
                // background-color: map-get($bgColor, normal);
              }
            }
          }
          .table-page-pagination {
            padding-top: 20px;
          }

          flex-wrap: wrap;
          li {
            margin-right: 10px;
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
      .boxWidth {
        width: calc(100% - 30px);
      }
    }
  }
}
</style>
<style lang="scss">
// .metadata-info {
//   .el-collapse {
//     border-top: 0;
//   }
//   .el-collapse-item {
//     font-size: 12px;
//     .el-collapse-item__header {
//       height: 28px;
//       line-height: 28px;
//       color: #333;
//       border: 0;
//       // background-color: #eff1f4;
//     }
//     .iconBox {
//       display: flex;
//       width: 100%;
//       height: 28px;
//       line-height: 28px;
//       justify-content: space-between;
//       .header-icon {
//         float: left;
//         margin-top: 8px;
//         // padding-right: 12px;
//         // vertical-align: middle;
//         transition: -webkit-transform 0.3s;
//         -webkit-transition: -webkit-transform 0.3s;
//         transition: transform 0.3s;
//         transition: transform 0.3s, -webkit-transform 0.3s;
//         transition: transform 0.3s, -webkit-transform 0.3s;
//         font-weight: 300;
//       }
//       span {
//         display: inline-block;
//         padding-left: 12px;
//         height: 28px;
//         line-height: 28px;
//       }
//       .iconfont {
//         display: inline-block;
//         line-height: 28px;
//         // float: right;
//         cursor: pointer;
//         &:hover {
//           color: map-get($color, primary);
//         }
//       }
//       .el-button {
//         padding: 0;
//         font-size: 12px;
//         color: #333;
//         &:hover {
//           color: map-get($color, primary);
//         }
//       }
//     }
//     .el-collapse-item__header {
//       padding: 0 5px;
//     }
//     .el-collapse-item__header.is-active {
//       .header-icon {
//         margin-top: 8px;
//         transform: rotate(90deg);
//       }
//     }
//     .el-collapse-item__content {
//       padding-bottom: 5px;
//     }
//     .el-collapse-item__arrow {
//       display: none;
//     }

//     .el-collapse-item__wrap {
//       border: 0;
//     }
//     .el-table__expanded-cell {
//       padding: 10px 50px;
//     }
//   }
//   .table-box {
//     flex: 1;
//     display: flex;
//     flex-direction: column;
//     overflow: hidden;
//     box-sizing: border-box;
//     border-radius: 3px;
//     .table-page-table {
//       th {
//         padding: 0;
//         background-color: #eff1f4 !important;
//       }
//       td,
//       .is-scrolling-left ~ .el-table__fixed {
//         border-right: 0;
//       }
//       th {
//         border-right: 1px solid #dcdfe6;
//       }
//     }
//     .table-page-pagination {
//       padding-top: 5px;
//       box-sizing: border-box;
//       border-top: 1px solid #ddd;
//       background-color: map-get($bgColor, white);
//       td,
//       .is-scrolling-left ~ .el-table__fixed {
//         border-right: 0;
//       }
//       th {
//         border-right: 1px solid #dcdfe6;
//       }
//     }
//   }
//   .dialogForm {
//     .el-form-item {
//       margin-bottom: 10px;
//       .el-form-item__label {
//         text-align: left;
//       }
//       .el-textarea__inner {
//         min-height: 100px !important;
//       }
//     }
//     .el-button.cancel {
//       color: map-get($fontColor, light);
//       border: 0;
//       background-color: #eee;
//     }
//   }
// }
</style>
