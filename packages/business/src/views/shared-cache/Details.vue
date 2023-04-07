<template>
  <Drawer
    v-loading="loading"
    class="shared-cache-details"
    :visible.sync="drawerVisible"
    v-bind="$attrs"
    @visible="handleVisible"
  >
    <div v-if="details.id" class="shared-cache-details--header flex pb-3">
      <div class="img-box">
        <VIcon class="icon">text</VIcon>
      </div>
      <div class="flex-fill ml-4 overflow-hidden">
        <div class="fs-6 ellipsis">{{ details.name }}</div>
        <TaskStatus class="mt-2" :task="details" />
      </div>
    </div>
    <ul class="mt-2">
      <li v-for="item in info" :key="item.label" class="drawer-info__item">
        <VIcon class="fs-7 mt-2">{{ item.icon }}</VIcon>
        <div class="body ml-4">
          <label class="label">{{ item.label }}</label>
          <p class="value mt-2">{{ item.value }}</p>
        </div>
      </li>
    </ul>
    <div class="shared-cache--keys">
      <div class="title">{{ $t('packages_business_shared_cache_keys') }}</div>
      <div class="content">
        <div v-for="key in details.cacheKeysArr" :key="key">{{ key }}</div>
      </div>
    </div>
    <div class="shared-cache--keys">
      <div class="title">{{ $t('packages_business_shared_cache_fields') }}</div>
      <div class="content">
        <div v-for="key in details.fields" :key="key" class="mt-2">{{ key }}</div>
      </div>
    </div>
    <div class="mt-4">{{ $t('packages_business_shared_cache_code') }}</div>
    <CodeView class="mt-2" :data="details"></CodeView>
  </Drawer>
</template>

<script>
import { sharedCacheApi } from '@tap/api'
import { Drawer } from '@tap/component'
import { TaskStatus } from '@tap/business'

import CodeView from './CodeView'

export default {
  name: 'Details',

  components: { Drawer, CodeView, TaskStatus },

  props: {
    visible: {
      required: true,
      value: Boolean
    }
  },

  data() {
    return {
      loading: false,
      drawerVisible: false,
      details: {
        id: '',
        name: '',
        cacheKeysArr: [],
        fields: []
      },
      info: []
    }
  },

  watch: {
    visible(v) {
      this.drawerVisible = v
    }
  },

  methods: {
    getData(id) {
      this.loading = true
      sharedCacheApi
        .findOne(id)
        .then(data => {
          data.cacheKeysArr = data.cacheKeys?.split(',') || []
          this.getInfo(data)
          this.details = data
        })
        .finally(() => {
          this.loading = false
        })
    },

    getInfo(row = {}) {
      this.info = [
        { label: this.$t('public_creator'), value: row.createUser, icon: 'createUser' },
        { label: this.$t('packages_business_shared_cache_time'), value: row.cacheTimeAtFmt, icon: 'cacheTimeAtFmt' },
        {
          label: this.$t('packages_business_shared_cache_column_connection'),
          value: row.connectionName,
          icon: 'connectionName'
        },
        { label: this.$t('packages_business_shared_cache_column_table'), value: row.tableName, icon: 'table' },
        { label: this.$t('public_external_memory_name'), value: row.externalStorageName, icon: 'table' },
        { label: this.$t('packages_business_shared_cache_max_memory'), value: row.maxMemory, icon: 'record' }
      ]
    },

    handleVisible(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: $fontBaseTitle;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: $fontBaseTitle;
      color: map-get($fontColor, dark);
    }
  }
}
.shared-cache--keys {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #edeeee;
  .title {
    padding: 0 16px;
    height: 38px;
    line-height: 38px;
    background: map-get($bgColor, normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: map-get($bgColor, white);
  }
}
</style>
