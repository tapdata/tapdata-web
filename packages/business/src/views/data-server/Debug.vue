<script setup lang="ts">
import { debug, fetchApiServerToken, fetchWorkers } from '@tap/api'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { useI18n } from '@tap/i18n'
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from 'vue'
import getTemplate from './template'

interface Props {
  urlList?: any[]
  debugParams?: any
  host?: string
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  urlList: () => [],
  debugParams: () => ({}),
  visible: false,
})
const form = inject<Ref<any>>('form')!
const { t } = useI18n()
const workerStatus = ref('')
const token = ref<Record<string, any>>({})
const templateType = ref('java')
const debugMethod = ref('GET')
const debugResult = ref('')
const debugHttpInfo = ref<Record<string, any>>({})
const templates = ref<Record<string, string>>({})
const intervalId = ref()

const urlsMap = computed(() => {
  return props.urlList.reduce((acc: Record<string, string>, item) => {
    acc[item.method] = item.url + (item.last || '')
    return acc
  }, {})
})

const debugDisabled = computed(() => {
  return workerStatus.value !== 'running'
})

// Watch effects
watch(
  () => props.visible,
  (v) => {
    if (!v) {
      intervalId.value && clearTimeout(intervalId.value)
    }
  },
)

onBeforeUnmount(() => {
  intervalId.value && clearTimeout(intervalId.value)
})

const getAPIServerToken = async (
  callback?: (token: Record<string, any>) => void,
) => {
  token.value = await fetchApiServerToken()
  callback?.(token.value)
}

const reflshToken = () => {
  getAPIServerToken((token: Record<string, any>) => {
    templates.value = getTemplate(props.host + form.value.path, token)
  })
}

const getWorkers = () => {
  const where = {
    worker_type: 'api-server',
    ping_time: {
      gte: '$serverDate',
      gte_offset: 30000,
    },
  }
  const filter = {
    order: 'ping_time DESC',
    limit: 1,
    fields: {
      worker_status: true,
    },
    where,
  }
  fetchWorkers(filter)
    .then((data) => {
      if (data?.items?.length) {
        const record: Record<string, any> = data.items[0] || {}
        const worker = record.workerStatus || record.worker_status || {}
        workerStatus.value = worker.status
      } else {
        workerStatus.value = 'stop'
      }
    })
    .finally(() => {
      intervalId.value = setTimeout(getWorkers, 2000)
    })
}

const debugData = async () => {
  const params = props.debugParams
  const method = debugMethod.value
  if (method === 'TOKEN') {
    reflshToken()
    debugResult.value = JSON.stringify(token.value, null, 2)
    debugHttpInfo.value = {
      httpCode: 200,
    }
    return
  }
  const hostPath = urlsMap.value[debugMethod.value]?.replace(/\/$/, '') || ''
  const url = `${hostPath}?access_token=${token.value.access_token}`
  const queryBody = {
    apiId: form.value.id,
    url: null,
    method,
    headers: { 'Content-Type': 'application/json' },
    body: null,
    params: null,
  }

  if (params) {
    //@ts-ignore
    let filterInfo: Record<string, any> = {}
    try {
      filterInfo = params.filter ? JSON.parse(params.filter) : {}
    } catch {
      ElMessage.error(t('packages_business_data_server_drawer_filter'))
      return
    }

    let paramsStr = ''
    switch (method) {
      case 'GET':
        paramsStr = ''
        Object.keys(params).forEach((key: string) => {
          if (params[key]) {
            paramsStr = `${paramsStr}&${key}=${encodeURIComponent(params[key])}`
          }
        })
        //@ts-ignore
        queryBody.url = `${url}${paramsStr}`
        queryBody.params = params
        break
      case 'POST':
        Object.keys(params).forEach((key: string) => {
          if (params[key]) {
            filterInfo[key] = parseValue(key, params[key])
          }
        })
        //@ts-ignore
        filterInfo.limit = Number(params?.limit || 20)
        //@ts-ignore
        filterInfo.page = Number(params?.page || 1)
        filterInfo.fields = params.fields ? JSON.parse(params.fields) : []
        //@ts-ignore
        queryBody.body = filterInfo
        //@ts-ignore
        queryBody.url = url
        break
    }
  }
  try {
    const debugInfo = await debug(queryBody)
    debugHttpInfo.value = {
      httpCode: debugInfo.httpCode,
    }
    delete debugInfo.httpCode
    debugResult.value = debugInfo ? JSON.stringify(debugInfo, null, 2) : ''
  } catch (error: any) {
    const result = error?.response?.data
    debugResult.value = result ? JSON.stringify(result, null, 2) : ''
    debugHttpInfo.value = {
      httpCode: result?.code || result?.httpCode,
    }
  }
}

const getParamType = (key: string) => {
  for (const element of form.value.params) {
    const item = element
    if (item.name === key) {
      if (Array.isArray(item.type)) {
        return item.type.join(': ')
      } else {
        return item.type
      }
    }
  }
  return 'string'
}

const parseValue = (key: string, value: any, defaultVal?: any) => {
  if (!value) {
    return defaultVal || null
  }
  const type = getParamType(key)
  if (!type) {
    return defaultVal
  }

  if (type.includes('array')) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  switch (type) {
    case 'number':
      return Number(value || defaultVal)
    case 'boolean':
      return Boolean(value)
    default:
      return value || defaultVal
  }
}

onMounted(() => {
  reflshToken()
  getWorkers()
})
</script>

<template>
  <div class="data-server-panel__title mt-4 mb-3">
    {{ $t('packages_business_data_server_drawer_diaoyongfangshi') }}
  </div>
  <div class="flex gap-4">
    <el-input :model-value="urlsMap[debugMethod]" readonly>
      <template #prepend>
        <ElSelect v-model="debugMethod" style="width: 100px">
          <ElOption
            v-for="(item, i) in urlList"
            :key="i"
            :value="item.method"
          />
        </ElSelect>
      </template>
    </el-input>

    <ElButton type="primary" :disabled="debugDisabled" @click="debugData"
      >{{ $t('public_button_submit') }}
    </ElButton>
  </div>
  <div class="data-server-panel__title mt-4 mb-3">
    {{ $t('packages_business_data_server_drawer_fanhuijieguo') }}
    <el-tag
      v-if="debugHttpInfo.httpCode"
      style="margin-left: 0.5rem"
      :type="
        debugHttpInfo.httpCode &&
        debugHttpInfo.httpCode >= 200 &&
        debugHttpInfo.httpCode < 300
          ? 'success'
          : 'warning'
      "
      size="small"
      >{{ debugHttpInfo.httpCode }}</el-tag
    >
  </div>
  <VCodeEditor
    class="rounded-lg"
    height="280"
    lang="json"
    :options="{ printMargin: false, readOnly: true, wrap: 'free' }"
    :value="debugResult"
  />
  <div class="position-relative mt-4 mb-3">
    <div
      class="fs-7 fw-sub font-color-dark flex align-center"
      style="line-height: 36px; height: 36px"
    >
      <span class="data-server-panel__title my-0">
        {{ $t('packages_business_data_server_drawer_shilidaima') }}
      </span>
    </div>
    <ElTabs v-model="templateType" class="data-server__tabs flex-1">
      <ElTabPane name="java">
        <template #label><span>JAVA</span></template>
      </ElTabPane>
      <ElTabPane name="javascript">
        <template #label><span>JS</span></template>
      </ElTabPane>
      <ElTabPane name="python">
        <template #label><span>PYTHON</span></template>
      </ElTabPane>
    </ElTabs>
  </div>
  <VCodeEditor
    class="rounded-lg"
    height="280"
    :lang="templateType"
    :options="{ printMargin: false, readOnly: true, wrap: 'free' }"
    :value="templates[templateType]"
  />
</template>
