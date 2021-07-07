<template>
  <div class="fixBtn">
    <el-popover popper-class="popperFixbtn" placement="top" width="400" trigger="hover">
      <div class="btnList">
        <span>
          {{ $t('dataFlow.button.save') }}
          <i>{{ isMac ? 'command+s' : 'ctrl+s' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.copy') }} <i>{{ isMac ? 'command+c' : 'ctrl+c' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.paste') }} <i>{{ isMac ? 'command+v' : 'ctrl+v' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.cut') }} <i>{{ isMac ? 'command+x' : 'ctrl+x' }}</i>
        </span>
        <span> {{ $t('message.delete') }} <i>delete</i> </span>
        <span>
          {{ $t('dataFlow.undo') }} <i>{{ isMac ? 'command+z' : 'ctrl+z' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.redo') }}
          <i>{{ isMac ? 'command+shift+z' : 'ctrl+y' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.selectAll') }}
          <i>{{ isMac ? 'command+a' : 'ctrl+a' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.amplification') }}
          <i>{{ isMac ? 'command+plus' : 'ctrl+plus' }}</i>
        </span>
        <span>
          {{ $t('dataFlow.zoomOut') }}
          <i>{{ isMac ? 'command+minus' : 'ctrl+minus' }}</i>
        </span>
        <span> {{ $t('dataFlow.down') }} <i>key down</i> </span>
        <span> {{ $t('dataFlow.up') }} <i>key up</i> </span>
        <span>
          {{ $t('dataFlow.selectMultipleNode') }}
          <i>Shift+{{ $t('dataFlow.mouseDrag') }}</i>
        </span>
      </div>
      <el-button circle class="iconfont icon-jianpan" slot="reference"></el-button>
    </el-popover>
  </div>
</template>
<script>
let isMac = /macintosh|mac os x/i.test(navigator.userAgent)
export default {
  data() {
    return {
      isMac
    }
  },
  mounted() {
    setTimeout(() => {
      let eBodyEl = document.body.getElementsByClassName('graph-container')[0]
      eBodyEl.appendChild(this.$el)
    }, 500)
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>
<style scoped lang="scss">
.fixBtn {
  position: absolute;
  bottom: 30px;
  left: 20px;
  z-index: 100;
}
</style>
<style lang="scss">
.popperFixbtn {
  width: 160px !important;
  .btnList {
    width: 160px;
    span {
      display: block;
      width: 100%;
      padding: 5px 0;
      color: #333;
      font-size: 12px;
      cursor: pointer;
      i {
        float: right;
        color: #999;
        font-size: 12px;
      }
    }
  }
}
</style>
