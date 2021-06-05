<template>
  <div>
    <div
      style="
        position: absolute;
        width: 3276px;
        height: 1688px;
        left: -700px;
        top: -200px;
        z-index: 1999;
        opacity: 0.7;
        background-color: black;
      "
    >
      <div v-html="cellHtmls" style=""></div>
    </div>
    <div class="action-bar">
      <h1>{{ $t('dataFlow.simpleSceneTitle') }}</h1>
      <div class="center-bar" @click="skip">
        <el-checkbox-group v-model="vsteps">
          <el-checkbox label="1">
            <i class="stepNum">1</i>
            <span class="desc">{{
              $t('dataFlow.sourceSetting')
            }}</span></el-checkbox
          >
          <span class="space-line"></span>
          <el-checkbox label="2">
            <i class="stepNum">2</i>
            <span class="desc">{{
              $t('dataFlow.targetSetting')
            }}</span></el-checkbox
          >
          <span class="space-line"></span>
          <el-checkbox label="3">
            <i class="stepNum">3</i>
            <span class="desc">{{
              $t('dataFlow.sourceLibrarySetting')
            }}</span></el-checkbox
          >
          <span class="space-line"></span>
          <el-checkbox label="4">
            <i class="stepNum">4</i>
            <span class="desc">{{
              $t('dataFlow.advancedetting')
            }}</span></el-checkbox
          >
        </el-checkbox-group>
      </div>
    </div>
    <div class="exit">
      <el-button @click="toHome">{{ $t('message.cancel') }}</el-button>
      <el-button @click="goFree"> {{ $t('dataFlow.freedomMode') }}</el-button>
      <el-button @click="prevStep">
        {{ $t('dataFlow.previous') }}
      </el-button>
      <el-button :class="activeValid ? 'e-btnv' : 'e-btn'" @click="nextStep">
        {{ $t('dataFlow.next') }}
      </el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'simpleScene',
  data() {
    return {
      cellHtmls: '',
      cellHtml: '',
      activeValid: false,
      activeStep: 1,
      maxStep: 4,
      isSetting: false,
      vsteps: ['1']
      // vsteps: '2'
    }
  },
  methods: {
    skip() {
      event.preventDefault()
    },
    renderCell() {
      this.cellHtmls =
        `<div style="width: 3276px; height: 1688px;">
				<svg width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" joint-selector="svg" id="v-50">
				<g joint-selector="layers" class="joint-layers" transform="matrix(1,0,0,1,1638,444)">
				<g joint-selector="cells" class="joint-cells-layer joint-viewport">` +
        this.cellHtml +
        `<!--z-index:3--><!--z-index:4--></g><g joint-selector="tools" class="joint-tools-layer"></g></g></svg></div>`
    },
    nextStep() {
      if (this.isSetting) {
        this.$parent.editor.showSetting(false)
        this.$parent.simpleGoNext(this.activeStep)
      }
      if (this.activeStep == this.maxStep) return
      try {
        if (this.activeStep)
          this.$parent.editor.graph.graph
            .getCells()
            [this.activeStep - 1].validate()
      } catch (e) {
        this.$message.error(e.message)
        return
      }
      try {
        if (
          this.activeStep <= 3 &&
          !this.$parent.editor.graph.graph
            .getCells()
            [this.activeStep].validate()
        )
          this.activeValid = true
      } catch (e) {
        this.activeValid = false
      }

      this.activeStep++
      if (!this.vsteps.includes(this.activeStep + ''))
        this.vsteps.push(this.activeStep + '')
      this.$parent.simpleGoNext(this.activeStep)
    },
    prevStep() {
      if (this.activeStep == 1) return
      if (this.vsteps.includes(this.activeStep + '')) this.vsteps.pop()
      this.activeStep--
      if (this.activeStep == 2 || this.activeStep == 3)
        this.$parent.simpleGoNext(this.activeStep - 1) //激活selection change事件
      this.$parent.simpleGoNext(this.activeStep)
    },
    stepValid() {
      this.activeValid = true
    },
    toHome() {
      location.replace(location.origin + '/#/dashboard')
    },
    goFree() {
      window.name = JSON.stringify(this.$parent.getDataFlowData(true))
      this.$router.push({
        path: '/job',
        query: { mapping: 'cluster-clone' }
      })
      location.reload()
    },
    setSetting() {
      this.isSetting = true
    }
  }
}
</script>
<style lang="scss" scoped>
.exit {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 54px;
  padding: 0 50px;
  line-height: 54px;
  text-align: center;
  background-color: #fff;
  color: #666;
  box-sizing: border-box;
  border-top: 1px solid #ddd;
  z-index: 2002;
}

.action-bar {
  position: absolute;
  z-index: 2002;
  display: flex;
  width: 100%;
  height: 67px;
  line-height: 67px;
  flex-flow: row;
  // justify-content: center;
  font-size: 12px;
  background-color: #fff;

  h1 {
    width: 15%;
    padding-left: 20px;
    font-size: 14px;
    color: #333;
  }

  & > div {
    background: #fff;
    margin-left: 30px;
    /*padding: 12px 16px;*/

    border-radius: 5px;
  }

  & > div:first-child {
    margin-left: 0;
  }

  .center-bar {
    width: 70%;
    text-align: center;
    font-size: 12px;
    box-sizing: border-box;

    .el-checkbox {
      margin-right: 10px;
      margin-left: 10px;
      color: #999;
    }

    .space-line {
      margin-bottom: 4px;
      display: inline-block;
      width: 70px;
      border: 1px solid #dddddd;
    }

    .stepNum {
      display: inline-block;
      width: 26px;
      height: 26px;
      text-align: center;
      border: 1px solid #dddddd;
      border-radius: 50%;
    }
  }

  .e-classification {
    padding: 6px;
  }
}
</style>
<style lang="scss">
.action-bar {
  .el-checkbox__input .el-checkbox__inner {
    // margin-bottom: 15px;
    display: none;
  }

  .center-bar {
    .el-checkbox__label {
      line-height: 26px;
    }

    .el-checkbox.is-checked {
      cursor: auto;

      .el-checkbox__label {
        .stepNum {
          color: #fff;
          background-color: #409eff;
          border: 1px solid #409eff;
        }
      }
    }
  }

  .el-button:focus,
  .el-button:hover {
    color: #666 !important;
  }
}

.exit {
  .el-button {
    padding: 12px 30px;
  }

  .e-btnv {
    background: #409eff;
    color: #fff;
    border-radius: 5px;
  }

  .e-btn {
    color: #aaa;
  }

  .e-btn:first-child {
    margin-left: 0;
  }
}
</style>
