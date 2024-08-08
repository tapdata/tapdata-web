<template>
  <section class="pay-container flex flex-column gap-4 overflow-hidden">
    <div class="flex-1 overflow-auto rounded-lg flex flex-column gap-4">
      <div class="bg-white rounded-lg p-4">
        <el-result :subTitle="$t('dfs_payment_progress_desc')" class="py-15">
          <template #icon>
            <div class="dot-pulse my-2"></div>
          </template>
          <template #title>
            <div class="text-center">
              <div class="fw-sub fs-5">{{ $t('dfs_payment_progress') }}</div>
            </div>
          </template>
          <template slot="extra">
            <el-button
              @click="
                $router.push({
                  name: 'payForBill',
                  params: {
                    id: billId
                  }
                })
              "
              size="medium"
              >{{ $t('dfs_retry_payment') }}</el-button
            >
            <el-button
              @click="
                $router.push({
                  name: 'order'
                })
              "
              type="primary"
              size="medium"
              >{{ $t('dfs_complete_payment') }}</el-button
            >
          </template>
        </el-result>
      </div>
    </div>
  </section>
</template>

<script>
import i18n from '@/i18n'
import { calcUnit } from '@tap/shared'

export default {
  components: {},

  data() {
    return {
      billId: ''
    }
  },

  created() {
    this.billId = this.$route.params.id

    this.timer = setInterval(() => {
      this.loadBill()
    }, 5000)
  },

  beforeDestroy() {
    clearInterval(this.timer)
  },

  methods: {
    async loadBill() {
      const {
        items: [bill]
      } = await this.$axios.get(
        `api/tcm/billing?filter=${encodeURIComponent(
          JSON.stringify({
            where: {
              id: this.billId
            }
          })
        )}`
      )

      if (bill?.status !== 'UNPAID') {
        this.$router.push({
          name: 'order'
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pay-container {
  ::v-deep {
    .el-form-item {
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 16px;
      }
      .el-form-item__label {
        line-height: 22px;
        padding-bottom: 8px;
      }
    }

    .label-grid {
      display: grid;
      grid-template-columns: auto 1fr; /* 两列 */
      grid-gap: 8px;
      grid-column-gap: 4px;
    }
  }
}
.pay-wrap {
  background-color: map-get($color, submenu);
}
.pay-main {
  width: 80%;
  height: 100vh;
  margin: 0 auto;
  padding-top: 65px;
}
.card {
  padding: 16px 24px;
  border-radius: 8px;
  border-top: 1px solid var(--unnamed, #e5e6eb);
  background: #fff;
}

.text-label {
  font-size: 0.875rem;
  line-height: 22px;
}

.payment-radio {
  ::v-deep {
    .el-radio__inner {
      vertical-align: top;
    }
  }
}
</style>
