<template>
  <div>
    <el-button class="float-end" type="text" @click="visible = true">{{
      $t('packages_form_clipboard_dialog_dialog_huoquchuangjianming')
    }}</el-button>
    <el-dialog :visible.sync="visible" width="50%" append-to-body :close-on-click-modal="false">
      <div slot="title">
        <span class="mr-2">{{ $t('packages_form_clipboard_dialog_dialog_chuangjianmingling') }}</span>
        <ClipboardButton :tooltip="tooltip" :finishTooltip="finishTooltip" :content="sql"></ClipboardButton>
      </div>
      <VCodeEditor
        class="border rounded-2"
        :value="sql"
        lang="javascript"
        :height="200"
        :options="options"
      ></VCodeEditor>
    </el-dialog>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { VCodeEditor } from '@tap/component'
import ClipboardButton from '../clipboard-button'

export default {
  name: 'ClipboardDialog',
  components: { VCodeEditor, ClipboardButton },
  data() {
    return {
      visible: false,
      sql: 'CREATE TABLE Persons',
      tooltip: i18n.t('packages_form_clipboard_dialog_dialog_fuzhichuangjianming'),
      finishTooltip: i18n.t('packages_form_clipboard_dialog_dialog_yifuzhi'),
      options: {
        readOnly: true
      }
    }
  }
}
</script>

<style scoped></style>
