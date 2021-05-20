<!-- 
  环形数据展示
  参数：
    number: 所展示的数据，会根据数字大小转单位
    color: 环形主题色
    text: 所展示数据的说明
    isCapacity: 是否转为容量大小单位,即KB，MB...
 -->

<template>
  <div class="annulus" ref="annulus">
    <div class="ring" :title="number">
      {{ handleText }}
    </div>
    <div class="label">
      <div class="color"></div>
      <div class="text">{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['number', 'color', 'text', 'isCapacity'],
  computed: {
    handleText() {
      let num = Number(this.number)
      if (this.isCapacity) {
        // 处理成MB、GB、TB、PB、EB、ZB的单位
        if (!num) return 0
        let unit = ''

        if (num < 1024) {
          unit = 'Byte'
        } else {
          unit = 'KB'
          num = num / 1024
        }

        if (num > 1024) {
          unit = 'MB'
          num = num / 1024
        }

        if (num > 1024) {
          unit = 'GB'
          num = num / 1024
        }

        if (num > 1024) {
          unit = 'TB'
          num = num / 1024
        }

        if (num > 1024) {
          unit = 'PB'
          num = num / 1024
        }

        if (num > 1024) {
          unit = 'EB'
          num = num / 1024
        }

        if (num > 1024) {
          unit = 'ZB'
          num = num / 1024
        }

        return num.toFixed(0) + unit
      } else {
        // 处理成万、亿、兆的单位
        if (num) {
          if (num > 1000000000000) {
            return (
              parseInt((num / 1000000000000) * 10) / 10 +
              this.$t('dkDashboard.zhao')
            )
          }
          if (num > 100000000) {
            return (
              parseInt((num / 100000000) * 10) / 10 + this.$t('dkDashboard.yi')
            )
          }
          if (num > 10000) {
            return (
              parseInt((num / 10000) * 10) / 10 + this.$t('dkDashboard.wan')
            )
          }
          return num
        } else {
          return this.number || 0
        }
      }
    }
  },
  mounted() {
    if (this.color) {
      this.$refs.annulus.style.setProperty('--color', this.color)
    }
  }
}
</script>

<style lang="scss" scoped>
.annulus {
  --color: #686be8; // 默认color
  font-size: 12px;
  display: inline-flex;
  vertical-align: top;
  flex-direction: column;
  align-items: center;
  .ring {
    width: 120px;
    height: 120px;
    box-sizing: border-box;
    border: 10px solid var(--color);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #777;
    font-size: 22px;
    transition: all 0.2s;
    &:hover {
      border-width: 6px;
      font-size: 26px;
      color: var(--color);
      padding: 4px;
    }
  }
  .label {
    display: flex;
    align-items: center;
    margin-top: 20px;
    .color {
      width: 36px;
      height: 12px;
      background-color: var(--color);
      margin-right: 2px;
    }
  }
}
</style>
