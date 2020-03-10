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
              @keyup.enter ="screenFn"
              v-model="sourch">
            </el-input>
          </div>
        </el-col>
        <el-col class="text-rf screen" :span="2" :offset="9">
          <el-button type="primary" @click="screenFn">筛选</el-button>
        </el-col>
      </el-row>

      <div class="content" v-if="waterfallData.length > 0">
        <el-row :gutter="20" class="waterfall" >
          <el-col class="list" :md="12" :sm="24" v-for="(element,i) in waterfallData" :key="i" >
            <div class="grid-content listBox" v-for="(item) in element" :key="item.ip">
              <div class="boxTop">
                <div class="fl" style="width: 60%;">
                  <i class="circular" :class="item.status !== 'running'?'bgred':'bggreen'"></i>
                  <h2 class="name">{{item.systemInfo.hostname}}</h2>
                  <span>{{item.id}}</span>
                  <div class="uuid">{{item.systemInfo.uuid}}</div>
                  <span>{{item.systemInfo.ip}}</span>
                </div>
                <div class="fr" style="width: 40%;">
                  <el-button size="mini" class="fr addBtn" @click="addServeFn(item)">添加服务监控</el-button>
                </div>
                <!--  -->
              </div>
              <div class="boxBottom">
                <el-row :gutter="20" class="data-list">
                  <el-col :span="8">
                    <span class="txt"><i class='icon iconfont iconhoutai'></i>管理后台</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.management.status == 'stopped'?'red':'green'">{{item.management.status}}</span>
                  </el-col>
                  <el-col :span="12">
                    <div class="btn fr">
                      <el-button
                      :type="item.management.status == 'stopped'?'primary':'info'"
                      :disabled="item.management.status == 'stopped'?false:true"
                      @click="startFn(item,item.management.status,'management','start')">启动</el-button>
                      <el-button
                      :type="item.management.status == 'running'?'danger':'info'"
                      :disabled="item.management.status == 'running'?false:true"
                      @click="closeFn(item,item.management.status,'management','stop')">关闭</el-button>
                      <el-button type="text"
                      :disabled="item.management.status == 'running'?false:true"
                      @click="restartFn(item,item.management.status,'management','restart')">重启</el-button>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="data-list">
                  <el-col :span="8">
                    <span class="txt"><i class="icon iconfont icontongbu"></i>同步治理</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.engine.status == 'stopped'?'red':'green'">{{item.engine.status}}</span>
                  </el-col>
                  <el-col :span="12">
                    <div class="btn fr">
                      <el-button
                      :type="item.engine.status == 'stopped'?'primary':'info'"
                      :disabled="item.engine.status == 'stopped'?false:true"
                      @click="startFn(item,item.engine.status,'engine')">启动</el-button>
                      <el-button
                      :type="item.engine.status == 'running'?'danger':'info'"
                      :disabled="item.engine.status == 'running'?false:true"
                      @click="closeFn(item,item.engine.status,'engine')">关闭</el-button>
                      <el-button type="text"
                      :disabled="item.engine.status == 'running'?false:true"
                      @click="restartFn(item,item.engine.status,'engine')">重启</el-button>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="data-list">
                  <el-col :span="8">
                    <span class="txt"><i class="icon iconfont iconAPI"></i>API SEVER</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.apiServer.status == 'stopped'?'red':'green'">{{item.apiServer.status}}</span>
                  </el-col>
                  <el-col :span="12">
                    <div class="btn fr">
                      <el-button
                      :type="item.apiServer.status == 'stopped'?'primary':'info'"
                      :disabled="item.apiServer.status == 'stopped'?false:true"
                      @click="startFn(item,item.apiServer.status,'apiServer')">启动</el-button>
                      <el-button
                      :type="item.apiServer.status == 'running'?'danger':'info'"
                      :disabled="item.apiServer.status == 'running'?false:true"
                       @click="closeFn(item,item.apiServer.status,'apiServer')">关闭</el-button>
                      <el-button type="text"
                      :disabled="item.apiServer.status == 'running'?false:true"
                       @click="restartFn(item,item.apiServer.status,'apiServer')">重启</el-button>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="data-list" v-for="(child) in item.customMonitorStatus" :key="child.id">
                  <el-col :span="7" :offset="1" >
                    <span class="txt">{{child.name}}</span>
                  </el-col>
                  <el-col :span="4">
                    <span :class="item.apiServer.status == 'stopped'?'red':'green'">{{child.status}}</span>
                  </el-col>
                  <el-col :span="7" :offset="5">
                    <div class="btn fr">
                      <el-button type="text"
                      @click="delServe(child)">删除</el-button>
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
    <el-dialog title="添加服务监控" custom-class="serverDialog" :visible.sync="dialogForm" :append-to-body="true" :lock-scroll="false" width="600px">
      <addServe :data="currentData" ref="ruleForm"></addServe>
      <div slot="footer" class="dialog-footer">
        <el-button size="small"  @click="dialogForm = false">取 消</el-button>
        <el-button size="small"  type="primary" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import vueWaterfallEasy from 'vue-waterfall-easy';
import addServe from './component/addServe';
import factory from '../../api/factory';
const cluster = factory('cluster');
export default {
  name: "clusterManagement",
  components: {addServe,vueWaterfallEasy},
  data () {
    return {
      waterfallData: [],
      currentData: null,
      dialogForm: false,
      activeIndex: "1",
      sourch: '',
      serveStatus:'',
      isStop: false,
      engineState: '',
      managementState: '',
      apiServerState: '',
      list:[]
    };
  },
  created () {
    this.timer();
    this.getDataApi();
  },

  methods: {
    //提交
    async submitForm() {
      let getFrom = this.$refs.ruleForm.ruleForm;
      let data = {
        uuid: this.currentData.uuid,
        name: getFrom.name,
        command: getFrom.command,
        arguments: getFrom.arguments
      };
      await cluster.addMonitor(data).then(res => {
        if(res.statusText === "OK" || res.status === 200) {
          this.dialogForm = false;
          this.getDataApi();
          this.$message.success('保存成功');
        } else{
          this.$message.error('保存失败');
        }
        this.dialogForm = false;
      });
    },
    //删除
    delServe(data) {
      let params = {
        uuid: data.uuid,
        id: data.id
      };
      this.$confirm('是否删除？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        cluster.removeMonitor(params).then(res => {
          if (res.statusText === "OK" || res.status === 200) {
            this.getDataApi();
            this.$message.success('删除成功');
          } else {
            this.$message.error('删除失败');
          }
        });
      });
    },
    addServeFn(item) {
      this.currentData = item;
      this.dialogForm = true;
    },
    //启动
    startFn(item,status,server) {
      if (status === "stopped") {
        let data = {
          uuid: item.uuid,
          server: server,
          operation: 'start'
        };
        this.operationFn(data);
      }
    },
    //关闭
    closeFn(item,status,server){
      let name;
      if(server ==="apiServer") {
        name = 'API SEVER';
      } else if(server ==="engine") {
        name = '同步治理';
      } else {
        name = '管理后台';
      }
      if (status === "running") {
        let data = {
          uuid: item.uuid,
          server: server,
          operation: 'stop'
        };
        this.$confirm('确认 "'+name+'" 关闭服务？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.operationFn(data);
        });
      }
    },
    restartFn(item,status,server) {
      let name;
      if(server ==="apiServer") {
        name = 'API SEVER';
      } else if(server ==="engine") {
        name = '同步治理';
      } else {
        name = '管理后台';
      }
      if (status === "running") {
        let data = {
          uuid: item.uuid,
          server: server,
          operation: 'restart'
        };
        this.$confirm('确认 "'+name+'" 重启服务？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.operationFn(data);
        });
      }
    },
    //重启---关闭---启动
    async operationFn(data) {
      await cluster.post(data).then(res=>{
        if(res.status === 200) {
          this.getDataApi();
        }
      });
    },
    //筛选
    screenFn() {
      let params = {
        'filter[where][or][0][systemInfo.hostname][like]': this.sourch,
        'filter[where][or][1][systemInfo.ip][like]': this.sourch,
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
      cluster.get(params).then(res => {
        if (res.statusText === "OK" || res.status === 200) {
          if (res.data) {
            this.list = res.data;
            let [...waterfallData]  = this.list;
            let [...newWaterfallData]= [[],[]];
            waterfallData.forEach((item,index)=>{
              if(index%2) {
                newWaterfallData[1].push(item);
              } else {
                newWaterfallData[0].push(item);
              }
            });
            this.waterfallData = newWaterfallData;
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
    overflow-y: auto;
    .list {
      padding: 5px 0 10px 0;
      overflow: hidden;
      box-sizing: border-box;
      .listBox {
        position: relative;
        margin-bottom: 20px;
        padding: 0 25px 10px 50px;
        background-color: #fff;
        box-shadow: 0.707px 0.707px 3px rgba(0,0,0,0.13);
        .boxTop {
          padding-top: 15px;
          overflow: hidden;
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
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          .uuid {
            padding: 5px 0;
            font-size: 12px;
          }
          span {
            font-size: 14px;
            color: #555;
          }
          .addBtn {
            span {
              font-size: 12px;
            }
          }
        }
        .boxTop {
          // .el-button {
          //   span { font-size: 12px;}
          // }
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
              text-overflow: ellipsis;
              white-space: nowrap;
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

.serverDialog {
  .el-dialog__body {
    padding: 30px 50px 0 20px;
  }
  .el-dialog__footer {
     padding: 10px 50px 20px;
  }
}
</style>

