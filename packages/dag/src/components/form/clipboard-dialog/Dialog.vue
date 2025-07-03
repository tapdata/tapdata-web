<script>
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { ClipboardButton } from '@tap/form/src/components/clipboard-button'
import i18n from '@tap/i18n'

export default {
  name: 'ClipboardDialog',
  components: { VCodeEditor, ClipboardButton },
  data() {
    return {
      visible: false,
      sql: 'CREATE TABLE Persons',
      tooltip: i18n.t(
        'packages_form_clipboard_dialog_dialog_fuzhichuangjianming',
      ),
      finishTooltip: i18n.t('packages_form_clipboard_dialog_dialog_yifuzhi'),
      options: {
        readOnly: true,
      },
    }
  },
}
</script>

<template>
  <div>
    <el-button class="float-end" text @click="visible = true">{{
      $t('packages_form_clipboard_dialog_dialog_huoquchuangjianming')
    }}</el-button>
    <el-dialog
      v-model="visible"
      width="50%"
      append-to-body
      :close-on-click-modal="false"
    >
      <template #header>
        <div>
          <span class="mr-2">{{
            $t('packages_form_clipboard_dialog_dialog_chuangjianmingling')
          }}</span>
          <ClipboardButton
            :tooltip="tooltip"
            :finish-tooltip="finishTooltip"
            :content="sql"
          />
        </div>
      </template>
      <VCodeEditor
        class="border rounded-2"
        :value="sql"
        lang="javascript"
        :height="200"
        :options="options"
      />
    </el-dialog>
  </div>
</template>
