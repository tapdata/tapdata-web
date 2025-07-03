<script>
import { getPaymentMethod, getSpec } from '../shared'
import OrderChange from '../views/order/Change'

export default {
  name: 'UpgradeCharges',
  components: { OrderChange },
  props: ['visible', 'tooltip', 'goPage'],
  emits: ['update:visible'],
  data() {
    return {
      list: [],
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.loadData()
      }
    },
  },
  methods: {
    loadData() {
      const filter = {
        limit: 500,
        skip: 0,
        sort: ['createAt desc'],
        where: {
          status: {
            $ne: 'invalid', //过滤 invild
          },
        },
      }
      this.$axios
        .get(
          `api/tcm/subscribe?filter=${encodeURIComponent(JSON.stringify(filter))}`,
        )
        .then((data) => {
          this.list =
            data.items
              ?.filter((t) => t.status === 'active' && t.totalAmount !== 0)
              ?.map((item) => {
                item.subscriptionMethodLabel =
                  getPaymentMethod(
                    { periodUnit: item.periodUnit, type: item.subscribeType },
                    item.paymentMethod || 'Stripe',
                  ) || '-'

                if (item.subscribeItems?.length > 0) {
                  const it = item.subscribeItems[0] || {}
                  item.specLabel = it.specLabel = getSpec(it.spec) || '-'
                  const { resource = {} } = it
                  item.taskNum = resource.tags.length
                    ? (resource.tags[0]?.split('limitScheduleTask:')[1] || 0) *
                      1
                    : 0
                  item.canUsedNum =
                    item.taskNum - (resource.metric?.runningTaskNum || 0)
                  item.isMaximal = resource.spec?.name === '8xlarge'
                  item.subscriptionMethodLabel =
                    it.amount === 0
                      ? this.$t('packages_component_src_upgradefee_mianfei')
                      : item.subscriptionMethodLabel
                }
                return item
              }) || []
        })
    },

    handleClose() {
      this.$emit('update:visible', false)
    },

    //变更
    openChangeSubscribe(row) {
      this.handleClose()
      this.$refs?.ChangeSubscribeDetailDialog.openChange(row)
    },

    submit() {
      this.handleClose()
      if (this.goPage) {
        this.goPage()
        return
      }
      this.$router.push({
        name: 'createAgent',
      })
    },
  },
}
</script>

<template>
  <section>
    <el-dialog
      :title="$t('packages_business_components_upgradecharges_dingyueshengji')"
      :model-value="visible"
      :append-to-body="true"
      width="880px"
      class="paid-upgrade-dialog"
      :before-close="handleClose"
      @update:model-value="$emit('update:visible', $event)"
    >
      <div
        v-if="tooltip"
        class="py-2 px-4 bg-warning-light flex align-items-center"
      >
        <VIcon size="20" class="color-warning">info</VIcon>
        <span class="ml-2 color-warning">{{ tooltip }}</span>
      </div>

      <ul class="dialog__ul mt-6">
        <li v-for="(item, index) in list" :key="index" class="mb-6">
          <ElRow class="pl-2 py-2 bg-light border">
            <ElCol :span="6">{{
              $t('packages_business_components_upgradecharges_dangqianguige')
            }}</ElCol>
            <ElCol :span="6">{{
              $t('packages_business_components_upgradecharges_keyongrenwushu')
            }}</ElCol>
            <ElCol :span="6">{{
              $t('packages_business_components_upgradecharges_dingyuefangshi')
            }}</ElCol>
            <ElCol :span="6">{{ $t('public_operation') }}</ElCol>
          </ElRow>

          <ElRow class="content__row pl-2 py-2 border">
            <ElCol :span="6"> {{ item.specLabel }} </ElCol>
            <ElCol :span="6">
              <span class="color-danger">0</span>/<span>{{
                item.taskNum
              }}</span>
            </ElCol>
            <ElCol :span="6"> {{ item.subscriptionMethodLabel }} </ElCol>
            <ElCol :span="6">
              <ElLink
                type="primary"
                :disabled="item.isMaximal"
                @click="openChangeSubscribe(item)"
                >{{
                  $t('packages_business_components_upgradecharges_shengjiguige')
                }}</ElLink
              >
            </ElCol>
          </ElRow>
        </li>
      </ul>

      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="submit">{{
            $t('packages_business_components_upgradecharges_dingyuexinyinqing')
          }}</ElButton>
        </div>
      </template>
    </el-dialog>
    <!--变更-->
    <OrderChange ref="ChangeSubscribeDetailDialog" />
  </section>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 0 20px 30px 20px;
}

.dialog__ul {
  max-height: 400px;
  overflow-y: auto;
}
.content__row {
  margin-top: -1px;
}
</style>
