<template>
  <div class="py-3 flex flex-column gap-3">
    <div v-for="(item, i) in list" :key="item.key" class="flex gap-3">
      <FieldSelect v-model="item.key" :options="sortFields" placeholder="请选择字段" @change="handleChange" style="flex: 0.8" />
      <ElInput v-model="item.value" placeholder="请输入字符集" @change="handleChange" class="flex-1" />
      <IconButton class="flex-shrink-0" @click="handleDelete(item, i)"> delete </IconButton>
    </div>
    <ElButton class="w-100" style="border-style: dashed" @click="handleAdd"> 添加 </ElButton>
  </div>
</template>

<script>
import { defineComponent, computed, ref, del, set } from '@vue/composition-api'
import { FieldSelect } from '@tap/form'
import { IconButton } from '@tap/component'

export default defineComponent({
  name: 'CollateMap',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => []
    },
    sortColumn: {
      type: String,
      required: true
    }
  },

  components: {
    FieldSelect,
    IconButton
  },

  setup(props, { emit }) {
    const list = ref([])

    if (props.value) {
      list.value = Object.keys(props.value).map(key => ({
        key,
        value: props.value[key]
      }))
    }

    if (list.value.length === 0) {
      list.value.push({
        key: '',
        value: ''
      })
    }

    const sortColumns = computed(() => {
      return props.sortColumn ? props.sortColumn.split(',') : []
    })

    const sortFields = computed(() => {
      return props.fields.filter(field => sortColumns.value.includes(field.value) && !(field.value in props.value))
    })

    const handleAdd = () => {
      list.value.push({
        key: '',
        value: ''
      })
    }

    const handleDelete = (item, index) => {
      list.value.splice(index, 1)
      item.key && del(props.value, item.key)
    }

    const handleChange = () => {
      const result = list.value.reduce((acc, item) => {
        item.key && set(acc, item.key, item.value)
        return acc
      }, {})

      emit('input', result)
    }

    return {
      list,
      sortFields,
      handleDelete,
      handleAdd,
      handleChange
    }
  }
})
</script>
