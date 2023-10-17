<template>
  <Drawer
    v-bind="$attrs"
    v-loading="loading"
    class="shared-cache-details"
    v-model:visible="visible"
    @visible="handleVisible"
  >
    <div v-if="details.id" class="shared-cache-details--header flex pb-3 flex-column">
      <header class="border-bottom py-2">
        <span class="font-color-dark inline-block fw-bold fs-6">{{
          $t('dfs_ticketing_system_details_gongdanxiangqing')
        }}</span>
      </header>
      <ul class="detail-ul flex flex-column flex-1">
        <li>
          <span class="label font-color-sslight inline-block">{{ $t('dfs_ticketing_system_details_zhuti') }}</span>
          <span class="font-color-dark fw-normal"> {{ details.subject }}</span>
        </li>
        <li>
          <span class="label font-color-sslight inline-block">{{ $t('dfs_ticketing_system_details_shujuyuan') }}</span>
          <span class="font-color-dark fw-normal"> {{ details.connectionName }}</span>
        </li>
        <li>
          <span class="label font-color-sslight inline-block">{{ $t('dfs_ticketing_system_details_renwu') }}</span>
          <span class="font-color-dark fw-normal"> {{ details.jobName }}</span>
        </li>
        <li>
          <span class="label font-color-sslight inline-block">{{
            $t('dfs_ticketing_system_details_gongdanbianhao')
          }}</span>
          <span class="font-color-dark fw-normal"> {{ details.ticketNumber }}</span>
        </li>
        <li>
          <span class="label font-color-sslight inline-block">{{
            $t('dfs_ticketing_system_details_gongdanzhuangtai')
          }}</span>
          <span class="font-color-dark fw-normal">
            <StatusTag type="tag" :status="details.status" default-status="Stopped" target="ticket"></StatusTag
          ></span>
        </li>
        <li>
          <span class="label font-color-sslight inline-block">{{
            $t('dfs_ticketing_system_details_tijiaoshijian')
          }}</span>
          <span class="font-color-dark fw-normal"> {{ details.createdTime }}</span>
        </li>
        <li class="border-top">
          <span class="label font-color-sslight inline-block mb-2">{{ $t('dfs_ticketing_system_details_wenti') }}</span>
          <div class="font-color-dark fw-normal lh-base">
            {{ details.description }}
          </div>
        </li>
        <li>
          <span class="label color-primary inline-block mb-2">
            {{ $t('dfs_ticketing_system_details_huifuneirong') }}
          </span>
          <span v-if="details.comment === 0">{{ $t('dfs_ticketing_system_details_zanwupinglun') }}</span>
          <el-timeline v-else>
            <el-timeline-item
              v-for="(item, index) in details.comments"
              :key="index"
              :color="index === 0 ? '#2c65ff' : ''"
              :type="index === 0 ? 'primary' : ''"
              :timestamp="formatter(item.commentedTime)"
            >
              <span class="font-color-dark fw-normal lh-base" v-html="item.content"> {{ item.content }}</span>
            </el-timeline-item>
          </el-timeline>
        </li>
      </ul>
    </div>
  </Drawer>
</template>

<script>
import { Drawer } from '@tap/component'
import dayjs from 'dayjs'
import StatusTag from '../../components/StatusTag'

export default {
  name: 'Details',

  components: { Drawer, StatusTag },

  data() {
    return {
      loading: false,
      visible: false,
      details: {
        id: '',
        name: '',
        cacheKeysArr: [],
        fields: []
      },
      info: []
    }
  },

  methods: {
    getData(id) {
      this.visible = true
      this.$axios.get(`api/ticket/${id}`).then(data => {
        this.details = data
        //格式化时间
        this.details.createdTime = this.details.createdTime
          ? dayjs(this.details.createdTime).format('YYYY-MM-DD HH:mm:ss')
          : '-'
      })
    },
    formatter(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    handleVisible() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.shared-cache-details {
  padding: 12px 16px 16px 16px;
}
.shared-cache-details--header {
  .icon {
    font-size: 18px;
  }
}
.detail-ul {
  li {
    padding: 10px 0;
  }
}
.label {
  width: 80px;
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
