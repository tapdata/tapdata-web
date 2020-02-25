<template>
  <div class="cluster">
    <!-- 服务集群管理 -->
    <div class="cluster_box" v-if="list.length > 0">
      <el-row class="fun_area">
        <el-col :span="12">
          <div class="demo-input-suffix">
            名称搜索：
            <el-input
              placeholder="请输入内容"
              clearable
              v-model="sourch">
            </el-input>
          </div>
        </el-col>
        <el-col :span="12" class="text-rf screen">
          <el-button type="primary" @click="screenFn">筛选</el-button>
        </el-col>
        <!-- <el-col :span="8" class="status">
          <span>服务器状态:</span>
          <span class="statusTxt" style="padding-right: 20px;">运行中</span>
          <span class="statusTxt">已停止</span>
        </el-col> -->
      </el-row>

      <div class="content">
        <el-row :gutter="20">
          <el-col class="list" :span="12" v-for="(item) in list" :key="item.ip">
            <div class="grid-content listBox">
              <div class="boxTop">
                <i class="circular" :class="item.status !== 'running'?'bgred':'bggreen'"></i>
                <h2 class="name">{{item.systemInfo.hostname}}</h2>
                <span>{{item.systemInfo.ip}}</span>
              </div>
              <div class="boxBottom">
                <ul>
                  <li>
                    <span class="txt"><i class='icon iconfont iconhoutai'></i>管理后台</span>
                    <span :class="item.engine.status == 'stop'?'red':'green'">{{item.engine.status}}</span>
                    <div class="btn fr">
                      <el-button type="primary" @click="startUp(item,'management')">启动</el-button>
                      <el-button type="info" @click="Close(item,'management')">关闭</el-button>
                      <el-button type="text" @click="restart(item,'management')">重启</el-button>
                    </div>
                  </li>
                  <li>
                    <span class="txt"><i class="icon iconfont icontongbu"></i>同步治理</span>
                    <span :class="item.engine.status == 'stop'?'red':'green'">{{item.management.status}}</span>
                    <div class="btn fr">
                      <el-button type="primary" @click="startUp(item,'engine')">启动</el-button>
                      <el-button type="info" @click="Close(item,'engine')">关闭</el-button>
                      <el-button type="text" @click="restart(item,'engine')">重启</el-button>
                    </div>
                  </li>
                  <li>
                    <span class="txt"><i class="icon iconfont iconAPI"></i>API SEVER</span>
                    <span :class="item.engine.status == 'stop'?'red':'green'">{{item.apiServer.status}}</span>
                    <div class="btn fr">
                      <el-button type="primary" @click="startUp(item,'apiServer')">启动</el-button>
                      <el-button type="info" @click="Close(item,'apiServer')">关闭</el-button>
                      <el-button type="text" @click="restart(item,'apiServer')">重启</el-button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-else class="noText">
      <i class="iconfont icon iconkongyemian_zanwuwendang" style="font-size: 174px"></i>
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
      isStop: false,
      list:[
        // {
        //   "_id": "ObjectId('5e4282a309316bd5dc66ae70')",
        //   "systemInfo": {
        //     "hostname": "localhost.localdomain",
        //     "uuid": "b50a9140-ab13-4cb5-8e70-50b3dcf196fd",
        //     "ip": "192.168.1.104",
        //     "time": 1581508796992
        //   },
        //   "reportInterval": "2000",
        //   "engine": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "management": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "apiServer": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "uuid": "b50a9140-ab13-4cb5-8e70-50b3dcf196fd",
        //   "status": "running",
        //   "insertTime": "ISODate('2020-02-12T11:59:56.672Z')",
        //   "ttl": "ISODate('2020-02-12T12:00:00.672Z')",
        //   "last_updated": "ISODate('2020-02-12T11:59:56.679Z')"
        // },{
        //   "_id": "ObjectId('5e4282a309316bd5dc66ae70')",
        //   "systemInfo": {
        //     "hostname": "localhost.localdomain",
        //     "uuid": "b50a9140-ab13-4cb5-8e70-50b3dcf196fd",
        //     "ip": "192.168.1.104",
        //     "time": 1581508796992
        //   },
        //   "reportInterval": "2000",
        //   "engine": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "management": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "apiServer": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "uuid": "b50a9140-ab13-4cb5-8e70-50b3dcf196fd",
        //   "status": "running",
        //   "insertTime": "ISODate('2020-02-12T11:59:56.672Z')",
        //   "ttl": "ISODate('2020-02-12T12:00:00.672Z')",
        //   "last_updated": "ISODate('2020-02-12T11:59:56.679Z')"
        // },{
        //   "_id": "ObjectId('5e4282a309316bd5dc66ae70')",
        //   "systemInfo": {
        //     "hostname": "localhost.localdomain",
        //     "uuid": "b50a9140-ab13-4cb5-8e70-50b3dcf196fd",
        //     "ip": "192.168.1.104",
        //     "time": 1581508796992
        //   },
        //   "reportInterval": "2000",
        //   "engine": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "management": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "apiServer": {
        //     "processID": "",
        //     "status": "stop"
        //   },
        //   "uuid": "b50a9140-ab13-4cb5-8e70-50b3dcf196fd",
        //   "status": "running",
        //   "insertTime": "ISODate('2020-02-12T11:59:56.672Z')",
        //   "ttl": "ISODate('2020-02-12T12:00:00.672Z')",
        //   "last_updated": "ISODate('2020-02-12T11:59:56.679Z')"
        // }
      ]
    };
  },
  created () {
    this.timer();
    this.getDataApi();
  },

  methods: {
    //启动
    startUp(e,server) {
      let  data = {
        uuid: e.uuid,
        server: server,
        operation: 'start'
      };
      console.log(e,data);
      this.operationFn(data);
    },
    //关闭
    Close() {

    },
    //重启
    restart() {

    },

    //操作接口方法
    async operationFn (data) {
      let api = '/clusterStates/updataStatus';
      await publicApi.post(api,data);
    },
    //筛选
    screenFn() {
      let params;
      if (this.sourch) {
        params = {
          'filter[where][or][0][systemInfo.hostname]': this.sourch,
          'filter[where][or][1][systemInfo.ip]': this.sourch,
        };
      }
      this.getDataApi(params);
    },

    // 这是一个定时器
    timer() {
      return setInterval(() => {
        // that.getDataApi()
      }, 5000);
    },

    // 获取数据
    getDataApi (params) {
      let api = '/api/clusterStates';
      if (this.sourch) {
        params = {
          'filter[where][or][0][systemInfo.hostname]': this.sourch,
          'filter[where][or][1][systemInfo.ip]': this.sourch,
        };
      }
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
  .cluster_box {
    background-color: #fff;
  }
  .fun_area {
    .status {
      .statusTxt {
        padding: 0 20px 0 10px;
        cursor: pointer;
      }
    }
  }
  .content {
    width: 100%;
    height: calc(100% - 60px);
    padding: 10px;
    box-sizing: border-box;
    .list {
      padding-bottom: 10px;
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
          span {
            font-size: 14px;
            color: #555;
          }
        }
        .boxBottom {
          padding-top: 10px;
          ul {
            padding: 0;
            li {
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
    height: 100%;
    align-items: center;
    justify-content: center;
    color: #1976D2;
    font-size: 16px;
    background-color: #fff;
  }
}
</style>
