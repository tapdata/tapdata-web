import { defineComponent, ref } from '@vue/composition-api'
import { useTaskButtons } from '@/hooks'

export default defineComponent({
  setup(props) {
    const onTaskButtonTriger = event => {
      console.log(event)
    }
    const { component } = useTaskButtons(onTaskButtonTriger)
    const task = {
      id: '62b45298cf6e9f33798c3227',
      name: '来自AUTO_POSTGRES_1206_SOURCE的共享挖掘任务',
      connections: [{ '62b44d77cf6e9f33798c29cc': 'AUTO_POSTGRES_1206_SOURCE' }],
      createTime: '2022-06-23T11:46:32.736+00:00',
      status: 'edit',
      statuses: [{ id: '62b4529acf6e9f33798c3229', status: 'edit' }],
      tableName: ['B_PG1655698991936229545', 'B_PG1655698990965714337'],
      syncTimePoint: 'current',
      storageTime: 3
    }
    return () => {
      return <div>{component(task)}</div>
    }
  }
})
