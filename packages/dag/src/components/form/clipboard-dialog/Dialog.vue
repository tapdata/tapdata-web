<template>
  <div>
    <el-button class="float-end" type="text" @click="visible = true">{{
      $t('packages_form_clipboard_dialog_dialog_huoquchuangjianming')
    }}</el-button>
    <el-dialog v-model="visible" width="50%" append-to-body :close-on-click-modal="false">
      <template v-slot:title>
        <div>
          <span class="mr-2">{{ $t('packages_form_clipboard_dialog_dialog_chuangjianmingling') }}</span>
          <ClipboardButton :tooltip="tooltip" :finishTooltip="finishTooltip" :content="sql"></ClipboardButton>
        </div>
      </template>
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
import { ClipboardButton } from '@tap/form'

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
