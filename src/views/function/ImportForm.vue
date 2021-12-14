<template>
  <section class="import-form-wrapper">
    <div class="container-header">
      {{ $t('function_button_import_jar') }}
    </div>
    <div class="import-form__body">
      <div class="main px-6 py-4">
        <ElForm ref="form" label-position="left" label-width="120px" size="small" :model="form" :rules="rules">
          <ElFormItem prop="fileId" :label="$t('function_file_label') + ':'">
            <ElUpload
              class="form-input flex align-center"
              action="api/file/upload"
              accept=".jar"
              :file-list="fileList"
              :on-change="fileChange"
              :on-remove="fileRemove"
            >
              <ElButton style="margin-right: 10px" size="small" type="primary">{{
                $t('function_button_file_upload')
              }}</ElButton>
            </ElUpload>
          </ElFormItem>
          <ElFormItem prop="packageName" :label="$t('function_package_name_label') + ':'">
            <div class="flex align-center">
              <ElInput
                v-model="form.packageName"
                class="form-input"
                :placeholder="$t('function_package_name_placeholder')"
              ></ElInput>
              <ElButton class="btn ml-4" type="primary" size="small" :loading="loading" @click="loadFunction">
                <span>{{ $t('function_button_load_function') }}</span>
              </ElButton>
            </div>
          </ElFormItem>
        </ElForm>
        <div class="mb-4">
          <div class="mb-4" style="font-size: 12px">{{ $t('function_import_list_title') }}:</div>
          <ElTable :data="funcList">
            <ElTableColumn min-width="200px" :label="$t('function_name_label')">
              <template #default="{ row, $index }">
                <div class="flex align-center">
                  <template v-if="editIndex !== $index">
                    <ElTooltip class="item" effect="dark" placement="top" :content="$t('function_tips_name_repeat')">
                      <i class="el-icon-warning mr-2 color-error"></i>
                    </ElTooltip>
                    <span class="ellipsis">{{ row.function_name }}</span>
                    <ElButton
                      class="ml-2"
                      type="text"
                      icon="el-icon-edit-outline"
                      @click="
                        editIndex = $index
                        editName = row.function_name
                      "
                    ></ElButton>
                  </template>
                  <template v-else>
                    <ElInput v-model="editName" size="mini" class="mr-2"></ElInput>
                    <ElButton size="mini" @click="editIndex = null">{{ $t('button_cancel') }}</ElButton>
                    <ElButton
                      type="primary"
                      size="mini"
                      :disabled="!editName || !editName.trim()"
                      @click="changeName($index)"
                      >{{ $t('button_save') }}</ElButton
                    >
                  </template>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="className" :label="$t('function_class_label')"></ElTableColumn>
            <ElTableColumn prop="methodName" :label="$t('function_method_name_label')"></ElTableColumn>
            <ElTableColumn :label="$t('column_operation')">
              <template #default="{ row, $index }">
                <ElButton size="mini" type="text" @click="openSetting(row, $index)">{{
                  $t('button_setting')
                }}</ElButton>
                <ElButton size="mini" type="text" @click="remove($index)">{{ $t('button_delete') }}</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
      <div class="footer p-6">
        <ElButton class="btn" size="mini" @click="$router.back()">{{ $t('button_back') }}</ElButton>
        <ElButton class="btn" type="primary" size="mini" @click="save">{{ $t('button_save') }}</ElButton>
      </div>
    </div>
    <ElDialog
      width="694px"
      custom-class="create-dialog"
      :title="$t('function_dialog_setting_title')"
      :close-on-click-modal="false"
      :visible="!!settingData"
    >
      <ElForm v-if="settingData" label-position="left" label-width="120px" size="small" :model="settingData">
        <ElFormItem prop="describe" :label="$t('function_describe_label') + ':'">
          <ElInput
            v-model="settingData.describe"
            type="textarea"
            :placeholder="$t('function_describe_placeholder')"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="format" :label="$t('function_format') + ':'">
          <ElInput v-model="settingData.format" :placeholder="$t('function_format_placeholder')"></ElInput>
        </ElFormItem>
        <ElFormItem prop="parameters_desc" :label="$t('function_parameters_describe_label') + ':'">
          <ElInput
            v-model="settingData.parameters_desc"
            type="textarea"
            :placeholder="$t('function_parameters_describe_placeholder')"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="return_value" :label="$t('function_return_value_label') + ':'">
          <ElInput
            v-model="settingData.return_value"
            type="textarea"
            :placeholder="$t('function_return_value_placeholder')"
          ></ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton class="btn" size="mini" @click="settingData = null">{{ $t('button_cancel') }}</ElButton>
        <ElButton class="btn" type="primary" size="mini" @click="submitSetting">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      fileList: [],
      funcList: [],
      form: {
        fileId: '',
        fileName: '',
        packageName: ''
      },
      rules: {
        fileId: [{ required: true, message: this.$t('function_file_upload_tips') }],
        packageName: [{ required: true, message: this.$t('function_package_name_placeholder') }]
      },
      settingData: null,
      editIndex: null,
      editName: '',
      repeatNames: []
    }
  },
  watch: {
    'form.fileId'() {
      this.clearFunctionList()
    },
    'form.packageName'() {
      this.clearFunctionList()
    }
  },
  destroyed() {
    if (this.$ws && this.loading) {
      this.$ws.off('loadJarLibResult', this.hanlderResult)
    }
  },
  methods: {
    getRepeatNames(list) {
      let map = {}
      let names = []

      list.forEach(item => {
        let name = item.function_name
        if (map[name]) {
          names.push(name)
        }
        map[name] = true
      })

      this.$api('Javascript_functions')
        .get({
          filter: JSON.stringify(
            encodeURIComponent({
              fields: { function_name: 1 },
              where: {
                function_name: {
                  inq: Object.keys(map)
                }
              }
            })
          )
        })
        .then(res => {
          let data = res?.data || []
          names.concat(data)
          this.repeatNames = Array.from(new Set(names))
          this.funcList.forEach(item => {
            item.isRepeat = this.repeatNames.includes(item.function_name)
          })
        })
    },
    changeName(index) {
      this.funcList[index].function_name = this.editName
      this.editIndex = null
      this.getRepeatNames(this.funcList, this.editName)
    },
    clearFunctionList() {
      this.funcList = null
      this.editIndex = null
    },
    hanlderResult(data) {
      let result = data?.result
      if (data?.status === 'SUCCESS' && result?.length) {
        this.funcList = result.map(item => {
          item.function_name = item.functionName
          item = Object.assign(item, {
            describe: '',
            format: '',
            parameters_desc: '',
            return_value: '',
            isRepeat: false
          })
          return item
        })
        this.getRepeatNames(this.funcList)
      } else if (data?.status === 'ERROR') {
        this.$message.error(data.error)
      } else {
        this.$message.error(this.$t('function_message_load_function_fail'))
      }
      this.loading = false
    },
    loadFunction() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.$ws) {
            this.loading = true
            this.$ws.on('loadJarLibResult', this.hanlderResult)
            let { fileId, packageName } = this.form
            this.$ws.send({
              type: 'loadJar',
              data: {
                fileId,
                packageName
              }
            })
          }
        }
      })
    },
    fileRemove() {
      this.fileList = []
      this.$api('file')
        .removeFile(this.form.fileId)
        .then(() => {})
      this.form.fileId = ''
      this.form.fileName = ''
    },
    fileChange(file) {
      if (file.status === 'ready') {
        this.form.fileId = ''
      }
      if (file.response) {
        let code = file.response.code
        if (code === 'ok') {
          this.$message.success(this.$t('function_file_upload_success'))
          this.form.fileId = file.response.data.id
          this.form.fileName = file.name
          this.$refs.form.clearValidate()
        }
        this.fileList = [file]
      }
      if (file.status === 'fail') {
        this.$message.error(this.$t('function_file_upload_fail'))
      }
    },
    openSetting(row, index) {
      this.settingData = Object.assign({}, row, { index })
    },
    submitSetting() {
      let data = this.settingData
      this.$set(this.funcList, data.index, Object.assign({}, data))
      this.settingData = null
    },
    remove(index) {
      this.funcList.splice(index, 1)
    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let list = this.funcList
          if (!list?.length) {
            return this.$message.error(this.$t('function_message_function_empty'))
          }
          if (list.some(item => item.isRepeat)) {
            return this.$message.error(this.$t('function_name_repeat'))
          }
          let { fileId, fileName, packageName } = this.form
          let useId = this.$cookie.get('user_id')
          let now = new Date()
          let params = list.map(item => {
            let { function_name, describe, format, parameters_desc, return_value, className, methodName } = item
            return {
              type: 'jar',
              fileId,
              fileName,
              packageName,
              function_name,
              className,
              methodName,
              describe,
              format,
              parameters_desc,
              return_value,
              last_updated: now,
              user_id: useId
            }
          })
          this.$api('Javascript_functions')
            .post(params)
            .then(res => {
              if (res) {
                this.$message.success(this.$t('message.saveOK'))
                this.$router.back()
              }
            })
            .catch(e => {
              this.$message.error(e.response.msg)
            })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.import-form-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
  .btn {
    min-width: 80px;
  }
}
.import-form__body {
  margin: 30px 24px 0 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0px 0px 3px 0px #cccccc;
  overflow: hidden;

  ::v-deep {
    .el-form-item__label {
      font-size: 12px;
    }
    .el-form-item--mini.el-form-item,
    .el-form-item--small.el-form-item {
      margin-bottom: 24px;
    }
    .el-upload-list__item:first-child {
      margin-top: 0;
    }
  }
  .form-input {
    max-width: 384px;
  }
  .main {
    flex: 1;
    overflow: auto;
  }
  .footer {
    border-top: 1px solid #f0f0f0;
    box-shadow: 0px -1px 2px 0px #f6f6f6;
  }
}
</style>
