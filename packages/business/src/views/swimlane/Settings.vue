<template>
  <ElDialog
    :title="title"
    :visible="visible"
    :append-to-body="true"
    width="1234px"
    top="10vh"
    destroy-on-close
    @open="handleOpen"
    @close="handleClose"
  >
    <div slot="title" class="text-center font-color-dark fs-2 fw-bold">
      {{ title }}
    </div>
    <div class="dialog__content text-break">
      <div class="fs-6 mb-2 font-color-normal text-center">Product Capability Mode</div>
      <div class="font-color-sslight mb-12">
        Tapdata can be used as a general data integration tool(ETL) , or as a data as a service platform. The key
        difference is Data Platform mode requires a storage backend.
      </div>
      <ElRadioGroup v-model="mode" class="block" @change="handleSelectMode">
        <ElRadio
          v-for="item in modeItems"
          :label="item.value"
          :key="item.value"
          class="w-50 mr-0 inline-flex align-items-center"
        >
          <span>{{ item.label }}</span>
          <VIcon v-if="item.beta" class="ml-1" size="28">beta</VIcon>
        </ElRadio>
      </ElRadioGroup>
      <div class="flex">
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
      </div>
      <ElForm :model="form" :rules="rules" ref="form">
        <div v-if="mode === 'service'" class="setting-card mt-6">
          <div class="setting-card__header p-4">
            <span>FDM/MDM Storage Backend</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              content="Specify the database connection that will be used for LDP data storage"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
          <div class="setting-card__content p-4">
            <ElRadioGroup v-model="form.fdmStorageCluster" @change="handleChangeFDMStorage" :disabled="disabled">
              <ElRadio v-for="item in options" :label="item.value" :key="'FDM' + item.value" class="block mb-4">
                <span>{{ item.label }}</span>
                <!--<ElTag class="ml-6 rounded-pill" effect="plain">{{ item.tag }}</ElTag>-->
                <ElFormItem v-if="form.fdmStorageCluster === item.value" prop="fdmStorageConnectionId">
                  <ElSelect v-model="form.fdmStorageConnectionId" class="block mt-4" :disabled="disabled">
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
              <!--<span class="font-color-sslight"
                >If you wish to change this setting later, you must migrate the data to your new database - manually for
                now</span
              >-->
              <span class="font-color-sslight"
                >Don't have the connection you want? You can add a connection in Connection Management.
              </span>
            </div>
            <div class="flex align-items-center">
              <VIcon class="color-primary mr-2" size="14">info</VIcon>
              <span class="font-color-sslight">The Settings cannot be modified after being saved.</span>
            </div>
          </div>
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

      <div class="text-end mt-13">
        <ElButton v-loading="loading" type="primary" :disabled="disabled" @click="submit">SAVE&ENABLE</ElButton>
        <ElButton class="ml-4" @click="cancel">CANCEL</ElButton>
      </div>
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
        return 'Live Data Platform Settings'
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
          label: 'MongoDB Atlas Cluster',
          value: 'atlas',
          tag: 'Sync Atlas Cluster List'
        },
        {
          label: 'Self Hosted MongoDB Cluster',
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
        this.setting.fdmStorageConnectionId === this.form.fdmStorageConnectionId &&
        this.mode === this.setting.mode
      )
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
            this.$message.success(this.$t('public_message_save_ok'))
            this.$emit('success', { mode, ...form })
            this.handleClose()
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
.mode-desc {
  width: 475px;
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
</style>
