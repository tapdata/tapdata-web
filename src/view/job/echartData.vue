<template>
  <div class="echartData">
    <el-select v-model="domValue">
      <el-option
        key="value"
        :label="$t('dataFlow.allNode')"
        value="all">
      </el-option>
      <el-option
        v-for="item in domList"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <div class="echartMain">
      <div class="echartlist">
        <echart-head :data="screeningObj" @twoRadio="getTwoRadio"></echart-head>
        <div class="info fl">
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.taskName') }}:</span>
            <span class="info-text" style="color: #48b6e2;">{{flow.flowName}}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.creatdor') }}:</span>
            <span class="info-text">{{flow.creatdor}}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.creationTime') }}:</span>
            <span class="info-text">{{flow.createTime}}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.state') }}:</span>
            <span class="info-text" style="color: #62a569;">{{flow.state}}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.executionTime') }}:</span>
            <span class="info-text">{{flow.executionTime}}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.inputNumber') }}:</span>
            <span class="info-text"> {{flow.inputNumber}}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t('dataFlow.outputNumber') }}:</span>
            <span class="info-text">{{flow.outputNumber}}</span>
          </div>
        </div>
        <shaftless-echart class="fr echartMain" :echartObj="dataScreening" v-if="dataScreening" :echartsId="'dataScreeningId'" style="width: 100%"></shaftless-echart>
      </div>
      <div class="echartlist">
        <echart-head :data="inputOutputObj" @getSpeed="getSpeed"></echart-head>
        <div class="floatLayer">
          <span style="background-color:rgba(72,182,226,.3);color:#48b6e2;">平均：{{this.inputAverage}}</span>
          <span style="background-color:rgba(98,165,105,.3);color:#62a569;">平均：{{this.outputAverage}}</span>
        </div>
        <echarts-compinent :echartObj="throughputData" v-if="throughputData" :echartsId="'echartsId'" style="width: 100%"></echarts-compinent>
      </div>
      <div class="echartlist">
        <echart-head :data="transfObj" @getTime="getTime"></echart-head>
        <div class="floatLayer">
          <span style="background-color:rgba(251,142,0,.3);color:#fb8e00;">当前：{{this.currentTime}}</span>
        </div>
        <echarts-compinent :echartObj="transfData" v-if="transfData" :echartsId="'transfId'" style="width: 100%"></echarts-compinent>
      </div>
      <div class="echartlist">
        <echart-head :data="replicateObj" @getTime="getTime"></echart-head>
        <div class="floatLayer">
          <span style="background-color:rgba(7245,108,108,.3);color:#f56c6c;">当前：{{this.ransfTime}}</span>
        </div>
        <echarts-compinent :echartObj="replicateData" v-if="replicateData" :echartsId="'replicateId'" style="width: 100%"></echarts-compinent>
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
	props: {
  		dataFlow: {
  			type: Object,
			required: true
		}
	},
  data() {
    return {
      selectFlow: 'flow_',  //选中节点
      speed: '',
      time: '',
      domValue: 'all',
      domList: [],
      flow: {
        flowName: '客户信息数据库复制',
        creatdor: 'shane',
        createTime:'2019/06/07/22:33:44',
        state: '执行中',
        executionTime: '2466h:56:45',
        inputNumber: '123,000',
        outputNumber: ''
      },
      throughputData: null,
      dataScreening: null,    //数据总览的echart数据
      screeningObj: null,      //数据总览的头
      inputOutputObj: null,
      transfObj: null,
      transfData: null,
      storeData: null,
      replicateObj: null,
      replicateData: null,
      throughput_time: [],
      inputAverage: '',   //输入平均值
      outputAverage: '',   //输出平均值
      currentTime: '',   // 当前耗时
      ransfTime: '',   // 传输耗时
    };
  },
  mounted() {
    let params = {};
    // this.getApiData();
    this.screeningObj = {
      title: this.$t('dataFlow.dataScreening'),
      type: 'screening',
      isScreeing: true
    };

    this.inputOutputObj = {
      title: this.$t('dataFlow.inputOutput'),
      isScreeing: false,
      isIput: true,
      isSpeed: true,
      type: 'inputOutput',
      tip:this.$t("dataFlow.throughputpop")
    };

    this.transfObj = {
      title: this.$t('dataFlow.transf'),
      type: 'transf',
      isIput: true,
      tip:this.$t("dataFlow.transtime_pop")
    },

    this.replicateObj = {
      title: this.$t('dataFlow.replicate'),
      type: 'replicate',
      isIput: true,
      tip:this.$t("dataFlow.replicate_pop")
    }
  },
  watch:{
    domValue: {
      handler(val) {
        if(val === "all") {
          this.selectFlow = 'flow_'
        } else {
          this.selectFlow = 'stage_'
        }
      },
      deep: true
    }
  },
  methods: {
    // 输入输出获取数据
    getSpeed(data,time) {
      console.log( this.selectFlow)
      let params = {
        'filter[where][statsType]': "throughput",
        'filter[where][granularity]': this.selectFlow + time
      }
      //判断是否是全部节点
      // if(this.domValue === "all") {
      //   params['filter[where][dataFlowId]']= this.domValu;
      // } else {
      //   params['filter[where][dataFlowId]']= this.domValue;
      //   params['filter[where][stageId]']= this.domValue;
      // }
      this.getApiData(params,'throughput',data)
    },

    //获取返回的单位
    getTwoRadio(data,type) {
      let params = {
        'filter[where][statsType]': "data_overview",
        'filter[where][granularity]': data
      }
      //判断是否是全部节点
      // if(this.domValue === "all") {
      //   params['filter[where][dataFlowId]']= this.domValue;
      // } else {
      //   params['filter[where][dataFlowId]']= this.domValue;
      //   params['filter[where][stageId]']= this.domValue;
      // }
      this.getApiData(params,type,data)
    },

    //获取返回的时间
    getTime(data,type) {
      let params;
      if(type ==="transf") {
        params = {
          'filter[where][statsType]': "trans_time",
          'filter[where][granularity]': this.selectFlow + data
        }
        //判断是否是全部节点
        // if(this.domValue === "all") {
        //   params['filter[where][dataFlowId]']=this.domValue;
        // } else {
        //   params['filter[where][dataFlowId]']= this.domValue;
        //   params['filter[where][stageId]']= this.domValue;
        // }
      } else if( type === "replicate") {
        params = {
          'filter[where][statsType]': "repl_lag",
          'filter[where][granularity]': this.selectFlow + data
        }
        //判断是否是全部节点
        // if(this.domValue === "all") {
        //   params['filter[where][dataFlowId]']= this.domValue;
        // } else {
        //   params['filter[where][dataFlowId]']= this.domValue;
        //   params['filter[where][stageId]']= this.domValue;
        // }
      }
      this.getApiData(params,type,data);
    },

    //获取数据
    async getApiData(params,type,ele) {
      await DataFlowStats.get(params).then(res=>{
        if (res.statusText === "OK" || res.status === 200) {
          this.storeData = res.data[0].statsData;
          this.dataProcessing(this.storeData,type,ele);
        }
      });
    },
    //数据处理
    dataProcessing(data,type,ele) {
      let timeList = [],
        inputSizeList = [],
        outputSizeList= [],
        inputCountList = [],
        outputCountList =[],
        dataList = [];

      if(type === "screening") {
        let time = data.t;
        let inputSize = data.inputSize;
        let outputSize = data.outputSize;
        let inputCount = data.inputCount;
        let outputCount = data.outputCount;
        if(ele === "flow") {
          this.flow.inputNumber = inputSize;
          this.flow.outputNumber = outputSize
          this.getScreening(time,inputSize,outputSize);
        } else {
          this.flow.inputNumber = inputCount;
          this.flow.outputNumber = outputCount
          this.getScreening(time,inputCount,outputCount);
        }
      } else if(type === "throughput") {
        data.forEach(item=>{
          console.log(item)
          timeList.push(item.t);  //时间
          inputSizeList.push(item.inputSize);
          outputSizeList.push(item.outputSize);
          inputCountList.push(item.inputCount);
          outputCountList.push(item.outputCount);
        });

        if(ele === "qps") {
          this.inputAverage = inputCountList[inputCountList.length-1];
          this.outputAverage = outputCountList[outputCountList.length-1];
          this.getThroughputEchart(timeList,inputCountList,outputCountList);

        } else {
          this.inputAverage = inputSizeList[inputSizeList.length-1];
          this.outputAverage = outputSizeList[outputSizeList.length-1];
          this.getThroughputEchart(timeList,inputSizeList,outputSizeList);
        }
      } else {
        data.forEach(item => {
          timeList.push(item.t);  //时间
          dataList.push(item.d)
        })
        if (type === "transf") {
          this.currentTime = dataList[dataList.length-1];
          this.getTransTime(timeList,dataList)
        } else if(type === "replicate") {
          this.ransfTime = dataList[dataList.length-1];
          this.getReplicateTime(timeList,dataList)
        }
      }
      console.log(inputSizeList,outputSizeList,inputCountList,outputCountList,this.inputAverage,this.outputAverage,this.currentTime,this.ransfTime)
    },
    getScreening(time,series1,series2) {
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
          // data: [this.$('dataFlow.totalOutput'),this.$('dataFlow.totalInput')],
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
          data: [this.$t('dataFlow.totalOutput'),this.$t('dataFlow.totalInput')],
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
          data: [series1,series2],
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
    },

    getThroughputEchart(time,series1,series2) {
      this.throughputData = {
        tooltip: {
          trigger: 'axis',

          // formatter: function(params) {
            // console.log(params)
          //   var d_value = params.value;
          //   var res = params.name+'<br/>'+'采集终端: '+d_value;
          //   return res;
          // }
        },
        legend: {
            // data: [this.$t('dataFlow.input'),this.$t('dataFlow.output')],
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
          data: time,
        },
        yAxis: {
          axisLine:{
            lineStyle:{
                color:'#48b6e2'
            }
          } ,
          axisLabel: {
            formatter:  '{value}'
          }
        },
        series: [
            {
              name: this.$t('dataFlow.input'),
              type: 'line',
              data: series1,
              itemStyle: {
                color: '#2ba7c3'
              },
              lineStyle: {
                color: '#2ba7c3'
              },
              markLine : {
                data : [{
                  type : 'average', name: '平均值'
                }]
              }
            },
            {
              name: this.$t('dataFlow.output'),
              type: 'line',
              data: series2,
              itemStyle:{
                color: '#61a569'
              },
              lineStyle: {
                color:'#8cd5c2', //改变折线点的颜色
              },
              markLine : {
                data : [{
                  type : 'average', name: '平均值'
                }]
              }
            },
        ]
      };
    },

    getTransTime(time,series){
      this.transfData = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            // data: ['最高气温', '最低气温'],
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
              color:'#fb8e00',
              width: 2,//这里是为了突出显示加上的
            }
          },
          data: time
        },
        yAxis: {
          axisLine:{
            lineStyle:{
                color:'#fb8e00',
                width: 2,//这里是为了突出显示加上的
            }
          } ,
          axisLabel: {
            formatter:  '{value}'
          }
        },
        series: [
            {
              type: 'line',
              data: series,
              // markPoint: {
              //     data: [
              //         {type: 'max', name: '最大值'},
              //         {type: 'min', name: '最小值'}
              //     ]
              // },
              itemStyle: {
                color: '#fb8e00'
              },
              lineStyle: {
                color: '#fb8e00'
              },
              formatter: function(params){
                return "CPU";
              }
            }
        ]
      }
    },

    getReplicateTime(time,series){
      this.replicateData = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            // data: ['最高气温', '最低气温'],
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
              color:'#f56c6c',
            }
          },
          data: time
        },
        yAxis: {
          axisLine:{
            lineStyle:{
                color:'#f56c6c'
            }
          } ,
          axisLabel: {
            formatter:  '{value}'
          }
        },
        series: [
            {
              type: 'line',
              data: series,
              itemStyle: {
                color: '#f56c6c'
              },
              lineStyle: {
                color: '#f56c6c'
              }
            }
        ]
      }
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
  overflow-y: auto;
  .echartMain {
    height: 100%;
    .echartlist {
      position: relative;
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
      .floatLayer {
        position: absolute;
        right: 20px;
        top: 90px;
        span {
          display: block;
          width: 76px;
          margin-bottom: 10px;
          padding: 3px 6px;
          font-size: 12px;
          background: #f00;
        }
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
