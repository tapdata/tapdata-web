<template>
  <div class="e-job-monitor">
    <!--		<el-button class="e-job-monitor-btn" size="mini" type="primary" @click="handleGoDataVerify">{{ $t('dataVerify.dataVerify') }} </el-button>-->
    <el-form inline>
      <el-form-item>
        <el-select v-model="domValue" size="mini">
          <el-option key="all" :label="$t('dataFlow.allNode')" value="all">
          </el-option>
          <el-option
            v-for="item in flow.stages"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div class="echartMain">
      <div class="echartlist">
        <echart-head :data="screeningObj" @twoRadio="getTwoRadio"></echart-head>
        <div class="info fl">
          <div class="info-list">
            <span class="info-label">{{ $t("dataFlow.taskName") }}:</span>
            <span class="info-text" style="color: #48b6e2;">{{
              flow.name
            }}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t("dataFlow.creatdor") }}:</span>
            <span class="info-text">{{ flow.username }}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t("dataFlow.creationTime") }}:</span>
            <span class="info-text">{{ flow.createTime }}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t("dataFlow.state") }}:</span>
            <span class="info-text" style="color: #62a569;">{{
              $t("dataFlow.status." + flow.status)
            }}</span>
          </div>
          <!-- <div class="info-list">
						<span class="info-label">{{ $t('dataFlow.executionTime') }}:</span>
						<span class="info-text">{{updateTime}}</span>
					</div> -->
          <div class="info-list">
            <span class="info-label">{{ $t("dataFlow.inputNumber") }}:</span>
            <span class="info-text"> {{ flow.inputNumber }}</span>
          </div>
          <div class="info-list">
            <span class="info-label">{{ $t("dataFlow.outputNumber") }}:</span>
            <span class="info-text">{{ flow.outputNumber }}</span>
          </div>
        </div>
        <shaftless-echart
          class="fr echartMain"
          :echartObj="dataScreening"
          v-if="dataScreening"
          :echartsId="'dataScreeningId'"
          style="width: 100%"
        ></shaftless-echart>
      </div>

      <div class="echartlist">
        <echart-head :data="inputOutputObj" @getSpeed="getSpeed"></echart-head>
        <div class="floatLayer">
          <span style="background-color:rgba(72,182,226,.3);color:#48b6e2;"
            >{{ $t("dataFlow.average") }}:{{ this.inputAverage }}</span
          >
          <span style="background-color:rgba(98,165,105,.3);color:#62a569;"
            >{{ $t("dataFlow.average") }}:{{ this.outputAverage }}</span
          >
        </div>
        <echarts-compinent
          :echartObj="throughputData"
          v-if="throughputData"
          :echartsId="'echartsId'"
          style="width: 100%"
        ></echarts-compinent>
      </div>
      <div class="echartlist">
        <echart-head :data="transfObj" @getTime="getTime"></echart-head>
        <div class="floatLayer">
          <span style="background-color:rgba(251,142,0,.3);color:#fb8e00;"
            >{{ $t("dataFlow.current") }}:{{ this.currentTime }}</span
          >
        </div>
        <echarts-compinent
          :echartObj="transfData"
          v-if="transfData"
          :echartsId="'transfId'"
          style="width: 100%"
        ></echarts-compinent>
      </div>
      <div class="echartlist">
        <echart-head :data="replicateObj" @getTime="getTime"></echart-head>
        <div class="floatLayer">
          <span style="background-color:rgba(7245,108,108,.3);color:#f56c6c;"
            >{{ $t("dataFlow.current") }}:{{ this.ransfTime }}</span
          >
        </div>
        <echarts-compinent
          :echartObj="replicateData"
          v-if="replicateData"
          :echartsId="'replicateId'"
          style="width: 100%"
        ></echarts-compinent>
      </div>
    </div>
  </div>
</template>
<script>
import echartHead from "./components/echartHead";
import echartsCompinent from "../../components/echartsCompinent";
import shaftlessEchart from "../../components/shaftlessEchart";
import factory from "../../api/factory";
import { EditorEventType } from "../../editor/lib/events";

const DataFlowInsights = factory("DataFlowInsights");
let intervalTime = 5000;
export default {
  name: "JobMonitor",
  components: { echartHead, echartsCompinent, shaftlessEchart },
  props: {
    dataFlow: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      dpx: "QPS",
      selectFlow: "flow_", // 选中节点
      speed: "",
      time: "",
      domValue: "all",
      flow: {
        name: "",
        username: "",
        createTime: "",
        status: "",
        updateTime: "",
        inputNumber: "",
        outputNumber: "",
        stages: [],
        id: ""
      },
      throughputData: {
        tooltip: {
          trigger: "axis"
        },
        legend: {
          // data: [this.$t('dataFlow.input'),this.$t('dataFlow.output')],
        },
        grid: {
          show: false
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            }
          }
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: "#48b6e2",
              width: 2 // 这里是为了突出显示加上的
            }
          },
          data: []
        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: "#48b6e2"
            }
          },
          axisLabel: {
            formatter: function(value, index) {
              if (value >= 10000) {
                value = value / 10000 + "W";
              }
              return value;
            }
          }
        },
        series: [
          {
            name: this.$t("dataFlow.input"),
            type: "line",
            smooth: true,
            data: [],
            itemStyle: {
              color: "#2ba7c3"
            },
            lineStyle: {
              color: "#2ba7c3"
            }
          },
          {
            name: this.$t("dataFlow.output"),
            type: "line",
            smooth: true,
            data: [],
            itemStyle: {
              color: "#61a569"
            },
            lineStyle: {
              color: "#8cd5c2" // 改变折线点的颜色
            }
          }
        ]
      },
      transfData: {
        tooltip: {
          trigger: "axis"
        },
        grid: {
          show: false
        },
        legend: {
          // data: [this.$t('dataFlow.input'),this.$t('dataFlow.output')],
        },
        toolbox: {
          show: true
          // feature: {
          //   dataZoom: {
          //     yAxisIndex: 'none'
          //   },
          // }
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: "#fb8e00",
              width: 2 // 这里是为了突出显示加上的
            }
          },
          data: []
        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: "#fb8e00",
              width: 2 // 这里是为了突出显示加上的
            }
          },
          axisLabel: {
            formatter: function(value, index) {
              if (value >= 10000) {
                value = value / 10000 + "W";
              }
              return value;
            }
          }
        },
        series: [
          {
            type: "line",
            smooth: true,
            data: [],
            itemStyle: {
              color: "#fb8e00"
            },
            lineStyle: {
              color: "#fb8e00"
            }
          }
        ]
      },
      replicateData: {
        tooltip: {
          trigger: "axis"
        },
        legend: {
          // data: ['最高气温', '最低气温'],
        },
        grid: {
          show: false
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            }
          }
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: "#f56c6c"
            }
          },
          data: []
        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: "#f56c6c"
            }
          },
          axisLabel: {
            formatter: function(value, index) {
              if (value >= 10000) {
                value = value / 10000 + "W";
              }
              return value;
            }
          }
        },
        series: [
          {
            type: "line",
            data: [],
            smooth: true,
            itemStyle: {
              color: "#f56c6c"
            },
            lineStyle: {
              color: "#f56c6c"
            }
          }
        ]
      },

      dataScreening: null, // 数据总览的echart数据
      screeningObj: null, // 数据总览的头

      inputOutputObj: null,
      transfObj: null,
      storeData: null,
      replicateObj: null,
      throughput_time: [],
      inputAverage: "", // 输入平均值
      outputAverage: "", // 输出平均值
      currentTime: "", // 当前耗时
      ransfTime: "", // 传输耗时
      throughputTime: "",
      isThroughputAll: "",
      dataOverviewAll: "",
      transfTime: "",
      replicateTime: "",
      transfType: "",
      replicateType: "",
      dataOverviewType: "",
      selectId: "",
      timer: null, // 定时器
      timer1: null, // 定时器
      timer2: null, // 定时器
      timer3: null, // 定时器
      intervalThroughputpop: 20000,
      intervalTransf: 20000,
      intervalReplicate: 20000
    };
  },

  computed: {
    updateTime: function() {
      if (this.dataFlow.startTime && this.dataFlow.last_updated) {
        let time =
          new Date(this.dataFlow.last_updated).getTime() -
          new Date(this.dataFlow.startTime).getTime();

        let unit = "ms";
        if (time > 1000) {
          unit = "s";
          time = Number((time / 1000).toFixed(2));
        }
        if (time > 60) {
          unit = "m";
          time = Number((time / 60).toFixed(2));
        }
        if (time > 60) {
          unit = "h";
          time = Number((time / 60).toFixed(2));
        }
        if (time > 24) {
          unit = "d";
          time = Number((time / 24).toFixed(2));
        }

        return time + " " + unit;
      }
      return "-";
    }
  },

  mounted() {
    this.$on(EditorEventType.SELECTED_STAGE, selectStage => {
      this.domValue = selectStage ? selectStage.id : "all";
    });
    this.flow = this.dataFlow;
    // this.getApiData();
    this.screeningObj = {
      title: this.$t("dataFlow.dataScreening"),
      type: "screening",
      isScreeing: true
    };

    this.inputOutputObj = {
      title: this.$t("dataFlow.inputOutput"),
      isScreeing: false,
      isIput: true,
      isSpeed: true,
      loading: false,
      type: "throughput",
      tip: this.$t("dataFlow.throughputpop")
    };

    this.transfObj = {
      title: this.$t("dataFlow.transf"),
      type: "transf",
      isIput: true,
      loading: false,
      tip: this.$t("dataFlow.transtime_pop")
    };

    this.replicateObj = {
      title: this.$t("dataFlow.replicate"),
      type: "replicate",
      isIput: true,
      loading: false,
      tip: this.$t("dataFlow.replicate_pop")
    };
    this.flow.createTime = this.dataFlow.createTime
      ? this.$moment(this.dataFlow.createTime).format("YYYY-MM-DD HH:mm:ss")
      : "";
    this.flow.username = (this.dataFlow.user && this.dataFlow.user.email) || "";
    this.timer = setInterval(() => {
      this.getTwoRadio(this.dataOverviewAll, this.dataOverviewType);
      this.getSpeed(this.isThroughputAll, this.throughputTime);
      this.getTime(this.transfTime, this.transfType);
      this.getTime(this.replicateTime, this.replicateType);
    }, intervalTime);
  },

  watch: {
    dataFlow: {
      handler(val) {
        this.flow = val;
        this.flow.createTime = val.createTime
          ? this.$moment(val.createTime).format("YYYY-MM-DD HH:mm:ss")
          : "";
        this.flow.username = (val.user && val.user.email) || "";
        this.flow.status = val.status;
      },
      deep: true
    },
    domValue: {
      handler(val) {
        this.selectId = val;
        if (val === "all") {
          this.selectFlow = "flow_";
        } else {
          this.selectFlow = "stage_";
        }
        this.$bus.emit("currentStageId", val);
        this.getSpeed(this.isThroughputAll, this.throughputTime);
        this.getTwoRadio(this.dataOverviewAll, this.dataOverviewType);
        this.getTime(this.transfTime, this.transfType);
        this.getTime(this.replicateTime, this.replicateType);
      },
      deep: true
    }
  },

  methods: {
    // 输入输出获取数据
    getSpeed(data, time) {
      this.isThroughputAll = data;
      this.throughputTime = time;
      let params = {
        statsType: "throughput",
        granularity: this.selectFlow + time
      };
      switch (time) {
        case "second":
          this.intervalThroughputpop = 20000;
          break;
        case "minute":
          this.intervalThroughputpop = 60000;
          break;
        case "hour":
          this.intervalThroughputpop = 360000;
          break;
        case "day":
          this.intervalThroughputpop = 86400000;
          break;
      }
      this.getApiData(params, "throughput", data);
    },

    // 获取返回的单位
    getTwoRadio(data, type) {
      this.dataOverviewType = type;
      this.dataOverviewAll = data;

      let params = {
        statsType: "data_overview",
        granularity: data
      };
      this.getApiData(params, type, data);
    },

    // 获取返回的时间
    getTime(data, type) {
      let params;
      if (type === "transf") {
        this.transfType = type;
        this.transfTime = data;
        switch (data) {
          case "second":
            this.intervalTransf = 20000;
            break;
          case "minute":
            this.intervalTransf = 60000;
            break;
          case "hour":
            this.intervalTransf = 360000;
            break;
          case "day":
            this.intervalTransf = 86400000;
            break;
        }
        params = {
          statsType: "trans_time",
          granularity: this.selectFlow + data
        };
      } else if (type === "replicate") {
        switch (data) {
          case "second":
            this.intervalReplicate = 20000;
            break;
          case "minute":
            this.intervalReplicate = 60000;
            break;
          case "hour":
            this.intervalReplicate = 360000;
            break;
          case "day":
            this.intervalReplicate = 86400000;
            break;
        }
        this.replicateType = type;
        this.replicateTime = data;
        params = {
          statsType: "repl_lag",
          granularity: this.selectFlow + data
        };
      }
      this.getApiData(params, type, data);
    },

    // 获取数据
    async getApiData(params, type, ele) {
      if (this.domValue === "all") {
        params["dataFlowId"] = this.flow.id;
      } else {
        params["dataFlowId"] = this.flow.id;
        params["stageId"] = this.domValue;
      }
      if (type === this.inputOutputObj.type) {
        this.inputOutputObj.loading = true;
      } else if (type === this.transfObj.type) {
        this.transfObj.loading = true;
      } else if (type === this.replicateObj.type) {
        this.replicateObj.loading = true;
      }
      await DataFlowInsights.runtimeMonitor(params)
        .then(res => {
          if (res.statusText === "OK" || res.status === 200) {
            if (res.data && res.data.length > 0) {
              this.storeData = res.data[0].statsData;
              this.dataProcessing(this.storeData, type, ele);
            } else {
              this.$message.error(this.$t("message.noData"));
            }
          }

          if (type === this.inputOutputObj.type) {
            this.inputOutputObj.loading = false;
          } else if (type === this.transfObj.type) {
            this.transfObj.loading = false;
          } else if (type === this.replicateObj.type) {
            this.replicateObj.loading = false;
          }
        })
        .catch(e => {
          if (type === this.inputOutputObj.type) {
            this.inputOutputObj.loading = false;
          } else if (type === this.transfObj.type) {
            this.transfObj.loading = false;
          } else if (type === this.replicateObj.type) {
            this.replicateObj.loading = false;
          }
        });
    },

    // 数据处理
    dataProcessing(data, type, ele) {
      let timeList = [];
      let inputSizeList = [];
      let outputSizeList = [];
      let inputCountList = [];
      let outputCountList = [];
      let dataList = [];

      if (type === "screening") {
        let time = data.t;
        let inputSize = data.inputSize;
        let outputSize = data.outputSize;
        let inputCount = data.inputCount;
        let outputCount = data.outputCount;
        if (ele === "flow") {
          this.flow.inputNumber = inputCount > 0 ? inputCount : 0;
          this.flow.outputNumber = outputCount > 0 ? outputCount : 0;
          this.getScreening(time, inputCount, outputCount);
        } else if (ele === "stage") {
          this.flow.inputNumber = inputSize > 0 ? inputSize : 0;
          this.flow.outputNumber = outputSize > 0 ? outputSize : 0;
          this.getScreening(time, inputSize, outputSize);
        }
      } else if (type === "throughput") {
        data.forEach(item => {
          timeList.push(item.t); // 时间
          inputSizeList.push(item.inputSize);
          outputSizeList.push(item.outputSize);
          inputCountList.push(item.inputCount);
          outputCountList.push(item.outputCount);
        });

        if (ele === "qps") {
          this.dpx = "QPS";
          this.inputAverage = inputCountList[inputCountList.length - 1];
          this.outputAverage = outputCountList[outputCountList.length - 1];
          this.getThroughputEchart(timeList, inputCountList, outputCountList);
        } else {
          this.dpx = "KB";
          this.inputAverage = inputSizeList[inputSizeList.length - 1];
          this.outputAverage = outputSizeList[outputSizeList.length - 1];
          this.getThroughputEchart(timeList, inputSizeList, outputSizeList);
        }
      } else {
        data.forEach(item => {
          timeList.push(item.t); // 时间
          dataList.push(item.d);
        });
        if (type === "transf") {
          this.currentTime = dataList[dataList.length - 1];
          this.getTransTime(timeList, dataList);
        } else if (type === "replicate") {
          this.ransfTime = dataList[dataList.length - 1];
          this.getReplicateTime(timeList, dataList);
        }
      }
    },

    getScreening(time, series1, series2) {
      this.dataScreening = {
        tooltip: {
          show: false,
          trigger: "none",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999"
            }
          }
        },
        toolbox: {
          show: false
        },
        legend: {
          // data: [this.$('dataFlow.totalOutput'),this.$('dataFlow.totalInput')],
        },
        grid: {
          left: "25%",
          right: "30%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          show: false,
          axisLine: {
            show: false,
            lineStyle: {
              color: "#ff00ff",
              width: 0
            }
          },
          data: [
            this.$t("dataFlow.outputNumber"),
            this.$t("dataFlow.inputNumber")
          ],
          axisPointer: {
            type: "shadow"
          },
          formatter: function() {}
        },
        yAxis: {
          type: "value",
          min: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          splitArea: { show: false },
          axisLabel: {
            formatter: function() {
              return "";
            }
          }
        },
        series: [
          {
            type: "bar",
            data: [series2, series1],
            barWidth: 70,
            barGap: "-100%",
            itemStyle: {
              normal: {
                color: function(params) {
                  var colorList = ["#62a569", "#48b6e2"];
                  return colorList[params.dataIndex];
                },
                label: {
                  show: true,
                  verticalAlign: "middle",
                  position: "top",
                  distance: 20,
                  formatter: "{b}\n{c}"
                }
              }
            }
          }
        ]
      };
    },

    getThroughputEchart(time, series1, series2) {
      this.throughputData.xAxis.data = time;
      this.throughputData.series[0].data = series1;
      this.throughputData.series[1].data = series2;
      // let self = this;
      // if (this.throughputData.xAxis.data.length === 0) {
      //   for (let i = 0; i < time.length; i++) {
      //     this.throughputData.xAxis.data.push(time[i]);
      //     this.throughputData.series[0].data.push(series1[i]);
      //     this.throughputData.series[1].data.push(series2[i]);
      //   }
      // } else {

      //   let interval = this.intervalThroughputpop / (time.length+1);
      //   let appendData = function () {
      //     let t = time.shift();
      //     let s1 = series1.shift();
      //     let s2 = series2.shift();
      //     self.throughputData.xAxis.data.shift();
      //     self.throughputData.xAxis.data.push(t);
      //     self.throughputData.series[0].data.shift();
      //     self.throughputData.series[0].data.push(s1);
      //     self.throughputData.series[1].data.shift();
      //     self.throughputData.series[1].data.push(s2);

      //     if (time.length > 0)
      //       setTimeout(appendData, interval);
      //   };
      //   appendData();
      // }
    },

    getTransTime(time, series) {
      this.transfData.xAxis.data = time;
      this.transfData.series[0].data = series;
      // let _this = this;
      // if (this.transfData.xAxis.data.length === 0) {
      //   for (let i = 0; i < time.length; i++) {
      //     this.transfData.xAxis.data.push(time[i]);
      //     this.transfData.series[0].data.push(series[i]);
      //   }
      // } else {
      //   let interval = intervalTime / (time.length + 1);
      //   let appendData = function () {
      //     let t = time.shift();
      //     let s = series.shift();
      //     _this.transfData.xAxis.data.shift();
      //     _this.transfData.xAxis.data.push(t);
      //     _this.transfData.series[0].data.shift();
      //     _this.transfData.series[0].data.push(s);
      //
      //     if (time.length > 0)
      //       setTimeout(appendData, interval);
      //   };
      //   appendData();
      // }
    },

    getReplicateTime(time, series) {
      this.replicateData.xAxis.data = time;
      this.replicateData.series[0].data = series;
      // let _this = this;
      // if (this.replicateData.xAxis.data.length === 0) {
      //   for (let i = 0; i < time.length; i++) {
      //     this.replicateData.xAxis.data.push(time[i]);
      //     this.replicateData.series[0].data.push(series[i]);
      //   }
      // } else {
      //   let interval = intervalTime / (time.length + 1);
      //   let appendData = function () {
      //     let t = time.shift();
      //     let s = series.shift();
      //     _this.replicateData.xAxis.data.shift();
      //     _this.replicateData.xAxis.data.push(t);
      //     _this.replicateData.series[0].data.shift();
      //     _this.replicateData.series[0].data.push(s);
      //
      //     if (time.length > 0)
      //       setTimeout(appendData, interval);
      //   };
      //   appendData();
      // }
    },
    // 跳转到数据校验页面
    handleGoDataVerifyhandleGoDataVerify() {
      this.editor.showDataVerify();
    }
  },

  destroyed() {
    // 清除定时器
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>
<style scoped lang="less">
.e-job-monitor {
  width: 100%;
  padding: 5px 12px 10px;
  box-sizing: border-box;
  position: relative;
  .e-job-monitor-btn {
    position: absolute;
    top: 15px;
    right: 15px;
  }
  .el-form-item {
    margin-bottom: 0;
  }

  .echartMain {
    height: 100%;

    .echartlist {
      position: relative;
      width: 100%;
      height: 330px;
      margin-top: 6px;
      border: 1px solid #dcdfe6;
      border-radius: 3px;
      box-shadow: 1.414px 1.414px 5px rgba(0, 0, 0, 0.1);

      .echartMain {
        width: 45% !important;
        height: calc(100% - 40px);
      }

      .floatLayer {
        position: absolute;
        left: 20px;
        top: 50px;

        span {
          display: inline-block;
          width: 76px;
          margin-bottom: 10px;
          padding: 3px 6px;
          font-size: 12px;
          background: #f00;
        }
      }

      .info {
        width: 55%;
        padding: 30px 10px 0 30px;
        box-sizing: border-box;

        .info-list {
          padding-bottom: 14px;

          .info-label {
            display: inline-block;
            width: 86px;
            font-size: 12px;
            color: #999;
          }

          .info-text {
            font-size: 12px;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
