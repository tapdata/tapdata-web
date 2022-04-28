<template>
  <div class="shaftlessBox">
    <div class="echarts" :id="echartsId" :echartObj="echartObj" ref="echarts"></div>
  </div>
</template>
<script>
import Echarts from '../../plugins/echarts'
import { EditorEventType } from '../editor/lib/events'
// import echarts from 'echarts'
export default {
  name: 'EchartsCompinent',
  props: {
    sliderBar: {
      type: Object
    },
    echartsId: {
      type: String
    },
    echartObj: {
      type: Object
    }
  },
  data() {
    return {
      myChart: null
    }
  },
  watch: {
    echartObj: {
      handler(data) {
        this.loadEchart(this.echartsId, data)
      },
      deep: true
    }
  },
  mounted() {
    let that = this
    // let publicCharts = that.echartOption(that.echartObj)
    that.$nextTick(() => {
      that.loadEchart(that.echartsId, that.echartObj)
      if (this.sliderBar) {
        this.sliderBar.on(EditorEventType.RESIZE, () => {
          this.myChart.resize()
        })
      } else {
        window.addEventListener('resize', () => {
          if (that.myChart) {
            that.myChart.resize()
          }
        })
      }
    })
  },

  methods: {
    loadEchart(id, data) {
      let _this = this
      setTimeout(function () {
        let dom = document.getElementById(id)
        if (dom) {
          _this.myChart = Echarts.init(dom)
          _this.myChart.clear() // 清空再重绘
          // _this.myChart.setOption(data)
          // let myChart = Echarts.init(this.refs.echarts);
          let publicCharts = _this.echartOption(data)
          _this.myChart.setOption(publicCharts)
          // window.addEventListener("resize", () => {
          // 	_this.myChart.resize();
          // });
        }
      }, 0)
    },
    echartOption(configures) {
      let MyOption = {
        // 图标的标题   本项目暂未使用
        title: {
          // text: configures.title.text
        },
        // 鼠标悬浮提示框
        tooltip: {
          trigger: configures.tooltip.trigger,
          confine: true, // 是否将 tooltip 框限制在图表的区域内。  true为是
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: configures.tooltip.axisPointer.type, // 默认为直线，可选为：'line' | 'shadow'
            label: {
              // backgroundColor: '#6a7985'
            }
          }
        },
        // 图例
        legend: {
          // 图例的数据数组
          data: configures.legend.data, // 图例的数据数组   一般不设置，自动根据数据匹配
          top: configures.legend.top, // 图例组件离容器上侧的距离
          right: configures.legend.right, // 图例组件离容器右侧的距离
          // bottom: configures.legend.bottom, //图例组件离容器下侧的距离
          left: configures.legend.left // 图例组件离容器左侧的距离
          // textStyle: {
          //   color: this.echartsXYcolor //在本项目中涉及到主题色切换，所以采用动态颜色，黑白两色，下边相同
          // }
        },
        // 工具栏。内置有导出图片，数据视图，动态类型切换，数据区域缩放，重置五个工具。
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        // 直角坐标系内绘图网格
        grid: configures.grid,
        // x轴的数据以及配置
        xAxis: {
          type: configures.xAxis.type, // 坐标轴类型。具体参考官方文档
          boundaryGap: configures.xAxis.boundaryGap, // 类目轴中 boundaryGap 可以配置为 true 和 false。默认为 true，这时候刻度只是作为分隔线，标签和数据点都会在两个刻度之间的带(band)中间。
          data: configures.xAxis.data, // x轴的数据
          show: configures.xAxis.show,
          axisTick: { show: false },
          splitLine: configures.xAxis.splitLine,
          axisLine: configures.xAxis.axisLine,
          formatter: configures.xAxis.formatter ? configures.xAxis.formatter : null
          // axisLabel: configures.xAxis.axisLabel ? configures.xAxis.axisLabel : null
          // axisLine: {
          //   lineStyle: {
          //     color: this.echartsXYcolor
          //   }
          // },
        },
        // y轴的数据配置
        yAxis: {
          type: 'value',
          axisTick: { show: false },
          axisLine: configures.yAxis.axisLine,
          splitLine: configures.yAxis.splitLine,
          // splitArea: configures.yAxis.splitArea,
          axisLabel: configures.yAxis.axisLabel
        },
        // type: 'value',
        // axisLabel: {
        //   // formatter: configures.yAxis.axisLabel.formatter
        // }
        // axisLine: {
        //   lineStyle: {
        //     color: this.echartsXYcolor
        //   }
        // },
        // axisLabel: {
        //   textStyle: {
        //     color: this.echartsXYcolor
        //   },
        //   formatter: configures.yAxis.axisLabel.formatter
        // }
        // }],
        // dataZoom 组件 用于区域缩放，从而能自由关注细节的数据信息，或者概览数据整体，或者去除离群点的影响。
        dataZoom: [
          // {
          //   type: "inside"
          // },
          // {
          //   type: "slider",
          //   // top: configures.dataZoom[1].top, //距离容器上边的距离
          //   textStyle: {
          //     color: this.echartsXYcolor
          //   }
          // }
        ],
        animation: false,
        radiusAxis: configures.radiusAxis,
        // 图表的数据
        series: configures.series // 由于数据的灵活度大，所以完全采用传入的方式
      }
      return MyOption
    }
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.clear()
    }
  }
}
</script>
<style scoped lang="scss">
.shaftlessBox {
  height: calc(100% - 30px);

  .echarts {
    width: 100%;
    height: 100%;
  }
}
</style>
