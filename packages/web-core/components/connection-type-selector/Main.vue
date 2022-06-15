<template>
  <div class="database">
    <el-radio-group v-if="!hideType && otherTypes.length" class="pb-5" v-model="type" @change="changeType">
      <el-radio-button label="sourcedata">{{ $t('connection_form_data_source') }}</el-radio-button>
      <el-radio-button label="other">Other Type</el-radio-button>
    </el-radio-group>
    <template v-if="type === 'sourcedata'">
      <ul class="database-ul" :class="[large ? 'customNthChild' : 'primaryNthChild']">
        <li v-for="item in types" :key="item.type" @click="$emit('select', item)">
          <div class="img-box">
            <ElImage v-if="item.pdkType" :src="getPdkIcon(item)">{{ item.pdkType }}</ElImage>
            <ElImage v-else :src="$util.getConnectionTypeDialogImg(item)" />
          </div>
          <ElTooltip class="item" effect="dark" :content="item.name" placement="bottom">
            <div class="content">{{ item.name }}</div>
          </ElTooltip>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import Cookie from '@tap/shared/src/cookie'

export default {
  name: 'ConnectionTypeSelector',
  props: {
    types: {
      value: Array,
      default: () => {
        return []
      }
    },
    comingTypes: {
      value: Array,
      default: () => {
        return []
      }
    },
    otherTypes: {
      value: Array,
      default: () => {
        return []
      }
    },
    automationType: {
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
    hideType: {
      type: Boolean
    }
  },
  data() {
    return {
      type: 'sourcedata'
    }
  },
  methods: {
    changeType(type) {
      this.type = type
    },
    getPdkIcon(item) {
      const token = Cookie.get('token')
      return `/api/pdk/icon?access_token=${token}&pdkHash=${item.pdkHash}`
    }
  }
}
</script>

<style scoped lang="scss">
.database {
  overflow: auto;
  .title {
    color: #999;
    margin-bottom: 32px;
    display: inline-block;
  }
  .database-ul {
    display: flex;
    flex-wrap: wrap;
    li {
      margin-left: 32px;
      margin-bottom: 32px;
      text-align: center;
    }
    .img-box {
      width: 78px;
      height: 78px;
      border: 1px solid #dedee4;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      .img-box__mask {
        width: 65px;
        height: 20px;
        top: 5px;
        right: -20px;
        border-radius: 12px;
        align-items: center;
        background: #ff9c00;
        .mask-text {
          font-size: 11px;
          color: #fff;
          font-family: PingFangSC-Regular, PingFang SC;
        }
      }
    }
    .content {
      margin-top: 5px;
      max-width: 82px;
      font-weight: 500;
      font-size: 12px;
      color: map-get($fontColor, dark);
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
      cursor: default;
      overflow: hidden;
    }
    .coming-icon {
      width: 46px;
      height: 16px;
      background: #ff9c00;
      border-radius: 7px;
    }
  }
  .customNthChild {
    max-height: 500px;
    li:nth-child(9n + 1) {
      margin-left: 0;
    }
  }
  .primaryNthChild {
    li:nth-child(6n + 1) {
      margin-left: 0;
    }
  }
}
</style>
<style lang="scss">
.database {
  .database-ul {
    .el-image__inner {
      // width: 60px
      width: 30px;
    }
  }
}
</style>
