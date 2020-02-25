<template>
<div class="journal">
  <el-row class="fun_area">
    <el-form ref="form" :model="form" label-width="80px">
      <el-col :span="8">
        <el-form-item label="选择时间">
          <el-col :span="11">
            <el-date-picker v-model="form.startDate" type="date" :picker-options="pickerStartDate" style="width: 100%;" placeholder="选择日期"></el-date-picker>
          </el-col>
          <el-col class="line" :span="2"> -</el-col>
          <el-col :span="11">
            <el-date-picker v-model="form.closeDate" type="date" :picker-options="pickerCloseDate" style="width: 100%;" placeholder="选择日期"></el-date-picker>
          </el-col>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="服务器">
          <el-select v-model="form.region">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="服务类型">
          <el-select v-model="form.region">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="级别">
          <el-select v-model="form.region" >
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item>
          <el-button type="primary" @click="onSubmit">筛选</el-button>
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
  <div class="content">
    <el-table :data="tableData" class="tableName" height="250" style="width: 100%">
      <el-table-column prop="date" label="时间" width="180"></el-table-column>
      <el-table-column prop="name" label="主机名" width="180"></el-table-column>
      <el-table-column prop="address" label="ip地址"></el-table-column>
      <el-table-column prop="address" label="唯一编码"></el-table-column>
      <el-table-column prop="address" label="服类类型"></el-table-column>
      <el-table-column prop="address" label="级别"></el-table-column>
      <el-table-column prop="address" label="日志信息"></el-table-column>
    </el-table>
    <el-pagination background
			layout="total, prev, pager, next"
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
export default {
  data(){
    return {
      pagesize: 10,
      currpage: 1,
      totalNum: 0,
      form: {
        startDate: null,
        closeDate: null
      },
      tableData: [{
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-08',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-06',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-07',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }],
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
  methods: {
    handleCurrentChange(cpage) {
      this.currpage = cpage;
    },
    handleSizeChange(psize) {
      this.pagesize = psize;
    },

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
    padding: 10px;
    box-sizing: border-box;
    text-align: right;
    .el-pagination__total {
      float: left;
    }
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
    margin-top: 5px;
    padding: 0 50px;
    background-color: #fff;
  }
}
</style>
