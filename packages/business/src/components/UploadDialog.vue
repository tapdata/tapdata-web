<script>
import { connectionsApi, metadataDefinitionsApi } from '@tap/api'
import { InfiniteSelect as AsyncSelect } from '@tap/form/src/components/infinite-select'
import Cookie from '@tap/shared/src/cookie'
import axios from 'axios'
import { merge } from 'lodash-es'
import { CONNECTION_STATUS_MAP } from '../shared'

export default {
  name: 'Upload',
  components: {
    AsyncSelect,
  },
  props: {
    showCondition: {
      type: Boolean,
      default: true,
    },
    type: {
      required: true,
      value: String,
    },
    showTag: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['success'],
  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    return {
      isDaas,
      // title: '',
      // uploadText: '',
      dialogVisible: false,
      classifyList: [],
      downType: '',
      importForm: {
        tag: [],
        fileList: [],
        action: '',
        upsert: 1,
        source: '',
        sink: '',
      },
      rules: {
        source: [
          {
            required: true,
            message: this.$t('public_select_placeholder'),
            trigger: 'blur',
          },
        ],
        sink: [
          {
            required: true,
            message: this.$t('public_select_placeholder'),
            trigger: 'blur',
          },
        ],
      },
      uploading: false,
    }
  },
  computed: {
    title() {
      return this.$t(
        this.isRelmig
          ? 'packages_business_relmig_import'
          : 'packages_business_modules_dialog_import_title',
      )
    },
    uploadText() {
      return this.$t(
        this.isRelmig
          ? 'packages_business_relmig_upload'
          : 'packages_business_modules_dialog_upload_files',
      )
    },
    isRelmig() {
      return this.type === 'relmig'
    },
    fileAccept() {
      return !this.isRelmig ? '.gz' : '.relmig' // 云版仅支持 .relmig
    },
    uploadData() {
      const data = {
        upsert: this.importForm.upsert,
        type: this.downType,
        listtags: JSON.stringify(this.importForm.tag),
        cover: !!this.importForm.upsert,
      }

      if (this.isRelmig) {
        Object.assign(data, {
          source: this.importForm.source,
          sink: this.importForm.sink,
        })
      }

      return data
    },
  },
  created() {
    if (this.type === 'api') {
      this.downType = 'APIServer'
    } else if (this.type === 'Modules') {
      this.downType = 'Modules'
    } else if (this.type === 'Inspect') {
      this.downType = 'Inspect'
    } else {
      this.downType = 'dataflow'
    }
    this.accessToken = Cookie.get('access_token')
    this.getClassify()
  },
  methods: {
    show() {
      this.dialogVisible = true
      this.resetRelmig()
      this.$refs.upload?.clearFiles()
      this.$refs.form?.resetFields()
    },

    // 上传文件成功失败钩子
    handleChange(file) {
      // if (file.name.split('.').pop() !== 'relmig') {
      //   this.isRelmig = true
      // } else {
      //   this.resetRelmig()
      // }

      this.importForm.fileList = [file]
      const originPath = window.location.origin + window.location.pathname
      const accessToken = this.accessToken
        ? `?access_token=${this.accessToken}`
        : ''
      const map = {
        api: `api/MetadataInstances/upload${accessToken}`,
        Javascript_functions: `api/Javascript_functions/batch/import${accessToken}`,
        Modules: `api/Modules/batch/import${accessToken}`,
      }

      let apiBaseURL = axios.defaults.baseURL.replace(/^\.?\//, '')
      if (apiBaseURL) apiBaseURL += '/'

      this.importForm.action =
        originPath +
        apiBaseURL +
        (map[this.type] || `api/Task/batch/import${accessToken}`)
    },

    // 获取分类
    getClassify() {
      const filter = {
        where: { or: [{ item_type: this.type }] },
      }
      metadataDefinitionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          this.classifyList = data?.items || []
        })
    },

    handleSuccess(response) {
      this.uploading = false
      if (response.code !== 'ok') {
        this.$message.error(
          response.message || this.$t('packages_business_message_upload_fail'),
        )
        this.importForm.fileList.forEach((file) => (file.status = 'ready'))
      } else {
        this.$message.success(
          this.$t('packages_business_message_upload_success'),
        )
        this.$emit('success')
        this.importForm.fileList = []
        this.$refs.upload.clearFiles()
        this.dialogVisible = false
      }
    },

    handleError() {
      this.uploading = false
    },

    // 上传保存
    submitUpload() {
      if (this.importForm.fileList?.length === 0) {
        this.$message.error(this.$t('packages_business_message_upload_msg'))
        return
      }

      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.$refs.upload.submit()
        this.uploading = true
      })
    },

    resetRelmig() {
      this.importForm.source = ''
      this.importForm.sink = ''
    },

    //删除文件
    handleRemove(file, fileList) {
      this.importForm.fileList = fileList
      this.resetRelmig()
    },

    handleClose() {
      this.dialogVisible = false
      this.$refs.upload.clearFiles()
      this.resetRelmig()
    },

    async loadDatabases(filter) {
      try {
        const { isSource, isTarget } = filter
        const _filter = {
          where: {
            createType: {
              $ne: 'System',
            },
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1,
            accessNodeType: 1,
            accessNodeProcessId: 1,
            accessNodeProcessIdList: 1,
            pdkType: 1,
            pdkHash: 1,
            capabilities: 1,
          },
          order: ['status DESC', 'name ASC'],
        }
        // 过滤连接类型
        if (isSource && isTarget) {
          _filter.where.connection_type = 'source_and_target'
        } else if (isSource) {
          _filter.where.connection_type = {
            like: 'source',
            options: 'i',
          }
        } else if (isTarget) {
          _filter.where.connection_type = {
            like: 'target',
            options: 'i',
          }
        }
        const result = await connectionsApi.get({
          filter: JSON.stringify(merge(filter, _filter)),
        })

        result.items = result.items.map((item) => {
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
            value: item.id,
            databaseType: item.database_type,
            connectionType: item.connection_type,
            accessNodeProcessId: item.accessNodeProcessId,
          }
        })

        return result
      } catch (error) {
        console.log('catch', error) // eslint-disable-line
        return { items: [], total: 0 }
      }
    },

    getSourceDatabase(filter) {
      filter.isSource = true
      return this.loadDatabases(filter)
    },

    getTargetDatabase(filter) {
      Object.assign(filter, {
        isTarget: true,
        where: {
          database_type: {
            in: ['MongoDB', 'MongoDB Atlas'],
          },
        },
      })
      return this.loadDatabases(filter)
    },

    goCreateConnection() {
      this.$router.push({
        name: 'connections',
        query: {
          create: true,
        },
      })
    },
  },
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="680px"
    class="import-upload-dialog"
    :title="title"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <ElForm
      ref="form"
      :rules="rules"
      :model="importForm"
      class="applications-form"
      label-position="top"
      label-width="100px"
    >
      <ElAlert
        v-if="isRelmig"
        class="bg-color-primary-light-9 mb-2 text-primary"
        type="info"
        show-icon
        :closable="false"
      >
        <template #title>
          <span class="inline-block lh-sm align-middle">
            {{ $t('packages_business_relmig_import_desc') }}
          </span>
        </template>
      </ElAlert>

      <ElFormItem
        v-if="!isRelmig"
        prop="upsert"
        :label="$t('packages_business_modules_dialog_condition')"
      >
        <el-radio v-model="importForm.upsert" :label="1"
          >{{ $t('packages_business_modules_dialog_overwrite_data') }}
        </el-radio>
        <el-radio v-model="importForm.upsert" :label="0"
          >{{ $t('packages_business_modules_dialog_skip_data') }}
        </el-radio>
      </ElFormItem>
      <ElFormItem
        prop="fileList"
        :label="$t('packages_business_modules_dialog_file')"
      >
        <ElUpload
          ref="upload"
          class="w-75"
          :action="importForm.action"
          :accept="fileAccept"
          :file-list="importForm.fileList"
          :auto-upload="false"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :data="uploadData"
        >
          <template #trigger>
            <ElButton class="align-top" type="primary">
              <VIcon class="mr-1">upload</VIcon>
              {{ uploadText }}
            </ElButton>
          </template>
        </ElUpload>
      </ElFormItem>
      <template v-if="isRelmig && importForm.fileList.length">
        <ElFormItem
          :label-width="`${$i18n.locale === 'en' ? 150 : 100}px`"
          required
          :label="$t('public_source_connection')"
          prop="source"
        >
          <AsyncSelect
            v-model="importForm.source"
            :placeholder="
              $t(
                'packages_business__relmig_import_source_connection_placeholder',
              )
            "
            class="w-100"
            :method="getSourceDatabase"
            item-query="name"
            lazy
          />
          <div>
            <ElLink type="primary" @click="goCreateConnection"
              >{{ $t('packages_business__relmig_import_connection_tip') }}
            </ElLink>
          </div>
        </ElFormItem>
        <ElFormItem
          :label-width="`${$i18n.locale === 'en' ? 150 : 100}px`"
          required
          :label="$t('public_target_connection')"
          prop="sink"
        >
          <AsyncSelect
            v-model="importForm.sink"
            :placeholder="
              $t(
                'packages_business__relmig_import_target_connection_placeholder',
              )
            "
            class="w-100"
            :method="getTargetDatabase"
            item-query="name"
            lazy
          />
          <div>
            <ElLink type="primary" @click="goCreateConnection"
              >{{ $t('packages_business__relmig_import_connection_tip') }}
            </ElLink>
          </div>
        </ElFormItem>
      </template>
      <ElFormItem v-show="showTag" prop="tag" :label="$t('public_tags')">
        <ElSelect
          v-model="importForm.tag"
          multiple
          class="w-100"
          :placeholder="$t('packages_business_task_tag_placeholder')"
        >
          <ElOption
            v-for="item in classifyList"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton :loading="uploading" type="primary" @click="submitUpload()">{{
          $t('public_button_confirm')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.import-upload-dialog {
  .el-upload-list {
    .el-upload-list__item {
      line-height: 28px;
      background-color: map.get($bgColor, disable);

      &:hover {
        background-color: map.get($bgColor, disable);
      }

      &.is-success {
        .el-icon-close {
          display: none;
        }
      }
    }

    .el-upload-list__item-name {
      margin-right: 28px;
      background-color: unset;
    }

    .el-upload-list__item-name {
      &:hover {
        color: map.get($color, primary);
      }

      i {
        color: map.get($color, primary);
      }
    }

    .el-icon-upload-success {
      vertical-align: middle;
    }

    .el-icon-close {
      top: 7px;

      &:hover {
        color: map.get($color, primary);
      }
    }
  }
}
</style>
