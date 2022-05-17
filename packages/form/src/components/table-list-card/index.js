import { defineComponent, ref } from 'vue-demi'
import { MetadataInstances } from '@tap/api'
import './style.scss'

const api = new MetadataInstances()

export const TableListCard = defineComponent({
  props: ['connectionId'],
  setup(props) {
    const loading = ref(false)
    const list = ref([])
    const loadData = () => {
      loading.value = true
      api
        .getTables(props.connectionId)
        .then(data => {
          list.value = data
        })
        .finally(() => (loading.value = false))
    }
    loadData()
    return () => {
      return (
        <ElCard class="table-list-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>表名</span>
            {!loading.value && <span class="font-color-light float-end">{list.value.length}</span>}
          </div>
          <div v-loading={loading.value} class="table-list">
            {list.value.map(name => (
              <div key={name} class="table-list-item font-color-light rounded-2 px-2">
                {name}
              </div>
            ))}
          </div>
        </ElCard>
      )
    }
  }
})
