<template>
  <div class="database">
    <div class="inline-flex align-items-center mt-2 mb-4">
      <ElCheckbox v-model="settings.showBeta" class="m-0" @change="getData(false)"></ElCheckbox>
      <span class="ml-2">{{ $t('packages_business_create_connection_dialog_neirongSho2') }}</span>
      <ElCheckbox v-model="settings.showAlpha" class="ml-8 mr-0" @change="getData(false)"></ElCheckbox>
      <span class="ml-2">{{ $t('packages_business_create_connection_dialog_neirongSho') }}</span>
    </div>
    <ElTabs v-model="active" @tab-click="handleChangeTab">
      <ElTabPane v-for="item in tabs" :key="item.value" :name="item.value" :label="item.label"></ElTabPane>
    </ElTabs>
    <div v-loading="loading">
      <ul v-if="database.length" class="overflow-auto">
        <li
          v-for="(item, index) in database"
          :key="index"
          class="database-item float-start cursor-pointer text-center"
          :class="{ active: item.pdkId === selected.pdkId }"
          @click="handleSelect(item)"
        >
          <div class="img-box inline-flex justify-content-center align-items-center rounded-circle">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />
          </div>
          <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
            <div class="ellipsis text-center font-color-normal">{{ item.name }}</div>
          </ElTooltip>
        </li>
      </ul>
      <ul v-else-if="apiList.length" class="overflow-auto">
        <li
          v-for="(item, index) in apiList"
          :key="index"
          class="api-item float-start cursor-pointer inline-flex flex-column align-items-center p-6 mb-6"
          @click="handleSelect(item)"
        >
          <VIcon size="32" class="color-primary">deploy</VIcon>
          <div class="mt-4 fw-bold font-color-normal">{{ item.title }}</div>
          <div class="mt-4 font-color-light flex-fill">{{ item.desc }}</div>
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

export default {
  name: 'ConnectionTypeSelector',
  components: { EmptyItem },
  props: {
    params: {
      type: Object,
      default: () => {
        return {}
      }
    },
    visible: {
      type: Boolean
    }
  },
  data() {
    return {
      loading: false,
      database: [],
      apiList: [],
      active: '',
      selected: {},
      tabs: [
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
        },
        {
          label: 'Application Services',
          value: 'apiServices'
        }
      ],
      timer: null,
      settings: {
        showBeta: true,
        showAlpha: true
      }
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
    this.active = this.tabs[0].value
    this.getData()
  },
  methods: {
    getData(noLoading = false) {
      let authentication = ''
      const { showAlpha, showBeta } = this.settings
      if (showAlpha && showBeta) {
        authentication = 'All'
      } else if (showAlpha && !showBeta) {
        authentication = 'Alpha'
      } else if (!showAlpha && showBeta) {
        authentication = 'Beta'
      }
      const params = {
        where: {
          tag: this.active,
          authentication
        }
      }
      if (!noLoading) this.loading = true
      databaseTypesApi
        .getDatabases({ filter: JSON.stringify(params) })
        .then(data => {
          this.database = data?.filter(t => t.connectionType.includes(this.params?.type) && !!t.pdkHash) || []
        })
        .finally(() => {
          this.loading = false
          // if (this.visible) {
          //   clearTimeout(this.timer)
          //   this.timer = setTimeout(() => {
          //     this.getData(true)
          //   }, 3000)
          // }
        })
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

    handleChangeTab(val) {
      this.apiList = []
      this.database = []
      switch (val?.name) {
        case 'apiServices':
          this.apiList = [
            {
              title: 'API Publish',
              desc: 'Public Data APIs for application use.'
            }
          ]
          break
        default:
          this.getData(false)
          break
      }
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
  height: 180px;
  background: rgba(239, 241, 244, 0.2);
  border: 1px solid rgba(221, 221, 221, 0.4);
}
</style>
