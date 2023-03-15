<template>
  <div class="database">
    <div class="inline-flex align-items-center mt-2 mb-4">
      <ElCheckbox v-model="settings.showBeta" class="m-0" @change="getData(false)"></ElCheckbox>
      <span class="ml-2">{{ $t('packages_business_create_connection_dialog_neirongSho2') }}</span>
      <ElCheckbox v-model="settings.showAlpha" class="ml-8 mr-0" @change="getData(false)"></ElCheckbox>
      <span class="ml-2">{{ $t('packages_business_create_connection_dialog_neirongSho') }}</span>
    </div>
    <ElTabs v-model="active" @tab-click="handleChangeTab">
      <ElTabPane v-for="item in comTabs" :key="item.value" :name="item.value" :label="item.label"></ElTabPane>
    </ElTabs>
    <div v-loading="loading">
      <ul v-if="database.length" class="overflow-auto inline-block">
        <li
          v-for="(item, index) in database"
          :key="index"
          class="float-start cursor-pointer text-center"
          :class="[
            { active: item.pdkId === selected.pdkId },
            activeTabData.display === 'card'
              ? 'api-item inline-flex flex-column align-items-center p-6 mr-13 mb-12'
              : 'database-item'
          ]"
          @click="handleSelect(item)"
        >
          <template v-if="activeTabData.display === 'card'">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)" class="flex-shrink-0">{{ item.pdkType }}</ElImage>
            <VIcon v-else size="32" class="color-primary">{{ item.icon }}</VIcon>
            <div class="mt-4 fw-bold font-color-normal">{{ item.name }}</div>
            <div class="mt-4 font-color-light flex-fill">{{ item.desc }}</div>
          </template>
          <template v-else>
            <div class="img-box inline-flex justify-content-center align-items-center rounded-circle">
              <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
              <ElImage v-else :src="getConnectionTypeDialogImg(item)" />
            </div>
            <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
              <div class="ellipsis text-center font-color-normal">{{ item.name }}</div>
            </ElTooltip>
          </template>
        </li>
      </ul>
      <EmptyItem v-else></EmptyItem>
    </div>
  </div>
</template>

<script>
import { getConnectionIcon } from '@tap/business/src/views/connections/util'
import { databaseTypesApi } from '@tap/api'
import { EmptyItem } from '@tap/component'
import { getConnectionTypeDialogImg } from '@tap/shared'

export default {
  name: 'ConnectionTypeSelector',
  components: { EmptyItem },
  props: {
    visible: {
      type: Boolean
    },
    selectorType: {
      type: String,
      default: 'source'
    }
  },
  data() {
    return {
      loading: false,
      database: [],
      apiList: [],
      active: '',
      selected: {},
      timer: null,
      settings: {
        showBeta: true,
        showAlpha: true
      }
    }
  },
  computed: {
    activeTabData() {
      return this.comTabs.find(t => this.active === t.value) || {}
    },

    comTabs() {
      if (['target'].includes(this.selectorType)) {
        return [
          {
            label: 'Recommended',
            value: 'Recommended',
            filter: (item = {}) => {
              return ['BigQuery', 'SelectDB', 'Tablestore', 'MongoDB', 'Doris', 'Clickhouse'].includes(item.type)
            }
          },
          {
            label: 'All Targets & Services',
            value: 'All'
          },
          {
            label: 'Cloud Platforms',
            value: 'CloudPlatforms',
            display: 'card',
            filter: (item = {}) => {
              return ['MongoDB', 'Tablestore', 'SelectDB', 'BigQuery'].includes(item.type)
            },
            map: (item = {}) => {
              const map = {
                MongoDB: {
                  desc: 'Fully managed MongoDB as a Service offered by MongoDB'
                },
                Tablestore: {
                  desc: 'Fully managed, reliable, and cost effective NoSQL database service'
                },
                SelectDB: {
                  desc: 'Cloud based analytical paltform powered by Apache Doris'
                },
                BigQuery: {
                  desc: 'Cloud data warehouse with petabytes scale & fast performance.'
                }
              }
              return map[item.type]
            }
          },
          {
            label: 'Databases Connectors',
            value: 'Database'
          },
          {
            label: 'Application Services',
            value: 'apiServices',
            display: 'card',
            items: [
              {
                icon: 'deploy',
                name: 'API Publish',
                desc: 'Public Data APIs for application use.'
              }
            ]
          },
          {
            label: 'My Custom Target',
            value: 'Custom'
          }
        ]
      }
      return [
        {
          label: 'All Connectors',
          value: 'All'
        },
        {
          label: 'Databases Connectors',
          value: 'Database'
        },
        {
          label: 'SaaS Connectors',
          value: 'SaaS'
        },
        {
          label: 'File Connectors',
          value: 'File'
        },
        {
          label: 'My Connectors',
          value: 'Custom'
        }
      ]
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.getData()
      } else {
        this.database = []
      }
    }
  },
  created() {
    this.active = this.comTabs[0].value
    this.getData()
  },
  methods: {
    getConnectionTypeDialogImg,

    async getData(noLoading = false) {
      let authentication = ''
      let tag = this.active
      const { showAlpha, showBeta } = this.settings
      if (showAlpha && showBeta) {
        authentication = 'All'
      } else if (showAlpha && !showBeta) {
        authentication = 'Alpha'
      } else if (!showAlpha && showBeta) {
        authentication = 'Beta'
      }

      if (this.activeTabData.filter) {
        tag = 'All'
      }

      const params = {
        where: {
          tag,
          authentication
        }
      }
      if (!noLoading) this.loading = true
      const res = await databaseTypesApi.getDatabases({ filter: JSON.stringify(params) })
      const data = res?.filter(t => t.connectionType.includes(this.selectorType) && !!t.pdkHash) || []
      if (this.activeTabData.items) {
        this.database = this.activeTabData.items
      } else if (this.activeTabData.filter) {
        this.database = data
          ?.filter(t => this.activeTabData.filter(t))
          .map(t => {
            return Object.assign(t, this.activeTabData.map?.(t))
          })
      } else {
        this.database = data
      }
      this.loading = false
    },

    getPdkIcon(item) {
      return getConnectionIcon(item.pdkHash)
    },

    handleSelect(item) {
      this.selected = Object.assign(item, {
        activeTab: this.active
      })
      this.$emit('select', this.selected)
    },

    handleChangeTab() {
      this.getData(false)
    }
  }
}
</script>

<style lang="scss" scoped>
.database {
  overflow: auto;
  word-break: break-word;
}
.database-item {
  width: 80px;
  flex: 1;
  margin-right: 53px;
  margin-bottom: 48px;
  &.active,
  &:hover {
    .img-box {
      background: rgba(201, 205, 212, 0.3);
    }
  }
  &.disable {
    .img-box {
      background-color: rgba(242, 242, 242, 0.2);
    }
  }
}
.img-box {
  width: 65px;
  height: 65px;
  border: 1px solid rgba(221, 221, 221, 0.4);
}
.el-image {
  width: 42px;
  text-align: center;
}
.my-database__desc {
  background: #f2f2f2;
}
::v-deep {
  .el-tabs__nav-wrap.is-top {
    padding: 0;
  }
  .el-tabs__nav-scroll {
    display: flex;
    justify-content: center;
  }
}
.api-item {
  width: 180px;
  height: 200px;
  background: rgba(239, 241, 244, 0.2);
  border: 1px solid rgba(221, 221, 221, 0.4);
  .el-image {
    width: 32px;
    height: 32px;
  }
}
</style>
