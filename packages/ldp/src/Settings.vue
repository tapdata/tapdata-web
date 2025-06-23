<script>
import { connectionsApi, liveDataPlatformApi } from '@tap/api'
import dataIntegrationModeImg from '@tap/assets/images/swimlane/data-integration-mode.png'
import dataServicePlatformModeImg from '@tap/assets/images/swimlane/data-service-platform-mode.png'
import i18n from '@tap/i18n'

export default {
  name: 'Settings',
  props: {
    title: {
      type: String,
      default: () => {
        return 'Product Capability Mode'
      },
    },
    visible: {
      required: true,
      value: Boolean,
    },
    fdmConnection: Object,
    mdmConnection: Object,
  },
  emits: [
    'init',
    'update:mode',
    'update:fdmStorageConnectionId',
    'update:visible',
    ' success',
  ],
  data() {
    const isCommunity = import.meta.env.VUE_APP_MODE === 'community'
    const options = [
      {
        label: this.$t('packages_business_mongodb_self_hosted_cluster'),
        value: 'self',
        tag: 'Add a New Connection',
      },
      {
        label: this.$t('packages_business_mongodb_full_management_cluster'),
        value: 'full-management',
      },
    ]

    if (isCommunity) {
      options.pop()
    }

    return {
      dataIntegrationModeImg,
      dataServicePlatformModeImg,
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      mode: '',
      connectionsList: [],
      modeItems: [
        {
          label: 'Data Integration Mode',
          value: 'integration',
        },
        {
          label: 'Data Service Platform Mode',
          value: 'service',
          beta: true,
        },
      ],
      options,
      form: {
        fdmStorageCluster: '',
        fdmStorageConnectionId: '',
        mdmStorageCluster: '',
        mdmStorageConnectionId: '',
      },
      loading: false,
      rules: {
        fdmStorageConnectionId: [
          {
            required: true,
            message: i18n.t('public_select_placeholder'),
            trigger: 'change',
          },
        ],
        mdmStorageConnectionId: [
          {
            required: true,
            message: i18n.t('public_select_placeholder'),
            trigger: 'change',
          },
        ],
      },
      liveDataPlatformId: '',

      setting: null,
    }
  },
  computed: {
    disabled() {
      return (
        this.isDaas &&
        this.setting &&
        !!this.setting.fdmStorageConnectionId &&
        // this.setting.fdmStorageCluster === this.form.fdmStorageCluster &&
        this.setting.fdmStorageConnectionId === this.form.fdmStorageConnectionId
      )
    },
    disabledBtn() {
      return (
        this.isDaas &&
        ((this.disabled &&
          this.mode === 'service' &&
          this.mode === this.setting?.mode) ||
          (this.mode === 'service' &&
            this.form.fdmStorageCluster === 'full-management'))
      )
    },
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
      this.$emit('init', data)
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
            in: ['source_and_target'],
          },
          database_type: {
            in: ['MongoDB', 'MongoDB Atlas'],
          },
        },
      }
      connectionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          this.connectionsList =
            data?.items.map((t) => {
              return {
                label: t.name,
                value: t.id,
              }
            }) || []
        })
    },

    setData(data = {}, update = false) {
      this.mode = data.mode || this.modeItems[0]?.value
      this.liveDataPlatformId = data.id

      if (this.mode === 'service') {
        const { options, connectionsList } = this
        this.form.fdmStorageCluster =
          data.fdmStorageCluster ||
          this.form.fdmStorageCluster ||
          options[0]?.value
        this.form.fdmStorageConnectionId =
          data.fdmStorageConnectionId ||
          this.form.fdmStorageConnectionId ||
          connectionsList[0]?.value
        this.form.mdmStorageCluster =
          data.mdmStorageCluster ||
          this.form.mdmStorageCluster ||
          options[0]?.value
        this.form.mdmStorageConnectionId =
          data.mdmStorageConnectionId ||
          this.form.mdmStorageConnectionId ||
          connectionsList[0]?.value
      }

      update && this.$emit('update:mode', this.mode)
    },

    handleOpen() {
      this.init()
    },

    handleClose() {
      this.$emit('update:visible', false)
    },

    handleSelectMode(type) {
      this.setData({
        mode: type,
        id: this.liveDataPlatformId,
      })
    },

    handleChangeFDMStorage() {
      this.form.fdmStorageConnectionId = this.connectionsList[0]?.value
    },

    handleChangeMDMStorage() {
      this.form.mdmStorageConnectionId = this.connectionsList[0]?.value
    },

    submit() {
      this.$refs.form.validate((v) => {
        if (!v) return
        const { mode, form, liveDataPlatformId } = this
        this.loading = true

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
    },

    handleOrderStorage() {
      this.$router.push({
        name: 'CreateStorage',
      })
    },
  },
}
</script>

<template>
  <ElDialog
    :title="title"
    :model-value="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    @open="handleOpen"
    @close="handleClose"
  >
    <template #header>
      <div class="font-color-dark fs-6 fw-sub">
        {{ $t('packages_business_data_console_mode') }}
      </div>
    </template>
    <div>
      <div
        class="flex gap-6 justify-content-center p-4 rounded-lg mode-card-container"
      >
        <div
          class="flex-1 rounded-xl bg-white border mode-card overflow-hidden clickable"
          :class="{ active: mode === 'integration' }"
          @click="handleSelectMode('integration')"
        >
          <ElImage
            class="px-5 py-2 mode-card-image align-top"
            :src="dataIntegrationModeImg"
          />
          <div class="px-4 flex align-center mode-card-title border-bottom">
            <ElRadio v-model="mode" class="mr-0" label="integration">
              <span class="fs-7 fw-sub">{{
                $t('packages_business_data_console_mode_integration')
              }}</span>
            </ElRadio>
          </div>
          <div class="px-4 py-2 mode-desc">
            1.
            {{
              $t('packages_business_data_console_mode_integration_tooltip_1')
            }}
            <br />
            2.
            {{
              $t('packages_business_data_console_mode_integration_tooltip_2')
            }}
            <br />
            3.
            {{
              $t('packages_business_data_console_mode_integration_tooltip_3')
            }}
          </div>
        </div>
        <div
          class="flex-1 rounded-xl bg-white border mode-card overflow-hidden clickable"
          :class="{ active: mode === 'service' }"
          @click="handleSelectMode('service')"
        >
          <ElImage
            class="px-5 py-2 mode-card-image align-top"
            :src="dataServicePlatformModeImg"
          />
          <div class="px-4 flex align-center mode-card-title border-bottom">
            <ElRadio v-model="mode" class="mr-0" label="service">
              <span class="fs-7 fw-sub"
                >{{ $t('packages_business_data_console_mode_service')
                }}<VIcon class="ml-1" size="32">beta</VIcon></span
              >
            </ElRadio>
          </div>
          <div class="px-4 py-2 mode-desc">
            1.
            {{ $t('packages_business_data_console_mode_service_tooltip_1') }}
            <br />
            2.
            {{ $t('packages_business_data_console_mode_service_tooltip_2') }}
            <br />
            3. {{ $t('packages_business_data_console_mode_service_tooltip_3') }}
          </div>
        </div>
      </div>

      <ElForm
        ref="form"
        :model="form"
        :rules="rules"
        label-position="top"
        class="mode-setting-form"
      >
        <template v-if="mode === 'service'">
          <div class="my-4 fs-6 font-color-dark form-title">
            <span class="align-middle">{{
              $t('packages_business_data_console_fdm_mdm_storage')
            }}</span>
            <ElTooltip
              class="ml-1"
              placement="top"
              :content="
                $t('packages_business_data_console_fdm_mdm_storage_tooltip')
              "
            >
              <VIcon class="color-primary align-middle" size="16">info</VIcon>
            </ElTooltip>
          </div>
          <div class="px-4 py-3 rounded-lg border">
            <ElFormItem prop="fdmStorageConnectionId">
              <template #label>
                <span class="inline-flex align-center">
                  <span>{{
                    $t('packages_business_data_console_fdm_storage')
                  }}</span>
                </span>
              </template>

              <ElRadioGroup
                v-if="!isDaas"
                v-model="form.fdmStorageCluster"
                :disabled="disabled"
                class="mb-2"
                @change="handleChangeFDMStorage"
              >
                <ElRadio
                  v-for="item in options"
                  :key="`FDM${item.value}`"
                  :label="item.value"
                  border
                  class="mr-4 ml-0"
                >
                  <span>{{ item.label }}</span>
                </ElRadio>
              </ElRadioGroup>

              <ElSelect
                v-if="form.fdmStorageCluster === 'self'"
                v-model="form.fdmStorageConnectionId"
                :disabled="disabled"
                class="w-100"
              >
                <ElOption
                  v-for="op in connectionsList"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                />
              </ElSelect>
              <template v-else>
                <div class="flex align-center gap-4">
                  <span
                    v-if="fdmConnection"
                    class="preview-text inline-block rounded-4 bg-subtle ellipsis"
                    >{{ fdmConnection.name }}</span
                  >
                  <ElButton
                    class="flex-shrink-0"
                    type="primary"
                    @click="handleOrderStorage"
                    >{{
                      $t('packages_ldp_order_fully_managed_storage')
                    }}</ElButton
                  >
                </div>
              </template>
            </ElFormItem>

            <ElFormItem prop="mdmStorageConnectionId">
              <template #label>
                <span class="inline-flex align-center">
                  <span>{{
                    $t('packages_business_data_console_mdm_storage')
                  }}</span>
                </span>
              </template>
              <ElRadioGroup
                v-if="!isDaas"
                v-model="form.mdmStorageCluster"
                class="mb-2"
                :disabled="disabled"
                @change="handleChangeMDMStorage"
              >
                <ElRadio
                  v-for="item in options"
                  :key="`FDM${item.value}`"
                  :label="item.value"
                  border
                  class="mr-4 ml-0"
                >
                  <span>{{ item.label }}</span>
                </ElRadio>
              </ElRadioGroup>

              <ElSelect
                v-if="form.mdmStorageCluster === 'self'"
                v-model="form.mdmStorageConnectionId"
                :disabled="disabled"
                class="w-100"
              >
                <ElOption
                  v-for="op in connectionsList"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                />
              </ElSelect>
              <template v-else>
                <div class="flex align-center gap-4">
                  <span
                    v-if="mdmConnection"
                    class="preview-text inline-block rounded-4 bg-subtle ellipsis"
                    >{{ mdmConnection.name }}</span
                  >
                  <ElButton
                    class="flex-shrink-0"
                    type="primary"
                    @click="handleOrderStorage"
                    >{{
                      $t('packages_ldp_order_fully_managed_storage')
                    }}</ElButton
                  >
                </div>
              </template>
            </ElFormItem>

            <div
              v-if="isDaas"
              class="flex align-items-center font-color-sslight"
            >
              <VIcon class="mr-1" size="14">info</VIcon>
              <span class="font-color-sslight">{{
                $t('packages_business_data_console_setting_saved_tooltip')
              }}</span>
            </div>
          </div>
        </template>
      </ElForm>
    </div>
    <template #footer>
      <div>
        <ElButton class="ml-4" @click="cancel">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          v-loading="loading"
          type="primary"
          :disabled="disabledBtn"
          @click="submit"
          >{{ $t('public_button_save') }}</ElButton
        >
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
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
    border-color: var(--color-primary) !important;
    .mode-card-image {
    }
  }

  &:hover {
    box-shadow:
      0 10px 36px 10px rgba(31, 35, 41, 0.04),
      0 8px 24px rgba(31, 35, 41, 0.04),
      0 6px 12px -10px rgba(31, 35, 41, 0.06);
  }
}
.mode-setting-form.el-form--label-top {
  :deep(.el-form-item__label) {
    padding-bottom: 0;
  }
}
.mode-desc {
  line-height: 2;
  padding-bottom: 10px;
}
.el-divider--horizontal {
  margin: 5px 5px !important;
}
.preview-text {
  padding: 0 15px;
  line-height: 32px;
  color: #333c4a;
  border: 1px solid hsla(0, 0%, 86.7%, 0.4);
}

.form-title {
  position: relative;
  padding-left: 12px;
  $bar-width: 3px;

  &::before {
    content: '';
    width: $bar-width;
    height: 1em;
    border-radius: calc($bar-width / 2);
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    position: absolute;
    background-color: var(--color-primary);
  }
}
</style>
