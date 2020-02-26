<template>
  <div class="cluster">
    <!-- 服务集群管理 -->
    <div class="cluster-box">
      <el-row class="fun-area" :gutter="10" >
        <el-col :span="12">
          <div class="demo-input-suffix">
            <span>名称搜索：</span>
            <el-input
              placeholder="请输入服务器名称"
              clearable
              v-model="sourch">
            </el-input>
          </div>
        </el-col>
        <el-col class="text-rf screen" :span="2" :offset="9">
          <el-button type="primary" @click="screenFn">筛选</el-button>
        </el-col>
      </el-row>

      <div class="content" v-if="list.length > 0">
        <el-row :gutter="20">
          <el-col class="list" :span="12" v-for="(item) in list" :key="item.ip">
            <div class="grid-content listBox">
              <div class="boxTop">
                <i class="circular" :class="item.status !== 'running'?'bgred':'bggreen'"></i>
                <h2 class="name">{{item.systemInfo.hostname}}</h2>
                <div class="uuid">{{item.systemInfo.uuid}}</div>
                <span>{{item.systemInfo.ip}}</span>
              </div>
              <div class="boxBottom">
                <el-row :gutter="20" class="data-list">
                  <el-col :span="6">
                    <span class="txt"><i class='icon iconfont iconhoutai'></i>管理后台</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.management.status == 'stopped'?'red':'green'">{{item.management.status}}</span>
                  </el-col>
                  <el-col :span="14">
                    <div class="btn fr">
                      <el-button
                      :type="item.management.status == 'stopped'?'primary':'info'"
                      :disabled="item.management.status == 'stopped'?false:true"
                      @click="operationFn(item,item.management.status,'management','start')">启动</el-button>
                      <el-button
                      :type="item.management.status == 'running'?'danger':'info'"
                      :disabled="item.management.status == 'running'?false:true"
                      @click="operationFn(item,item.management.status,'management','stop')">关闭</el-button>
                      <el-button type="text"
                      :disabled="item.management.status == 'running'?false:true"
                      @click="operationFn(item,item.management.status,'management','restart')">重启</el-button>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="data-list">
                  <el-col :span="6">
                    <span class="txt"><i class="icon iconfont icontongbu"></i>同步治理</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.engine.status == 'stopped'?'red':'green'">{{item.engine.status}}</span>
                  </el-col>
                  <el-col :span="14">
                    <div class="btn fr">
                      <el-button
                      :type="item.engine.status == 'stopped'?'primary':'info'"
                      :disabled="item.engine.status == 'stopped'?false:true"
                      @click="operationFn(item,item.engine.status,'engine','start')">启动</el-button>
                      <el-button
                      :type="item.engine.status == 'running'?'danger':'info'"
                      :disabled="item.engine.status == 'running'?false:true"
                      @click="operationFn(item,item.engine.status,'engine','stop')">关闭</el-button>
                      <el-button type="text"
                      :disabled="item.engine.status == 'running'?false:true"
                      @click="operationFn(item,item.engine.status,'engine','restart')">重启</el-button>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="data-list">
                  <el-col :span="6">
                    <span class="txt"><i class="icon iconfont iconAPI"></i>API SEVER</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.apiServer.status == 'stopped'?'red':'green'">{{item.apiServer.status}}</span>
                  </el-col>
                  <el-col :span="14">
                    <div class="btn fr">
                      <el-button
                      :type="item.apiServer.status == 'stopped'?'primary':'info'"
                      :disabled="item.apiServer.status == 'stopped'?false:true"
                      @click="operationFn(item,item.apiServer.status,'apiServer','start')">启动</el-button>
                      <el-button
                      :type="item.apiServer.status == 'running'?'danger':'info'"
                      :disabled="item.apiServer.status == 'running'?false:true"
                       @click="operationFn(item,item.apiServer.status,'apiServer','stop')">关闭</el-button>
                      <el-button type="text"
                      :disabled="item.apiServer.status == 'running'?false:true"
                       @click="operationFn(item,item.apiServer.status,'apiServer','restart')">重启</el-button>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

       <div v-else class="noText">
        <i class="iconfont icon iconkongyemian_zanwuwendang" style="font-size: 174px"></i>
      </div>
    </div>

  </div>
</template>
<script>
import publicApi from "../../api/publicApi";
export default {
  data () {
    return {
      activeIndex: "1",
      sourch: '',
      serveStatus:'',
      isStop: false,
      engineState: '',
      managementState: '',
      apiServerState: '',
      list:[],
      serveList:[
        {label:"正常",value:'running'},
        {label:"停止",value:'stop'},
      ]
    }
  },
  created () {
    this.timer();
    this.getDataApi();
  },

  methods: {
    //重启---关闭---启动
    async operationFn (item,status,server,opt) {
      let flag = false;
      if(status == "running" && (opt == "stop" || opt == "restart")) {
        flag = true;
      } else if(status == "stopped" && opt == "start") {
        flag = true;
      }

      if(flag) {
        let  data = {
          uuid: item.uuid,
          server: server,
          operation: opt
        };
        let api = 'http://52.82.13.216:3031/api/clusterStates/updataStatus';
        await publicApi.post(api,data).then(res=>{
          if(res.status == 200) {
            this.getDataApi();
          }
        })
      }
    },
    //筛选
    screenFn() {
      let params = {
        'filter[where][or][0][systemInfo.hostname]': this.sourch,
        'filter[where][or][1][systemInfo.ip]': this.sourch,
      };
      if (this.sourch) {
        this.getDataApi(params);
      } else {
        this.getDataApi();
      }
      this.sourch = '';
    },

    // 这是一个定时器
    timer() {
      let that = this;
      return setInterval(() => {
        that.getDataApi();
      }, 5000);
    },

    // 获取数据
    getDataApi (params) {
      let api = 'http://52.82.13.216:3031/api/clusterStates';
      publicApi.get(api,params).then(res => {
        if (res.statusText === "OK" || res.status === 200) {
          if (res.data) {
            this.list = res.data;
          }
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.cluster {
  width: 100%;
  height: 100%;
  font-size: 12px;
  background-color: #f8f6fa;
  .cluster-box {
    height: 100%;
    background-color: #fff;
  }

  .content {
    width: 100%;
    height: calc(100% - 60px);
    padding: 10px;
    box-sizing: border-box;
    .list {
      padding: 5px 0 10px 0;
      overflow: hidden;
      .listBox {
        position: relative;
        padding: 0 25px 10px 50px;
        background-color: #fff;
        box-shadow: 0.707px 0.707px 3px rgba(0,0,0,0.13);
        .boxTop {
          padding-top: 15px;
          .circular {
            display: inline-block;
            position: absolute;
            left: 20px;
            top: 18px;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background-color: #f00;
          }
          .name {
            margin: 0;
            font-size: 18px;
            color: #48b6e2;
          }
          .uuid {
            padding: 5px 0;
            font-size: 12px;
          }
          span {
            font-size: 14px;
            color: #555;
          }
        }
        .boxBottom {
          padding-top: 10px;
          .data-list{
            width: 100%;
            height: 30px;
            margin-bottom: 5px;
            line-height: 30px;
            background-color: #f0fafe;
            list-style: none;
            .txt {
              display: inline-block;
              width: 120px;
              padding-left: 15px;
              font-size: 12px;
              color: #000;
              i {
                padding-right: 5px;
              }
            }

            .btn {
              display: inline;
            }
            .popover-tip {
              display: inline-block;
              color: #f00;
              transform: rotate(180deg);
              cursor: pointer;
            }
          }

        }
      }
    }
  }
  .screen {
    padding-right: 15px;
  }
}
</style>
<style lang="less">
.cluster {
  width: 100%;
  .content {
    padding: 10px;
    width: 100%;
    height: 100%;
    .el-row {
      margin-bottom: 20px;
    }
    .boxBottom {
      .el-button {
        padding: 4px 10px;
        font-size: 12px;
      }
    }
  }
}

.popover-box {
  color: #333;
  h5 {
    margin: 0;
    padding-bottom: 5px;
  }
  div {
    font-size: 12px;
  }
}
</style>
<style lang="less" scoped>
.red {
  color: #ee5353;
}
.bgred {
  background-color: #ee5353!important;
}
.green {
  color: #48b6e2;
}
.bggreen {
  background-color: #71c179!important;
}
.cluster {
  .cluster_box {
    height: 100%;

  }
  .noText {
    display: flex;
    height: calc(100% - 60px);
    align-items: center;
    justify-content: center;
    color: #1976D2;
    font-size: 16px;
    background-color: #fff;
  }
}
</style>
