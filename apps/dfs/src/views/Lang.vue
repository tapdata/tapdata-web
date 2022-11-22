<template>
  <div class="g-panel-container flex flex-column h-100">
    <ElCollapse>
      <ElCollapseItem :title="$t('views_Lang_pingBiGuoJiHua')" name="1">
        <ElForm>
          <ElFormItem :label="$t('views_Lang_wenAnBaoHanDe')">
            <ElInput v-model="inc" type="textarea" :placeholder="$t('views_Lang_wenAnBaoHanDe')" autosize></ElInput>
            <ElButton type="primary" class="mt-3" @click="saveIncludes">{{ $t('button_save') }}</ElButton>
          </ElFormItem>
          <ElFormItem :label="$t('views_Lang_wenAnDengYuDe')">
            <ElInput v-model="equal" type="textarea" :placeholder="$t('views_Lang_wenAnDengYuDe')" autosize></ElInput>
            <ElButton type="primary" class="mt-3" @click="saveEqual">{{ $t('button_save') }}</ElButton>
          </ElFormItem>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
    <div class="flex justify-content-between mt-4">
      <FilterBar v-model="searchParams" :items="filterItems" @search="search"> </FilterBar>
      <div>
        <ElButton @click="uploadModify">{{ $t('button_upload') }}</ElButton>
        <ElButton type="primary" @click="exportFile('zh-CN')">{{ $t('button_export') + $t('lang_zh_cn') }}</ElButton>
        <ElButton type="primary" @click="exportFile('zh-TW')">{{ $t('button_export') + $t('lang_zh_tw') }}</ElButton>
        <ElButton type="primary" @click="exportFile('en')">{{ $t('button_export') + $t('lang_en') }}</ElButton>
      </div>
    </div>
    <VTable ref="table" row-key="id" :columns="columns" :data="data" height="100%" class="mt-4" :isPage="true">
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
    </VTable>
    <ElDialog width="435px" append-to-body title="edit" :close-on-click-modal="false" :visible.sync="dialog.visible">
      <ElForm :model="dialog.form" label-width="120px" @submit.native.prevent>
        <ElFormItem label="key">
          <div>{{ dialog.form.key }}</div>
        </ElFormItem>
        <ElFormItem :label="langMap['zh-CN']">
          <div>{{ dialog.form['zh-CN'] }}</div>
          <ElInput
            v-model="dialog.form['zh-CN-modify']"
            type="textarea"
            :placeholder="$t('views_Lang_qingShuRuJiaoZheng')"
          ></ElInput>
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
        <ElButton @click="dialog.visible = false">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="confirm">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <ElDialog
      width="1000px"
      append-to-body
      title="edit"
      :close-on-click-modal="false"
      :visible.sync="uploadDialog.visible"
    >
      <ElForm :model="uploadDialog.form" label-width="120px" @submit.native.prevent>
        <ElFormItem label="Select Lang">
          <ElSelect v-model="uploadDialog.form.select">
            <ElOption v-for="(label, value) in langMap" :label="label" :value="value" :key="value"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="langMap['zh-CN']">
          <ElInput
            v-model="uploadDialog.form.value"
            type="textarea"
            :placeholder="$t('views_Lang_qingShuRuJiaoZheng')"
          ></ElInput>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="uploadDialog.visible = false">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="confirmUpload">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@/i18n'

import { FilterBar, VTable } from '@tap/component'
import zhCNSource from '@/i18n/langs/zh-CN'
import zhTWSource from '@/i18n/langs/zh-TW'
import enSource from '@/i18n/langs/en'
import zhCNModify from '@/i18n/modify/zh-CN'
import zhTWModify from '@/i18n/modify/zh-TW'
import enModify from '@/i18n/modify/en'
import { downloadBlob } from '@/util'

export default {
  name: 'Lang',
  components: { VTable, FilterBar },
  data() {
    let langMap = {
      'zh-CN': i18n.t('lang_zh_cn'),
      'zh-TW': i18n.t('lang_zh_tw'),
      en: i18n.t('lang_en')
    }
    // 原有的文案
    let sourceObject = {
      en: enSource,
      'zh-CN': zhCNSource,
      'zh-TW': zhTWSource
    }
    let localLangModifyZhCN = localStorage.getItem('localLangModifyZhCN')
    let localLangModifyZhTW = localStorage.getItem('localLangModifyZhTW')
    let localLangModifyEn = localStorage.getItem('localLangModifyEn')
    // 矫正的文案
    let modifyObject = {
      en: localLangModifyEn ? Object.assign(JSON.parse(localLangModifyEn), enModify) : enModify,
      'zh-TW': localLangModifyZhTW ? Object.assign(JSON.parse(localLangModifyZhTW), zhTWModify) : zhTWModify,
      'zh-CN': localLangModifyZhCN ? Object.assign(JSON.parse(localLangModifyZhCN), zhCNModify) : zhCNModify
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
      label: i18n.t('list_operation'),
      prop: 'operation',
      slotName: 'operation'
    })
    let list = []
    const keyArr = Object.keys(sourceObject['zh-CN'])
    keyArr.forEach(key => {
      let obj = {}
      obj.key = key
      Object.keys(langMap).forEach(el => {
        obj[el] = sourceObject[el][key]
        obj[el + '-modify'] = modifyObject[el]?.[key] || ''
      })
      list.push(obj)
    })
    return {
      inc: '',
      equal: '',
      langMap: langMap,
      columns: columns,
      list: list,
      data: [],
      searchParams: {
        status: '',
        key: '',
        value: ''
      },
      filterItems: [
        {
          label: i18n.t('agent_status'),
          key: 'status',
          type: 'select-inner',
          items: [
            {
              label: 'modify',
              value: 'modify'
            },
            {
              label: 'no-modify',
              value: 'no-modify'
            }
          ]
        },
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
      },
      uploadDialog: {
        visible: false,
        form: {
          select: '',
          value: ''
        }
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
        let { status, key, value } = this.searchParams
        let data = this.list
        if (status) {
          if (status === 'modify') {
            data = this.list.filter(t => t['zh-TW-modify'] || t['en-modify'])
          } else if (status === 'no-modify') {
            data = this.list.filter(t => !t['zh-TW-modify'] && !t['en-modify'])
          }
        }
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
      findOne['zh-CN-modify'] = form['zh-CN-modify']
      findOne['zh-TW-modify'] = form['zh-TW-modify']
      findOne['en-modify'] = form['en-modify']
      this.updateLocalStorage()
      this.$message.success(this.$t('operate_update_success'))
    },
    getModifyData() {
      let zhCN = {}
      let zhTW = {}
      let en = {}
      this.list.forEach(el => {
        if (el['zh-CN-modify']) {
          zhCN[el.key] = el['zh-CN-modify']
        }
        if (el['zh-TW-modify']) {
          zhTW[el.key] = el['zh-TW-modify']
        }
        if (el['en-modify']) {
          en[el.key] = el['en-modify']
        }
      })
      return {
        zhCN,
        zhTW,
        en
      }
    },
    updateLocalStorage() {
      let { zhCN, zhTW, en } = this.getModifyData()
      if (Object.keys(zhCN).length) {
        localStorage.setItem('localLangModifyZhCN', JSON.stringify(zhCN))
      }
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
    },
    uploadModify() {
      this.uploadDialog.visible = true
    },
    exportFile(type) {
      if (!type) {
        return
      }
      let { zhCN, zhTW, en } = this.getModifyData()
      const map = {
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        en: en
      }
      this.downloadBlob(map[type], `${type}.js`)
    },
    confirmUpload() {
      console.log('confirmUpload', this.uploadDialog)
      console.log(123213, eval('(' + this.uploadDialog.form.value + ')'))
      // 根据类型保存内容
      const map = {
        'zh-CN': 'localLangModifyZhCN',
        'zh-TW': 'localLangModifyZhTW',
        en: 'localLangModifyEn'
      }
      // const str = localStorage.getItem(key)
      const key = map[this.uploadDialog.form.select]
      if (!key) return
      const str = localStorage.getItem(key)
      let result = str ? JSON.parse(str) : {}
      const inputObj = eval('(' + this.uploadDialog.form.value + ')')
      localStorage.setItem(key, JSON.stringify(Object.assign({}, result, inputObj)))
      this.$message.success(i18n.t('views_Lang_shangChuanChengGongShua'))
      this.uploadDialog.visible = false
    }
  }
}
</script>

<style scoped></style>
