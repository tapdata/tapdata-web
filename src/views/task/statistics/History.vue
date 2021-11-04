<template>
  <div>
    <TableList :remoteMethod="remoteMethod" :columns="columns"></TableList>
  </div>
</template>

<script>
import TableList from '@/components/TableList'

export default {
  name: 'History',
  components: { TableList },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      columns: [
        {
          label: '子任务名称',
          prop: 'name'
        },
        {
          label: '运行时间',
          prop: 'time',
          dataType: 'time'
        },
        {
          label: '操作者',
          prop: 'creator'
        },
        {
          label: '操作内容',
          prop: 'opration'
        }
      ]
    }
  },
  methods: {
    remoteMethod({ page }) {
      let ids = this.task?.stages.map(item => {
        return item.connectionId
      })
      let { current, size } = page
      let filter = {
        where: {
          id: {
            inq: ids
          }
        },
        limit: size,
        skip: size * (current - 1)
      }
      return this.$axios
        .get(`tm/api/Connections?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .then(({ items, total }) => {
          let data = items
          return {
            total: total,
            data: data
          }
        })
    }
  }
}
</script>

<style scoped></style>
