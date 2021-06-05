<template>
  <div class="echartHead">
    <h2>{{ textObj.title }}</h2>
    <!-- <el-popover
			v-if="isIput"
			placement="top-start"
			width="300"
			popper-class="echartsTitle_popover"
			trigger="hover"
			:content="tip"
		>
			<span class="icon iconfont icon-tishi1" slot="reference"></span>
		</el-popover>
		<i class="el-icon-loading" v-if="data && data.loading"></i> -->
    <div class="rightOpt fr" v-if="textObj.overviewFalg">
      <el-radio-group
        v-model="num"
        size="mini"
        :class="selectColor"
        @change="changeUnit"
      >
        <el-radio-button label="flow">{{
          $t('dataFlow.rowCount')
        }}</el-radio-button>
        <el-radio-button label="stage">KB</el-radio-button>
      </el-radio-group>
    </div>
    <div class="unit fr" v-if="textObj.allFalg">
      <el-button type="text" @click="handleAll(data)">{{
        $t('app.Home.all')
      }}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'echartHead',
  props: {
    data: Object
  },
  data() {
    return {
      textObj: {
        title: '',
        overviewFalg: false,
        allFalg: false
      },
      num: 'flow',
      selectColor: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.data) {
        this.textObj = this.data

        this.$emit('getUnit', this.num)
        if (this.data.type === 'screening') {
          this.selectColor = 'screeningColor'
        }
      }
    })
  },
  methods: {
    changeUnit(val) {
      this.$emit('getUnit', val)
    },
    handleAll(data) {
      this.$emit('getAllData', data)
    }
  }
}
</script>
<style lang="scss" scoped>
.echartHead {
  height: 38px;
  line-height: 38px;
  padding: 0 10px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #fafafa;

  h2 {
    display: inline-block;
    font-size: 12px;
    color: #333;
  }

  span {
    padding: 0 5px;
    color: #999;
    cursor: pointer;
  }

  span:hover {
    color: #409eff;
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
  .unit {
    display: inline-block;
    font-size: 12px;
    span {
      padding: 3px 6px;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
  }
}
</style>
<style lang="scss">
.echartHead {
  .el-radio-button--mini .el-radio-button__inner {
    padding: 4px 6px;
  }

  .el-radio-group {
    padding-left: 10px;
  }

  .screeningColor,
  .putColor {
    .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      background-color: #409eff;
      border-color: #409eff;
      box-shadow: -1px 0 0 0 #409eff;
    }
  }
  .unit {
    .el-button span {
      font-size: 12px;
    }
  }

  // .transfColor {
  // 	.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  // 		background-color: #fb8e00;
  // 		border-color: #fb8e00;
  // 		box-shadow: -1px 0 0 0 #fb8e00;
  // 	}
  // }

  // .replicateColor {
  // 	.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  // 		background-color: #f56c6c;
  // 		border-color: #f56c6c;
  // 		box-shadow: -1px 0 0 0 #f56c6c;
  // 	}
  // }
}
</style>
