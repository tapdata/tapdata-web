<template>
  <div class="database">
    <ul class="database-ul">
      <li v-for="item in types" :key="item" @click="$emit('select', item)">
        <div class="img-box">
          <ElImage :src="$util.getConnectionTypeDialogImg(item)" />
        </div>
        <div class="content">{{ typeMap[item] }}</div>
      </li>
      <li v-for="item in comingTypes" :key="item" class="item--disabled">
        <div class="img-box position-relative">
          <ElImage :src="$util.getConnectionTypeDialogImg(item)" />
          <div class="img-box__mask position-absolute">
            <span class="mask-text">即将上线</span>
          </div>
        </div>
        <div class="content">{{ typeMap[item] }}</div>
      </li>
    </ul>
    <span class="title" v-if="otherTypes && otherTypes.length > 0">Other Type</span>
    <ul class="database-ul">
      <li v-for="(item, index) in otherTypes" :key="index" @click="$emit('select', item)">
        <div class="img-box">
          <ElImage :src="$util.getConnectionTypeDialogImg(item)" />
        </div>
        <div class="content">{{ typeMap[item] }}</div>
      </li>
    </ul>
    <span class="title" v-if="automationType && automationType.length > 0">Automation Type</span>
    <ul class="database-ul">
      <li v-for="(item, index) in automationType" :key="index" @click="$emit('select', item.type)">
        <div class="img-box">
          <ElImage :src="$util.getConnectionTypeDialogImg('default1')" />
        </div>
        <div class="content">{{ item.name }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
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
    }
  },
  data() {
    return {
      typeMap: this.$const.TYPEMAP
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
    li:nth-child(9n + 1) {
      margin-left: 0;
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
      font-weight: 400;
      font-size: 14px;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
      overflow: hidden;
    }
    .coming-icon {
      width: 46px;
      height: 16px;
      background: #ff9c00;
      border-radius: 7px;
    }
  }
}
</style>
<style lang="scss">
.database {
  .database-ul {
    .el-image__inner {
      width: 30px;
    }
  }
}
</style>
