<template>
  <Drawer
    v-loading="loading"
    class="shared-cache-details"
    :visible.sync="drawerVisible"
    width="800px"
    v-bind="$attrs"
    @visible="handleVisible"
  >
    <div class="mb-4">{{ details.value }}</div>
    <ElInput :value="details.desc" type="textarea" disabled class="mb-6"></ElInput>

    <VTable height="100%" ref="table" :has-pagination="false" :columns="columns" :remoteMethod="remoteMethod">
      <template #status="{ row }">
        <span class="status-block" :class="'status-' + row.status">{{ row.statusFmt }}</span>
      </template>
      <template #operation="{ row }">
        <ElButton type="text">发布</ElButton>
        <ElButton type="text">导出</ElButton>
        <ElButton type="text">删除</ElButton>
      </template>
    </VTable>
  </Drawer>
</template>

<script>
import i18n from '@tap/i18n'
import { sharedCacheApi, appApi, modulesApi } from '@tap/api'
import { Drawer, VTable } from '@tap/component'
import { TaskStatus } from '@tap/business'

export default {
  name: 'Details',

  components: { Drawer, VTable, TaskStatus },

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
        value: '',
        desc: ''
      },
      info: [],
      columns: [
        {
          label: 'API名称',
          prop: 'name'
        },
        {
          label: '服务状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '操作',
          prop: 'operation',
          slotName: 'operation',
          width: 160
        }
      ]
    }
  },

  watch: {
    visible(v) {
      this.drawerVisible = v
    }
  },

  methods: {
    getData(id, data) {
      this.taskId = id
      this.details = data
      this.$nextTick(() => {
        this.$refs.table?.fetch()
      })
    },

    handleVisible(val) {
      this.$emit('update:visible', val)
    },

    remoteMethod({ page }) {
      console.log('remoteMethod', this.taskId)
      let { current, size } = page
      let where = {}
      let filter = {
        limit: size,
        skip: (current - 1) * size,
        where
      }
      const statusOptions = [
        {
          label: i18n.t('public_select_option_all'),
          value: ''
        },
        {
          label: i18n.t('public_status_published'),
          value: 'active'
        },
        {
          label: i18n.t('public_status_unpublished'),
          value: 'pending'
        },
        {
          label: i18n.t('public_status_to_be_generated'),
          value: 'generating'
        }
      ]
      return modulesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: 0,
            data: data?.items.map(t => {
              t.statusFmt = statusOptions.find(it => it.value === t.status)?.label || '-'
              return t
            }) || []
          }
        })
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
