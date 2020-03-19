<template>
  <div class="echartHead">
    <h2>{{title}}</h2>
    <el-popover
      placement="top-start"
      width="300"
      popper-class ="echartsTitle_popover"
      trigger="hover"
      :content="tip">
      <span class="icon iconfont icontishi1" slot="reference"></span>
    </el-popover>
    <!-- <div class="arrow fr">
      <span class="el-icon-caret-top"></span>
      <span class="el-icon-caret-bottom"></span>
    </div> -->
    <div class="rightOpt fr">
      <el-radio-group v-model="radio1" size="mini" @change="changeRadio">
        <el-radio-button label="1">{{rowCount.lable}}</el-radio-button>
        <el-radio-button label="2">{{kbs.lable}}</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="time" size="mini" @change="changeTime" v-if="!data.isScreeing">
        <el-radio-button label="ss">秒</el-radio-button>
        <el-radio-button label="mm">分</el-radio-button>
        <el-radio-button label="hh">时</el-radio-button>
        <el-radio-button label="dd">日</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>
<script>
export default {
  name: "echartHead",
  props: {
    data: Object
  },
  data() {
    return {
      title: '',
      tip: '',
      radio1: '1',
      time: 'ss',
      rowCount: null,
      kbs: null,
      isScreeing: false
    };
  },
  watch: {

  },
  mounted() {
    this.$nextTick(()=>{
      this.title = this.data.title;
      this.tip = this.data.tip;
      this.radio1 = "1";
      this.rowCount = this.data.rowCount;
      this.kbs = this.data.kbs;
      this.isScreeing = this.data.isScreeing;
      this.$emit("twoRadio",this.radio1);
      this.$emit("getTime",this.time);
    })
  },
  methods: {
    changeRadio(val) {
      this.$emit("twoRadio",val);
    },
    changeTime(val) {
      this.$emit("getTime",val);
    }
  }
};
</script>
<style lang="less" scoped>
.echartHead {
  height: 38px;
  line-height: 38px;
  padding: 0 10px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #fafafa;
  h2 {
    display: inline-block;
    font-size: 14px;
    color: #333;
  }
  span {
    padding: 0 5px;
    color: #999;
    cursor: pointer;
  }
  span:hover {
    color: #48b6e2;
  }
  .arrow {
    display: inline-block;
    position: relative;
    width: 20px;
    height: 38px;
    overflow: hidden;
    .el-icon-caret-top {
      position: absolute;
      top: 8px;
    }
    .el-icon-caret-bottom {
      position: absolute;
      top: 16px;
    }
  }
}
</style>
<style lang="less">
.echartHead {
  .el-radio-group {
    padding-left: 20px;
  }
}

</style>
