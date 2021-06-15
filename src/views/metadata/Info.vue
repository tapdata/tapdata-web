<template>
  <section class="metadata-info">
    <header class="header">
      <span
        @click="$router.push({ name: 'metadata' })"
        style="color: #409eff; cursor: pointer"
      >
        {{ $t('metadata.details.dataDirectory') }}
      </span>
      / {{ $t('metadata.details.dataDetails') }}
    </header>

    <el-container class="metadata-content">
      <!-- 元数据管理详情 头部信息 start -->
      <el-header class="matadata-head">
        <div class="img-box">
          <img src="static/editor/table.svg" />
        </div>
        <div class="table-info">
          <h3>
            <span v-if="metadataDataObj.alias_name">
              {{ metadataDataObj.alias_name }}
            </span>

            <span v-if="metadataDataObj.alias_name">(</span>
            {{ $t('metadata.details.originalTableName') }}：{{
              metadataDataObj.original_name
            }}
            <span v-if="metadataDataObj.alias_name">)</span>
            <el-button
              type="text"
              @click="handleChangeName"
              style="padding: 0 10px"
              >{{ $t('metadata.details.renamed') }}</el-button
            >
          </h3>
          <div class="description">
            <span v-if="metadataDataObj.comment">{{
              metadataDataObj.comment
            }}</span>

            <span v-else>{{ $t('metadata.details.clickAddDes') }}</span>

            <el-button
              class="e-button"
              type="text"
              @click="
                ;(editCommentDialogVisible = true),
                  (editCommentForm.comment = metadataDataObj.comment)
              "
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
      <el-main class="matadata-main">
        <!-- 元数据管理详情 左侧信息 start -->
        <div class="aside" v-if="!asideFalg">
          <i @click="asideFalg = true" class="iconfont icon-indent"></i>
          <p>{{ $t('metadata.details.propertyDetails') }}</p>
        </div>
        <el-aside class="metadata-aside" v-show="asideFalg">
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1">
              <template slot="title">
                <div class="iconBox">
                  <i class="header-icon el-icon-arrow-right"></i>
                  <span>{{ $t('metadata.details.basicAttributes') }}</span>
                  <i
                    @click.stop="asideFalg = false"
                    class="iconfont icon-outdent"
                  ></i>
                </div>
              </template>
              <ul>
                <!-- <li>
									<span class="label">{{ $t('metadata.details.name') }}：</span>
									<span>{{ metadataDataObj.alias_name }}</span>
									<el-button type="text" @click="handleChangeName">{{
										$t('metadata.details.renamed')
									}}</el-button>
								</li> -->
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.originalTableName') }}：</span
                  >
                  <el-tooltip
                    :content="metadataDataObj.original_name"
                    placement="right"
                  >
                    <span>{{ metadataDataObj.original_name }}</span>
                  </el-tooltip>
                </li>
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.typesOf') }}：</span
                  >
                  <span>{{ metadataDataObj.meta_type }}</span>
                </li>
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.owningConnection') }}：</span
                  >
                  <template
                    v-if="metadataDataObj.source && metadataDataObj.source.name"
                  >
                    <el-tooltip
                      :content="metadataDataObj.source.name"
                      placement="right"
                    >
                      <span>{{ metadataDataObj.source.name }}</span>
                    </el-tooltip>
                  </template>
                </li>
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.primaryKey') }}：</span
                  >
                  <el-tooltip
                    :content="metadataDataObj.qualified_name"
                    placement="right"
                  >
                    <span>{{ metadataDataObj.qualified_name }}</span>
                  </el-tooltip>
                </li>
                <!-- <li>
									<span class="label">{{ $t('metadata.details.uniquelyIdentifies') }}：</span>
									<el-tooltip :content="metadataDataObj.qualified_name" placement="right">
										<span>{{ metadataDataObj.qualified_name }}</span>
									</el-tooltip>
								</li> -->
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.source') }}：</span
                  >
                  <span>{{ metadataDataObj.create_source }}</span>
                </li>
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.creationTime') }}：</span
                  >
                  <span>{{
                    $moment(metadataDataObj.createTime).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  }}</span>
                </li>
                <!-- <li>
									<span class="label">{{ $t('metadata.details.founder') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li> -->
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.changeTime') }}：</span
                  >
                  <span>{{
                    $moment(metadataDataObj.last_updated).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  }}</span>
                </li>
                <li>
                  <span class="label"
                    >{{ $t('metadata.details.Modifier') }}：</span
                  >
                  <span>{{ metadataDataObj.last_user_name }}</span>
                </li>
              </ul>
            </el-collapse-item>
            <el-collapse-item name="2">
              <template slot="title">
                <div class="iconBox">
                  <i class="header-icon el-icon-arrow-right"></i
                  ><span>{{ $t('metadata.details.businessAttributes') }}</span>
                  <el-button type="text" @click.stop="creatBusiness"
                    >+ {{ $t('metadata.details.creat') }}</el-button
                  >
                </div>
              </template>
              <ul>
                <li
                  class="business"
                  v-for="(
                    item, key, index
                  ) in metadataDataObj.custom_properties"
                  :key="index"
                >
                  <span>{{ key }} : {{ item }}</span>
                  <span class="delete" @click="delBusiness(item, key, index)">{{
                    $t('button.delete')
                  }}</span>
                </li>
                <!-- <li>
									<span class="label">{{ $t('metadata.details.tableLayering') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.theme') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.taskReference') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li>
								<li>
									<span class="label">{{ $t('metadata.details.APIReference') }}：</span>
									<span>{{ metadataDataObj.original_name }}</span>
								</li> -->
              </ul>
            </el-collapse-item>
          </el-collapse>
        </el-aside>
        <!-- 元数据管理详情 左侧信息 end -->
        <!-- 元数据管理详情 主要内容 start -->
        <div class="content" :class="{ boxWidth: !asideFalg }">
          <!-- tab页面 start -->
          <div class="tapNav">
            <ul class="mune">
              <li
                v-for="item in menuList"
                v-show="item.mateTypes.includes(metadataDataObj.meta_type)"
                :key="item.icon"
                :class="activePanel === item.key ? 'active' : ''"
                @click="changePanel(item.key)"
              >
                <i :class="['iconfont', item.icon]"></i>
                <span slot="title">{{ item.name }}</span>
              </li>
            </ul>
          </div>
          <!-- tab页面 end -->

          <div class="table-box" v-if="activePanel == 'model'">
            <div class="table-page-topbar">
              <div class="table-page-search-bar">
                <ul class="search-bar">
                  <li class="item">
                    <el-input
                      :placeholder="$t('metadata.details.searchPlaceholder')"
                      clearable
                      prefix-icon="el-icon-search"
                      v-model="searchParams.keyword"
                      size="mini"
                      style="width: 160px"
                    ></el-input>
                  </li>
                  <!-- <li class="item">
										<el-select
											v-model="searchParams.source"
											:placeholder="$t('metadata.details.selsectSource')"
											clearable
											size="mini"
										>
											<el-option
												v-for="item in databaseModelOptions"
												:key="item.value"
												:label="item.label"
												:value="item.value"
											>
											</el-option>
										</el-select>
									</li> -->
                  <li class="item">
                    <el-button
                      type="text"
                      class="restBtn"
                      size="mini"
                      @click="reset()"
                    >
                      {{ $t('dataFlow.reset') }}
                    </el-button>
                  </li>
                </ul>
              </div>
              <div class="table-page-operation-bar">
                <div slot="operation" class="operation">
                  <el-button
                    class="btn btn-create"
                    size="mini"
                    @click="hanldCreateFiled"
                  >
                    <i class="iconfont icon-jia add-btn-icon"></i>
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
              border
              :element-loading-text="$t('dataFlow.dataLoading')"
              :data="tableFieldList"
              :header-cell-style="tableHeaderStyle"
            >
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <ul class="attributes">
                    <li class="more">
                      <label class="label">{{
                        $t('metadata.details.moreAttributes')
                      }}</label>
                      <span
                        >{{ $t('metadata.details.allowOverwrite') }} :
                        {{ scope.row.is_auto_allowed }}</span
                      >
                      <span
                        >{{ $t('metadata.details.fieldLength') }} :
                        {{ scope.row.columnSize }}</span
                      >
                      <span
                        >{{ $t('metadata.details.accuracy') }} :
                        {{ scope.row.precision }}</span
                      >
                      <span
                        >{{ $t('metadata.details.numberLength') }} :
                        {{ scope.row.scale }}</span
                      >
                    </li>
                    <li
                      v-if="scope.row.dictionary && scope.row.dictionary.length"
                    >
                      <label class="label">{{
                        $t('metadata.details.filedDictionary')
                      }}</label>
                      <div class="dropInfo">
                        <span
                          v-for="item in scope.row.dictionary"
                          :key="item.table_name"
                          >{{ item.key }} : {{ item.value }}</span
                        >
                      </div>
                    </li>
                    <li v-if="scope.row.relation && scope.row.relation.length">
                      <label class="label">{{
                        $t('metadata.details.foreignKeyAssociation')
                      }}</label>
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
              <el-table-column
                prop="field_name"
                :label="$t('metadata.details.filedAliasName')"
                width="150"
              >
              </el-table-column>
              <el-table-column
                prop="alias_name"
                :label="$t('metadata.details.alias')"
                width="80"
              >
                <template slot-scope="scope">
                  <div class="database-text" style="margin-left: 0">
                    <div>{{ scope.row.alias_name }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="java_type"
                :label="$t('metadata.details.fieldType')"
                width="100"
              >
                <template slot-scope="scope">
                  <div>{{ $t('metadata.details.' + scope.row.java_type) }}</div>
                </template>
              </el-table-column>
              <el-table-column
                prop="columnSize"
                :label="$t('metadata.details.fieldLength')"
                width="100"
              ></el-table-column>
              <el-table-column
                prop="comment"
                :label="$t('metadata.details.description')"
              ></el-table-column>
              <el-table-column
                width="120"
                :label="$t('metadata.details.opera')"
              >
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
              layout="total, ->, sizes, prev, pager, next"
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
          <!-- 表链路图 start-->
          <div class="table-box" v-if="activePanel == 'relations'">
            <Relations :tableId="metadataDataObj.qualified_name"></Relations>
          </div>
          <!-- 表链路图 end-->
          <!-- 版本管理 start -->
          <div class="table-box" v-if="activePanel == 'version'">
            <VersionList :histories="metadataDataObj"></VersionList>
          </div>
          <!-- 版本管理 end -->
          <!-- 索引 start -->
          <div class="table-box" v-if="activePanel == 'indexes'">
            <IndexManager
              :indexData="metadataDataObj"
              v-if="activePanel == 'indexes'"
            ></IndexManager>
          </div>
          <!-- 索引 end -->
          <!-- 数据校验 start -->
          <div class="table-box" v-if="activePanel == 'validation'">
            <Validation
              :validaData="metadataDataObj"
              v-if="activePanel == 'validation'"
            ></Validation>
          </div>
          <!-- 数据校验 end -->
          <!-- 数据预览 start -->
          <div class="table-box" v-if="activePanel == 'preview'">
            <Preview
              :validaData="metadataDataObj"
              v-if="activePanel == 'preview'"
            ></Preview>
          </div>
          <!-- 数据预览 end -->
          <!-- 管道 start -->
          <div class="table-box" v-if="activePanel == 'pipeline'">
            <Pipeline
              :pipelineData="metadataDataObj"
              v-if="activePanel == 'pipeline'"
            ></Pipeline>
          </div>
          <!-- 管道 end -->
          <!-- 数据集 start -->
          <div class="table-box" v-if="activePanel == 'collections'">
            <Collections
              :collectionData="metadataDataObj"
              v-if="activePanel == 'collections'"
            ></Collections>
          </div>
          <!-- 数据集 end -->
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
      <FormBuilder
        ref="form"
        v-model="businessForm"
        :config="businessFormConfig"
      ></FormBuilder>
      <span slot="footer" class="dialog-footer">
        <el-button
          class="cancel"
          @click="businessDialogVisible = false"
          size="small"
          >{{ $t('message.cancel') }}</el-button
        >
        <el-button type="primary" @click="saveBusiness()" size="small">{{
          $t('message.save')
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      width="600px"
      :title="$t('metadata.details.editAliasNameTitle')"
      :close-on-click-modal="false"
      :visible.sync="editNameDialogVisible"
      custom-class="dialogForm"
    >
      <el-form
        :model="editNameForm"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item
          :label="$t('metadata.details.originalTableName')"
          prop="name"
        >
          {{ editNameForm.original_name }}
        </el-form-item>
        <el-form-item :label="$t('metadata.details.alias')" prop="name">
          <el-input
            v-model="editNameForm.alias_name"
            size="small"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          class="cancel"
          @click="editNameDialogVisible = false"
          size="small"
          >{{ $t('message.cancel') }}</el-button
        >
        <el-button type="primary" @click="saveAliasName()" size="small">{{
          $t('message.save')
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      width="600px"
      :title="$t('metadata.details.editCommentTitle')"
      :close-on-click-modal="false"
      :visible.sync="editCommentDialogVisible"
      custom-class="dialogForm"
    >
      <el-form
        :model="editCommentForm"
        ref="ruleForm"
        label-width="60px"
        class="demo-ruleForm"
      >
        <el-form-item :label="$t('metadata.details.description')" prop="name">
          <el-input
            type="textarea"
            v-model="editCommentForm.comment"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          class="cancel"
          @click="editCommentDialogVisible = false"
          size="small"
          >{{ $t('message.cancel') }}</el-button
        >
        <el-button type="primary" @click="saveComment()" size="small">{{
          $t('message.save')
        }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import VersionList from './versionList'
import FormPage from './Form'
import Relations from '../relations/relations'
import IndexManager from './IndexManager'
import Validation from './Validation'
import Preview from './Preview'
import Pipeline from './Pipeline'
import Collections from './Collections'
export default {
  components: {
    VersionList,
    Relations,
    FormPage,
    IndexManager,
    Validation,
    Preview,
    Pipeline,
    Collections
  },
  data() {
    return {
      editCommentDialogVisible: false,
      loading: false,
      asideFalg: true,
      activeNames: ['1', '2'],
      activePanel: 'model',
      menuList: [
        {
          name: this.$t('metadata.details.model'),
          mateTypes: ['collection', 'table', 'mongo_view'],
          key: 'model'
        },
        {
          name: this.$t('metadata.details.version.version_control'),
          mateTypes: ['collection', 'table', 'mongo_view', 'api','database'],
          key: 'version'
        },
        {
          name: this.$t('metadata.details.index.title'),
          mateTypes: ['collection'],
          key: 'indexes'
        },
        {
          name: this.$t('metadata.details.validation.title'),
          mateTypes: ['collection'],
          key: 'validation'
        },
        {
          name: this.$t('metadata.details.pipeline.title'),
          mateTypes: ['collection', 'mongo_view'],
          key: 'pipeline'
        },
        {
          name: this.$t('metadata.details.preview.title'),
          mateTypes: ['collection', 'api'],
          key: 'preview'
        },
        {
          name: this.$t('metadata.details.collection'),
          mateTypes: ['database'],
          key: 'collections'
        },
        {
          name: this.$t('relations.blood'),
          mateTypes: ['collection', 'table', 'mongo_view', 'view'],
          key: 'relations'
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
        lineHeight: '30px',
        background: '#fafafa',
        color: '#999'
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
    // 获取数据
    // async handleGetDataApi() {
    // 	let params = {
    // 		where: {
    // 			databaseId: {
    // 				regexp: `^${this.$route.query.id}$`
    // 			},
    // 			meta_type: this.metadataDataObj.meta_type,
    // 			id: {
    // 				neq: this.metadataDataObj.id
    // 			},
    // 			'relation.table_name': {
    // 				neq: this.metadataDataObj.original_name
    // 			}
    // 		},
    // 		fields: {
    // 			histories: false,
    // 			original_name: true,
    // 			id: true
    // 		}
    // 	};

    // 	let resultData = await this.$api('MetadataInstances').get({ filter: JSON.stringify(params) });

    // 	if (resultData.data) {
    // 		this.getTableData = resultData.data;
    // 	}
    // },
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
      return Promise.all([
        this.$api('MetadataInstances').get([this.$route.query.id])
      ])
        .then(res => {
          this.metadataDataObj = res[0].data

          this.pageTotal =
            (res[0].data.fields && res[0].data.fields.length) || 0
          this.setCurrentPageData(this.metadataDataObj.fields || [])
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
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#409EFF' } }, item.field_name)
      ])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            this.metadataDataObj.fields.splice(index, 1)
            let groupRelation = {}
            let fields = this.metadataDataObj.fields

            if (fields && fields.length) {
              fields.forEach(field => {
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
            this.$api('MetadataInstances')
              .patch(this.metadataDataObj.id, params)
              .then(() => {
                this.getData()
                this.$message.success(this.$t('message.deleteOK'))
                done()
              })
              .catch(() => {
                this.$message.info(this.$t('message.deleteFail'))
              })
              .finally(() => {
                instance.confirmButtonLoading = false
              })
          } else {
            done()
          }
        }
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
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#409EFF' } }, key)
      ])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            for (let value in this.metadataDataObj.custom_properties) {
              if (value === key) {
                delete this.metadataDataObj.custom_properties[value]
              }
            }
            let params = {
              custom_properties: this.metadataDataObj.custom_properties
            }
            this.$api('MetadataInstances')
              .patch(this.metadataDataObj.id, params)
              .then(() => {
                this.getData()
                this.$message.success(
                  this.$t('metadata.details.success_Release')
                )
                done()
              })
              .catch(() => {
                this.$message.error(this.$t('message.saveFail'))
              })
              .finally(() => {
                instance.confirmButtonLoading = false
              })
          } else {
            done()
          }
        }
      })
    },
    // 保存业务属性
    saveBusiness() {
      let obj = {},
        custom_properties = this.metadataDataObj.custom_properties
          ? this.metadataDataObj.custom_properties
          : {}
      obj[this.businessForm.key] = this.businessForm.value
      let params = {
        custom_properties: Object.assign(custom_properties, obj)
      }
      this.$api('MetadataInstances')
        .patch(this.metadataDataObj.id, params)
        .then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        .catch(() => {
          this.$message.error(this.$t('message.saveFail'))
        })
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

      this.$api('MetadataInstances')
        .patch(this.metadataDataObj.id, params)
        .then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        .catch(() => {
          this.$message.error(this.$t('message.saveFail'))
        })
        .finally(() => {
          this.editNameDialogVisible = false
        })
    },
    // 编辑描述
    saveComment() {
      let params = {
        comment: this.editCommentForm.comment
      }
      this.$api('MetadataInstances')
        .patch(this.metadataDataObj.id, params)
        .then(() => {
          this.getData()
          this.$message.success(this.$t('metadata.details.success_Release'))
        })
        .catch(() => {
          this.$message.error(this.$t('message.saveFail'))
        })
        .finally(() => {
          this.editCommentDialogVisible = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.metadata-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: rgba(239, 241, 244, 100);
  .header {
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    background-color: rgba(250, 250, 250, 100);
    color: rgba(51, 51, 51, 100);
    font-size: 18px;
    text-align: left;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(222, 222, 228, 100);
    border-left: none;
    position: relative;
  }
  .metadata-content {
    padding: 10px;
    box-sizing: border-box;
    overflow: hidden;
    .matadata-head {
      display: flex;
      height: auto !important;
      flex-direction: row;
      padding: 20px;
      background-color: #fff;
      box-sizing: content-box;
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
      .img-box {
        width: 32px;
        height: 32px;
      }
      .table-info {
        padding-left: 20px;
        h3 {
          font-size: 18px;
          color: #333;
        }
        .description {
          padding: 0 0 5px;
          font-size: 12px;
          span {
            color: #aaa;
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
            color: #666;
            border-radius: 3px;
            background-color: #eff1f4;
          }
        }
      }
    }
    .matadata-main {
      display: flex;
      flex-direction: row;
      padding: 10px 0 0;
      overflow: hidden;
      .metadata-aside {
        width: 360px;
        height: 100%;
        border-radius: 3px;
        background-color: #fff;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        ul {
          padding: 10px 10px 10px 20px;
          font-size: 12px;
          li {
            padding-bottom: 10px;
            overflow: hidden;
            span {
              display: inline-block;
              float: left;
              color: #666;
            }
            .label {
              display: inline-block;
              width: 95px;
              color: #aaa;
            }
            .label + span {
              display: inline-block;
              max-width: calc(100% - 100px);
              text-overflow: ellipsis;
              overflow: hidden;
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
                color: #409eff;
              }
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
                color: #409eff;
              }
            }
          }
        }
      }
      .aside {
        width: 28px;
        height: 100%;
        padding: 5px 0;
        text-align: center;
        color: #666;
        font-size: 12px;
        background-color: #fff;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        .iconfont {
          cursor: pointer;
        }
        p {
          padding: 12px 5px;
        }
      }
      .content {
        width: calc(100% - 311px);
        margin-left: 10px;
        box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
        .tapNav {
          height: 28px;
          background-color: rgba(239, 241, 244, 100);
          .mune {
            display: inline-block;
            height: 28px;
            line-height: 25px;
            font-size: 12px;
            border-radius: 0px 3px 0px 0px;
            background-color: rgba(244, 245, 247, 100);
            // box-shadow: 0 -1px 10px 0px rgba(0, 0, 0, 0.15);
            li {
              float: left;
              height: 28px;
              padding: 0 15px;
              color: #666;
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
              background-color: #fff;
              border-right: 0;
              border-left: 0;
              // box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
            }
          }
        }

        .table-box {
          height: calc(100% - 28px);
          padding: 10px 20px;
          background-color: #fff;
          box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.15);
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
                  background: #f5f5f5;
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
                color: #666;
                border-radius: 10px;
                background-color: #f7edee;
              }
              .label {
                display: inline-block;
                float: left;
                padding: 5px 0;
                color: #aaa;
                border-radius: 0;
                background-color: transparent;
              }
              .dropInfo {
                float: left;
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
        .search-bar {
          display: flex;
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
.metadata-info {
  .el-collapse-item {
    font-size: 12px;
    .el-collapse-item__header {
      height: 28px;
      line-height: 28px;
      color: #333;
      background-color: #eff1f4;
    }
    .iconBox {
      width: 100%;

      .header-icon {
        // padding-right: 12px;
        // vertical-align: middle;
        transition: -webkit-transform 0.3s;
        -webkit-transition: -webkit-transform 0.3s;
        transition: transform 0.3s;
        transition: transform 0.3s, -webkit-transform 0.3s;
        transition: transform 0.3s, -webkit-transform 0.3s;
        font-weight: 300;
      }
      span {
        display: inline-block;
        padding-left: 12px;
        height: 30px;
        line-height: 30px;
      }
      .iconfont {
        display: inline-block;
        float: right;
        padding-top: 3px;
        cursor: pointer;
      }
      .el-button {
        float: right;
        height: 32px;
        line-height: 32px;
        padding: 0;
      }
    }
    .el-collapse-item__header {
      padding: 0 5px;
    }
    .el-collapse-item__header.is-active {
      .header-icon {
        margin-top: 12px;
        transform: rotate(90deg);
      }
    }
    .el-collapse-item__content {
      padding-bottom: 5px;
    }
    .el-collapse-item__arrow {
      display: none;
    }

    .el-collapse-item__wrap {
      border: 0;
    }
    .el-table__expanded-cell {
      padding: 10px 50px;
    }
  }
  .table-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    .table-page-table {
      th {
        padding: 0;
        background-color: #eff1f4 !important;
      }
      td,
      .is-scrolling-left ~ .el-table__fixed {
        border-right: 0;
      }
      th {
        border-right: 1px solid #dcdfe6;
      }
    }
    .table-page-pagination {
      padding-top: 5px;
      box-sizing: border-box;
      border-top: 1px solid #ddd;
      background-color: #fff;
      td,
      .is-scrolling-left ~ .el-table__fixed {
        border-right: 0;
      }
      th {
        border-right: 1px solid #dcdfe6;
      }
    }
  }
  .dialogForm {
    .el-form-item {
      margin-bottom: 10px;
      .el-form-item__label {
        text-align: left;
      }
      .el-textarea__inner {
        min-height: 100px !important;
      }
    }
    .el-button.cancel {
      color: #666;
      border: 0;
      background-color: #eee;
    }
  }
}
</style>
