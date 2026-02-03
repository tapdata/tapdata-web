<script setup lang="ts">
import { callProxy } from '@tap/api/src/core/proxy'
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const getDefaultState = () => ({
  errorStack: '',
  errorCode: '',
  fullErrorCode: '',
  describe: '',
  solution: '',
  dynamicDescribe: '',
  seeAlso: [],
  module: '',
  message: '',
  dynamicDescriptionParameters: '',
})

const props = defineProps<{
  taskId: string
}>()

const { t, locale } = useI18n()
const router = useRouter()

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const hideSeeAlso =
  import.meta.env.VUE_APP_PAGE_TITLE === 'IKAS' ||
  import.meta.env.VUE_APP_HIDE_LOG_SEE_ALSO

const visible = ref(false)
const isExpanded = ref(false)
const state = reactive(getDefaultState())

const handleCreateTicket = () => {
  if (state.errorStack) {
    const errorCode = state.fullErrorCode || state.errorCode

    window.open(
      router.resolve({
        name: 'TicketSystem',
        query: {
          form: encodeURIComponent(
            JSON.stringify({
              jobId: props.taskId,
              subject: `${errorCode}-${state.message}`,
              description: `Error Code: ${errorCode}
Module: ${state.module || ''}
Describe: ${state.describe ? `\n${state.describe}` : ''}
Stack Trace: ${state.errorStack ? `\n${state.errorStack}` : ''}`,
            }),
          ),
        },
      }).href,
    )
  }
}

const handleCopyStack = (stack: string) => {
  copyToClipboard(stack)
  ElMessage.success(t('public_message_copy_success'))
}

const handleOpen = (item: any) => {
  isExpanded.value = false

  Object.assign(state, {
    ...getDefaultState(),
    ...item,
  })

  const params = {
    className: 'ErrorCodeService',
    method: 'getErrorCodeWithDynamic',
    args: [
      state.errorCode,
      locale.value === 'en' ? 'en' : 'cn',
      state.dynamicDescriptionParameters,
    ],
  }

  callProxy(params)
    .then((data) => {
      Object.assign(state, data)

      state.describe = data.describe || item.message
    })
    .finally(() => {
      visible.value = true
    })
}

defineExpose({
  handleOpen,
})
</script>

<template>
  <ElDialog
    v-model="visible"
    width="80%"
    class="max-w-1000 mt-25 --padding"
    :close-on-click-modal="false"
    append-to-body
  >
    <template #header>
      <div class="flex align-center gap-2">
        <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
        <span class="fs-6 fw-sub">{{
          state.fullErrorCode || state.errorCode
        }}</span>
      </div>
    </template>

    <div class="font-color-light">
      <!--错误信息-->
      <template v-if="state.describe">
        <div class="fw-sub mb-3 font-color-dark">
          {{ $t('packages_business_milestone_list_cuowuxinxi') }}
        </div>
        <div class="mb-6 border rounded-xl overflow-hidden">
          <div
            class="error-stack-wrap text-prewrap font-color-light overflow-y-auto bg-subtle p-4 lh-base"
            v-html="state.describe"
          />
        </div>
      </template>

      <!--错误原因/描述-->
      <template v-if="state.dynamicDescribe">
        <div class="fw-sub mb-3 font-color-dark">
          {{ $t('public_task_reasons_for_error') }}
        </div>
        <div
          class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-xl p-4 lh-base"
          v-html="state.dynamicDescribe"
        />
      </template>

      <!--解决方案-->
      <template v-if="state.solution">
        <div class="fw-sub mb-3 font-color-dark">
          {{ $t('packages_business_solution') }}
        </div>
        <div
          class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-xl p-4 lh-base"
          v-html="state.solution"
        />
      </template>

      <!--See Also-->
      <template v-if="!hideSeeAlso && state.seeAlso && state.seeAlso.length">
        <div class="fw-sub mb-3 font-color-dark">See Also</div>
        <ol class="pl-6 mb-6">
          <li
            v-for="(item, index) in state.seeAlso"
            :key="index"
            class="list-decimal"
          >
            <ElLink
              type="primary"
              class="text-decoration-underline"
              @click="handleLink(item)"
              >{{ item }}</ElLink
            >
          </li>
        </ol>
      </template>

      <!--错误堆栈-->
      <template v-if="state.errorStack">
        <div class="mb-3 flex justify-content-between align-items-end">
          <span class="fw-sub font-color-dark">{{
            $t('packages_business_logs_nodelog_cuowuduizhan')
          }}</span>
        </div>
        <div
          class="error-stack-pre-wrap position-relative font-color-light rounded-xl"
        >
          <div class="position-absolute end-0 top-0 px-2 pt-1">
            <el-button
              text
              type="primary"
              class="px-1 py-0.5 font-color-dark"
              @click="handleCopyStack(state.errorStack)"
            >
              <VIcon class="mr-1">copy</VIcon>
              <span class="">{{ $t('public_button_copy') }}</span> </el-button
            ><el-button
              text
              type="primary"
              class="px-1 py-0.5 font-color-dark ml-2"
              @click="isExpanded = !isExpanded"
            >
              {{
                isExpanded
                  ? $t('packages_business_verification_details_shouqi')
                  : $t('public_button_expand')
              }}<i
                class="el-icon-arrow-down is-rotate ml-1"
                :class="{ 'is-active': isExpanded }"
              />
            </el-button>
          </div>

          <pre
            class="m-0 p-4 pt-0 mt-6 font-color-dark"
            :class="isExpanded ? '' : 'truncate-two-lines'"
            style="max-height: 400px; font-size: 13px; overflow-x: auto"
            >{{ state.errorStack }}</pre
          >
        </div>
      </template>
    </div>

    <template v-if="!isDaas" #footer>
      <ElButton @click="visible = false">{{
        $t('public_button_cancel')
      }}</ElButton>
      <ElButton type="primary" @click="handleCreateTicket">{{
        $t('dfs_user_contactus_chuangjiangongdan')
      }}</ElButton>
    </template>
  </ElDialog>
</template>
