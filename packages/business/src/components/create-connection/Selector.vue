<template>
  <div class="database">
    <ElTabs v-model="active">
      <ElTabPane v-for="item in tabs" :key="item.value" :name="item.value" :label="item.label"></ElTabPane>
    </ElTabs>
    <ul v-loading="loading" class="database-ul overflow-auto">
      <li
        v-for="(item, index) in filterList"
        :key="index"
        class="database-item float-start mb-4 cursor-pointer"
        :class="{ active: item.pdkId === selected.pdkId }"
        @click="handleSelect(item)"
      >
        <div class="img-box rounded-3">
          <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
          <ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />
        </div>
        <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
          <div class="ellipsis text-center font-color-normal">{{ item.name }}</div>
        </ElTooltip>
      </li>
    </ul>
  </div>
</template>

<script>
import { getConnectionIcon } from '@tap/business/src/views/connections/util'
import { cloneDeep } from 'lodash'

export default {
  name: 'ConnectionTypeSelector',
  props: {
    types: {
      value: Array,
      default: () => {
        return []
      }
    },
    large: {
      value: Boolean,
      default: () => {
        return false
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      active: '',
      selected: {},
      tabs: [
        {
          label: 'All Connectors',
          value: 'All_Connectors'
        },
        {
          label: 'Databases Connectors',
          value: 'Databases_Connectors'
        },
        {
          label: 'SaaS Connectors',
          value: 'SaaS_Connectors'
        },
        {
          label: 'File Connectors',
          value: 'File_Connectors'
        },
        {
          label: 'My Connectors',
          value: 'My_Connectors'
        }
      ]
    }
  },
  computed: {
    filterList() {
      const { active, types } = this
      let list = cloneDeep(types)
      switch (active) {
        case 'All_Connectors':
          break
        case 'SaaS_Connectors':
          list = types.filter(t => t.scope === 'public' && t.beta)
          break
        case 'Databases_Connectors':
          break
        case 'File_Connectors':
          list = types.filter(t => !['CSV', 'EXCEL', 'JSON', 'XML'].includes(t.database_type))
          break
        case 'My_Connectors':
          list = types.filter(t => t.scope === 'customer')
          break
        default:
          list = types
      }
      return list
    }
  },
  created() {
    this.active = this.tabs[0].value
  },
  methods: {
    getPdkIcon(item) {
      return getConnectionIcon(item.pdkHash)
    },

    handleSelect(item) {
      this.selected = item
      this.$emit('select', this.selected)
    }
  }
}
</script>

<style lang="scss" scoped>
.database {
  overflow: auto;
}
.database-item {
  width: 80px;
  flex: 1;
  margin-right: 40px;
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
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #f2f2f2;
}
.el-image {
  width: 50px;
  text-align: center;
}
.my-database__desc {
  background: #f2f2f2;
}
::v-deep {
  .el-tabs__nav-wrap.is-top {
    padding: 0;
  }
}
</style>
