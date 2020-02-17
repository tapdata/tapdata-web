<template>
  <div class="cluster">
    <el-row class="fun_area">
      <el-col :span="8">
        <div class="demo-input-suffix">
          名称搜索：
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="sourch">
          </el-input>
        </div>
      </el-col>
      <!-- <el-col :span="8" class="status">
        <span>服务器状态:</span>
        <span class="statusTxt" style="padding-right: 20px;">运行中</span>
        <span class="statusTxt">已停止</span>
      </el-col> -->
    </el-row>

    <div class="content">
      <el-row :gutter="20">
        <el-col class="list" :span="12" v-for="(item,index) in list" :key="item.ip">
          <div class="grid-content listBox">
            <div class="boxTop">
              <i class="circular" :class="item.status !== 'running'?'bgred':'bggreen'"></i>
              <h2 class="name">{{item.systemInfo.hostname}}</h2>
              <span>{{item.systemInfo.ip}}</span>
            </div>
            <div class="boxBottom">
              <ul>
                <li>
                  <span class="txt"><i class='icon-houtai'></i>管理后台</span>
                  <span :class="item.engine.status == 'stop'?'red':'green'">{{item.engine.status}}</span>
                </li>
                <li>
                  <span class="txt"><i class="icon-tongbu"></i>同步治理</span>
                  <span :class="item.engine.status == 'stop'?'red':'green'">{{item.management.status}}</span>
                </li>
                <li>
                  <span class="txt"><i class='icon-API'></i>API SEVER</span>
                  <span :class="item.engine.status == 'stop'?'red':'green'">{{item.apiServer.status}}</span>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
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
      list:[]
    }
  },
  created(){
    this.timer()
    this.getDataApi()
  },
  watch: {
    sourch(data) {
      let params;
      if(data) {
        params = {
          'filter[where][or][0][systemInfo.hostname]': data,
          'filter[where][or][1][systemInfo.ip]': data,
        }
      }
      this.getDataApi(params)
    }
  },
  methods: {
    // 这是一个定时器
    timer() {
      let that = this
      return setInterval(()=>{
        that.getDataApi()
      },5000)
    },
    getDataApi(params) {
      let api = '/api/clusterStates'
      if(this.sourch) {
        params = {
          'filter[where][or][0][systemInfo.hostname]': this.sourch,
          'filter[where][or][1][systemInfo.ip]': this.sourch,
        }
      }
      publicApi.get(api,params).then(res => {
        if(res.statusText == "OK" || res.status == 200) {
          if(res.data) {
            this.list = res.data
          }
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.cluster {
  width: 100%;
  height: 100%;
  font-size: 12px;
  background-color: #f8f6fa;
  .fun_area {
    .status {
      .statusTxt {
        padding: 0 20px 0 10px;
        cursor: pointer;
      }
    }
  }
  .content {
    padding: 10px;
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
              }
            }
          }
        }
      }
    }
  }
  .icon-houtai {
    // display: inline-block;
    // width: 20px;
    // height: 20px;
    // background-image: url(../../../static/image/tongbu.png);
  }
}
</style>
<style lang="less">
.cluster {
  width: 100%;
  .content {
    padding: 10px;
    .el-row {
      margin-bottom: 20px;
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
</style>
