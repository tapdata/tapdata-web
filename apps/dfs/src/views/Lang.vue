<template>
  <div class="g-panel-container flex flex-column h-100">
    <ElCollapse>
      <ElCollapseItem :title="$t('views_Lang_pingBiGuoJiHua')" name="1">
        <ElForm>
          <ElFormItem :label="$t('views_Lang_wenAnBaoHanDe')">
            <ElInput v-model="inc" type="textarea" :placeholder="$t('views_Lang_wenAnBaoHanDe')" autosize></ElInput>
            <VButton type="primary" @click="saveIncludes">{{ $t('button_submit') }}</VButton>
          </ElFormItem>
          <ElFormItem :label="$t('views_Lang_wenAnDengYuDe')">
            <ElInput v-model="equal" type="textarea" :placeholder="$t('views_Lang_wenAnDengYuDe')" autosize></ElInput>
            <VButton type="primary" @click="saveEqual">{{ $t('button_submit') }}</VButton>
          </ElFormItem>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
    <div class="flex justify-content-between mt-4">
      <FilterBar v-model="searchParams" :items="filterItems" @search="search"> </FilterBar>
      <div>
        <ElButton type="primary" @click="exportModifyEn">{{ $t('views_Lang_daoChuYingWen') }}</ElButton>
        <ElButton type="primary" @click="exportModifyZhTW">{{ $t('views_Lang_daoChuFanTi') }}</ElButton>
      </div>
    </div>
    <TableList ref="table" row-key="id" :columns="columns" :data="data" height="100%" class="mt-4" :isPage="true">
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="edit(scope.row)">{{ $t('button_edit') }}</ElButton>
        </div>
      </template>
      <template slot="name" slot-scope="scope">
        <div v-if="scope.row[scope.prop + '-modify']" class="color-success">
          {{ scope.row[scope.prop + '-modify'] }}
        </div>
        <div v-else>{{ scope.row[scope.prop] }}</div>
      </template>
    </TableList>

    <ElDialog width="435px" append-to-body title="edit" :close-on-click-modal="false" :visible.sync="dialog.visible">
      <ElForm :model="dialog.form" label-width="120px" @submit.native.prevent>
        <ElFormItem label="key">
          <div>{{ dialog.form.key }}</div>
        </ElFormItem>
        <ElFormItem :label="langMap['zh-CN']">
          <div>{{ dialog.form['zh-CN'] }}</div>
        </ElFormItem>
        <ElFormItem :label="langMap['zh-TW']">
          <div>{{ dialog.form['zh-TW'] }}</div>
          <ElInput
            v-model="dialog.form['zh-TW-modify']"
            type="textarea"
            :placeholder="$t('views_Lang_qingShuRuJiaoZheng')"
          ></ElInput>
        </ElFormItem>
        <ElFormItem :label="langMap['en']">
          <div>{{ dialog.form['en'] }}</div>
          <ElInput
            v-model="dialog.form['en-modify']"
            type="textarea"
            :placeholder="$t('views_Lang_qingShuRuJiaoZheng')"
          ></ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <VButton @click="dialog.visible = false">{{ $t('dataVerify_cancel') }}</VButton>
        <VButton type="primary" @click="confirm">{{ $t('dataVerify_confirm') }}</VButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@/i18n'

import FilterBar from '@/components/filter-bar'
import TableList from '@/components/TableList'
import zhCN from '@/i18n/langs/zh-CN'
import enSource from '@/i18n/langs/en'
import enModify from '@/i18n/modify/en'
import zhTWSource from '@/i18n/langs/zh-TW'
import zhTWModify from '@/i18n/modify/zh-TW'
import { downloadBlob } from '@/util'

export default {
  name: 'Lang',
  components: { TableList, FilterBar },
  data() {
    let langMap = {
      'zh-CN': i18n.t('views_Lang_zhongWen'),
      en: i18n.t('views_Lang_yingWen'),
      'zh-TW': i18n.t('views_Lang_fanTi')
    }
    // 原有的文案
    let sourceObject = {
      en: enSource,
      'zh-CN': zhCN,
      'zh-TW': zhTWSource
    }
    let localLangModifyZhTW = localStorage.getItem('localLangModifyZhTW')
    let localLangModifyEn = localStorage.getItem('localLangModifyEn')
    // 矫正的文案
    let modifyObject = {
      en: localLangModifyEn ? Object.assign(JSON.parse(localLangModifyEn), enModify) : enModify,
      'zh-TW': localLangModifyZhTW ? Object.assign(JSON.parse(localLangModifyZhTW), zhTWModify) : zhTWModify
    }
    let columns = [
      {
        label: 'key',
        prop: 'key',
        minWidth: 100
      }
    ]
    for (let key in langMap) {
      columns.push({
        label: langMap[key],
        prop: key,
        slotName: 'name'
      })
    }
    columns.push({
      label: i18n.t('connection_list_operate'),
      prop: 'operation',
      slotName: 'operation'
    })
    let list = []
    for (let key in sourceObject['zh-CN']) {
      let obj = {}
      obj.key = key
      Object.keys(langMap).forEach(el => {
        obj[el] = sourceObject[el][key]
        if (el !== 'zh-CN') {
          obj[el + '-modify'] = modifyObject[el]?.[key] || ''
        }
      })
      list.push(obj)
    }
    return {
      inc: '',
      equal: '',
      langMap: langMap,
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
      ],
      dialog: {
        visible: false,
        form: {}
      }
    }
  },
  mounted() {
    this.inc = localStorage.getItem('includesLang') ?? ''
    this.equal = localStorage.getItem('equalLang') ?? ''
    this.data = this.list
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
      delayTrigger(() => {
        let { key, value } = this.searchParams
        let data = this.list
        if (key) {
          data = this.list.filter(t => t.key.toLowerCase().includes(key.trim().toLowerCase() || ''))
        }
        if (value) {
          let iVal = value.trim().toLowerCase()
          data = this.list.filter(t => ['zh-CN', 'zh-TW', 'en'].some(s => t[s]?.toLowerCase().includes(iVal || '')))
        }

        this.data = data
      }, debounce)
    },
    edit(row) {
      this.dialog.visible = true
      this.dialog.form = JSON.parse(JSON.stringify(row))
    },
    confirm() {
      this.dialog.visible = false
      let { form } = this.dialog
      let findOne = this.list.find(t => t.key === form.key)
      findOne['zh-TW-modify'] = form['zh-TW-modify']
      findOne['en-modify'] = form['en-modify']
      this.updateLocalStorage()
      this.$message.success(this.$t('gl_button_update_success'))
    },
    getModifyData() {
      let zhTW = {}
      let en = {}
      this.list.forEach(el => {
        if (el['zh-TW-modify']) {
          zhTW[el.key] = el['zh-TW-modify']
        }
        if (el['en-modify']) {
          en[el.key] = el['en-modify']
        }
      })
      return {
        zhTW,
        en
      }
    },
    updateLocalStorage() {
      let { zhTW, en } = this.getModifyData()
      if (Object.keys(zhTW).length) {
        localStorage.setItem('localLangModifyZhTW', JSON.stringify(zhTW))
      }
      if (Object.keys(en).length) {
        localStorage.setItem('localLangModifyEn', JSON.stringify(en))
      }
    },
    exportModifyZhTW() {
      let { zhTW } = this.getModifyData()
      this.downloadBlob(zhTW, 'zh-TW.js')
    },
    exportModifyEn() {
      let { en } = this.getModifyData()
      this.downloadBlob(en, 'en.js')
    },
    downloadBlob(obj = {}, name = '') {
      downloadBlob(
        { data: 'export default ' + JSON.stringify(obj), headers: { 'content-type': 'text/plain;charset=utf-8' } },
        name
      )
    }
  }
}
</script>

<style scoped></style>
