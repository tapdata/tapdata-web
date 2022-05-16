<template>
  <div class="connection-from" v-loading="loadingFrom">
    <div class="connection-from-body">
      <main class="connection-from-main">
        <div class="connection-from-title" v-if="!$getSettingByKey('DFS_TCM_PLATFORM')">
          {{
            $route.params.id ? this.$t('connection_form_edit_connection') : this.$t('connection_form_creat_connection')
          }}
        </div>
        <!-- <header class="header" v-if="!$getSettingByKey('DFS_TCM_PLATFORM')">
          {{ $route.params.id ? $t('connection_form_edit_connection') : $t('connection_form_creat_connection') }}
        </header> -->
        <!-- <div class="databaseFrom-body">
          <main class="databaseFrom-main"> -->
        <div class="connection-from-label" v-if="$route.params.id">
          <label class="label">{{ $t('connection_form_data_source') }}: </label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <div class="content ml-2">{{ model.name }}</div>
            <div class="addBtn color-primary ml-2" @click="dialogEditNameVisible = true">
              {{ $t('connection_form_rename') }}
            </div>
          </div>
        </div>
        <div class="connection-from-label" v-else>
          <label class="label">{{ $t('connection_form_data_source_type') }}:</label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <span class="ml-2">{{ databaseTypeLabel }}</span>
            <el-button class="ml-2" type="text" @click="dialogDatabaseTypeVisible = true">
              {{ $t('connection_form_change') }}
            </el-button>
          </div>
        </div>
        <div class="form-wrap">
          <div class="form">
            <SchemaToForm
              v-if="isPdk"
              ref="schemaToForm"
              :schema="schemaData"
              :colon="true"
              label-width="160"
            ></SchemaToForm>
            <form-builder
              v-else
              ref="form"
              class="form-builder grey"
              v-model="model"
              :config="config"
              @value-change="formChange"
            >
              <div class="url-tip" slot="name" v-if="!$route.params.id">
                中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格
              </div>
              <div class="url-tip" slot="shareCdc-tip" v-if="mongodbList.length === 0 && model.showShareConfig">
                <el-link type="primary" target="_blank" href="#/connections/create?databaseType=mongodb"
                  >请先创建mongodb数据源</el-link
                >
                /
                <span class="refresh" @click="getMongodb">
                  刷新数据 <VIcon class="font-color-slight">refresh</VIcon></span
                >
              </div>
              <div class="url-tip" slot="ecsList" v-if="model.sourceType === 'ecs'">
                <el-select
                  v-model="model.ecs"
                  clearable
                  placeholder="请选择"
                  v-loadmore="loadMore"
                  style="width: 100%; margin-top: 10px"
                  @change="handleEcsList"
                >
                  <el-option v-for="item in ecsList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
                </el-select>
                <el-select v-model="model.vpc" clearable placeholder="请选择" style="width: 100%; margin-top: 10px">
                  <el-option v-for="item in vpcList" :key="item.portId" :label="item.vpcName" :value="item.portId">
                  </el-option>
                </el-select>
              </div>
              <div class="url-tip" slot="vpc-setting" v-if="model.ecs">
                <el-checkbox v-model="model.checkedVpc">授权允许数据同步服务访问您的ECS实例</el-checkbox>
                <span v-if="model.checkedVpc">
                  <el-link
                    v-if="!model.platformInfo.strategyExistence"
                    :underline="false"
                    @click="createStrategy()"
                    style="color: #d54e21"
                    :disabled="createStrategyDisabled"
                    >点击开通</el-link
                  >
                  <span v-else>已开通</span>
                </span>
              </div>
              <div class="url-tip" slot="accessNodeProcessId">
                <ElForm :model="model" ref="agentForm">
                  <ElFormItem
                    required
                    prop="accessNodeProcessId"
                    :rules="{
                      required: true,
                      message: $t('connection_form_name_ip') + $t('tips_rule_not_empty'),
                      trigger: 'blur'
                    }"
                  >
                    <ElSelect
                      v-model="model.accessNodeProcessId"
                      :placeholder="$t('connection_form_name_ip')"
                      v-loadmore="loadMore"
                      style="width: 100%"
                    >
                      <ElOption
                        v-for="item in accessNodeList"
                        :key="item.processId"
                        :label="item.hostName"
                        :value="item.processId"
                      >
                        <span class="fl">{{ item.hostName }}</span>
                        <span class="font-color-light fr pl-2">{{ item.ip }}</span>
                      </ElOption>
                    </ElSelect>
                  </ElFormItem>

                  <!-- <el-input
                  :rows="5"
                  v-model="model.accessNodeProcessId"
                  :placeholder="$t('connection_form_name_ip')"
                ></el-input> -->
                </ElForm>
              </div>
              <div class="url-tip" slot="urlTip" v-if="model.isUrl" v-html="$t('dataForm.form.uriTips.content')"></div>
              <!-- rest api -->
              <div class="url-tip" slot="req_pre_process">
                <div>function request_process(url, headers, request_params, offset) {</div>
                <el-input type="textarea" :rows="5" v-model="model.req_pre_process"></el-input>
                <div>return {'url': url, 'headers':headers,'request_params':request_params, 'offset': offset};}</div>
              </div>
              <div class="url-tip" slot="resp_pre_process">
                <div>function response_process(result) {</div>
                <div>var tapdata_result = { data_rows:[], access_token:null, 'tapdata_offset': offset }</div>
                <el-input type="textarea" :rows="5" v-model="model.resp_pre_process"></el-input>
                <div>return tapdata_result; }</div>
              </div>
              <!-- custom_connection -->
              <div slot="cdcScrip">
                <div>function requestData(ctx) {</div>
                <CodeEditor v-model="model.custom_cdc_script" :width="width" :height="height"></CodeEditor>
                <div>}</div>
              </div>
              <div slot="historyScrip">
                <div>function requestData() {</div>
                <CodeEditor v-model="model.custom_initial_script" :width="width" :height="height"></CodeEditor>
                <div>}</div>
              </div>
              <div slot="targetScrip">
                <div>
                  data = [{
                  <span style="color: #998; font-style: italic"> // data is an array</span>
                </div>
                <div style="margin-left: 30px">
                  op : " i ",
                  <span style="color: #998; font-style: italic"> // i - insert, u - update, d - delete</span>
                </div>
                <div style="margin-left: 30px">
                  from : " ",
                  <span style="color: #998; font-style: italic"> // source table name</span>
                </div>
                <div style="margin-left: 30px">
                  data : { },
                  <span style="color: #998; font-style: italic"> // master data</span>
                </div>
                <div>}]</div>
                <div style="padding-bottom: 5px; margin-top: 10px; font-weight: bold">function onData(data) {</div>
                <CodeEditor v-model="model.custom_ondata_script" :width="width" :height="height"></CodeEditor>
                <div>}</div>
              </div>
              <div slot="custom_before_script">
                <div>function before() {</div>
                <CodeEditor v-model="model.custom_before_script" :width="width" :height="height"></CodeEditor>
                <div>}</div>
              </div>
              <div slot="custom_after_script">
                <div>function after() {</div>
                <CodeEditor v-model="model.custom_after_script" :width="width" :height="height"></CodeEditor>
                <div>}</div>
              </div>
            </form-builder>
            <!-- rest api -->
            <template v-if="databaseType === 'rest api'">
              <div class="rest-api-box">
                <div class="rest-api-label">URL</div>
                <div class="url-tip rest-api-url">
                  <el-form :model="model" ref="urlInfoForm" label-width="102px" class="urlInfoForm">
                    <el-row v-for="(item, parentIndex) in model.url_info" :key="parentIndex">
                      <div class="rest-api-row">
                        {{ item.url_type }}
                      </div>
                      <el-col :span="24" class="fromLoopBox">
                        <el-form-item
                          label="URL"
                          :prop="'url_info.' + parentIndex + '.url'"
                          :rules="{
                            required: true,
                            message: 'URL不能为空',
                            trigger: 'blur'
                          }"
                        >
                          <el-input v-model="item.url" size="mini"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12" class="fromLoopBox" type="flex" :gutter="20">
                        <el-form-item :label="$t('dataForm.form.restApi.url_info_method')" :prop="item.method">
                          <el-select v-model="item.method" class="min-input" size="mini">
                            <el-option label="GET" value="GET"></el-option>
                            <el-option label="POST" value="POST"></el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12" class="fromLoopBox" v-show="item.method === 'POST'">
                        <el-form-item label="Content Type" :prop="item.content_type">
                          <el-select v-model="item.content_type" class="small-input" size="mini">
                            <el-option label="form-data" value="application/form-data"></el-option>
                            <el-option
                              label="x-www-form-urlencoded"
                              value="application/x-www-form-urlencoded;charset=UTF-8"
                            ></el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="24" class="fromLoopBox">
                        <el-form-item
                          :label="$t('dataForm.form.restApi.url_info_initial_offset')"
                          :prop="item.offset_field"
                          v-if="model.data_sync_mode === 'INCREMENTAL_SYNC' || item.url_type === 'INCREMENTAL_SYNC'"
                        >
                          <el-input v-model="item.offset_field" size="mini"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="24" class="fromLoopBox">
                        <el-form-item label="Headers">
                          <div
                            v-for="(header, headerIndex) in item.headerArray"
                            :key="headerIndex"
                            class="rest-api-Array"
                          >
                            <el-input
                              :placeholder="$t('dataForm.form.restApi.url_info_header_name')"
                              class="medium-input"
                              size="mini"
                              v-model="header.name"
                            ></el-input>
                            <el-input
                              :placeholder="$t('dataForm.form.restApi.url_info_header_value')"
                              class="medium-input rest-api-margin"
                              size="mini"
                              v-model="header.value"
                            ></el-input>
                            <i
                              class="iconfont icon-jia add-btn-icon rest-api-margin"
                              @click="addHeader(parentIndex)"
                            ></i>
                            <i
                              class="iconfont icon-quxiao add-btn-icon rest-api-margin"
                              v-show="item.headerArray.length > 1"
                              @click="removeHeader(parentIndex, headerIndex)"
                            ></i>
                          </div>
                        </el-form-item>
                      </el-col>
                      <el-col :span="24" class="fromLoopBox">
                        <el-form-item label="Parameters" prop="parameters">
                          <div
                            v-for="(parameter, parameterIndex) in item.parameterArray"
                            :key="parameterIndex"
                            class="rest-api-Array"
                          >
                            <el-input
                              :placeholder="$t('dataForm.form.restApi.url_info_parameter_name')"
                              class="medium-input"
                              size="mini"
                              v-model="parameter.name"
                            ></el-input>
                            <el-input
                              :placeholder="$t('dataForm.form.restApi.url_info_parameter_value')"
                              class="medium-input rest-api-margin"
                              size="mini"
                              v-model="parameter.value"
                            ></el-input>
                            <i
                              class="iconfont icon-jia add-btn-icon rest-api-margin"
                              @click="addParameter(parentIndex)"
                            ></i>
                            <i
                              class="iconfont icon-quxiao add-btn-icon rest-api-margin"
                              v-show="item.parameterArray.length > 1"
                              @click="removeParameter(parentIndex, parameterIndex)"
                            ></i>
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
              </div>
            </template>
            <!-- grid fs -->
            <template
              v-if="
                databaseType === 'gridfs' &&
                model.file_type === 'excel' &&
                model.gridfsReadMode === 'data' &&
                model.connection_type === 'source'
              "
            >
              <div class="gridfs-box">
                <el-form label-width="200px" label-position="right" :rules="gridFSrules" :model="model" ref="excelForm">
                  <!--工作页 -->
                  <el-form-item :label="$t('editor.fileFormBuilder.sheet_range')" prop="sheet_start">
                    <el-input
                      v-model.number="model.sheet_start"
                      maxlength="3"
                      show-word-limit
                      size="mini"
                      onkeyup="model.sheet_start = model.sheet_start.replace(/[^\d.]/g,'');"
                      :placeholder="$t('editor.fileFormBuilder.sheet_start')"
                    ></el-input>
                    <span class="separate"> ~ </span>
                    <el-input
                      v-model="model.sheet_end"
                      maxlength="3"
                      show-word-limit
                      size="mini"
                      onkeyup="model.sheet_end = model.sheet_end.replace(/[^\d.]/g,'');"
                      :placeholder="$t('editor.fileFormBuilder.sheet_end')"
                    ></el-input>
                  </el-form-item>
                  <!--字段范围 -->
                  <el-form-item
                    :label="$t('editor.fileFormBuilder.excel_header_type')"
                    class="headerType"
                    prop="excel_header_start"
                  >
                    <div>
                      <el-radio-group v-model="model.gridfs_header_type" @change="changeHeaderType">
                        <el-radio label="specified_line">{{
                          $t('editor.fileFormBuilder.excel_header_coordinate')
                        }}</el-radio>
                        <el-radio label="custom">{{ $t('editor.fileFormBuilder.excel_header_range') }}</el-radio>
                      </el-radio-group>
                      <el-input
                        v-model="model.gridfs_header_config"
                        size="mini"
                        :placeholder="$t('editor.fileFormBuilder.header_type_custom_label')"
                        v-show="model.gridfs_header_type === 'custom'"
                      ></el-input>
                      <div v-show="model.gridfs_header_type !== 'custom'" class="excel_header_start">
                        <el-input
                          v-model="model.excel_header_start"
                          size="mini"
                          :placeholder="$t('editor.fileFormBuilder.excel_header_start')"
                        ></el-input>
                        <span class="separate"> ~ </span>
                        <el-input
                          v-model="model.excel_header_end"
                          size="mini"
                          :placeholder="$t('editor.fileFormBuilder.excel_header_end')"
                        ></el-input>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item v-show="model.gridfs_header_type !== 'custom'"
                    ><div style="color: #999">
                      {{ $t('editor.fileFormBuilder.excel_cell_point') }}
                    </div></el-form-item
                  >
                  <!--字段获取方式 -->
                  <el-form-item :label="$t('editor.fileFormBuilder.header_mapping')" class="excelHeaderType">
                    <el-radio-group v-model="model.excel_header_type">
                      <el-radio label="value">{{ $t('editor.fileFormBuilder.header_mapping_value') }}</el-radio>
                      <el-radio label="index">{{ $t('editor.fileFormBuilder.header_mapping_index') }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <!-- 内容 -->
                  <el-form-item
                    :label="$t('editor.fileFormBuilder.excel_value_type')"
                    prop="excel_value_start"
                    class="excel_value_start"
                  >
                    <el-input
                      v-model.number="model.excel_value_start"
                      maxlength="10"
                      show-word-limit
                      size="mini"
                      onkeyup="model.excel_value_start = model.excel_value_start.replace(/[^\d.]/g,'');"
                      :placeholder="$t('editor.fileFormBuilder.excel_value_start')"
                    ></el-input>
                    <span class="separate"> ~ </span>
                    <el-input
                      v-model.number="model.excel_value_end"
                      maxlength="10"
                      show-word-limit
                      size="mini"
                      onkeyup="model.excel_value_end = model.excel_value_end.replace(/[^\d.]/g,'');"
                      :placeholder="$t('editor.fileFormBuilder.excel_value_end')"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    ><div style="margin-top: -10px; color: #999">
                      {{ $t('editor.fileFormBuilder.excel_value_range') }}
                    </div></el-form-item
                  >
                </el-form>
              </div>
            </template>
            <!-- 文件数据库 -->
            <template v-if="model.database_type === 'file' && model.connection_type === 'source'">
              <div class="fileBox">
                <div class="file-label">
                  {{ $t('dataForm.form.file.fileUrl') }}
                </div>
                <div class="file-form-content">
                  <el-form
                    :model="model"
                    ref="fileForm"
                    label-width="100px"
                    class="demo-ruleForm"
                    label-position="top"
                    :inline-message="true"
                  >
                    <el-row
                      type="flex"
                      :gutter="20"
                      class="loopFrom"
                      v-for="(item, index) in model.file_sources"
                      :key="index"
                    >
                      <el-col :span="24" class="fromLoopBox">
                        <el-form-item
                          required
                          :label="$t('dataForm.form.file.path')"
                          :prop="'file_sources.' + index + '.path'"
                          :rules="{
                            required: true,
                            message: $t('dataForm.form.file.fileNone'),
                            trigger: 'blur'
                          }"
                        >
                          <el-input
                            v-model="item.path"
                            size="mini"
                            :placeholder="$t('dataForm.form.file.pathPlaceholder')"
                          ></el-input>
                        </el-form-item>
                        <el-form-item :label="$t('dataForm.form.file.recursive')" prop="path">
                          <el-switch v-model="item.recursive"></el-switch>
                        </el-form-item>
                        <el-form-item :label="$t('dataForm.form.file.csvFijlter')">
                          <el-select
                            v-model="item.selectFileType"
                            size="mini"
                            style="width: 100%"
                            @change="changeFileInclude(item, item.selectFileType)"
                          >
                            <el-option :label="$t('dataForm.form.file.include_filename')" value="include"></el-option>
                            <el-option :label="$t('dataForm.form.file.exclude_filename')" value="exclude"></el-option>
                          </el-select>
                        </el-form-item>
                        <el-form-item v-if="item.selectFileType === 'include'">
                          <el-input
                            v-model="item.include_filename"
                            size="mini"
                            :placeholder="$t('dataForm.form.file.includePlaceholder')"
                          ></el-input>
                        </el-form-item>
                        <el-form-item v-else>
                          <el-input
                            v-model="item.exclude_filename"
                            size="mini"
                            :placeholder="$t('dataForm.form.file.excludePlaceholder')"
                          ></el-input>
                        </el-form-item>
                        <p class="font-color-light" style="font-size: 12px">
                          {{ $t('dataForm.form.file.viewExpression') }}
                        </p>
                      </el-col>
                      <el-col :span="2" style="margin-right: -40px">
                        <el-button plain style="padding: 0" @click="removeRow(item, index)">
                          <i class="iconfont icon-quxiao remove"></i>
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-button type="text" style="padding: 0" @click="addPathRow()">
                      {{ $t('dataForm.form.file.addPath') }}
                    </el-button>
                  </el-form>
                </div>
              </div>
            </template>

            <span class="status">
              <span class="error" v-if="['invalid'].includes(status)">
                <VIcon>error</VIcon>
                <span>
                  {{ $t('connection.status.invalid') }}
                </span>
              </span>
              <span class="success" v-if="['ready'].includes(status)">
                <i class="el-icon-success"></i>
                <span>
                  {{ $t('connection.status.ready') }}
                </span>
              </span>
              <span class="warning" v-if="['testing'].includes(status)">
                <i class="el-icon-warning"></i>
                <span>
                  {{ $t('connection.status.testing') }}
                </span>
              </span>
            </span>
          </div>
        </div>
        <footer slot="footer" class="footer">
          <div class="footer-btn">
            <el-button size="mini" @click="goBack()">{{ $t('button_back') }}</el-button>
            <el-button size="mini" class="test" @click="startTest()">{{ $t('connection_list_test_button') }}</el-button>
            <el-button size="mini" type="primary" :loading="submitBtnLoading" @click="submit">
              {{ $t('button_save') }}
            </el-button>
          </div>
        </footer>
      </main>
      <GitBook v-if="!isPdk"></GitBook>
      <!-- </div>
      </main> -->
    </div>
    <Test
      ref="test"
      :dialogTestVisible.sync="dialogTestVisible"
      :formData="model"
      @returnTestData="returnTestData"
    ></Test>
    <DatabaseTypeDialog
      :dialogVisible.sync="dialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
    <el-dialog
      :title="$t('connection.rename')"
      :close-on-click-modal="false"
      :visible.sync="dialogEditNameVisible"
      width="30%"
    >
      <el-form :model="renameData" :rules="renameRules" ref="renameForm" @submit.native.prevent>
        <el-form-item prop="rename">
          <el-input v-model="renameData.rename" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <span style="color: #ccc; margin-top: 5px; font-size: 12px; display: inline-block"
          >中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格</span
        >
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelRename" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button @click="submitEdit()" size="mini" type="primary" :loading="editBtnLoading">{{
          $t('button_confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import factory from '@/api/factory'
import formConfig from './config'
import GitBook from './GitBook'
import CodeEditor from '@/components/CodeEditor'
import Test from './Test'
import { TYPEMAPCONFIG, defaultModel, getConnectionIcon } from './util'
import DatabaseTypeDialog from './DatabaseTypeDialog'
import VIcon from '@/components/VIcon'
import SchemaToForm from '@/components/SchemaToForm'
import { checkConnectionName } from '@/utils/util'

const connectionsModel = factory('connections')
let defaultConfig = []
export default {
  name: 'DatabaseForm',
  components: { GitBook, Test, DatabaseTypeDialog, CodeEditor, VIcon, SchemaToForm },
  data() {
    let validateExcelHeader = (rule, value, callback) => {
      let start = this.model.excel_header_start
      let end = this.model.excel_header_end
      let config = this.model.gridfs_header_config
      if (start === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_header_start') + this.$t('formBuilder.noneText')))
      } else if (end === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_header_end') + this.$t('formBuilder.noneText')))
      } else if (config === '' && this.model.gridfs_header_type === 'custom') {
        callback(new Error(this.$t('editor.fileFormBuilder.header_type_required')))
      } else if ((!/^[A-Z]+[1-9]+$/.test(start) && start !== '') || (!/^[A-Z]+[1-9]+$/.test(end) && end !== '')) {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_cell_tip')))
      } else {
        callback()
      }
    }
    let validateSheet = (rule, value, callback) => {
      let start = this.model.sheet_start
      let end = this.model.sheet_end
      if (start === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.sheet_start') + this.$t('formBuilder.noneText')))
      } else if (end === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.sheet_end') + this.$t('formBuilder.noneText')))
      } else if (start > end) {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_value_end_gt_start')))
      } else {
        callback()
      }
    }
    let validateRename = (rule, value, callback) => {
      if (!this.renameData.rename || !this.renameData.rename.trim()) {
        callback(new Error(this.$t('dataForm.form.connectionName') + this.$t('formBuilder.noneText')))
      } else if (!checkConnectionName(this.renameData.rename)) {
        callback(new Error('名称规则：中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格'))
      } else {
        callback()
      }
    }
    return {
      accessNodeList: [],
      // modelForm: {},
      rules: [],
      id: '',
      visible: false,
      createStrategyDisabled: false,
      timezones: [],
      dataTypes: [],
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      mongodbList: [],
      showSystemConfig: false,
      tableList: [], //共享挖掘
      model: '',
      config: {
        items: []
      },
      checkItems: null,
      databaseType: '',
      typeMap: this.$const.TYPEMAP,
      timer: null,
      status: '',
      loadingFrom: true,
      dialogTestVisible: false,
      dialogDatabaseTypeVisible: false,
      dialogEditNameVisible: false,
      submitBtnLoading: false,
      editBtnLoading: false,
      connectionTypeOption: '',
      isUrlOption: '',
      renameData: {
        rename: ''
      },
      kafka: {
        id: '',
        name: '',
        database_type: '',
        connection_type: '',
        kafkaBootstrapServers: '',
        kafkaPatternTopics: '',
        kafkaIgnoreInvalidRecord: false,
        kafkaAcks: '',
        kafkaCompressionType: '',
        kafkaIgnorePushError: false
      },
      width: 440,
      height: 300,
      instanceModelZone: '',
      instanceMock: [],
      dataSourceZone: '',
      dataSourceMock: [],
      ecsPageSize: 10,
      ecsPage: 1,
      vpcList: [],
      ecsList: [],
      gridFSrules: {
        gridfs_header_config: [
          {
            required: true,
            message: this.$t('editor.fileFormBuilder.gridfs_header_config'),
            trigger: 'blur'
          }
        ],
        excel_header_start: [
          {
            validator: validateExcelHeader,
            trigger: 'blur'
          }
        ],
        sheet_start: [
          {
            validator: validateSheet,
            trigger: 'blur'
          }
        ]
      },
      renameRules: {
        rename: [{ validator: validateRename, trigger: 'blur' }]
      },
      pdkOptions: {},
      schemaData: null,
      pdkFormModel: {}
    }
  },
  computed: {
    isPdk() {
      return [this.$route.query.pdkType, this.$store.state.pdkType].includes('pdk')
    },
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    },
    databaseTypeLabel() {
      const { isPdk, databaseType, typeMap } = this
      if (isPdk) {
        return databaseType
      }
      return typeMap[databaseType]
    }
  },
  created() {
    let self = this
    defaultConfig = [
      {
        type: 'input',
        field: 'name',
        label: self.$t('dataForm.form.connectionName'),
        required: true,
        maxlength: 100,
        width: '504px',
        showWordLimit: true,
        show: true,
        customClass: 'large-item',
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback(new Error('连接名称不能为空'))
              } else if (!checkConnectionName(value)) {
                callback('连接名称中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格')
              } else if (value && value.trim() && checkConnectionName(value)) {
                let filter = {
                  where: {
                    name: this.model.name
                  },
                  fields: {
                    name: 1
                  },
                  limit: 1
                }
                if (this.id) {
                  filter.where['id'] = { neq: this.id }
                }
                this.$api('connections')
                  .get({
                    filter: JSON.stringify(filter)
                  })
                  .then(res => {
                    if (res.data?.total !== 0) {
                      callback(new Error('名称已存在'))
                    } else callback()
                  })
              } else {
                callback()
              }
            }
          }
        ]
      }
    ]
    this.id = this.$route.params.id || ''
    this.databaseType = this.$route.query.databaseType || this.$store.state.createConnection.databaseType
    //确认类型 按照type 初始化变量

    this.model = Object.assign({}, defaultModel['default'])
    switch (this.databaseType) {
      case 'kafka':
        this.model = Object.assign({}, defaultModel['kafka'])
        break
      case 'file':
        this.model = Object.assign({}, defaultModel['file'])
        break
      case 'jira':
        this.model = Object.assign({}, defaultModel['jira'])
        break
      case 'rest api':
        this.model = Object.assign({}, defaultModel['restApi'])
        break
      case 'custom_connection':
        this.model = Object.assign({}, defaultModel['custom_connection'])
        break
      case 'mq':
        this.model = Object.assign({}, defaultModel['mq'])
        break
      case 'gridfs':
        this.model = Object.assign({}, defaultModel['default'], defaultModel['gridfs'])
        break
      case 'tcp_udp':
        this.model = Object.assign({}, defaultModel['tcp'])
        break
      case 'hana':
        this.model = Object.assign({}, defaultModel['default'], defaultModel['hana'])
        break
      case 'vika':
        this.model = Object.assign({}, defaultModel['vika'])
        break
    }
    this.initTimezones()
    this.checkDataTypeOptions(this.databaseType)
    this.getCluster()
    if (this.isPdk) {
      this.getPdkForm()
    }
  },
  watch: {
    'model.multiTenant'(val) {
      if (!val) {
        this.model.pdb = ''
      }
    },
    'model.region'() {
      this.changeInstanceRegion()
    },
    'model.s_region'() {
      this.changeDataSourceRegion()
    },
    'model.zone'() {
      this.getDataSourceRegion() //选择完zone 联动实例vip 接口
    },
    'model.s_zone'() {
      this.changeDatabaseHost()
    },
    'model.sourceType'() {
      this.getEcsList()
    },
    'model.ecs'() {
      this.ecsList = this.ecsList || []
      if (!this.ecsList || this.ecsList.length === 0) return
      this.handleStrategy()
    }
  },
  methods: {
    formChange(data) {
      let filed = data.field || ''
      let value = data.value
      if (filed === 'connection_type') {
        this.model.redoLogParserEnable = false
        this.model.shareCdcEnable = false
      }
      //rest api
      if (filed === 'data_sync_mode') {
        if (value === 'INITIAL_INCREMENTAL_SYNC') {
          this.model.url_info = []
          if (this.model.auth_type === 'oauth2') {
            this.addUrlInfo('GET_TOKEN')
          }
          this.addUrlInfo('INITIAL_SYNC')
          this.addUrlInfo('INCREMENTAL_SYNC')
        } else if (value === 'INITIAL_SYNC') {
          this.addUrlInfo('INITIAL_SYNC')
          this.removeUrlInfo('INCREMENTAL_SYNC')
        } else {
          this.addUrlInfo('INCREMENTAL_SYNC')
          this.removeUrlInfo('INITIAL_SYNC')
        }
      }
      if (filed === 'auth_type') {
        if (value === 'oauth2') {
          this.addUrlInfo('GET_TOKEN')
        } else {
          this.removeUrlInfo('GET_TOKEN')
        }
      }
      // custom_connection
      if (filed === 'connection_type' || filed === 'custom_type') {
        this.model.custom_ondata_script = ''
        this.model.custom_cdc_script = ''
        this.model.custom_initial_script = ''
      }
      if (filed === 'custom_before_opr') {
        this.model.custom_before_script = ''
      }
      if (filed === 'custom_after_opr') {
        this.model.custom_after_script = ''
      }
      //维格表
      if (filed === 'plain_password' && this.model.database_type === 'vika') {
        this.getSpaceVika()
      }
      //共享挖掘
      if (filed === 'shareCdcEnable') {
        //请求是否有全局共享挖掘配置
        this.check()
        //日志时长
        this.changeConfig([], 'logSaveList')
      }
      if (filed === 'persistenceMongodb_uri_db') {
        //请求是否有全局共享挖掘配置
        this.model.persistenceMongodb_collection = '' //清空之前的数据
        this.handleTables()
      }
    },
    async initData(data) {
      let editData = null
      if (this.$route.params.id) {
        if (this.model.database_type === 'mongodb') {
          editData = await this.$api('connections').customQuery([this.$route.params.id])
        } else {
          editData = await this.$api('connections').getNoSchema(this.$route.params.id)
        }

        if (
          editData.data.database_type === 'mq' &&
          (typeof editData.data.mqQueueSet === 'object' || typeof editData.data.mqTopicSet === 'object')
        ) {
          let mqQueueSet = editData.data.mqQueueSet.length ? editData.data.mqQueueSet.join(',') : ''
          let mqTopicSet = editData.data.mqTopicSet.length ? editData.data.mqTopicSet.join(',') : ''
          editData.data.mqQueueSet = mqQueueSet
          editData.data.mqTopicSet = mqTopicSet
        }
        this.model = Object.assign(this.model, editData.data)
        if (this.model.sourceType === 'ecs') {
          this.getEcsList()
        }
        this.renameData.rename = this.model.name
        this.model.isUrl = false
        if (this.model.database_type === 'vika') {
          //初始化维格表
          this.getSpaceVika(this.$route.params.id)
        }
        if (!this.model.accessNodeProcessId) {
          this.model.accessNodeProcessId = this.accessNodeList?.[0]?.processId
        }
      } else {
        this.model = Object.assign(this.model, data, { name: this.model.name })
        this.model.isUrl = true
      }
      if (this.model.database_type === 'file' && this.model.file_sources) {
        this.model.file_sources.forEach(item => {
          if (item.exclude_filename) {
            this.$set(item, 'selectFileType', 'exclude')
          } else {
            this.$set(item, 'selectFileType', 'include')
          }
        })
      }
    },
    checkDataTypeOptions(type) {
      this.model.database_type = type
      this.getFormConfig()
    },
    initTimezones() {
      let timezones = [{ label: '(Database Timezone)', value: '' }]

      for (let i = -11; i < 15; i++) {
        let timezone = ''
        if (i >= -9 && i <= 9) {
          timezone = '0' + Math.abs(i)
        } else {
          timezone = Math.abs(i)
        }
        timezone += ':00'
        let UTCName
        if (i < 0) {
          timezone = '-' + timezone
          UTCName = 'UTC ' + i
        } else {
          timezone = '+' + timezone
          UTCName = 'UTC +' + i
        }

        timezones.push({ label: UTCName, value: timezone })
      }
      this.timezones = timezones
    },
    //获取维格表的空间
    getSpaceVika(id) {
      if ((!this.model.plain_password || this.model.plain_password === '') && !id) {
        return
      }
      let params = {
        load_type: 'space',
        database_host: this.model.database_host,
        api_token: this.model.plain_password,
        connection_id: id || ''
      }
      this.$api('connections')
        .getSpace(params)
        .then(data => {
          if (data.data.status === 'SUCCESS') {
            this.changeConfig(data.data.result || [], 'set_space')
          } else {
            this.$message.error(data.data?.error)
          }
        })
    },
    // 共享挖掘设置
    check() {
      Promise.all([this.$api('logcollector').check(), this.$api('logcollector').getSystemConfig()]).then(
        ([check, res]) => {
          let verify = check?.data
          let digSettingForm = res?.data
          if (verify && !digSettingForm?.persistenceMongodb_uri_db) {
            this.showSystemConfig = true
            this.getMongodb() //打开全局设置
          }
        }
      )
    },
    //获取所有mongo连接
    getMongodb() {
      let filter = {
        where: {
          database_type: 'mongodb'
        }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res) {
            this.mongodbList = res?.data?.items
            this.changeConfig([], 'mongodbList')
            this.model.showShareConfig = true
          }
        })
    },
    //根据已选connectionId->tables
    handleTables() {
      this.$api('connections')
        .customQuery(this.model.persistenceMongodb_uri_db, { schema: true })
        .then(res => {
          if (res) {
            this.tableList = res?.data?.schema?.tables || []
            this.changeConfig([], 'tableList')
          }
        })
    },
    //保存全局挖掘设置
    saveSetting() {
      let digSettingForm = {
        persistenceMongodb_uri_db: this.model.persistenceMongodb_uri_db,
        persistenceMongodb_collection: this.model.persistenceMongodb_collection,
        share_cdc_ttl_day: this.model.share_cdc_ttl_day
      }
      this.$api('logcollector')
        .patchSystemConfig(digSettingForm)
        .then(res => {
          if (res) {
            this.settingDialogVisible = false
            this.$message.success('保存全局设置成功')
          }
        })
    },

    //rest api addUrl
    addUrlInfo(type) {
      let urlInfo = {
        url: '',
        method: 'GET',
        url_type: 'INITIAL_SYNC',
        headers: {},
        request_parameters: {},
        offset_field: '',
        initial_offset: '',
        content_type: '',
        headerArray: [{ name: '', value: '' }],
        parameterArray: [{ name: '', value: '' }]
      }
      urlInfo['url_type'] = type
      if (type === 'GET_TOKEN') {
        urlInfo['parameterArray'] = [
          { name: 'client_id', value: '' },
          { name: 'client_secret', value: '' },
          { name: 'scope', value: '' },
          { name: 'grant_type', value: '' },
          { name: 'client_credentials', value: '' }
        ]
      }
      let isExist = this.model.url_info.filter(item => item.url_type === type)
      if (isExist.length === 0 && type !== 'GET_TOKEN') {
        this.model.url_info.push(urlInfo)
      } else if (isExist.length === 0 && type === 'GET_TOKEN') {
        this.model.url_info.unshift(urlInfo)
      }
    },
    //删除url
    removeUrlInfo(type) {
      let index = this.model.url_info.findIndex(item => item.url_type === type)
      if (index > -1) {
        this.model.url_info.splice(index, 1)
      }
    },
    // 按照数据库类型获取表单配置规则
    getFormConfig() {
      let type = this.model.database_type
      type = TYPEMAPCONFIG[type] || type //特殊数据源名称转换
      let func = formConfig[type]
      if (func) {
        let config = func(this)
        let items = defaultConfig.concat(config.items)
        let item = items.find(it => it.field === 'database_datetype_without_timezone')
        if (item) {
          item.options = this.timezones
        }
        let databaseName = items.find(it => it.field === 'database_name')
        if (databaseName) {
          databaseName.allowSpace = false
        }
        let itemIsUrl = items.find(it => it.field === 'isUrl')
        let sslKey = items.find(it => it.field === 'sslKeyFile')
        let sslCA = items.find(it => it.field === 'sslCAFile')
        if (this.model.database_type === 'mongodb' && this.$route.params.id && itemIsUrl) {
          itemIsUrl.options[0].disabled = true //编辑模式下mongodb不支持URL模式
        }
        if (this.model.database_type === 'mongodb' && this.$route.params.id && sslKey) {
          sslKey.rules = []
        }
        if (this.model.database_type === 'mongodb' && this.$route.params.id && sslCA) {
          sslCA.rules = []
        }
        //编辑模式下vika不校验plain_password
        let plain_password = items.find(it => it.field === 'plain_password')
        if (this.model.database_type === 'vika' && this.$route.params.id && plain_password) {
          plain_password.required = false
        }
        if (this.$route.params.id) {
          //编辑模式下 不展示
          defaultConfig[0].show = false
          defaultConfig[0].required = false
        }
        this.config.form = config.form
        this.config.items = items
        this.initData(
          Object.assign(this.model, config.defaultModel, {
            database_type: this.model.database_type
          })
        ) //切换类型会后初始化数据
        this.checkItems = config.checkItems //根据model变化更新表单项显示或隐藏
        this.checkItems && this.checkItems()
      }
      this.loadingFrom = false
    },
    //第一步 选择实例
    // getInstanceRegion() {
    //   this.$api('tcm')
    //     .getRegionZone()
    //     .then(data => {
    //       this.instanceMock = data.data || []
    //       if (this.model.region === '' && this.instanceMock.length > 0) {
    //         this.model.region = this.instanceMock[0].code
    //       }
    //       this.changeConfig(this.instanceMock || [], 'region')
    //       this.changeInstanceRegion()
    //     })
    //     .catch(() => {
    //       this.$message.error('请求失败')
    //     })
    // },
    changeInstanceRegion() {
      let zone = this.instanceMock.filter(item => item.code === this.model.region)
      if (zone.length > 0) {
        this.model.zone = this.model.zone || zone[0].zones[0].code
        this.instanceModelZone = zone[0].zones
      } else {
        this.instanceModelZone = []
      }
      let data = zone.length ? zone[0].zones : []
      this.changeConfig(data, 'zone')
      this.getDataSourceRegion() //选择完zone 联动实例vip 接口
    },
    //第二步 source_type DRS实例
    getDataSourceRegion() {
      let param = {
        productType: this.model.database_type,
        agentPoolId: this.model.region,
        agentZoneId: this.model.zone
      }
      this.$api('tcm')
        .productVip(param)
        .then(data => {
          this.dataSourceMock = data.data.poolList || []
          if (this.model.s_region === '' && this.dataSourceMock.length > 0) {
            this.model.s_region = this.dataSourceMock[0].poolId
          }
          this.changeConfig(this.dataSourceMock || [], 's_defaultRegion')
          this.changeDataSourceRegion()
        }) //华东上海
    },
    changeDataSourceRegion() {
      let zone = this.dataSourceMock.filter(item => item.poolId === this.model.s_region)
      if (zone.length > 0) {
        this.model.s_zone = this.model.s_zone || zone[0].zoneInfo[0].zoneCode
        this.dataSourceZone = zone[0].zoneInfo
      } else {
        this.dataSourceZone = []
      }
      let data = zone.length ? zone[0].zones : []
      this.changeConfig(data, 's_defaultZone')
    },
    //可用区联动database host
    changeDatabaseHost() {
      if (!this.dataSourceZone || this.dataSourceZone.length === 0) {
        return
      }
      let currentZone = this.dataSourceZone.filter(item => item.zoneCode === this.model.s_zone)
      if (currentZone.length > 0 && this.model.sourceType === 'rds' && this.model.s_zone !== '') {
        this.model.database_host = currentZone[0].ipv4 || currentZone[0].ipv6 || ''
      }
    },
    //change config
    changeConfig(data, type) {
      let items = this.config.items
      switch (type) {
        case 'region': {
          // 第一步 选择实例 选择区域
          let region = items.find(it => it.field === 'region')
          if (region) {
            region.options = data.map(item => {
              return {
                id: item.code,
                name: item.name,
                label: item.name,
                value: item.code
              }
            })
          }
          break
        }
        case 'zone': {
          //映射可用区
          let zone = items.find(it => it.field === 'zone')
          if (zone) {
            zone.options = this.instanceModelZone.map(item => {
              return {
                id: item.code,
                name: item.name,
                label: item.name,
                value: item.code
              }
            })
          }
          break
        }
        case 's_defaultRegion': {
          //源端默认等于选择实例可用区
          let s_region = items.find(it => it.field === 's_region')
          if (s_region) {
            s_region.options = this.dataSourceMock.map(item => {
              return {
                id: item.poolId,
                name: item.poolName,
                label: item.poolName,
                value: item.poolId
              }
            })
          }
          break
        }
        case 's_defaultZone': {
          //映射可用区
          let s_zone = items.find(it => it.field === 's_zone')
          if (s_zone) {
            s_zone.options = this.dataSourceZone.map(item => {
              return {
                id: item.zoneCode,
                name: item.zoneName,
                label: item.zoneName,
                value: item.zoneCode
              }
            })
          }
          break
        }
        case 'set_space': {
          //映射可用区
          let vika_space_id = items.find(it => it.field === 'vika_space_id')
          if (vika_space_id) {
            vika_space_id.options = data.map(item => {
              return {
                id: item.id,
                name: item.name,
                label: item.name,
                value: item.id
              }
            })
          }
          break
        }
        //共享挖掘
        case 'mongodbList': {
          //映射可用区
          let persistenceMongodb_uri_db = items.find(it => it.field === 'persistenceMongodb_uri_db')
          if (persistenceMongodb_uri_db) {
            persistenceMongodb_uri_db.options = this.mongodbList.map(item => {
              return {
                id: item.id,
                name: item.name,
                label: item.name,
                value: item.id
              }
            })
          }
          break
        }
        case 'tableList': {
          //映射可用区
          let persistenceMongodb_collection = items.find(it => it.field === 'persistenceMongodb_collection')
          if (persistenceMongodb_collection) {
            persistenceMongodb_collection.show = true
            persistenceMongodb_collection.options = this.tableList.map(item => {
              return {
                id: item.tableId,
                name: item.table_name,
                label: item.table_name,
                value: item.table_name
              }
            })
          }
          break
        }
        case 'logSaveList': {
          let share_cdc_ttl_day = items.find(it => it.field === 'share_cdc_ttl_day')
          if (share_cdc_ttl_day) {
            share_cdc_ttl_day.options = this.logSaveList.map(item => {
              return {
                id: item,
                name: item + this.$t('share_form_edit_day'),
                label: item + this.$t('share_form_edit_day'),
                value: item
              }
            })
          }
          break
        }
      }
    },
    handleTestVisible() {
      this.dialogTestVisible = false
    },
    handleEcsList() {
      let ecs = this.ecsList.filter(item => item.id === this.model.ecs)
      this.model.vpc = '' //清空当前子级值
      if (ecs.length > 0) {
        this.vpcList = ecs[0].portDetail
      } else {
        this.vpcList = []
      }
    },
    loadMore() {
      this.ecsPage = this.ecsPage + 1
      this.getEcsList()
    },
    //切换sourceType ecs需要请求ecs列表 开通网络策略
    getEcsList() {
      if (this.model.sourceType !== 'ecs') return
      let userId = this.$cookie.get('userId')
      let params = {
        page: this.ecsPage || 1,
        pageSize: this.ecsPageSize || 10,
        region: this.model.region || ''
      }
      this.$api('tcm')
        .getEcsList(userId, params)
        .then(result => {
          if (result.data) {
            const newList = result.data.ecsList
            if (newList.length > 0) {
              this.ecsList.push(...newList)
            }
          }
        })
    },
    //控制是否开通网络策略
    handleStrategy() {
      let currentData = this.ecsList.filter(item => item.id === this.model.ecs)
      if (currentData.length === 0) return
      this.model.platformInfo.strategyExistence = currentData[0].strategyExistence
      if (this.model.platformInfo.strategyExistence) {
        this.createStrategy()
      }
    },
    //创建网络策略
    createStrategy() {
      this.createStrategyDisabled = true
      let currentData = this.vpcList.filter(item => item.portId === this.model.vpc)
      if (currentData.length === 0) return
      let params = {
        userId: this.$cookie.get('user_id'),
        ecsId: this.model.ecs,
        region: this.model.region,
        zone: this.model.zone,
        routerId: currentData[0].routerId
      }
      this.$api('tcm')
        .strategy(params)
        .then(result => {
          this.model.platformInfo.strategyExistence = true
          if (result.data) {
            this.getEcsList() //更新Ecs列表
            this.model.database_host = result.data.dummyFipAddress
            if (this.model.database_type === 'mongodb') {
              this.model.database_uri = `mongodb://${result.data.dummyFipAddress}/test`
            }
          }
        })
        .catch(() => {
          this.$message.error('开通失败')
        })
        .finally(() => {
          this.createStrategyDisabled = false
        })
    },
    goBack() {
      let msg = this.$route.params.id ? '此操作会丢失当前修改编辑内容' : '此操作会丢失当前正在创建的连接'
      // let title = this.$route.params.id ? '是否放弃修改内容？' : '是否放弃创建该连接？'

      this.$confirm(msg, '', {
        confirmButtonText: this.$t('connection_form_give_up'),
        cancelButtonText: this.$t('button_cancel'),
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.push({
          name: 'connections'
        })
      })
    },
    handleName(ops) {
      if (!ops.sourceData || ops.sourceData.length === 0) {
        return
      }
      let data = ops.sourceData.filter(item => item[ops.target] === ops.field)
      if (data.length === 0) return
      return data[0][ops.name]
    },
    //处理不同rds 场景 platformInfo
    handlePlatformInfo(params) {
      let platformInfo = {
        region: params.region || '',
        zone: params.zone || '',
        sourceType: params.sourceType || '',
        DRS_region: params.s_region || '',
        DRS_zone: params.s_zone || '',
        DRS_regionName: '',
        DRS_zoneName: '',
        DRS_instances: params.DRS_instances || '',
        IP_type: params.IP_type || '',
        checkedVpc: params.checkedVpc || '',
        vpc: params.vpc || '',
        ecs: params.ecs || '',
        strategyExistence: params.strategyExistence || ''
      }
      //存实例名称
      platformInfo['regionName'] = this.handleName({
        sourceData: this.instanceMock,
        field: platformInfo.region,
        target: 'code',
        name: 'name'
      })
      platformInfo['zoneName'] = this.handleName({
        sourceData: this.instanceModelZone,
        field: platformInfo.zone,
        target: 'code',
        name: 'name'
      })
      //数据源名称
      if (platformInfo.DRS_region !== '') {
        platformInfo['DRS_regionName'] = this.handleName({
          sourceData: this.dataSourceMock,
          field: platformInfo.DRS_region,
          target: 'poolId',
          name: 'poolName'
        })
      }
      if (platformInfo.DRS_zone !== '') {
        platformInfo['DRS_zoneName'] = this.handleName({
          sourceData: this.dataSourceZone,
          field: platformInfo.DRS_zone,
          target: 'zoneCode',
          name: 'zoneName'
        })
      }
      return platformInfo
    },
    submit() {
      if (this.isPdk) {
        this.submitPdk()
        return
      }
      this.submitBtnLoading = true
      let flag = true
      this.model.search_databaseType = ''
      if (this.model.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER') {
        this.$refs.agentForm.validate(valid => {
          if (!valid) {
            flag = false
          }
        })
      }

      if (this.model.database_type === 'file' && this.model.connection_type === 'source') {
        this.$refs.fileForm.validate(valid => {
          if (!valid) {
            flag = false
          }
        })
      }
      if (this.model.database_type === 'rest api') {
        this.$refs.urlInfoForm.validate(valid => {
          if (!valid) {
            flag = false
          }
        })
      }

      if (this.model.database_type === 'gridfs' && this.model.file_type === 'excel') {
        this.$refs.excelForm.validate(valid => {
          if (!valid) {
            flag = false
          }
        })
      }
      if (!this.model.checkedVpc && this.model.sourceType === 'ecs') {
        this.$message.error('请授权允许数据同步服务访问您的ECS实例')
        return
      }
      if (this.model.platformInfo && !this.model.platformInfo.strategyExistence && this.model.sourceType === 'ecs') {
        this.$message.error('请"点击开通"开通网络策略')
        return
      }
      let data = Object.assign({}, this.model)
      if (data.database_type === 'mq') {
        if (typeof data.mqQueueSet === 'string' || typeof data.mqTopicSet === 'string') {
          data.mqQueueSet = data.mqQueueSet ? data.mqQueueSet.split(',') : []
          data.mqTopicSet = data.mqTopicSet ? data.mqTopicSet.split(',') : []
        }

        if (data.mqType === '0') {
          delete data.database_host
          delete data.database_port
        } else {
          delete data.brokerURL
        }
      }

      if (data.accessNodeType === 'AUTOMATIC_PLATFORM_ALLOCATION') {
        data.accessNodeProcessId = ''
      }

      // if (this.model.database_type === 'mysqlpxc') {
      // 	// this.model.search_databaseType = this.model.database_type;
      // 	this.model.database_type = 'mysql pxc';
      // }
      this.$refs.form.validate(valid => {
        if (valid && flag) {
          //提交全局挖掘设置
          if (this.showSystemConfig) {
            this.saveSetting()
          } else {
            delete this.model.persistenceMongodb_uri_db
            delete this.model.persistenceMongodb_collection
            delete this.model.share_cdc_ttl_day
          }
          let params = Object.assign(
            {},
            {
              // user_id: this.$cookie.get('user_id'),
              status: 'testing',
              schema: {},
              retry: 0,
              nextRetry: null,
              response_body: {},
              project: '',
              submit: true
            },
            data
          )
          params['sslCert'] = this.model.sslKey
          delete params.sslKeyFile
          delete params.sslCAFile
          delete params.status //编辑的情况下不传status
          if (!params.id) {
            delete params.id
          }
          if (!params.id) {
            params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
          }
          if (!params.schema) {
            delete params.schema
          }
          if (!params.tidbPdServer) {
            delete params.tidbPdServer
          }
          if (params.database_type === 'mongodb') {
            //params['database_uri'] = encodeURIComponent(params['database_uri'])
            params.fill = params.isUrl ? 'uri' : ''
            params.isUrl
          }
          //rest api 数据组装
          if (params.database_type === 'rest api') {
            params.url_info.forEach(v => {
              if (v) {
                v.headerArray.forEach(header => {
                  if (header && header.name) {
                    v.headers[header.name] = header.value
                  }
                })
                v.parameterArray.forEach(parameter => {
                  if (parameter && parameter.name) {
                    v.request_parameters[parameter.name] = parameter.value
                  }
                })
              }
            })
          }
          connectionsModel[this.model.id ? 'patchId' : 'post'](params)
            .then(() => {
              this.$message.success(this.$t('message_save_ok'))
              if (this.$route.query.step) {
                this.$router.push({
                  name: 'connections',
                  query: {
                    step: this.$route.query.step
                  }
                })
              } else {
                this.$router.push({
                  name: 'connections'
                })
              }
            })
            .catch(err => {
              if (err && err.response) {
                // if (err.response.msg.indexOf('duplication for names') > -1) {
                //   this.$message.error(this.$t('dataForm.error.connectionNameExist'))
                // } else if (err.response.msg.indexOf('duplicate source') > -1) {
                //   // this.connectionObj.name = err.response.data.name;
                //   // this.connectionObj.id = err.response.data.id;
                //   // this.repeatDialogVisible = true;
                //   this.$message.error(this.$t('dataForm.error.duplicateSource'))
                // } else {
                //   this.$message.error(err.response.msg)
                // }
                this.$message.error(err.response.message)
              } else {
                this.$message.error(this.$t('message_save_fail'))
              }
            })
            .finally(() => {
              this.submitBtnLoading = false
            })
        } else {
          this.submitBtnLoading = false
        }
      })
    },
    submitPdk() {
      this.pdkFormModel = this.$refs.schemaToForm?.getForm?.()
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        // 保存数据源
        let id = this.$route.params?.id
        let { pdkOptions } = this
        let formValues = this.$refs.schemaToForm?.getFormValues?.()
        let { __connection_database_name__ } = formValues
        delete formValues.__connection_database_name__
        let params = Object.assign(
          {
            name: __connection_database_name__, // 必填，需要渲染
            connection_type: pdkOptions.connectionType, // 必填 data.connectionType
            database_type: pdkOptions.type,
            pdkHash: pdkOptions.pdkHash
          },
          {
            status: 'testing',
            schema: {},
            retry: 0,
            nextRetry: null,
            response_body: {},
            project: '',
            submit: true,
            pdkType: 'pdk'
          },
          {
            config: formValues
          }
        )
        if (id) {
          params.id = id
        }
        if (!params.id) {
          params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
        }
        connectionsModel[params.id ? 'patchId' : 'post'](params)
          .then(() => {
            this.$message.success(this.$t('message.saveOK'))
            if (this.$route.query.step) {
              this.$router.push({
                name: 'connections',
                query: {
                  step: this.$route.query.step
                }
              })
            } else {
              this.$router.push({
                name: 'connections'
              })
            }
          })
          .catch(err => {
            if (err && err.response) {
              if (err.response.msg.indexOf('duplication for names') > -1) {
                this.$message.error(this.$t('dataForm.error.connectionNameExist'))
              } else if (err.response.msg.indexOf('duplicate source') > -1) {
                this.$message.error(this.$t('dataForm.error.duplicateSource'))
              } else {
                this.$message.error(err.response.msg)
              }
            } else {
              this.$message.error(this.$t('message.saveFail'))
            }
          })
          .finally(() => {
            this.submitBtnLoading = false
          })
      })
    },
    //开始测试
    async startTest() {
      this.$root.checkAgent(() => {
        if (this.isPdk) {
          this.schemaFormInstance.validate().then(() => {
            this.startTestPdk()
          })
          return
        }
        this.$refs.form.validate(valid => {
          if (valid) {
            let data = Object.assign({}, this.model)
            if (
              this.model.database_type === 'mq' &&
              (typeof this.model.mqQueueSet === 'string' || typeof this.model.mqTopicSet === 'string')
            ) {
              data.mqQueueSet = this.model.mqQueueSet.split(',')
              data.mqTopicSet = this.model.mqTopicSet.split(',')
            }
            this.dialogTestVisible = true
            if (this.$route.params.id) {
              //编辑需要特殊标识 updateSchema = false editTest = true
              if (['mongodb', 'gridfs'].includes(data.database_type) && data?.database_uri) {
                delete this.model.database_uri
              }
              this.$refs.test.start(false, true)
            } else {
              delete this.model.id
              if (!data.isUrl && data.database_type === 'mongodb') {
                this.model.database_password = data.plain_password || ''
              }
              this.$refs.test.start(false)
            }
          }
        })
      })
    },
    startTestPdk() {
      debugger
      let formValues = this.$refs.schemaToForm?.getFormValues?.()
      this.model.name = formValues.__connection_database_name__
      delete formValues.__connection_database_name__
      this.model.config = formValues
      this.model.pdkType = 'pdk'
      this.model.pdkHash = this.$route.query?.pdkHash
      this.dialogTestVisible = true
      if (this.$route.params.id) {
        //编辑需要特殊标识 updateSchema = false editTest = true
        this.$refs.test.start(false, true)
      } else {
        delete this.model.id
        this.$refs.test.start(false)
      }
    },
    returnTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    //取消
    handleCancelRename() {
      this.renameData.rename = this.model.name
      this.$refs['renameForm'].clearValidate()
      this.dialogEditNameVisible = false
    },
    //保存名字
    submitEdit() {
      this.$refs['renameForm'].validate(valid => {
        if (valid) {
          this.editBtnLoading = true
          if (this.renameData.rename === '') {
            this.editBtnLoading = false
            this.renameData.rename = this.model.name
            this.$refs['renameForm'].clearValidate()
            return
          }
          let params = {
            name: this.renameData.rename,
            id: this.model.id,
            submit: true
          }
          this.$api('connections')
            .patchId(params)
            .then(() => {
              this.editBtnLoading = false
              this.model.name = this.renameData.rename
              this.$refs['renameForm'].clearValidate()
              this.$message.success(this.$t('message_save_ok'))
              this.dialogEditNameVisible = false
            })
            .catch(err => {
              this.renameData.rename = this.model.name
              this.$refs['renameForm'].clearValidate()
              this.editBtnLoading = false
              if (err && err.response) {
                if (err.response.msg.indexOf('duplication for names') > -1) {
                  this.$message.error(this.$t('dataForm.error.connectionNameExist'))
                } else {
                  this.$message.error(err.response.msg)
                }
              } else {
                this.$message.error(this.$t('dataForm.saveFail'))
              }
            })
        }
      })
    },
    // 跳转到重复数据源
    clickLinkSource() {
      window.open('/#/connection/' + this.connectionObj.id, '_blank')
    },
    handleDatabaseType(type, item) {
      this.dialogDatabaseTypeVisible = false
      let query = {
        databaseType: type
      }
      if (item) {
        query.pdkType = item.pdkType
        query.pdkHash = item.pdkHash
      }
      this.$router.push({
        name: 'connectionsCreate',
        query
      })
      location.reload()
    },
    // 文件类型添加文件路径
    addPathRow() {
      let list = {
        path: '',
        recursive: false,
        selectFileType: 'include',
        include_filename: '',
        exclude_filename: ''
      }
      this.model.file_sources.push(list)
    },

    // 文件类型删除文件路径
    removeRow(item, index) {
      // this.index = this.model.file_sources.indexOf(item);
      if (this.model.file_sources.length > 1) {
        if (index !== -1) {
          this.model.file_sources.splice(index, 1)
        }
      }
    },

    // 文件保留丢弃字段
    changeFileInclude(item, val) {
      val === 'include' ? (item.exclude_filename = '') : (item.include_filename = '')
    },
    //rest api
    addHeader(index) {
      this.model.url_info[index].headerArray.push({
        name: '',
        value: ''
      })
    },
    removeHeader(parentIndex, index) {
      this.model.url_info[parentIndex].headerArray.splice(index, 1)
    },
    addParameter(index) {
      this.model.url_info[index].parameterArray.push({
        name: '',
        value: ''
      })
    },
    removeParameter(parentIndex, index) {
      this.model.url_info[parentIndex].parameterArray.splice(index, 1)
    },
    // 获取数据
    getCluster() {
      let self = this
      this.$api('cluster')
        .findAccessNodeInfo()
        .then(res => {
          let items = res.data || []
          self.accessNodeList = items
          if (!self.model.accessNodeProcessId) {
            self.model.accessNodeProcessId = items?.[0]?.processId
          }
        })
    },
    getPdkForm() {
      const pdkHash = this.$route.query?.pdkHash
      this.$api('DatabaseTypes')
        .pdkHash(pdkHash)
        .then(({ data }) => {
          this.pdkOptions = data
          let result = {}
          if (!this.id && !this.$route.query.id) {
            // 连接名称是必填项
            result.__connection_database_name__ = {
              type: 'string',
              title: '连接名称',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input'
            }
          }
          let connection = {}
          if (data?.properties?.connection) {
            connection = data.properties.connection
            let properties = connection.properties || {}
            Object.assign(result, properties)
          }
          connection.properties = result
          this.schemaData = connection
          let id = this.id || this.$route.params.id
          if (id) {
            this.getPdkData(id)
          }
        })
    },
    getPdkData(id) {
      this.$api('connections')
        .customQuery(id, { schema: true })
        .then(res => {
          this.model = res.data
          this.schemaFormInstance.setValues(res.data?.config)
          this.renameData.rename = this.model.name
        })
    },
    getConnectionIcon() {
      const { databaseType, isPdk } = this
      let result = {
        database_type: databaseType
      }
      if (isPdk) {
        const { pdkHash, pdkType } = this.$route.query || {}
        result.pdkHash = pdkHash
        result.pdkType = pdkType
      }
      return getConnectionIcon(result)
    }
  }
}
</script>

<style scoped lang="scss">
.connection-from {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 20px 20px;
  overflow: hidden;
  background-color: #eff1f4;
  .connection-from-body {
    display: flex;
    flex: 1;
    padding-left: 24px;
    border-radius: 4px;
    overflow: hidden;
    background-color: map-get($bgColor, white);
    .connection-from-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      .connection-from-title {
        padding-top: 20px;
        margin-bottom: 24px;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: map-get($fontColor, dark);
        line-height: 28px;
      }
      .connection-from-label {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
        .label:before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
        .label {
          width: 160px;
          font-size: 12px;
          color: map-get($fontColor, light);
        }
        .content-box {
          display: flex;
          max-width: 680px;
          line-height: 22px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: map-get($fontColor, dark);
          align-items: center;
          white-space: nowrap;
          word-break: break-word;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .img-box {
          display: flex;
          width: 25px;
          height: 25px;
          justify-content: center;
          align-items: center;
          background: map-get($bgColor, white);
          border-radius: 3px;
          img {
            width: 100%;
          }
        }
      }
      .form-wrap {
        display: flex;
        flex: 1;
        overflow: hidden;
        .form {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          .scheme-to-form {
            width: 396px;
          }
          .form-builder {
            width: 396px;
            ::v-deep {
              .e-form-builder-item {
                // width: 396px;
                &.large-item {
                  width: 610px;
                  .el-form-item__content {
                    padding-right: 20px;
                  }
                }
                &.small-item {
                  width: 320px;
                }
                &.mongodb-item {
                  width: 680px;
                }
                &.mongodb-tip-item .el-form-item__content {
                  width: 680px;
                }
                .url-tip {
                  font-size: 12px;
                  color: map-get($fontColor, light);
                  b {
                    font-size: 12px;
                    font-weight: 400;
                    color: map-get($fontColor, light);
                  }
                }
                .fb-radio-group {
                  .el-radio--mini.is-bordered {
                    padding-top: 0;
                  }
                }
                // .el-form-item__content {
                //   width: 300px;
                // }
                .el-input .el-input__inner,
                .el-textarea__inner {
                  // width: 300px;
                  background-color: rgba(239, 241, 244, 0.2);
                }
                .el-textarea__inner {
                  min-height: 70px !important;
                }
              }
              .el-input-group__append button.el-button {
                background-color: inherit;
                border-color: azure;
              }
            }
          }
        }
      }
      // .form {
      //   padding: 0 20px;
      //   width: 640px;
      //   margin: 0 auto;
      //   padding-right: 200px;
      //   .url-tip {
      //     font-size: 12px;
      //     color: #999;
      //     line-height: 18px;
      //   }
      //   .rest-api-box {
      //     display: flex;
      //     flex: 1;
      //     div.rest-api-label {
      //       width: 210px;
      //       padding-right: 20px;
      //       line-height: 28px;
      //       font-size: 12px;
      //       color: #606266;
      //       text-align: right;
      //       box-sizing: border-box;
      //     }
      //     .rest-api-url {
      //       width: calc(100% - 200px);
      //       border: 1px solid #dedee4;
      //       padding: 10px;
      //       margin-top: 5px;
      //       .rest-api-row {
      //         margin-bottom: 10px;
      //       }
      //       .rest-api-margin {
      //         margin-left: 10px;
      //       }
      //       .rest-api-marginB {
      //         margin-bottom: 10px;
      //       }
      //       .rest-api-label {
      //         display: inline-block;
      //         width: 80px;
      //       }
      //       .rest-api-FloatL {
      //         float: left;
      //       }
      //       .small-input {
      //         width: 104px;
      //       }
      //       .min-input {
      //         width: 80px;
      //       }
      //       .medium-input {
      //         width: 130px;
      //       }
      //       .rest-api-Array {
      //         margin-bottom: 10px;
      //       }
      //       .add-btn-icon {
      //         cursor: pointer;
      //       }
      //     }
      //   }
      //   .gridfs-box {
      //     font-size: 12px;
      //     .separate {
      //       margin: 0 10px;
      //     }
      //   }
      //   .fileBox {
      //     display: flex;
      //     flex: 1;
      //     div.file-label {
      //       width: 210px;
      //       padding-right: 20px;
      //       line-height: 28px;
      //       font-size: 12px;
      //       color: #606266;
      //       text-align: right;
      //       box-sizing: border-box;
      //     }
      //     .file-form-content {
      //       width: calc(100% - 200px);
      //       padding: 0 10px;
      //     }
      //     .fromLoopBox {
      //       padding: 10px 20px 20px !important;
      //       margin-bottom: 12px;
      //       box-sizing: border-box;
      //       background-color: map-get($bgColor, white);
      //       border: 1px solid #dedee4;
      //       border-radius: 3px;
      //       .el-input--mini .el-input__inner {
      //         width: 100%;
      //       }
      //     }
      //   }
      // }
      // .edit-header-box {
      //   border-bottom: 1px solid #eee;
      //   margin-bottom: 20px;
      // }
      // .edit-header {
      //   display: flex;
      //   justify-content: flex-start;
      //   width: 578px;
      //   margin: 30px auto;
      // }
      // .title {
      //   display: flex;
      //   justify-content: flex-start;
      //   width: 568px;
      //   margin: 40px auto 20px auto;
      // }
      // .img-box {
      //   display: flex;
      //   width: 52px;
      //   height: 52px;
      //   justify-content: center;
      //   align-items: center;
      //   background-color: map-get($bgColor, white);
      //   border-radius: 3px;
      //   margin-right: 10px;
      //   img {
      //     width: 100%;
      //   }
      // }
      // .content {
      //   display: flex;
      //   align-items: center;
      //   margin-left: 15px;
      //   font-size: 22px;
      //   max-width: 445px;
      //   white-space: nowrap;
      //   word-break: break-word;
      //   text-overflow: ellipsis;
      //   overflow: hidden;
      // }
      // .addBtn {
      //   cursor: pointer;
      //   font-size: 12px;
      //   margin-top: 22px;
      //   margin-left: 10px;
      // }
      // .content-box {
      //   .addBtn {
      //     cursor: pointer;
      //     font-size: 12px;
      //     margin-top: 0;
      //     margin-left: 10px;
      //   }

      //   .tip {
      //     margin-left: 15px;
      //     font-size: 12px;
      //     color: #999;
      //     margin-top: 5px;
      //     line-height: 18px;
      //     width: 430px;
      //   }
      // }
      // .test {
      //   margin-left: 200px;
      //   margin-bottom: 20px;
      //   margin-top: 16px;
      // }
    }
    .status {
      font-size: 12px;
      margin-top: 2px;
      .error {
        color: #f56c6c;
      }
      .success {
        color: #67c23a;
      }
      .warning {
        color: #e6a23c;
      }
    }
  }
  // .header {
  //   height: 50px;
  //   line-height: 50px;
  //   padding-left: 20px;
  //   background-color: rgba(250, 250, 250, 100);
  //   color: rgba(51, 51, 51, 100);
  //   font-size: 18px;
  //   text-align: left;
  //   box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
  //   border: 1px solid rgba(222, 222, 228, 100);
  //   border-left: none;
  //   position: relative;
  // }
  .footer {
    // margin: 10px auto;
    width: 100%;
    height: 62px;
    background-color: map-get($bgColor, white);
    border-left: none;
    line-height: 62px;
    border-top: 1px solid #dedee4;
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0 auto;
      padding-top: 18px;
    }
    // button {
    //   margin-left: 10px;
    //   padding: 0 15px;
    //   height: 32px;
    //   line-height: 32px;
    //   border-radius: 2px;
    // }
  }
}
</style>
<style lang="scss">
// .databaseFrom .el-form--label-right .el-form-item {
//   .el-form-item__label .e-form-builder-item-label {
//     float: right;
//   }
//   margin-top: 16px;
// }
// .databaseFrom .el-form--label-right .el-form-item {
//   .el-form-item__label {
//     display: inline-block;
//     padding: 0 20px 0 0;
//   }
// }
// .databaseFrom .form {
//   .url-tip {
//     margin-top: -14px;
//     b {
//       color: map-get($fontColor, light);
//     }
//   }
//   .file-form-content {
//     .el-form-item {
//       margin-bottom: 6px;
//     }
//     .el-form-item__label {
//       padding-bottom: 0;
//       line-height: 28px;
//       font-size: 12px;
//     }
//     .el-form-item__content {
//       line-height: 30px;
//     }
//   }
//   .urlInfoForm {
//     .el-form-item {
//       margin-bottom: 0;
//     }
//   }
// }
// .databaseFrom .gridfs-box {
//   .el-form-item {
//     margin-bottom: 0;
//     margin-top: 0;
//   }

//   .el-form-item__content {
//     display: flex;
//     font-size: 12px;
//     margin-right: 20px;
//   }

//   .el-form-item__error {
//     padding-top: 0;
//   }

//   .el-form-item__label:before {
//     content: '*';
//     color: #f56c6c;
//     margin-right: 4px;
//   }

//   .excel_value_start {
//     .el-form-item__label:before {
//       content: '';
//     }
//   }

//   .el-form-item__label {
//     font-size: 12px;
//   }

//   .el-radio__label {
//     font-size: 12px;
//   }

//   .headerType .el-form-item__content {
//     flex-direction: column;

//     .excel_header_start {
//       display: flex;
//       font-size: 12px;
//     }
//   }

//   .excelHeaderType {
//     .el-form-item__content {
//       display: block;
//       font-size: 12px;
//     }
//   }
// }
</style>
