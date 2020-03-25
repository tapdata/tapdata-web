<template>
  <div class="task-list">
    <div class="task-list-operating-area box-card">
      <el-row :gutter="10">
        <el-form label-width="100px"  :data="formData">
          <el-row>
            <el-col :span="8">
              <el-form-item label="搜索:">
                <el-input placeholder="任务名称/节点名/库表名" prefix-icon="el-icon-search" v-model="formData.search"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="创建日期范围:">
                <el-date-picker type="daterange" v-model="formData.timeData" size="small " class="task-list-time-picker" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="运行状态:">
                <el-select v-model="formData.status" clearable placeholder="请选择">
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="创建人:">
                <el-select v-model="formData.person" clearable placeholder="请选择" multiple >
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="目录分类:">
                <el-select v-model="formData.classification" clearable placeholder="请选择">
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-row>
    </div>
    <div class="task-list-main">
      <div>
        <div class="task-list-menu-left">
          <i class="iconfont icon-icon_yingyongguanli"></i>
          <i class="iconfont icon-liebiao"></i>
        </div>
        <div class="task-list-menu-right">
          <i class="iconfont icon-play-circle" @click="handleAllStatus('pause')"></i>
          <i class="iconfont icon-zanting" @click="handleAllStatus('running')"></i>
          <i class="iconfont icon-icon_tianjia"></i>
        </div>
      </div>
      <div class="clear"></div>
      <el-table :data="tableData" style="width: 98%" row-key="id"  :tree-props="{children: 'children', hasChildren: 'hasChildren'}"  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" ></el-table-column>
        <el-table-column prop="name" label="任务名称" width="180">
          <template slot-scope="scope">
            <div>{{scope.row.name}}</div>
            <div>{{scope.row.last_updated}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" sortable label="任务状态">
          <template slot-scope="scope">
            <el-button size="mini" v-if="scope.row.status=== 'stopping'" style="background: #F19149;color:#fff">暂停中</el-button>
            <el-button size="mini" v-if="scope.row.status=== 'running'" style="background: #67C23A;color:#fff">运行中</el-button>
            <el-button size="mini" v-if="scope.row.status=== 'paused'" style="background: #F19149;color:#fff">已暂停</el-button>
            <el-button size="mini" v-if="scope.row.status=== 'error'" style="background: #F56C6C;color:#fff">错误</el-button>
            <el-button size="mini" v-if="scope.row.status=== 'draft'" style="background: #ccc;color:#fff">草稿</el-button>
            <el-button size="mini" v-if="scope.row.status=== 'scheduled'" style="background: #F19149;color:#fff">等待中</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="input" sortable label="总输入（条）" ></el-table-column>
        <el-table-column prop="output" sortable label="总输出（条）" ></el-table-column>
        <el-table-column prop="transmissionTime" sortable label="输出速度" ></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div v-if="!scope.row.hasChildren">
              <el-switch v-model="scope.row.stopOnError" @change="handleStatus(scope.row.id,scope.row.status)"></el-switch>
              <i class="iconfont task-list-icon icon-yunyingzhongxin"></i>
              <router-link to="/job"><i class="iconfont task-list-icon icon-ceshishenqing"></i></router-link>
              <i class="iconfont task-list-icon icon-fuzhi1"></i>
              <i class="iconfont task-list-icon icon-shanchu" @click="handleDelete(scope.row.id)"></i>
              <i class="iconfont task-list-icon icon-shuaxin1"></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import factory from '../../api/factory';
  const dataFlows = factory('DataFlows');

  export default {
    data() {
      return {
        tableData: [],
        newData:[],
        options:[{
          label: '运行中',
          value: 'running'
        },{
          label: '已停止',
          value: 'paused'
        },{
          label: '错误',
          value: 'error'
        },{
          label: '草稿',
          value: 'draft'
        },{
          label: '等待中',
          value: 'scheduled'
        },{
          label: '暂停中',
          value: 'stopping'
        }],
        multipleSelection:[],
        formData:[{
          search:'',
          timeData:[],
          status:'',
          person:'',
          classification:[],
        }]
      };
    },
    created() {
      let formData ={
        formData:this.formData,
      };
      this.getData(formData);
    },
    methods: {
      async getData(params) {
        let _params = Object.assign({
          filter: JSON.stringify({
            fields: {
              "id": true,
              "name": true,
              "description": true,
              "status": true,
              "executeMode": true,
              "category": true,
              "stopOnError": true,
              "mappingTemplate": true,
               "last_updated": true,
              "children": true,
              "stats":true,
              "stages":true
            }
          })
        }, params);
       await dataFlows.get(_params).then(res => {
          if (res.statusText === "OK" || res.status === 200) {
            if (res.data) {
              this.tableData = res.data;
              this.handleData(this.tableData)
            }
          }
        });
      },
      handleData(data){
        if(!data) return;
        data.map(item =>{
          if(item.stats){
            item.input = item.stats.input.rows;
            item.output = item.stats.output.rows;
            item.transmissionTime = item.stats.transmissionTime;
            let children = item.stats.stagesMetrics;
            item.children =[];
            if(children){
              children.map(k=>{
                let id = ''
                item.stages.map(k =>{
                  id = k.id
                });
                let node = {
                  id:id,
                  input:k.input.rows,
                  output:k.output.rows,
                  transmissionTime:k.transmissionTime,
                  hasChildren:true,
                };
                item.children.push(node);
              });
            }
          }
        });
      },
      handleDelete(id){
        this.$confirm('此操作将删除该任务, 是否删除?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          dataFlows.delete(id).then(res => {
            if (res.statusText === "OK" || res.status === 200) {
              this.getData();
            }
          });
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });

      },
      async handleStatus(id,status){
        let data = {
          status:status,
        };
        if(status !== 'running'){ //停止则启动
          data.status = 'running';
        }else {
          data.status = 'paused';
        }
        await dataFlows.patch(id,data).then(res => {
          if (res.statusText === "OK" || res.status === 200) {
            this.getData();
          }
        });
      },
      handleAllStatus(status){
        if(this.multipleSelection.length === 0){
          return;
        }
        let id = [];
        this.multipleSelection.map(item =>{
          id.push(item.id);
        });
        id =id.join(',');
        console.log(id);

        let data = {
          status:status,
        };
        dataFlows.post(id,data).then(res =>{
          if (res.statusText === "OK" || res.status === 200) {
            this.getData();
          }
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
    },
  };
</script>

<style lang="less" scoped>
  .task-list{
    font-size: 14px;
    margin-left: 20px;
  }
.task-list-operating-area{
  border: 1px solid #ebebeb;
  border-radius: 3px;
  transition: .2s;
  padding: 10px;
  margin: 20px;
  margin-left: 0px;
  .el-input, .el-select {
    display: inline-block;
    width: 240px;
  }
  .el-form-item {
    margin-bottom: 6px;
    .el-table{
      margin-right: 20px;
    }
  }
}
.task-list-menu{
  margin-bottom: 10px;
}
  .task-list-icon{
    font-size: 18px;
  }
  .task-list-time-picker{
    width: 240px;
  }
  .task-list-menu-left{
    float: left;
  }
  .task-list-menu-right{
    float: right;
    margin-right: 20px;
  }
  .clear{
    clear: both;
  }
</style>
