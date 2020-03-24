<template>
  <div class="preview">
      <el-tabs type="border-card" class="tabBox">
        <el-tab-pane label="Test Results">
          <template>
             <el-select v-model="selectNode" :placeholder="$t('message.placeholderSelect')">
              <el-option
                v-for="item in nodeList"
                :key="item"
                :label="item"
                :value="item">
              </el-option>
            </el-select>
            <el-table border class="tableStyle" :data="itemList" v-loading="isloading">
              <el-table-column
                v-for="(head, key) in headers"
                :key="key" :prop="head"
                :label="head">
                  <template slot-scope="scope">
                    {{scope.row[head]}}
                  </template>
              </el-table-column>
            </el-table>
          </template>
        </el-tab-pane>
        <el-tab-pane label="Debug Log">
          <template>
             <el-input
              class="inputStyle"
              :placeholder="$t('message.search')"
              v-model="search">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <ul class="log">
              <li v-for="(item, i) in logList" :key="i" style="padding-bottom:10px;">
                <span>[<i style="font-weight: bold;" :class="{'redColor':item.level=='ERROR'}">{{item.level}}</i>]</span> &nbsp;
                <span>{{item.date}}</span>&nbsp;
                <span>[{{item.threadName}}]</span>&nbsp;
                <span>{{item.loggerName}}</span>&nbsp;-&nbsp;
                <span>{{item.message}}</span>
              </li>
          </ul>
          </template>
        </el-tab-pane>
      </el-tabs>
  </div>
</template>
<script>
import factory from '../../api/factory';
const dataFlows = factory('DataFlows');
const logsModel = factory('logs')
export default {
    name:"Preview",
    props:{
      flowsId:{
        type: String,
        required: true
      },
      stageId:{
        type: String,
        required: true
      }
    },
    data(){
        return{
          nodeList:[], //下拉
          selectNode:'',
          tableName: '',
          tableName_list: [],
          search: '',
          item: 1,
          logList:[],
          tableList:[],
          itemList:[],
          headers:[],
          activeTab: null,
          totalItems: 0,
          isloading: false,
          // timer: null, //定时器
          status: '',
          // 通知
          notify: {
              show: false,
              msg: '',
              datatype: 1
          },
        };
    },

    mounted () {
      this.selectNode = this.nodeList[0];
      this.timer()

    },

    watch: {
      selectNode(val) {
        this.selectNode = val;
        this.getDataTableApi();
      },
      search (val) {
        this.search = val
        this.getLogsData()
      },
    },

    methods: {
        async getDataTableApi(){
          let tableList = [];
          let headerList =[];

          await dataFlows.get([this.flowsId , 'debugData?stageId=' + this.stageId ]).then(res =>{
            if (res.statusText === "OK" || res.status === 200) {
              this.nodeList = Object.keys(res.data);   // 获取下拉项

              res.logs.forEach((item,index) =>{
                item.date = item.date? this.$moment(item.date).format('YYYY-MM-DD HH:mm:ss') : '';
                item.last_updated = item.last_updated? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';
              });
              this.logList = res.logs;  //日志数据

              for(let i in res.data) {  // 获取选择后对应的表格数据
                if(this.selectNode === i) {
                  tableList = res.data[i];
                }
              }
            }
          });

          tableList.forEach(item =>{  // 获取表头
            for(let key of Object.keys(item)) {
              headerList.push(key);
            }
          });
          headerList =  headerList.filter((element,index,self) => { //表头去重
            return self.indexOf(element) === index;
          });
          this.headers = headerList;
          this.itemList = tableList;
          console.log("表格数据",this.itemList,this.headers);
        },

        async getLogsData() {  //获取日志
          let paramas = {
            'filter[order]': 'date DESC',
            'filter[where][flowsId]': this.flowsId,
            'filter[where][stageId]': this.stageId
          }
          if (this.search) {
            paramas['filter[where][$text][search]'] = this.search
          }
          await logsModel.get(paramas).then(res=>{
            if (res.statusText === "OK" || res.status === 200) {
              res.data.forEach((item,index) =>{
                item.date = item.date? this.$moment(item.date).format('YYYY-MM-DD HH:mm:ss') : '';
                item.last_updated = item.last_updated? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';
              });
              this.logList = res.data;  //日志数据
            }
          })
        },

        async queryInterface(){
          this.flowsId = '5e202f38bbf0c348a88ff90b';
          let result = await dataFlows.get([this.flowsId]);
          if (result.status == '200' || result.status == '304' ) {
            if(result.data.status == 'stopped' || result.data.status == 'error') {
              this.status = result.data.status;
              clearInterval(this.timer);
            }
          }
        },

        // 这是一个定时器
        timer() {
          let that = this;
          return setInterval(() => {
            that.queryInterface()
            that.getDataTableApi();
            that.getLogsData();
          }, 5000);
        },
    },
    destroyed() {
      //清除定时器
      clearInterval(this.timer);
        // console.log("destroyed");
    }
}
</script>
<style scope lang="less">
    .preview {
      width: 100%;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
      overflow: hidden;
      .tabBox{
        height: 100%;
        overflow: hidden;
      }
      .metadata-tap-bar {
          background-color: #00000000;
          border-bottom: 1px solid #00000030;
      }
      .tableStyle {
        margin-top: 20px;
      }
      li {
          list-style: none;
      }
      .redColor {
          color: red;
      }
      .mar0 {
          height: 100%;
          margin-bottom:0 !important;
      }
      .inputStyle {
        width: 300px;
      }
      .log {
        width: 100%;
        display: inline-block;
        height: calc(100% - 103px);
        padding-top: 20px;
        overflow: auto;
      }
    }

</style>
<style lang="less">
    .preview {
      .el-tabs__content,.el-tab-pane,.card {
          height: 100%!important;
      }
      .slider-color {
          background-color: #449dff;
      }
      .mar0 {
          justify-content: flex-end;
          .input-group {
              padding-top: 15px;
          }
      }
      .tabs__bar {
          height: 60px;
      }
      .table__overflow {
          border: 1px solid #efefef;
      }
    }
</style>
