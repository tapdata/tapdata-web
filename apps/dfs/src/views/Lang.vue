<template>
  <div class="g-panel-container flex flex-column h-100">
    <FilterBar v-model="searchParams" :items="filterItems" @search="search"> </FilterBar>
    <TableList ref="table" row-key="id" :columns="columns" :data="data" height="100%" class="mt-4" :isPage="true">
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="edit(scope.row)">edit</ElButton>
        </div>
      </template>
    </TableList>

    <ElForm class="none">
      <ElFormItem label="Includes List: a,b,c">
        <ElInput v-model="inc" type="textarea" placeholder="for example: a,b,c" autosize></ElInput>
        <VButton @click="saveIncludes">save</VButton>
      </ElFormItem>
      <ElFormItem label="Equal List: a,b,c">
        <ElInput v-model="equal" type="textarea" placeholder="for example: a,b,c" autosize></ElInput>
        <VButton @click="saveEqual">save</VButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script>
import FilterBar from '@/components/filter-bar'
import TableList from '@/components/TableList'

let files = require
  .context('@/i18n/langs', false, /\.js$/)
  .keys()
  .map(t => t.replace('./', '').replace('.js', ''))
console.log('files', files)
let columns = [
  {
    label: 'key',
    prop: 'key',
    minWidth: 160
  }
]
let filesObject = {}
files.forEach(el => {
  let fileContent = require(`@/i18n/langs/${el}.js`)
  filesObject[el] = fileContent.default
  columns.push({
    label: el,
    prop: el
  })
})
columns.push({
  label: 'operation',
  prop: 'operation',
  slotName: 'operation'
})
let list = []
let langs = Object.keys(filesObject)

for (let key in filesObject['zh-CN']) {
  let obj = {}
  obj.key = key
  langs.forEach(el => {
    obj[el] = filesObject[el][key]
  })
  list.push(obj)
}
filesObject = null
export default {
  name: 'Lang',
  components: { TableList, FilterBar },
  data() {
    return {
      inc: '',
      equal: '',
      columns: columns,
      list: list,
      data: [],
      searchParams: {
        key: '',
        value: ''
      },
      filterItems: [
        {
          placeholder: 'key',
          key: 'key',
          type: 'input',
          debounce: 300
        },
        {
          placeholder: 'value',
          key: 'value',
          type: 'input',
          debounce: 300
        }
      ]
    }
  },
  mounted() {
    this.inc = localStorage.getItem('includesLang') ?? ''
    this.equal = localStorage.getItem('equalLang') ?? ''
    this.data = this.list
    console.log('this.', this.data)
  },
  methods: {
    saveIncludes() {
      localStorage.setItem('includesLang', this.inc)
      this.$message.success('success, please refresh page!')
    },
    saveEqual() {
      localStorage.setItem('equalLang', this.equal)
      this.$message.success('success, please refresh page!')
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      console.log('this.searchParams', this.searchParams)
      delayTrigger(() => {
        let { key, value } = this.searchParams
        // if (!key && !value) {
        //   this.data = this.list
        //   return
        // }
        let data = this.list
        if (key) {
          data = this.list.filter(t => t.key.includes(key || ''))
        }
        if (value) {
          data = this.list.filter(
            t => t['zh-CN'].includes(value || '') || t['zh-TW'].includes(value || '') || t['en'].includes(value || '')
          )
        }

        this.data = data
      }, debounce)
    },
    edit(row) {
      console.log('edit', row)
    }
  }
}
</script>

<style scoped></style>
