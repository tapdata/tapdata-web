<script setup lang="ts">
import { pdkApi } from '@tap/api'
import GitBook from '@tap/component/src/GitBook.vue'
import { useI18n } from '@tap/i18n'
import { useDark } from '@vueuse/core'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useStore } from 'vuex'

const pdkDocMap = {
  'supported-databases': 'prerequisites/supported-databases',
  'big-query': 'prerequisites/warehouses-and-lake/big-query',
  clickhouse: 'prerequisites/warehouses-and-lake/clickhouse',
  databend: 'prerequisites/warehouses-and-lake/databend',
  doris: 'prerequisites/warehouses-and-lake/doris',
  gaussdb: 'prerequisites/warehouses-and-lake/gaussdb',
  greenplum: 'prerequisites/warehouses-and-lake/greenplum',
  hudi: 'prerequisites/warehouses-and-lake/hudi',
  selectdb: 'prerequisites/warehouses-and-lake/selectdb',
  tablestore: 'prerequisites/warehouses-and-lake/tablestore',
  yashandb: 'prerequisites/warehouses-and-lake/yashandb',
  dameng: 'prerequisites/on-prem-databases/dameng',
  db2: 'prerequisites/on-prem-databases/db2',
  elasticsearch: 'prerequisites/on-prem-databases/elasticsearch',
  'gbase-8a': 'prerequisites/on-prem-databases/gbase-8a',
  'gbase-8s': 'prerequisites/on-prem-databases/gbase-8s',
  hive1: 'prerequisites/on-prem-databases/hive1',
  hive3: 'prerequisites/on-prem-databases/hive3',
  informix: 'prerequisites/on-prem-databases/informix',
  'kingbase-es-r3': 'prerequisites/on-prem-databases/kingbase-es-r3',
  'kingbase-es-r6': 'prerequisites/on-prem-databases/kingbase-es-r6',
  mariadb: 'prerequisites/on-prem-databases/mariadb',
  mongodb: 'prerequisites/on-prem-databases/mongodb',
  'mongodb-below34': 'prerequisites/on-prem-databases/mongodb-below34',
  'mongodb-atlas': 'prerequisites/on-prem-databases/mongodb-atlas',
  'mrs-hive3': 'prerequisites/on-prem-databases/mrs-hive3',
  mysql: 'prerequisites/on-prem-databases/mysql',
  'mysql-pxc': 'prerequisites/on-prem-databases/mysql-pxc',
  oceanbase: 'prerequisites/on-prem-databases/oceanbase',
  'oceanbase-oracle': 'prerequisites/on-prem-databases/oceanbase-oracle',
  opengauss: 'prerequisites/on-prem-databases/opengauss',
  oracle: 'prerequisites/on-prem-databases/oracle',
  postgresql: 'prerequisites/on-prem-databases/postgresql',
  redis: 'prerequisites/on-prem-databases/redis',
  sqlserver: 'prerequisites/on-prem-databases/sqlserver',
  sybase: 'prerequisites/on-prem-databases/sybase',
  tdengine: 'prerequisites/on-prem-databases/tdengine',
  tidb: 'prerequisites/on-prem-databases/tidb',
  vastbase: 'prerequisites/on-prem-databases/vastbase',
  'aliyun-adb-mysql': 'prerequisites/cloud-databases/aliyun-adb-mysql',
  'aliyun-adb-postgresql':
    'prerequisites/cloud-databases/aliyun-adb-postgresql',
  'aliyun-mongodb': 'prerequisites/cloud-databases/aliyun-mongodb',
  'aliyun-rds-for-mariadb':
    'prerequisites/cloud-databases/aliyun-rds-for-mariadb',
  'aliyun-rds-for-mongodb':
    'prerequisites/cloud-databases/aliyun-rds-for-mongodb',
  'aliyun-rds-for-mysql': 'prerequisites/cloud-databases/aliyun-rds-for-mysql',
  'aliyun-rds-for-pg': 'prerequisites/cloud-databases/aliyun-rds-for-pg',
  'aliyun-rds-for-sql-server':
    'prerequisites/cloud-databases/aliyun-rds-for-sql-server',
  'amazon-rds-mysql': 'prerequisites/cloud-databases/amazon-rds-mysql',
  'huawei-cloud-gaussdb': 'prerequisites/cloud-databases/huawei-cloud-gaussdb',
  'polardb-mysql': 'prerequisites/cloud-databases/polardb-mysql',
  'polardb-postgresql': 'prerequisites/cloud-databases/polardb-postgresql',
  'tencentdb-for-mariadb':
    'prerequisites/cloud-databases/tencentdb-for-mariadb',
  'tencentdb-for-mongodb':
    'prerequisites/cloud-databases/tencentdb-for-mongodb',
  'tencentdb-for-mysql': 'prerequisites/cloud-databases/tencentdb-for-mysql',
  'tencentdb-for-pg': 'prerequisites/cloud-databases/tencentdb-for-pg',
  'tencentdb-for-sql-server':
    'prerequisites/cloud-databases/tencentdb-for-sql-server',
  'tencentdb-td-mysql': 'prerequisites/cloud-databases/tencentdb-td-mysql',
  activemq: 'prerequisites/mq-and-middleware/activemq',
  'ai-chat': 'prerequisites/mq-and-middleware/ai-chat',
  'bes-channels': 'prerequisites/mq-and-middleware/bes-channels',
  'hazelcast-cloud': 'prerequisites/mq-and-middleware/hazelcast-cloud',
  kafka: 'prerequisites/mq-and-middleware/kafka',
  rabbitmq: 'prerequisites/mq-and-middleware/rabbitmq',
  rocketmq: 'prerequisites/mq-and-middleware/rocketmq',
  hubspot: 'prerequisites/crm-and-sales-analytics/hubspot',
  metabase: 'prerequisites/crm-and-sales-analytics/metabase',
  salesforce: 'prerequisites/crm-and-sales-analytics/salesforce',
  'zoho-crm': 'prerequisites/crm-and-sales-analytics/zoho-crm',
  coding: 'prerequisites/saas-and-api/coding',
  'feishu-bitable': 'prerequisites/saas-and-api/feishu-bitable',
  github: 'prerequisites/saas-and-api/github',
  'lark-approval': 'prerequisites/saas-and-api/lark-approval',
  'lark-doc': 'prerequisites/saas-and-api/lark-doc',
  'lark-im': 'prerequisites/saas-and-api/lark-im',
  'lark-task': 'prerequisites/saas-and-api/lark-task',
  'quick-api': 'prerequisites/saas-and-api/quick-api',
  vika: 'prerequisites/saas-and-api/vika',
  'zoho-desk': 'prerequisites/saas-and-api/zoho-desk',
  'alibaba-1688': 'prerequisites/e-commerce/alibaba-1688',
  shein: 'prerequisites/e-commerce/shein',
  csv: 'prerequisites/files/csv',
  excel: 'prerequisites/files/excel',
  json: 'prerequisites/files/json',
  xml: 'prerequisites/files/xml',
  'custom-connection': 'prerequisites/others/custom-connection',
  dummy: 'prerequisites/others/dummy',
  'http-receiver': 'prerequisites/others/http-receiver',
  'mock-source': 'prerequisites/others/mock-source',
  'mock-target': 'prerequisites/others/mock-target',
  dws: 'prerequisites/warehouses-and-lake/gaussdb',
  kafka_enhanced: 'prerequisites/mq-and-middleware/kafka-enhanced',
} as const

// 维护一个DocMap还有一个NameDictionary的原因是，docMap从文档仓库直接复制过来，有些命名和pdkId不一致
const pdkNameDictionary = {
  ali1688: 'alibaba-1688',
  'aliyun-adb-postgres': 'aliyun-adb-postgresql',
  'aliyun-db-mongodb': 'aliyun-mongodb',
  'aliyun-rds-mariadb': 'aliyun-rds-for-mariadb',
  'aliyun-rds-mysql': 'aliyun-rds-for-mysql',
  'aliyun-rds-postgres': 'aliyun-rds-for-pg',
  'aliyun-rds-sqlserver': 'aliyun-rds-for-sql-server',
  'aws-rds-mysql': 'amazon-rds-mysql',
  bigquery: 'big-query',
  custom: 'custom-connection',
  gbase8a: 'gbase-8a',
  gbase8s: 'gbase-8s',
  greenplum: 'greenplum',
  hazelcast: 'hazelcast-cloud',
  kingbaser3: 'kingbase-es-r3',
  kingbaser6: 'kingbase-es-r6',
  'open-gauss': 'opengauss',
  'polar-db-mysql': 'polardb-mysql',
  'polar-db-postgres': 'polardb-postgresql',
  postgres: 'postgresql',
  quickapi: 'quick-api',
  'tencent-db-mariadb': 'tencentdb-for-mariadb',
  'tencent-db-mongodb': 'tencentdb-for-mongodb',
  'tencent-db-mysql': 'tencentdb-for-mysql',
  'tencent-db-postgres': 'tencentdb-for-pg',
  'tencent-db-sqlserver': 'tencentdb-for-sql-server',
  mongodb3: 'mongodb-below34',
} as const

interface Props {
  pdkId?: string
  pdkHash?: string
}

const props = defineProps<Props>()

const { locale } = useI18n()
const store = useStore()
const isDark = useDark()
const isDaas = ref(import.meta.env.VUE_APP_PLATFORM === 'DAAS')
const doc = ref('')
const iframe = ref<HTMLIFrameElement>()

const docUrl = computed(() => {
  const map = pdkDocMap
  return map[
    pdkNameDictionary[props.pdkId as keyof typeof pdkNameDictionary] ||
      (props.pdkId as keyof typeof pdkDocMap)
  ]
})

const src = computed(() => {
  let domain

  if (isDaas.value) {
    domain = locale.value === 'en' ? '/docs/en/' : '/docs/'
  } else {
    domain =
      !store.getters.isDomesticStation || locale.value === 'en'
        ? 'https://docs.tapdata.io/'
        : 'https://docs.tapdata.net/'
  }

  return `${domain + docUrl.value}?from=cloud`
})

const showIframe = computed(() => {
  return !!docUrl.value
})

const getPdkDoc = () => {
  if (!props.pdkHash) return
  pdkApi.doc(props.pdkHash).then((res) => {
    doc.value = res?.data
  })
}

// Initialize doc if no iframe should be shown
if (!showIframe.value) {
  getPdkDoc()
}

onMounted(() => {
  // iframe ref is available after mount
})

const setIFrameTheme = () => {
  // if (iframe.value?.contentDocument?.documentElement) {
  //   if (isDark.value) {
  //     iframe.value.contentDocument.documentElement.dataset.theme = 'dark'
  //   } else {
  //     iframe.value.contentDocument.documentElement.dataset.theme = 'light'
  //   }
  // }
}

watchEffect(() => {
  setIFrameTheme()
})
</script>

<template>
  <div class="h-100">
    <GitBook v-if="!showIframe" class="bg-white border-0" :value="doc" />
    <iframe
      v-else
      ref="iframe"
      :src="src"
      class="w-100 h-100 block"
      @load="setIFrameTheme"
    />
  </div>
</template>
