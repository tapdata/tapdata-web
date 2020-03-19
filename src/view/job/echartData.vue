<template>
  <div class="echartData">
    <el-select v-model="domValue">
      <el-option
        v-for="item in domList"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <div class="echartMain">
      <div class="echartlist">
        <echart-head :data="screeningObj" @twoRadio="getTwoRadio" @getTime="getTime"></echart-head>
        <div class="info fl">
          <div class="info-list">
            <span class="info-label">任务名称:</span>
            <span class="info-text" style="color: #48b6e2;">客户信息数据库复制</span>
          </div>
          <div class="info-list">
            <span class="info-label">创建人:</span>
            <span class="info-text">shane</span>
          </div>
          <div class="info-list">
            <span class="info-label">创建时间:</span>
            <span class="info-text">2019/06/07/22:33:44</span>
          </div>
          <div class="info-list">
            <span class="info-label">状态:</span>
            <span class="info-text" style="color: #62a569;">执行中</span>
          </div>
          <div class="info-list">
            <span class="info-label">本次执行时间:</span>
            <span class="info-text">2466h:56:45</span>
          </div>
          <div class="info-list">
            <span class="info-label">本次输入条数:</span>
            <span class="info-text"> 123,000</span>
          </div>
          <div class="info-list">
            <span class="info-label">本次输出条数:</span>
            <span class="info-text">110</span>
          </div>
        </div>
        <shaftless-echart class="fr echartMain" :echartObj="dataScreening" :echartsId="'dataScreeningId'" style="width: 100%"></shaftless-echart>
      </div>
      <div class="echartlist">
        <echart-head :data="inputOutputObj"></echart-head>
        <echarts-compinent :echartObj="echartData" :echartsId="'echartsId'" style="width: 100%"></echarts-compinent>
      </div>
    </div>
  </div>
</template>
<script>
import echartHead from './components/echartHead';
import echartsCompinent from '../../components/echartsCompinent';
import shaftlessEchart from '../../components/shaftlessEchart';
import factory from '../../api/factory';
const DataFlowStats = factory('DataFlowStats');
export default {
  name: 'echartData',
  components: {echartHead,echartsCompinent,shaftlessEchart},
  data() {
    return {
      domValue: '',
      domList: [
        {value: '选项1', label: '所有节点'}
      ],
      echartData: null,
      dataScreening: null,    //数据总览的echart数据
      screeningObj: null,      //数据总览的头
      inputOutputObj: null
    };
  },
  mounted() {
    let params = {}
    this.getApiData()
    this.domValue = this.domList[0].value;
    this.screeningObj = {
      title: "数据总览",
      isScreeing: true,
      rowCount: {
        lable: "条数",
        value: "rowCount"
      },
      kbs: {
        lable: "KB",
        value: "KB"
      },
      tip:'传输耗时：除源节点外，事件处理完的时间减去事件的发生时间。 节点间统计：事件从进入节点到输出到所消耗的时间 任务流统计：所有节'
    };

    this.inputOutputObj = {
      title: "输入输出统计",
      isScreeing: false,
      rowCount: {
        lable: "QPS",
        value: "QPS"
      },
      kbs: {
        lable: "KB",
        value: "KB"
      },
      tip:'传输耗时：除源节点外，事件处理完的时间减去事件的发生时间。 节点间统计：事件从进入节点到输出到所消耗的时间 任务流统计：所有节'
    }

    this.dataScreening = {
      tooltip: {
        show: false,
        trigger: 'none',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      toolbox: {
        show: false,
      },
      legend: {
        data: ['总输出','总输入'],
      },
      grid: {
          left: '30%',
          right: '30%',
          bottom: '3%',
          containLabel: true
      },
      xAxis:{
        type: 'category',
        show: false,
        axisLine: {
          show:false,
          lineStyle: {
            color: '#ff00ff',
            width: 0
          }
        },
        data : ['总输出','总输入'],
        axisPointer: {
            type: 'shadow'
        },
        formatter: function() {

        }
      },
      yAxis:{
        type: 'value',
        min: 0,
        axisLine: {show:false},
        axisTick: {show:false},
        splitLine: {show: false},
        splitArea:{show:false},
        axisLabel : {
          formatter: function(){
            return "";
          }
        }
      },
      series: [{
        type: 'bar',
        data: [12524,6666],
        barWidth: 120,
        barGap: '-100%',
        itemStyle: {
          normal: {
            color: function(params) {
              var colorList = ['#48b6e2','#62a569'];
              return colorList[params.dataIndex]
            },
            label: {
              show: true,
              verticalAlign: 'middle',
              position: 'top',
              distance: 20,
              formatter: '{b}\n{c}'
            }
          }
        }
      }]
    };

    this.echartData = {
      tooltip: {
          trigger: 'axis',
      },
      legend: {
          data: ['最高气温', '最低气温'],
      },
      grid: {
        show: false,
      },
      toolbox: {
          show: true,
          feature: {
              dataZoom: {
                  yAxisIndex: 'none'
              },
          }
      },
      xAxis: {
        show: true,
        axisLine: {
          lineStyle:{
            color:'#48b6e2',
            width: 2,//这里是为了突出显示加上的
          }
        },
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        axisLine:{
          lineStyle:{
              color:'#48b6e2',
              width: 2,//这里是为了突出显示加上的
          }
        } ,
        axisLabel: {
          formatter:  '{value}°C'
        }
      },
      series: [
          {
              name: '输出',
              type: 'line',
              data: [131, 11, 15, 13, 12, 13, 10],
              // markPoint: {
              //     data: [
              //         {type: 'max', name: '最大值'},
              //         {type: 'min', name: '最小值'}
              //     ]
              // },
              itemStyle: {
                color: '#2ba7c3'
              },
              lineStyle: {
                color: '#2ba7c3'
              },
              formatter: function(params){
                console.log(params + ','+typeof(params));
                return "CPU";
              }
          },
          {
              name: '输入',
              type: 'line',
              data: [1, 12, 2, 5, 3, 2, 0],
              itemStyle:{
                color: '#61a569'
              },
              lineStyle: {
                color:'#8cd5c2', //改变折线点的颜色
              }
              // markPoint: {
              //     data: [
              //         {name: '周最低', value: -2, xAxis: 1, yAxis: -1.5}
              //     ]
              // },
              // markLine: {
              //     data: [
              //         {type: 'average', name: '平均值'},
              //         [{
              //             symbol: 'none',
              //             x: '90%',
              //             yAxis: 'max'
              //         }, {
              //             symbol: 'circle',
              //             label: {
              //                 position: 'start',
              //                 formatter: '最大值'
              //             },
              //             type: 'max',
              //             name: '最高点'
              //         }]
              //     ]
              // }
          }
      ]
    };
  },

  methods: {
    //获取返回的单位
    getTwoRadio(data) {
      console.log(data);
      // if() {

      // }
    },
    //获取返回的时间
    getTime(data) {
      console.log(data);
    },

    //获取数据
    async getApiData(params) {
      await DataFlowStats.get(params).then(res=>{
        console.log('===',res);
      });
    }
  }
};
</script>
<style scoped lang="less">
.echartData {
  width: 100%;
  height: 100%;
  padding: 10px 15px;
  box-sizing: border-box;
  overflow: hidden;
  .echartMain {
    height: 100%;
    .echartlist {
      width: 100%;
      height: 330px;
      margin-top: 20px;
      border: 1px solid #dcdfe6;
      border-radius: 3px;
      box-shadow: 1.414px 1.414px 5px rgba(0,0,0,0.1);
      .echartMain {
        width: 60%!important;
        height: calc(100% - 40px);
      }
      .info {
        padding: 30px 10px 0 30px;
        .info-list {
          padding-bottom: 14px;
          .info-label {
            display: inline-block;
            width: 120px;
            font-size: 14px;
            color: #999;
          }
          .info-text {
            font-size: 14px;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
