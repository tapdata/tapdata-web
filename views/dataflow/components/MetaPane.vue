<template>
  <ElTable :data="tableData" stripe style="width: 100%" height="100%" v-if="activeNode">
    <ElTableColumn prop="date" label="字段名称" width="180"> </ElTableColumn>
    <ElTableColumn prop="name" label="字段类型" width="180"> </ElTableColumn>
    <ElTableColumn prop="address" label="精度"> </ElTableColumn>
    <ElTableColumn prop="address" label="主键"> </ElTableColumn>
    <ElTableColumn prop="address" label="字段注释"> </ElTableColumn>
  </ElTable>
</template>

<script>
import MetadataApi from 'web-core/api/MetadataInstances'
import { mapGetters, mapState } from 'vuex'
const metadataApi = new MetadataApi()

export default {
  name: 'MetaPane',
  data() {
    return {
      tableData: [
        {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        },
        {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }
      ]
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId']),
    ...mapGetters('dataflow', ['activeNode'])
  },

  watch: {
    activeNodeId() {
      this.loadFields()
    }
  },

  methods: {
    async loadFields() {
      const data = await metadataApi.findOne({
        filter: JSON.stringify({
          where: {
            nodeId: this.activeNode.id
          }
        })
      })
    }
  }
}
</script>
