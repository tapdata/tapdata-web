<template>
  <span v-if="onlyImg" class="td-status-tag inline-flex align-items-center">
    <img :src="imgSrc" :data-status="statusObj.text" alt="" />
  </span>
  <span v-else class="td-status-tag">
    <ElTag v-if="type === 'tag'" :type="statusObj.type">{{ statusObj.text }}</ElTag>
    <span :class="['flex', 'align-items-center', 'icon-span', status]" v-else>
      <VIcon v-if="statusObj.icon" :class="['v-icon', `color-${statusObj.type}`]" size="16">{{ statusObj.icon }}</VIcon>
      <span
        v-else
        :class="['circle-icon', 'mr-2', `bg-color-${statusObj.type}`]"
        :style="{ 'background-color': statusObj.color }"
      ></span>
      <span class="td-status-tag__text font-color-light">{{ statusObj.text }}</span>
    </span>
  </span>
</template>

<script>
import VIcon from '@/components/VIcon'
import {
  CONNECTION_STATUS_MAP,
  TASK_STATUS_MAP,
  MILESTONE_STATUS_MAP,
  ETL_STATUS_MAP,
  ETL_SUB_STATUS_MAP,
  MIGRATE_STATUS_MAP,
  SHARECDC_MAP
} from '../const'
export default {
  name: 'StatusTag',
  components: { VIcon },
  props: {
    type: {
      type: String,
      default: 'tag'
    },
    status: {
      type: String
    },
    target: {
      type: String,
      default: 'instance'
    },
    onlyImg: {
      type: Boolean,
      default: false
    },
    statusMap: {
      type: Object,
      default: () => {
        return null
      }
    },
    defaultStatus: {
      type: String
    }
  },
  data() {
    return {
      lang: localStorage.getItem('tapdata_localize_lang') || 'sc'
    }
  },
  computed: {
    map() {
      return (
        this.statusMap ||
        {
          task: TASK_STATUS_MAP,
          shareCdc: SHARECDC_MAP,
          connection: CONNECTION_STATUS_MAP,
          milestone: MILESTONE_STATUS_MAP,
          etl: ETL_STATUS_MAP,
          etlSub: ETL_SUB_STATUS_MAP,
          migrate: MIGRATE_STATUS_MAP
        }[this.target]
      )
    },
    statusObj() {
      return this.map[this.status] || this.map[this.defaultStatus] || {}
    },
    imgSrc() {
      return require(`@/assets/icons/colorSvg/${this.statusObj.icon}.png`)
    }
  }
}
</script>

<style lang="scss">
.td-status-tag {
  display: inline-block;
  vertical-align: middle;
  img {
    height: 25px;
  }
  .icon-span {
    .v-icon {
      margin: 0 4px;
    }
    .circle-icon {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
  }
}
.td-status-tag__icon {
  font-size: 14px;
  display: inline-block;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
}
.td-status-tag__text {
  display: inline-block;
  height: 26px;
  line-height: 26px;
}
</style>
