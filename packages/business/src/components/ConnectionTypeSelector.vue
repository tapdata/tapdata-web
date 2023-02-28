<template>
  <div class="database">
    <ElTabs v-model:value="active">
      <ElTabPane v-for="item in tabs" :key="item.value" :name="item.value" :label="item.label"></ElTabPane>
    </ElTabs>
    <div v-if="active === 'GA'">
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in gaList"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
        >
          <div class="img-box rounded-3">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <!--<ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />-->
          </div>
          <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
            <div class="ellipsis text-center font-color-normal">
              {{ item.name }}
            </div>
          </ElTooltip>
        </li>
      </ul>
    </div>
    <div v-else-if="active === 'Beta'">
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in betaList"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
        >
          <div class="img-box rounded-3">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <!--<ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />-->
          </div>
          <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
            <div class="ellipsis text-center font-color-normal">
              {{ item.name }}
            </div>
          </ElTooltip>
        </li>
      </ul>
    </div>
    <div v-else-if="active === 'Alpha'">
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in alphaList"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
        >
          <div class="img-box rounded-3">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <!--<ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />-->
          </div>
          <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
            <div class="ellipsis text-center font-color-normal">
              {{ item.name }}
            </div>
          </ElTooltip>
        </li>
      </ul>
    </div>
    <div v-else>
      <div class="my-4 fs-8">
        <div>
          {{ $t('packages_business_components_connectiontypeselectorsort_zhuyizhelishi') }}
        </div>
        <div>
          {{ $t('packages_business_components_connectiontypeselectorsort_jiaoyouTap') }}
        </div>
      </div>
      <ul v-loading="loading" class="database-ul overflow-auto">
        <li
          v-for="item in customerList"
          :key="item.type"
          class="database-item float-start mb-4 cursor-pointer"
          @click="$emit('select', item)"
        >
          <div class="img-box rounded-3">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <!--<ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />-->
          </div>
          <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
            <div class="ellipsis text-center font-color-normal">
              {{ item.name }}
            </div>
          </ElTooltip>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { getConnectionIcon } from '../views/connections/util'
import { VIcon } from '@tap/component'

export default {
  name: 'ConnectionTypeSelector',
  components: { VIcon },
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
      active: 'GA',
      tabs: [
        {
          label: i18n.t('packages_business_components_connectiontypeselectorsort_renzhengshujuyuan'),
          value: 'GA'
        },
        {
          label: i18n.t('packages_business_components_connectiontypeselectorsort_betashu'),
          value: 'Beta'
        },
        {
          label: i18n.t('packages_business_components_connectiontypeselectorsort_jijiangshangxian'),
          value: 'Alpha'
        },
        {
          label: i18n.t('packages_business_components_connectiontypeselectorsort_wodeshujuyuan'),
          value: 'my'
        }
      ]
    }
  },
  computed: {
    alphaList() {
      return this.types.filter(t => t.scope === 'public' && t.qcType === 'Alpha')
    },
    betaList() {
      return this.types.filter(t => t.scope === 'public' && t.qcType === 'Beta')
    },
    gaList() {
      return this.types.filter(t => t.scope === 'public' && t.qcType === 'GA')
    },
    customerList() {
      return this.types.filter(t => t.scope === 'customer')
    }
  },
  methods: {
    getPdkIcon(item) {
      return getConnectionIcon(item.pdkHash)
    }
  },
  emits: ['select']
}
</script>

<style lang="scss" scoped>
.database {
  width: 804px;
  overflow: auto;
}
.database-item {
  width: 80px;
  flex: 1;
  margin-right: 40px;
  &:nth-child(7n) {
    margin-right: 0;
  }
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
