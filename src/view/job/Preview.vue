<template>
  <div class="preview" ref="boxHeight">
    <el-select v-model="selectNode" :placeholder="$t('message.placeholderSelect')">
      <el-option
        v-for="item in nodeList"
        :key="item"
        :label="item"
        :value="item">
      </el-option>
    </el-select>
    <el-table border fit :height="tableHeight" class="tableStyle" :data="itemList" v-loading="isloading">
      <el-table-column
        minWidth="120"
        v-for="(head, key) in headers"
        :key="key"
        :prop="head"
        :label="head">
        <template slot-scope="scope">
          {{scope.row[head]}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  import factory from '../../api/factory';

  const DataFlowsDebugs = factory('DataFlowsDebugs');
  export default {
    name: "Preview",
    props: {
      dataFlow: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        tableHeight: '',
        nodeList: [], //下拉
        selectNode: '',
        tableName: '',
        tableName_list: [],

        item: 1,
        tableList: [],
        itemList: [],
        headers: [],
        activeTab: null,
        totalItems: 0,
        isloading: false,
        timer: null, //定时器
        status: '',
        stageId: ''
      };
    },

    mounted() {
      this.stageId = this.dataFlow.stages[0].id;
      this.getSelectData();
      this.$nextTick(() => {
        this.tableHeight = this.$refs.boxHeight.clientHeight - 90;
      });
      // 这是一个定时器
      this.timer = setInterval(() => {
        this.getDataTableApi();
      }, 10000);

      this.$on("selected:stage", (selectStage) => {
        this.stageId = selectStage.id;
        this.getSelectData();
      });

      this.$bus.on("currentStageId",(id) => {  
        if (id !== "all") {
          this.stageId = id;
        }
        this.getSelectData()
      })
    },

    watch: {
      selectNode(val) {
        this.selectNode = val;
        this.getDataTableApi();
      }
    },

    methods: {
      //获取下拉数据
      async getSelectData() {
        let params = {
          'dataFlowId': this.dataFlow.id,
          'stageId': this.stageId
        };
        await DataFlowsDebugs.getTables(params).then(res => {
          if (res.status === 200 && res.statusText === "OK") {
            if (res.data && res.data.data.length > 0) {
              this.nodeList = res.data.data;
              if (this.nodeList.length > 0) {
                this.selectNode = this.nodeList[0];
              }
            }
          }
        });
      },

      //获取表格数据
      async getDataTableApi() {
        let headerList = [];
        let params = {
          'filter[where][__tapd8.dataFlowId][regexp]': `^${this.dataFlow.id}$`,
          'filter[where][__tapd8.stageId]': this.stageId,
          'filter[where][__tapd8.tableName]':this.selectNode,
        };

        await DataFlowsDebugs.get(params).then(res => {
          if (res.statusText === "OK" || res.status === 200) {
            // this.nodeList = Object.keys(res.data);   // 获取下拉项
            if (res.data && res.data.length > 0) {
              // for(let i in res.data) {  // 获取选择后对应的表格数据
              //   if(this.selectNode === i) {
              //     tableList = res.data[i];
              //   }
              // }
              res.data.forEach(item => {
                delete item.id;
                delete item.__tapd8;
                item.last_updated = item.last_updated ? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';

             });
              res.data.forEach(item => {  // 获取表头
                for (let key of Object.keys(item)) {
                  headerList.push(key);
                }
              });
              headerList = headerList.filter((element, index, self) => { //表头去重
                return self.indexOf(element) === index;
              });
              this.headers = headerList;
              this.itemList = res.data;
            } else {
              this.itemList = [];
            }
          }
        });
      }
    },

    destroyed() {
      //清除定时器
      clearInterval(this.timer);
      this.timer = null;
    }
  };
</script>
<style scope lang="less">
  .preview {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;

    // .tabBox {
    // 	height: 100%;
    // 	overflow: hidden;
    // }

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

    .mar0 {
      height: 100%;
      margin-bottom: 0 !important;
    }
  }

</style>
<style lang="less">
  .preview {
    .el-tab-pane, .card {
      height: 100% !important;
    }

    .el-tabs__content {
      height: calc(100% - 40px) !important;
      box-sizing: border-box;
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
