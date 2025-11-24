<script>
import { uploadFunctions } from '@tap/api/core/function'
import { fetchMetadataDefinitions } from '@tap/api/core/metadata-definitions'
import { uploadMetadataInstance } from '@tap/api/core/metadata-instances'
import { uploadModules } from '@tap/api/core/modules'
import { uploadTask } from '@tap/api/core/task'
import { fetchConnections } from '@tap/api/src/core/connections'
import { FileAddColorful, FileDocxColorful } from '@tap/component/src/icon'
import AsyncSelect from '@tap/form/src/components/infinite-select/InfiniteSelect.vue'
import { calcUnit } from '@tap/shared'
import { merge } from 'lodash-es'
import { CONNECTION_STATUS_MAP } from '../shared'

const uploadHandlers = {
  api: uploadMetadataInstance,
  Javascript_functions: uploadFunctions,
  Modules: uploadModules,
  dataflow: uploadTask,
}

export default {
  name: 'Upload',
  components: {
    AsyncSelect,
    FileAddColorful,
    FileDocxColorful,
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
      importForm: {
        tag: [],
        fileList: [],
        action: '',
        upsert: 1,
        source: '',
        sink: '',
        importMode: 'import_as_copy',
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
      titleMap: {
        Modules: 'packages_business_api_import',
        Inspect: 'packages_business_modules_dialog_import_title',
        dataflow: 'packages_business_modules_dialog_import_title',
        relmig: 'packages_business_relmig_import',
        Javascript_functions: 'packages_business_functions_import',
      },
    }
  },
  computed: {
    importType() {
      const map = {
        api: 'APIServer',
        relmig: 'dataflow',
      }
      return map[this.type] || this.type
    },
    title() {
      return this.$t(this.titleMap[this.type || 'dataflow'])
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
  },
  created() {
    this.getClassify()
  },
  methods: {
    calcUnit,
    handleDelete() {
      this.importForm.fileList = []
      this.resetRelmig()
    },
    show() {
      this.dialogVisible = true
      this.resetRelmig()
      this.$refs.upload?.clearFiles()
      this.$refs.form?.resetFields()
    },

    // 获取分类
    getClassify() {
      const filter = {
        where: { or: [{ item_type: this.type }] },
      }
      fetchMetadataDefinitions(filter).then((data) => {
        this.classifyList = data?.items || []
      })
    },

    // 上传保存
    async submitUpload() {
      if (this.importForm.fileList?.length === 0) {
        this.$message.error(this.$t('packages_business_message_upload_msg'))
        return
      }

      const valid = await this.$refs.form.validate()
      if (!valid) return

      this.uploading = true

      const formData = new FormData()
      formData.append('file', this.importForm.fileList[0].raw)
      formData.append('type', this.importType)
      formData.append('importMode', this.importForm.importMode)
      formData.append('listtags', JSON.stringify(this.importForm.tag))

      if (this.isRelmig) {
        formData.append('source', this.importForm.source)
        formData.append('sink', this.importForm.sink)
      }

      try {
        await uploadHandlers[this.type](formData)
        this.$message.success(
          this.$t('packages_business_message_upload_success'),
        )
        this.$emit('success')
        this.dialogVisible = false
      } catch (error) {
        console.error('error', error)
      }

      this.uploading = false
    },

    resetRelmig() {
      this.importForm.source = ''
      this.importForm.sink = ''
    },

    onClosed() {
      this.dialogVisible = false
      this.importForm.fileList = []
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
        const result = await fetchConnections(merge(filter, _filter))

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
    width="600px"
    class="import-upload-dialog"
    :title="title"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <el-upload
      v-show="!importForm.fileList.length"
      v-model:file-list="importForm.fileList"
      drag
      :accept="fileAccept"
      :auto-upload="false"
      :show-file-list="false"
    >
      <el-icon size="40"><FileAddColorful /></el-icon>
      <div
        class="el-upload__text mt-6"
        v-html="$t('packages_business_drag_file_here', { type: fileAccept })"
      />
    </el-upload>
    <div
      v-if="importForm.fileList.length"
      class="flex align-center gap-3 border rounded-xl p-3 lh-base hover:border-primary"
    >
      <el-icon size="32"><FileDocxColorful /></el-icon>
      <div>
        <div class="font-bold">
          {{ importForm.fileList[0].name }}
        </div>
        <div
          class="fs-8"
          :style="{ color: 'var(--el-text-color-placeholder)' }"
        >
          {{ calcUnit(importForm.fileList[0].size, 1) }}
        </div>
      </div>

      <el-button class="ml-auto flex-shrink-0" text @click="handleDelete">
        <template #icon>
          <el-icon><i-lucide-trash-2 /></el-icon>
        </template>
      </el-button>
    </div>

    <ElForm
      ref="form"
      :rules="rules"
      :model="importForm"
      class="applications-form mt-6"
      label-position="top"
    >
      <ElAlert
        v-if="isRelmig"
        class="bg-color-primary-light-9 mb-2"
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
        prop="importMode"
        :label="$t('packages_business_import_mode')"
      >
        <el-radio-group
          v-model="importForm.importMode"
          class="gap-2 import-mode-radio-group"
        >
          <el-radio
            value="import_as_copy"
            border
            class="h-auto px-3 py-2 rounded-xl bg-card w-100 m-0"
          >
            <div class="lh-5 mb-1">
              {{ $t('packages_business_import_as_copy') }}
            </div>
            <p class="lh-sm font-color-sslight fs-8 text-wrap">
              {{ $t('packages_business_import_as_copy_tip') }}
            </p>
          </el-radio>
          <el-radio
            value="replace"
            border
            class="h-auto px-3 py-2 rounded-xl bg-card w-100 m-0"
          >
            <div class="lh-5 mb-1">
              {{ $t('packages_business_import_replace') }}
            </div>
            <p class="lh-sm font-color-sslight fs-8 text-wrap">
              {{ $t('packages_business_import_replace_tip') }}
            </p>
          </el-radio>
          <el-radio
            value="cancel_import"
            border
            class="h-auto px-3 py-2 rounded-xl bg-card w-100 m-0"
          >
            <div class="lh-5 mb-1">
              {{ $t('packages_business_import_cancel_import') }}
            </div>
            <p class="lh-sm font-color-sslight fs-8 text-wrap">
              {{ $t('packages_business_import_cancel_import_tip') }}
            </p>
          </el-radio>
        </el-radio-group>
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
        <ElButton @click="dialogVisible = false">{{
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
      background-color: var(--bg-disable);

      &:hover {
        background-color: var(--bg-disable);
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
        color: var(--color-primary);
      }

      i {
        color: var(--color-primary);
      }
    }

    .el-icon-upload-success {
      vertical-align: middle;
    }

    .el-icon-close {
      top: 7px;

      &:hover {
        color: var(--color-primary);
      }
    }
  }
  .import-mode-radio-group {
    .el-radio__input {
      align-self: flex-start;
      margin-top: 3px;
    }
  }
}
</style>
