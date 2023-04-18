<template>
  <ElDialog
    :title="title"
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    @open="handleOpen"
    @close="handleClose"
  >
    <div slot="title" class="font-color-dark fs-6 fw-sub">
      {{ $t('packages_business_data_console_mode') }}
    </div>
    <div class="my-n3">
      <!--<div class="fs-6 mb-4 font-color-dark">Product Capability Mode</div>-->
      <!--<div class="font-color-sslight">
        Tapdata可以作为一个实时的数据同步与加工产品使用,也可以作为一个实时数据服务平台使用,当作为服务平台使用时,除了基基本的数据同步与处理
        能力之外,通过预置的数据存储中心,您可以通过不同的分层模式式,便捷完成数据模型的构建,并支持通过各种终端服务对数据模型进行发布与展示
      </div>-->
      <!--<div class="font-color-sslight mb-12">
        Tapdata can be used as a general data integration tool(ETL) , or as a data as a service platform. The key
        difference is Data Platform mode requires a storage backend.
      </div>-->
      <div class="flex gap-6 justify-content-center p-4 rounded-4 mode-card-container">
        <div
          class="rounded-xl bg-white border mode-card overflow-hidden clickable"
          :class="{ active: mode === 'integration' }"
          @click="handleSelectMode('integration')"
        >
          <ElImage
            class="px-5 py-2 mode-card-image align-top"
            :src="require('@tap/assets/images/swimlane/data-integration-mode.png')"
          ></ElImage>
          <div class="px-4 flex align-center mode-card-title border-bottom">
            <ElRadio v-model="mode" class="mr-0" label="integration">
              <span class="fs-7 font-color-dark">{{ $t('packages_business_data_console_mode_integration') }}</span>
            </ElRadio>
          </div>
          <div class="px-4 py-2 mode-desc">
            1. {{ $t('packages_business_data_console_mode_integration_tooltip_1') }} <br />
            2. {{ $t('packages_business_data_console_mode_integration_tooltip_2') }}
          </div>
        </div>
        <div
          class="rounded-xl bg-white border mode-card overflow-hidden clickable"
          :class="{ active: mode === 'service' }"
          @click="handleSelectMode('service')"
        >
          <ElImage
            class="px-5 py-2 mode-card-image align-top"
            :src="require('@tap/assets/images/swimlane/data-service-platform-mode.png')"
          ></ElImage>
          <div class="px-4 flex align-center mode-card-title border-bottom">
            <ElRadio v-model="mode" class="mr-0" label="service">
              <span class="fs-7 font-color-dark"
                >{{ $t('packages_business_data_console_mode_service') }}<VIcon class="ml-1" size="32">beta</VIcon></span
              >
            </ElRadio>
          </div>
          <div class="px-4 py-2 mode-desc">
            1. {{ $t('packages_business_data_console_mode_service_tooltip_1') }} <br />
            2. {{ $t('packages_business_data_console_mode_service_tooltip_2') }} <br />
            3. {{ $t('packages_business_data_console_mode_service_tooltip_3') }}
          </div>
        </div>
      </div>

      <!--<ElRadioGroup v-model="mode" class="block" @change="handleSelectMode">
        <ElRadio
          v-for="item in modeItems"
          :label="item.value"
          :key="item.value"
          class="w-50 mr-0 inline-flex align-items-center"
        >
          <span>{{ item.label }}</span>
          <VIcon v-if="item.beta" class="ml-1" size="28">beta</VIcon>
        </ElRadio>
      </ElRadioGroup>-->
      <!--<div class="flex">
        <div class="w-50">
          <div class="mode-desc inline-block pt-4 cursor-pointer" @click="handleSelectMode('integration')">
            <ElImage :src="require('@tap/assets/images/swimlane/data-integration-mode.svg')"></ElImage>
            <ul class="mode-ul mt-4">
              <li>• Database Replications</li>
              <li>• Move data to cloud</li>
              <li>• ETL pipelines</li>
            </ul>
          </div>
        </div>
        <div class="w-50">
          <div class="mode-desc inline-block pt-4 cursor-pointer" @click="handleSelectMode('service')">
            <ElImage :src="require('@tap/assets/images/swimlane/data-service-platform-mode.svg')"></ElImage>
            <ul class="mode-ul mt-4">
              <li>• All the Data Integration capability, plus the storage & services</li>
              <li>• Data are sync-ed to and cached in centralized data platform</li>
              <li>
                • Data are then served to operational applications via API or to the analytical application via reverse
                ETL
              </li>
            </ul>
          </div>
        </div>
      </div>-->
      <ElForm :model="form" :rules="rules" ref="form" label-position="top" class="mode-setting-form">
        <div v-if="mode === 'service'" class="mt-4 px-4 py-3 border rounded-4">
          <ElFormItem>
            <span slot="label" class="inline-flex align-center">
              <span>{{ $t('packages_business_data_console_fdm_mdm_storage') }}</span>
              <ElTooltip
                class="ml-2"
                placement="top"
                :content="$t('packages_business_data_console_fdm_mdm_storage_tooltip')"
              >
                <VIcon size="14">info</VIcon>
              </ElTooltip>
            </span>
            <ElRadioGroup v-model="form.fdmStorageCluster" @change="handleChangeFDMStorage" :disabled="disabled">
              <ElRadio
                v-for="item in options"
                :label="item.value"
                :key="'FDM' + item.value"
                border
                class="rounded-2 mr-4 ml-0"
              >
                <span>{{ item.label }}</span>
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem prop="fdmStorageConnectionId">
            <ElSelect v-model="form.fdmStorageConnectionId" :disabled="disabled" class="w-100">
              <ElOption v-for="op in connectionsList" :label="op.label" :value="op.value" :key="op.value"></ElOption>
            </ElSelect>
          </ElFormItem>

          <!--<div class="flex align-items-center">
            <VIcon class="color-primary mr-2" size="14">info</VIcon>
            &lt;!&ndash;<span class="font-color-sslight"
              >If you wish to change this setting later, you must migrate the data to your new database - manually for
              now</span
            >&ndash;&gt;
            <span class="font-color-sslight"
              >Don't have the connection you want? You can add a connection in Connection Management.
            </span>
          </div>-->
          <div class="flex align-items-center">
            <VIcon class="mr-2" size="14">info</VIcon>
            <span class="font-color-sslight">{{ $t('packages_business_data_console_setting_saved_tooltip') }}</span>
          </div>

          <!--<div class="setting-card__header p-4">
            <span>FDM/MDM Storage Backend</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              content="Specify the database connection that will be used for LDP data storage"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>-->
        </div>
        <!--<div v-if="mode === 'service'" class="setting-card mt-6">
          <div class="setting-card__header p-4">
            <span>FDM Storage Backend</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              content="Specify the database connection that will be used for additional  data layer storage"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
          <div class="setting-card__content p-4">
            <ElRadioGroup v-model="form.mdmStorageCluster" @change="handleChangeMDMStorage">
              <ElRadio v-for="item in options" :label="item.value" :key="'MDM' + item.value" class="block mb-4">
                <span>{{ item.label }}</span>
                <ElTag class="ml-6 rounded-pill" effect="plain">{{ item.tag }}</ElTag>
                <ElFormItem v-if="form.mdmStorageCluster === item.value" prop="mdmStorageConnectionId">
                  <ElSelect v-model="form.mdmStorageConnectionId" class="block mt-4">
                    <ElOption
                      v-for="op in connectionsList"
                      :label="op.label"
                      :value="op.value"
                      :key="op.value"
                    ></ElOption>
                  </ElSelect>
                </ElFormItem>
              </ElRadio>
            </ElRadioGroup>
            <div class="flex align-items-center">
              <VIcon class="color-primary mr-2" size="14">info</VIcon>
              <span class="font-color-sslight"
                >If you wish to change this setting later, you must migrate the data to your new database - manually for
                now</span
              >
            </div>
          </div>
        </div>-->
      </ElForm>
    </div>
    <div slot="footer">
      <ElButton class="ml-4" @click="cancel">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton v-loading="loading" type="primary" :disabled="disabledBtn" @click="submit">{{
        $t('public_button_save')
      }}</ElButton>
    </div>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import { connectionsApi, liveDataPlatformApi } from '@tap/api'

export default {
  name: 'Settings',

  props: {
    title: {
      type: String,
      default: () => {
        return 'Product Capability Mode'
      }
    },
    visible: {
      required: true,
      value: Boolean
    }
  },

  data() {
    return {
      mode: '',
      connectionsList: [],
      modeItems: [
        {
          label: 'Data Integration Mode',
          value: 'integration'
        },
        {
          label: 'Data Service Platform Mode',
          value: 'service',
          beta: true
        }
      ],
      options: [
        {
          label: this.$t('packages_business_mongodb_atlas_cluster'),
          value: 'atlas',
          tag: 'Sync Atlas Cluster List'
        },
        {
          label: this.$t('packages_business_mongodb_self_hosted_cluster'),
          value: 'self',
          tag: 'Add a New Connection'
        }
      ],
      form: {
        fdmStorageCluster: '',
        fdmStorageConnectionId: '',
        mdmStorageCluster: '',
        mdmStorageConnectionId: ''
      },
      loading: false,
      rules: {
        fdmStorageConnectionId: [{ required: true, message: i18n.t('public_select_placeholder'), trigger: 'change' }],
        mdmStorageConnectionId: [{ required: true, message: i18n.t('public_select_placeholder'), trigger: 'change' }]
      },
      liveDataPlatformId: '',

      setting: null
    }
  },

  computed: {
    disabled() {
      return (
        this.setting &&
        this.setting.fdmStorageCluster === this.form.fdmStorageCluster &&
        this.setting.fdmStorageConnectionId === this.form.fdmStorageConnectionId
      )
    },

    disabledBtn() {
      return this.disabled && this.mode === 'service' && this.mode === this.setting?.mode
    }
  },

  created() {
    this.init()
  },

  methods: {
    async init() {
      this.loadConnections()
      const data = await this.getData()
      this.setting = data
      this.setData(data, true)
      this.$emit('init', this.form)
    },

    async getData() {
      return liveDataPlatformApi.findOne().catch(() => {
        return null
      })
    },

    loadConnections() {
      const filter = {
        limit: 999,
        where: {
          connection_type: {
            in: ['source_and_target']
          },
          database_type: 'MongoDB'
        }
      }
      connectionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.connectionsList =
            data?.items.map(t => {
              return {
                label: t.name,
                value: t.id
              }
            }) || []
        })
    },

    setData(data = {}, update = false) {
      this.mode = data.mode || this.modeItems[0]?.value
      this.liveDataPlatformId = data.id
      if (this.mode === 'service') {
        const { options, connectionsList } = this
        this.form.fdmStorageCluster = data.fdmStorageCluster || options[0]?.value
        this.form.fdmStorageConnectionId = data.fdmStorageConnectionId || connectionsList[0]?.value

        this.form.mdmStorageCluster = data.mdmStorageCluster || options[0]?.value
        this.form.mdmStorageConnectionId = data.mdmStorageConnectionId || connectionsList[0]?.value
      }

      update && this.$emit('update:mode', this.mode)
    },

    handleOpen() {
      this.init()
    },

    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },

    handleSelectMode(type) {
      this.setData({
        mode: type,
        id: this.liveDataPlatformId
      })
    },

    handleChangeFDMStorage() {
      this.form.fdmStorageConnectionId = this.connectionsList[0]?.value
    },

    handleChangeMDMStorage() {
      this.form.mdmStorageConnectionId = this.connectionsList[0]?.value
    },

    submit() {
      this.$refs.form.validate(v => {
        if (!v) return
        const { mode, form, liveDataPlatformId } = this
        this.loading = true

        // FDM & MDM 暂时合并一个
        form.mdmStorageCluster = form.fdmStorageCluster
        form.mdmStorageConnectionId = form.fdmStorageConnectionId

        liveDataPlatformApi
          .patch({ id: liveDataPlatformId, mode, ...form })
          .then(() => {
            const result = { mode, ...form }
            this.$message.success(this.$t('public_message_save_ok'))
            this.$emit('success', result)
            this.handleClose()

            Object.assign(this.setting, result)
          })
          .finally(() => {
            this.loading = false
          })
        this.loading = false
      })
    },

    cancel() {
      this.handleClose()
    }
  }
}
</script>

<style scoped lang="scss">
.dialog__content {
  padding: 20px 94px;
}
.mode-ul {
  list-style-type: disc;
}
.setting-card__header {
  border-radius: 4px 4px 0 0;
  background: rgba(78, 89, 105, 0.08);
  border: 1px solid #f2f2f2;
}
.setting-card__content {
  border: 1px solid #f2f2f2;
  border-top: none;
}

.mode-card-container {
  background-color: #f5f7fa;
}

.mode-card {
  transition: box-shadow 0.15s linear 0s;

  &-image {
    width: 100%;
    height: auto;
    background-color: #f6f8fa;
  }

  &-title {
    height: 48px;
  }

  &.active {
    border-color: map-get($color, primary) !important;
    .mode-card-image {
    }
  }

  &:hover {
    box-shadow: 0 10px 36px 10px rgba(31, 35, 41, 0.04), 0 8px 24px rgba(31, 35, 41, 0.04),
      0 6px 12px -10px rgba(31, 35, 41, 0.06);
  }
}

.mode-setting-form.el-form--label-top {
  ::v-deep {
    .el-form-item__label {
      padding-bottom: 0;
    }
  }
}

.mode-desc {
  line-height: 2;
  padding-bottom: 10px;
}
.el-divider--horizontal {
  margin: 5px 5px !important;
}
</style>
