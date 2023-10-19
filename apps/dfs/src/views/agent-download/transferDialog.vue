<template>
  <el-dialog
    :value="visible"
    @input="$emit('update:visible', $event)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    :title="$t('dfs_agent_download_subscriptionmodeldialog_zhuanzhangzhifu')"
    width="1000px"
    custom-class="tap-dialog"
  >
    <div class="transfer-info transfer-price mt-4 mb-4">
      {{ $t('dfs_agent_zhuanzhang_price') }}:
      <span class="font-color-dark fw-normal ml-1">{{ price }}</span>
    </div>
    <div class="transfer-info mt-4 mb-4">
      <header class="fs-6 font-color-dark fw-normal mb-4">
        {{ $t('dfs_agent_download_transferdialog_zhuanzhangxinxi') }}
      </header>
      <ul class="transfer-ul">
        <li>
          <span>{{ $t('dfs_agent_download_transferdialog_kaihumingcheng') }}</span
          ><span class="font-color-dark fw-normal ml-1">{{
            $t('dfs_agent_download_transferdialog_shenzhentaiboshu')
          }}</span>
        </li>
        <li>
          <span>{{ $t('dfs_agent_download_transferdialog_kaihuyinhang') }}</span
          ><span class="font-color-dark fw-normal ml-1">{{
            $t('dfs_agent_download_transferdialog_zhongguominshengyin')
          }}</span>
        </li>
        <li>
          <span>{{ $t('dfs_agent_download_transferdialog_huikuanzhanghao') }}</span
          ><span class="font-color-dark fw-normal ml-1">160313199</span>
        </li>
      </ul>
    </div>
    <div class="secondary mt-4">
      {{ $t('dfs_agent_download_transferdialog_zaiwanchengzhuanzhang') }}
    </div>
    <div class="primary">
      {{ $t('dfs_agent_download_transferdialog_reopen_tips') }}
    </div>
    <template v-slot:footer>
      <div>
        <el-button @click="close">{{ $t('public_button_cancel') }}</el-button>
        <el-button type="primary" @click="close">{{ $t('public_button_confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
export default {
  name: 'transferDialog',
  inject: ['buried'],
  props: {
    visible: {
      type: Boolean
    },
    price: {
      type: String
    }
  },
  methods: {
    close() {
      $emit(this, 'update:visible', false)
    }
  },
  emits: ['update:visible']
}
</script>

<style lang="scss" scoped>
.transfer-info {
  background: #fafafa;
  border: 1px solid #dedede;
  border-radius: 4px;
  padding: 16px;
}
.transfer-ul {
  color: map-get($fontColor, sslight);
  li {
    line-height: 30px;
  }
}
.secondary {
  color: map-get($color, secondary);
}
</style>

<style lang="scss">
.tap-dialog {
  .el-dialog__header {
    height: 64px;
    min-height: 64px;
    border-bottom: 1px solid #dee2e6;
  }

  .el-dialog__body {
    padding: 16px 24px;
  }

  .el-dialog__footer {
    padding: 24px;
  }
}
.transfer-price {
}
</style>
