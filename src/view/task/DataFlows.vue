<template>
  <div class="task-list" style="overflow: auto;">
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
                <el-button type="primary" size="mini" @click="screenFn">{{ $t('message.filter') }}</el-button>
              </el-form-item>

            </el-col>
          </el-row>
<!--          <el-row>-->
<!--            <el-col :span="8">-->
<!--              <el-form-item label="创建人:">-->
<!--                <el-select v-model="formData.person" clearable placeholder="请选择" multiple >-->
<!--                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
<!--              </el-select>-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--            <el-col :span="8">-->
<!--              <el-form-item label="目录分类:">-->
<!--                <el-select v-model="formData.classification" clearable placeholder="请选择">-->
<!--                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
<!--                </el-select>-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--          </el-row>-->
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
          <i class="iconfont task-list-menu-cion icon-play-circle" @click="handleAllStatus('paused')"></i>
          <i class="iconfont task-list-menu-cion  icon-zanting" @click="handleAllStatus('running')"></i>
          <i class="iconfont task-list-menu-cion  icon-icon_tianjia"></i>
        </div>
      </div>
      <div class="clear"></div>
      <el-table :data="tableData" style="width: 99%;border: 1px solid #dedee4;margin-top: 10px" row-key="id"  :tree-props="{children: 'children', hasChildren: 'hasChildren'}"  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" :selectable="hanldeSelectable">
        </el-table-column>
        <el-table-column prop="name" label="任务名称" >
          <template slot-scope="scope">
            <div>{{scope.row.name}}</div>
            <div>{{scope.row.last_updated}}</div>
          </template>
        </el-table-column>
        <el-table-column sortable label="创建人" width="180"></el-table-column>
        <el-table-column prop="status" sortable label="任务状态" width="180">
          <template slot-scope="scope">
            <div size="mini" v-if="scope.row.status=== 'stopping'" style="color:#F19149">暂停中</div>
            <div size="mini" v-if="scope.row.status=== 'running'" style="color:#67C23A">运行中</div>
            <div size="mini" v-if="scope.row.status=== 'paused'" style="color:#F19149">已暂停</div>
            <div size="mini" v-if="scope.row.status=== 'error'" style="color:#F56C6C">错误</div>
            <div size="mini" v-if="scope.row.status=== 'draft'" style="color:#ccc">草稿</div>
            <div size="mini" v-if="scope.row.status=== 'scheduled'" style="color:#F19149">等待中</div>
          </template>
        </el-table-column>
        <el-table-column prop="input" sortable label="总输入（条）" width="180"></el-table-column>
        <el-table-column prop="output" sortable label="总输出（条）" width="180"></el-table-column>
        <el-table-column prop="transmissionTime" sortable label="输出速度"width="180" ></el-table-column>
        <el-table-column label="运行开关" width="100">
          <template slot-scope="scope">
            <div v-if="!scope.row.hasChildren">
              <el-switch v-model="scope.row.stopOnError"  @change="handleStatus(scope.row.id,scope.row.status)"></el-switch>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作"  width="220">
          <template slot-scope="scope">
            <div v-if="!scope.row.hasChildren">
              <el-tooltip class="item" content="数据地图" placement="bottom">
                <router-link :to='{path:"/job", query: { id: scope.row.id}}'><i class="iconfont task-list-icon icon-yunyingzhongxin"></i></router-link>
              </el-tooltip>
              <el-tooltip class="item" content="编辑" placement="bottom">
                <router-link  :to='{path:"/job", query: { id: scope.row.id}}'><i class="iconfont task-list-icon icon-ceshishenqing"></i></router-link>
              </el-tooltip>
              <el-tooltip class="item" content="复制" placement="bottom">
                <i class="iconfont task-list-icon icon-fuzhi1"></i>
              </el-tooltip>
              <el-tooltip class="item" content="删除" placement="bottom">
                <i class="iconfont task-list-icon icon-shanchu" @click="handleDelete(scope.row.id)"></i>
              </el-tooltip>
              <el-tooltip class="item" content="重置" placement="bottom">
                <i class="iconfont task-list-icon icon-shuaxin1" @click="handleReset(scope.row.id)"></i>
              </el-tooltip>
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
      this.screenFn();
    },
    methods: {
      hanldeSelectable(row){
        if(row.hasChildren){
          return false;
        }else {
          return  true;
        }
      },
      screenFn(){
        this.getData(this.formData);
      },
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
            },
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
            item.hasChildren = false
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
        await dataFlows.updateById(id,data).then(res => {
          if (res.statusText === "OK" || res.status === 200) {
            this.getData();
          }
        });
      },
      handleAllStatus(status){
        if(this.multipleSelection.length === 0){
          return;
        }
        let multipleSelection = [];
        this.multipleSelection.map(item =>{
          multipleSelection.push(item.id);
        });
        multipleSelection = multipleSelection.join(',');
        let id ={
          id:multipleSelection,
        };
        let attributes = {
          status: status,
        };
        dataFlows.update(id,attributes).then(res =>{
          if (res.statusText === "OK" || res.status === 200) {
            this.getData();
          }
        });
      },
      handleReset(id){
        this.$confirm('此操作将重置该任务状态, 是否重置?', '提示', {
          confirmButtonText: '重置',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let attributes = {
            status: 'draft',
            stats:'',
          };
          dataFlows.updateById(id,attributes).then(res => {
            if (res.statusText === "OK" || res.status === 200) {
              this.getData();
            }
          });
          this.$message({
            type: 'success',
            message: '重置成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消重置'
          });
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
    overflow: scroll;
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
      .el-table__expand-icon {
        display: block;
        width: 25px;
        line-height: 20px;
        height: 20px;
        text-align: center;
        margin-left: -20px;
        float: left;
      }
    }
  }
}
.task-list-menu-cion{
  font-size: 20px;
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
  .item{
    margin-left:10px ;
    color: #606266;
  }

</style>
