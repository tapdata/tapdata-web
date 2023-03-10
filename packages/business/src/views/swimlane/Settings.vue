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
      <ElRadioGroup v-model="mode" class="block">
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
      <div v-if="mode === 'service'" class="setting-card mt-6">
        <div class="setting-card__header p-4">
          <span>FDM Storage Backend</span>
          <ElTooltip
            class="ml-2"
            placement="top"
            content="Specify the database connection that will be used for LDP data storage"
          >
            <VIcon class="color-primary" size="14">info</VIcon>
          </ElTooltip>
        </div>
        <div class="setting-card__content p-4">
          <ElRadioGroup v-model="FDMStorage.type" @change="handleChangeFDMStorage">
            <ElRadio v-for="item in FDMRadioItems" :label="item.value" :key="'FDM' + item.value" class="block mb-4">
              <span>{{ item.label }}</span>
              <ElTag class="ml-6 rounded-pill" effect="plain">{{ item.tag }}</ElTag>
              <ElSelect v-if="FDMStorage.type === item.value" v-model="FDMStorage.value" class="block mt-4">
                <ElOption v-for="op in item.options" :label="op.label" :value="op.value" :key="op.value"></ElOption>
              </ElSelect>
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
      </div>
      <div v-if="mode === 'service'" class="setting-card mt-6">
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
          <ElRadioGroup v-model="MDMStorage.type" @change="handleChangeMDMStorage">
            <ElRadio v-for="item in MDMRadioItems" :label="item.value" :key="'MDM' + item.value" class="block mb-4">
              <span>{{ item.label }}</span>
              <ElTag class="ml-6 rounded-pill" effect="plain">{{ item.tag }}</ElTag>
              <ElSelect v-if="MDMStorage.type === item.value" v-model="MDMStorage.value" class="block mt-4">
                <ElOption v-for="op in item.options" :label="op.label" :value="op.value" :key="op.value"></ElOption>
              </ElSelect>
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
      </div>

      <div class="text-end mt-13">
        <ElButton v-loading="loading" type="primary" @click="submit">SAVE&ENABLE</ElButton>
        <ElButton class="ml-4" @click="cancel">CANCEL</ElButton>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import { liveDataPlatformApi } from '@tap/api'

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
      FDMRadioItems: [
        {
          label: 'MongoDB Atlas Cluster',
          value: 'MongoDB Atlas Cluster',
          tag: 'Sync Atlas Cluster List',
          options: [
            {
              label: 'Select Atlas Cluster',
              value: 'Select Atlas Cluster'
            },
            {
              label: 'Cluster in Singapore AZ',
              value: 'Cluster in Singapore AZ'
            },
            {
              label: 'Sharded Cluster in HK',
              value: 'Sharded Cluster in HK'
            }
          ]
        },
        {
          label: 'Self Hosted MongoDB Cluster',
          value: 'Self Hosted MongoDB Cluster',
          tag: 'Add a New Connection',
          options: [
            {
              label: 'Select A Configured Connection',
              value: 'Select A Configured Connection'
            },
            {
              label: 'MongoDB Cluster A',
              value: 'MongoDB Cluster A'
            },
            {
              label: 'MongoDB Cluster B',
              value: 'MongoDB Cluster B'
            }
          ]
        }
      ],
      FDMStorage: {
        type: '',
        value: ''
      },
      MDMRadioItems: [
        {
          label: 'MongoDB Atlas Cluster',
          value: 'MongoDB Atlas Cluster',
          tag: 'Sync Atlas Cluster List',
          options: [
            {
              label: 'Select Atlas Cluster',
              value: 'Select Atlas Cluster'
            },
            {
              label: 'Cluster in Singapore AZ',
              value: 'Cluster in Singapore AZ'
            },
            {
              label: 'Sharded Cluster in HK',
              value: 'Sharded Cluster in HK'
            }
          ]
        },
        {
          label: 'Self Hosted MongoDB Cluster',
          value: 'Self Hosted MongoDB Cluster',
          tag: 'Add a New Connection',
          options: [
            {
              label: 'Select A Configured Connection',
              value: 'Select A Configured Connection'
            },
            {
              label: 'MongoDB Cluster A',
              value: 'MongoDB Cluster A'
            },
            {
              label: 'MongoDB Cluster B',
              value: 'MongoDB Cluster B'
            }
          ]
        }
      ],
      MDMStorage: {
        type: '',
        value: ''
      },
      loading: false
    }
  },

  created() {
    this.init()
  },

  methods: {
    async init() {
      const data = await this.getData()
      console.log('init', data)
      if (data) {
        return this.setData(data)
      }
      this.mode = this.modeItems[0]?.value

      this.FDMStorage.type = this.FDMRadioItems[0]?.value
      this.handleChangeFDMStorage(this.FDMStorage.type)

      this.MDMStorage.type = this.MDMRadioItems[0]?.value
      this.handleChangeMDMStorage(this.MDMStorage.type)
    },

    async getData() {
      return liveDataPlatformApi.get().catch(() => {
        return null
      })
    },

    setData(data = {}) {
      this.mode = data.mode
      // TODO set FDMStorage and MDMStorage
      this.FDMStorage.type = ''
      this.FDMStorage.value = ''

      this.MDMStorage.type = ''
      this.MDMStorage.value = ''

      this.$emit('update:mode', this.mode)
    },

    handleOpen() {
      this.init()
    },

    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },

    handleSelectMode(type) {
      this.mode = type
    },

    handleChangeFDMStorage(val) {
      this.FDMStorage.value = this.FDMRadioItems.find(t => t.value === val)?.options[0]?.value
    },

    handleChangeMDMStorage(val) {
      this.MDMStorage.value = this.MDMRadioItems.find(t => t.value === val)?.options[0]?.value
    },

    submit() {
      this.loading = true
      liveDataPlatformApi
        .patch()
        .then()
        .finally(() => {
          this.loading = false
        })
      const { mode, FDMStorage, MDMStorage } = this
      this.$emit('success', { mode, FDMStorage, MDMStorage })
      this.handleClose()
      this.loading = false
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
