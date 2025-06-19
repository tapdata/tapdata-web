<script>
import { EditPen } from '@element-plus/icons-vue'
import { fileApi, javascriptFunctionsApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import Cookie from '@tap/shared/src/cookie'
import i18n from '@/i18n'

export default {
  components: { PageContainer },
  data() {
    return {
      loading: false,
      fileList: [],
      funcList: [],
      form: {
        fileId: '',
        fileName: '',
        packageName: '',
      },
      rules: {
        fileId: [
          { required: true, message: this.$t('function_file_upload_tips') },
        ],
        packageName: [
          {
            required: true,
            message: this.$t('function_package_name_placeholder'),
          },
        ],
      },
      settingData: null,
      editIndex: null,
      editName: '',
      repeatNames: [],
    }
  },
  watch: {
    'form.fileId': function () {
      this.clearFunctionList()
    },
    'form.packageName': function () {
      this.clearFunctionList()
    },
  },
  created() {
    this?.$ws?.on('loadJarLibResult', this.hanlderResult)
  },
  beforeUnmount() {
    this?.$ws?.off('loadJarLibResult', this.hanlderResult)
    clearTimeout(this.timer)
  },
  methods: {
    getRepeatNames(list) {
      const map = {}
      let names = []

      list.forEach((item) => {
        const name = item.function_name
        if (map[name]) {
          names.push(name)
        }
        map[name] = true
      })

      javascriptFunctionsApi
        .get({
          filter: JSON.stringify({
            fields: { function_name: 1 },
            where: {
              function_name: {
                inq: Object.keys(map),
              },
            },
          }),
        })
        .then((data) => {
          const items = data?.items || []
          names = names.concat(items.map((item) => item.function_name))
          this.repeatNames = Array.from(new Set(names))
          this.funcList.forEach((item) => {
            item.isRepeat = this.repeatNames.includes(item.function_name)
          })
        })
    },
    changeName(index) {
      const item = this.funcList[index]
      item.function_name = this.editName
      item.format = this.setFormat(item)
      this.editIndex = null
      this.getRepeatNames(this.funcList, this.editName)
    },
    clearFunctionList() {
      this.funcList = null
      this.editIndex = null
    },
    setFormat(item) {
      const params = item?.parameters?.sort((a, b) => a.index < b.index) || []
      const arr = []
      params.forEach((p) => {
        arr.push(`${p.name}:${p.type}`)
      })
      return `${item.function_name}(${arr.join(', ')})`
    },
    hanlderResult(data) {
      if (!this.loading) {
        return
      }
      const result = data?.result
      if (data?.status === 'SUCCESS' && result?.length) {
        this.funcList = result.map((item) => {
          item.function_name = item.methodName
          item.classNameFmt =
            item.className?.split(`${this.form.packageName}.`)?.[1] || ''
          item = Object.assign(item, {
            describe: '',
            format: '',
            parameters_desc: '',
            return_value: '',
            isRepeat: false,
          })
          item.format = this.setFormat(item)
          return item
        })
        this.getRepeatNames(this.funcList)
      } else if (data?.status === 'ERROR') {
        this.$message.error(data.error)
      } else if (data?.status === 'TIME_OUT') {
        this.$message.error('Websocket time out.')
      } else {
        this.$message.error(this.$t('function_message_load_function_fail'))
      }
      this.loading = false
      clearTimeout(this.timer)
    },
    loadFunction() {
      this.$refs.form.validate((valid) => {
        if (valid && this.$ws) {
          this.loading = true
          const { fileId, packageName } = this.form
          this.$ws.send({
            type: 'loadJar',
            data: {
              fileId,
              packageName,
            },
          })
          // 设置10秒超时
          this.timer = setTimeout(() => {
            this?.hanlderResult({ status: 'TIME_OUT' })
          }, 10000)
        }
      })
    },
    selectFile(file) {
      const maxFileSize = 10
      if (file.size > maxFileSize * 1024 * 1024) {
        this.$message.error(
          i18n.t('daas_function_importform_shangchuanwenjianda', {
            val1: maxFileSize,
          }),
        )
        return false
      }
      return true
    },
    fileRemove() {
      this.fileList = []
      fileApi.removeFile(this.form.fileId).then(() => {})
      this.form.fileId = ''
      this.form.fileName = ''
    },
    fileChange(file) {
      if (file.status === 'ready') {
        this.form.fileId = ''
      }
      if (file.response) {
        const code = file.response.code
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
      const data = this.settingData
      this.funcList[data.index] = Object.assign({}, data)
      this.settingData = null
    },
    remove(index) {
      this.funcList.splice(index, 1)
      this.getRepeatNames(this.funcList)
    },
    save() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const list = this.funcList
          if (!list?.length) {
            return this.$message.error(
              this.$t('function_message_function_empty'),
            )
          }
          if (list.some((item) => item.isRepeat)) {
            return this.$message.error(this.$t('function_name_repeat'))
          }
          const loading = this.$loading()
          const { fileId, fileName, packageName } = this.form
          const useId = Cookie.get('user_id')
          const now = new Date()
          const params = list.map((item) => {
            const {
              function_name,
              describe,
              format,
              parameters_desc,
              return_value,
              className,
              methodName,
            } = item
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
              user_id: useId,
            }
          })
          javascriptFunctionsApi
            .post(params)
            .then(() => {
              this.$message.success(this.$t('public_message_save_ok'))
              this.$router.back()
            })
            .finally(() => {
              loading.close()
            })
        }
      })
    },
    handleEdit(row, index) {
      this.editIndex = index
      this.editName = row.function_name
    },
  },
}
</script>

<template>
  <PageContainer
    mode="auto"
    content-class="flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <ElForm
      ref="form"
      label-position="left"
      label-width="auto"
      :model="form"
      :rules="rules"
    >
      <ElFormItem prop="fileId" :label="`${$t('function_file_label')}:`">
        <div class="flex align-center">
          <ElUpload
            class="form-input flex align-center"
            action="api/file/upload"
            accept=".jar"
            :file-list="fileList"
            :before-upload="selectFile"
            :on-change="fileChange"
            :on-remove="fileRemove"
          >
            <ElButton style="margin-right: 10px" type="primary">{{
              $t('function_button_file_upload')
            }}</ElButton>
          </ElUpload>
          <span class="color-info ml-4" style="font-size: 12px"
            >*{{ $t('function_tips_max_size') }}10M</span
          >
        </div>
      </ElFormItem>
      <ElFormItem
        prop="packageName"
        :label="`${$t('function_package_name_label')}:`"
      >
        <div class="flex align-center">
          <ElInput
            v-model="form.packageName"
            class="form-input"
            :placeholder="$t('function_package_name_placeholder')"
          />
          <ElButton
            class="btn ml-4"
            type="primary"
            :loading="loading"
            @click="loadFunction"
          >
            <span>{{ $t('function_button_load_function') }}</span>
          </ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <div class="flex flex-column flex-1 overflow-hidden">
      <div class="mb-4 fw-sub">
        {{ $t('function_import_list_title') }}
      </div>
      <ElTable :data="funcList" height="100%">
        <ElTableColumn :label="$t('function_name_label')">
          <template #default="{ row, $index }">
            <div class="flex align-center">
              <template v-if="editIndex !== $index">
                <ElTooltip
                  v-if="row.isRepeat"
                  class="item"
                  effect="dark"
                  placement="top"
                  :content="$t('function_tips_name_repeat')"
                >
                  <el-icon class="mr-2 color-danger"
                    ><el-icon-warning
                  /></el-icon>
                </ElTooltip>
                <span class="ellipsis">{{ row.function_name }}</span>
                <ElButton
                  class="ml-2"
                  text
                  icon="el-icon-edit-outline"
                  @click="handleEdit(row, $index)"
                >
                  <el-icon><EditPen /></el-icon
                ></ElButton>
              </template>
              <template v-else>
                <ElInput v-model="editName" class="mr-2" />
                <ElButton @click="editIndex = null">{{
                  $t('public_button_cancel')
                }}</ElButton>
                <ElButton
                  type="primary"
                  :disabled="!editName || !editName.trim()"
                  @click="changeName($index)"
                  >{{ $t('public_button_save') }}</ElButton
                >
              </template>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="classNameFmt"
          :label="$t('function_class_label')"
        />
        <ElTableColumn
          prop="methodName"
          :label="$t('function_method_name_label')"
        />
        <ElTableColumn prop="format" :label="$t('function_format')" />
        <ElTableColumn width="120px" :label="$t('public_operation')">
          <template #default="{ row, $index }">
            <ElButton text @click="openSetting(row, $index)">{{
              $t('public_button_setting')
            }}</ElButton>
            <ElButton text @click="remove($index)">{{
              $t('public_button_delete')
            }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <div class="footer position-sticky py-6 bottom-0 bg-white z-10">
      <ElButton type="primary" @click="save">{{
        $t('public_button_save')
      }}</ElButton>

      <ElButton @click="$router.back()">{{
        $t('public_button_back')
      }}</ElButton>
    </div>

    <ElDialog
      width="694px"
      class="create-dialog"
      :title="$t('function_dialog_setting_title')"
      :close-on-click-modal="false"
      :model-value="!!settingData"
    >
      <ElForm
        v-if="settingData"
        label-position="left"
        label-width="120px"
        :model="settingData"
      >
        <ElFormItem
          prop="describe"
          :label="`${$t('function_describe_label')}:`"
        >
          <ElInput
            v-model="settingData.describe"
            type="textarea"
            :placeholder="$t('function_describe_placeholder')"
          />
        </ElFormItem>
        <ElFormItem prop="format" :label="`${$t('function_format')}:`">
          <ElInput
            v-model="settingData.format"
            :placeholder="$t('function_format_placeholder')"
          />
        </ElFormItem>
        <ElFormItem
          prop="parameters_desc"
          :label="`${$t('function_parameters_describe_label')}:`"
        >
          <ElInput
            v-model="settingData.parameters_desc"
            type="textarea"
            :placeholder="$t('function_parameters_describe_placeholder')"
          />
        </ElFormItem>
        <ElFormItem
          prop="return_value"
          :label="`${$t('function_return_value_label')}:`"
        >
          <ElInput
            v-model="settingData.return_value"
            type="textarea"
            :placeholder="$t('function_return_value_placeholder')"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton class="btn" @click="settingData = null">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton class="btn" type="primary" @click="submitSetting">{{
            $t('public_button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.import-form__body {
  margin: 30px 24px 0 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: map.get($bgColor, white);
  box-shadow: 0px 0px 3px 0px #cccccc;
  overflow: hidden;
  :deep(.el-form-item__label) {
    font-size: 12px;
  }

  :deep(.el-form-item--mini.el-form-item),
  :deep(.el-form-item--small.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-upload-list__item:first-child) {
    margin-top: 0;
  }

  :deep(.el-upload-list__item-name) {
    width: 250px;
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
