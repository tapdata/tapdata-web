<template>
<div class="journal" ref="boxHeight">
  <el-row class="fun-area" :gutter="20">
    <el-form ref="form" :model="form" label-width="80px">
      <el-col :span="8">
        <el-form-item label="选择时间">
          <el-col :span="11">
            <el-date-picker v-model="form.startDate" type="date" :picker-options="pickerStartDate" style="width: 100%;" placeholder="选择日期"></el-date-picker>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="11">
            <el-date-picker v-model="form.closeDate" type="date" :picker-options="pickerCloseDate" style="width: 100%;" placeholder="选择日期"></el-date-picker>
          </el-col>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="服务器">
          <el-select v-model="form.ip">
            <el-option v-for="item in ipList" :label="item.value" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="服务类型">
          <el-select v-model="form.serverType">
            <el-option v-for="item in serverTypeList" :label="item.lable" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="级别">
          <el-select v-model="form.level" >
            <el-option v-for="item in levelList" :label="item.lable" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4" class="center">
          <el-button type="primary" @click="screenFn">筛选</el-button>
      </el-col>
    </el-form>
  </el-row>
  <div class="content" ref="contentHeight">
    <el-table :data="tableData" class="tableName" border :height="tableHeight" style="width: 100%">
      <el-table-column prop="data" label="时间" width="260"></el-table-column>
      <el-table-column prop="hostname" label="主机名" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="ip" label="ip地址" width="150"></el-table-column>
      <el-table-column prop="uuid" label="唯一编码" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="threadName" label="服类类型" width="100"></el-table-column>
      <el-table-column prop="level" label="级别" width="100">
        <template slot-scope="scope">
          <span
            :class="scope.row.level === 'ERROR' ? 'red' : ''"
            disable-transitions>{{scope.row.level}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="日志信息" :show-overflow-tooltip="true"></el-table-column>
    </el-table>
    <el-pagination background
      class="pagination-bar"
			layout="total, prev, pager, next,sizes"
			:page-sizes="[10, 20, 30, 50,100]"
			:page-size="pagesize"
			:total="totalNum"
			@current-change="handleCurrentChange"
			@size-change="handleSizeChange">
		</el-pagination>
  </div>
</div>
</template>
<script>
	import factory from '../../api/factory';
	const logs = factory('logs');
	const cluster = factory('cluster');
export default {
  data(){
    return {
      pagesize: 30,
      currpage: 0,
      totalNum: 0,
      tableHeight: 100,
      form: {
        startDate: null,
        closeDate: null,
        level: '',
        serverType: '',
        ip: ''
      },
      tableData: [],
      levelList: [
        {lable: 'INFO', value: 'INFO'},
        {lable: 'WARN', value: 'WARN'},
        {lable: 'ERROR', value: 'ERROR'},
      ],
      serverTypeList:[
        {lable: 'engine', value: 'engine'},
        {lable: 'management', value: 'management'},
        {lable: 'apiServer', value: 'apiServer'},
        {lable: 'tapdataAgent', value: 'tapdataAgent'},
      ],
      ipList: [],
      pickerStartDate: {
        disabledDate: time => {
          if (this.form.closeDate) {
            return time.getTime() > this.form.closeDate;
          }
        }
      },
      pickerCloseDate: {
        disabledDate: time => {
          return time.getTime() < this.form.startDate;
        }
      }
    };
  },

  created () {

  },
  mounted(){
    let params = {
      'filter[limit]': this.pagesize,
      'filter[skip]': this.currpage,
      'filter[where][loggerName]': 'tapdataAgent',
    };
    setTimeout(() => this.getDataApi(params),1000);
    this.getIpFn();
  },
  methods: {
    //获取ip
    getIpFn() {
      // let api = 'http://52.82.13.216:3031/api/clusterStates'
		cluster.get().then(res => {
        if (res.statusText === "OK") {
          if (res.data) {
            res.data.forEach(item => {
              this.ipList.push({value:item.systemInfo.ip});
            });
          }
        }
      });
    },
    //筛选
    screenFn() {
      let params = {
        'filter[where][date][lt]': this.form.closeDate,
        'filter[where][date][gt]': this.form.startDate,
        'filter[where][level]': this.form.level,
        'filter[where][threadName]': this.form.serverType,
        'filter[where][ip]': this.form.ip,
        'filter[where][loggerName]': 'tapdataAgent',
        'filter[limit]': this.pagesize,
        'filter[skip]': this.currpage
      };
      let obj={};
      for(let i in params){
        if(params[i]){
          obj[i] = params[i];
        }
      }
      this.getDataApi(obj);
    },
    //获取数据
    async getDataApi (params) {
      logs.get(params).then(res => {
        if (res.statusText === "OK" || res.status === 200) {
          if (res.data) {
            this.tableData = res.data;
          }
        }
      });
      let where = {
        'where[loggerName]': 'tapdataAgent',
      };
      let result = await logs.count(where);
      if (result.statusText === 'OK') {
        this.totalNum = result.data.count;
      }

      //获取表格高度
    let contentHeight= this.$refs.contentHeight.offsetHeight; //100
    this.tableHeight = (contentHeight - 60);
    },
    handleCurrentChange(cpage) {
      let params = {
        'filter[limit]': this.pagesize,
        'filter[skip]': cpage,
        'filter[where][loggerName]': 'tapdataAgent',
      };
      this.getDataApi(params);
    },
    handleSizeChange(psize) {
      let params = {
        'filter[limit]': psize,
        'filter[skip]': this.currpage,
        'filter[where][loggerName]': 'tapdataAgent',
      };
      this.getDataApi(params);
    }
  }
};
</script>
<style lang="less">
.journal {
  width: 100%;
  height: 100%;
  .line {
    text-align: center;
  }
  .el-form {
    overflow: hidden;
    .el-col {
      height: 100%;
    }
  }
  .el-form-item {
    height: 60px;
    line-height: 60px;
    margin-bottom: 0;
    .el-form-item__label {
      height: 60px;
      line-height: 60px;
      .el-form-item__content {
        line-height: 60px!important;
      }
    }
    .el-input {
      .el-input__prefix {
        // display: none!important;
        // opacity: 0;
        .el-icon-date {
          display: none;
        }
      }
      .el-input__inner {
        padding-left: 5px;
      }
    }
  }
  .tableName {
    tr th {
      font-weight: normal;
    }
    tr th,tr td {
      padding: 6px 0;
    }
  }
  .el-pagination {
    // position: absolute;
    // bottom: 0;
    width: 100%;
    padding: 10px 50px;
    box-sizing: border-box;
    text-align: right;
    overflow: hidden;

    .el-pagination__total {
      float: left;
    }
  }
}
.el-tooltip__popper{
  max-width:80%;
  color: #000!important;
  box-shadow: 0 0 6px #666;
  background-color: #fff!important;
  .popper__arrow:after {
    border-top-color: rgba(0,0,0,0.2)!important;
  }
}
</style>
<style scoped lang="less">
.journal {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 12px;
  background-color: #f8f6fa;
  .content {
    height: calc(100% - 65px);
    margin-top: 5px;
    padding: 10px 50px;
    box-sizing: border-box;
    background-color: #fff;
    .red {
      color: #F56C6C;
    }
  }
}
</style>
