<template>
  <div class="h-100">
    <GitBook v-if="!showIframe" class="bg-white border-0" :value="doc"></GitBook>
    <iframe v-else ref="docsIframe" :src="src" class="w-100 h-100 block"> </iframe>
  </div>
</template>

<script>
import { GitBook } from '@tap/component'
import { pdkApi } from '@tap/api'

const pdkDocMap = {
  'big-query': 'cloud/prerequisites/warehouses-and-lake/big-query',
  clickhouse: 'cloud/prerequisites/warehouses-and-lake/clickhouse',
  databend: 'cloud/prerequisites/warehouses-and-lake/databend',
  doris: 'cloud/prerequisites/warehouses-and-lake/doris',
  selectdb: 'cloud/prerequisites/warehouses-and-lake/selectdb',
  tablestore: 'cloud/prerequisites/warehouses-and-lake/tablestore',
  yashandb: 'cloud/prerequisites/warehouses-and-lake/yashandb',
  dameng: 'cloud/prerequisites/on-prem-databases/dameng',
  db2: 'cloud/prerequisites/on-prem-databases/db2',
  elasticsearch: 'cloud/prerequisites/on-prem-databases/elasticsearch',
  'gbase-8a': 'cloud/prerequisites/on-prem-databases/gbase-8a',
  'gbase-8s': 'cloud/prerequisites/on-prem-databases/gbase-8s',
  hive1: 'cloud/prerequisites/on-prem-databases/hive1',
  hive3: 'cloud/prerequisites/on-prem-databases/hive3',
  informix: 'cloud/prerequisites/on-prem-databases/informix',
  'kingbase-es-r3': 'cloud/prerequisites/on-prem-databases/kingbase-es-r3',
  'kingbase-es-r6': 'cloud/prerequisites/on-prem-databases/kingbase-es-r6',
  mariadb: 'cloud/prerequisites/on-prem-databases/mariadb',
  mongodb: 'cloud/prerequisites/on-prem-databases/mongodb',
  'mongodb-atlas': 'cloud/prerequisites/on-prem-databases/mongodb-atlas',
  'mrs-hive3': 'cloud/prerequisites/on-prem-databases/mrs-hive3',
  mysql: 'cloud/prerequisites/on-prem-databases/mysql',
  'mysql-pxc': 'cloud/prerequisites/on-prem-databases/mysql-pxc',
  oceanbase: 'cloud/prerequisites/on-prem-databases/oceanbase',
  opengauss: 'cloud/prerequisites/on-prem-databases/opengauss',
  oracle: 'cloud/prerequisites/on-prem-databases/oracle',
  postgresql: 'cloud/prerequisites/on-prem-databases/postgresql',
  redis: 'cloud/prerequisites/on-prem-databases/redis',
  sqlserver: 'cloud/prerequisites/on-prem-databases/sqlserver',
  tdengine: 'cloud/prerequisites/on-prem-databases/tdengine',
  tidb: 'cloud/prerequisites/on-prem-databases/tidb',
  'aliyun-adb-mysql': 'cloud/prerequisites/cloud-databases/aliyun-adb-mysql',
  'aliyun-adb-postgresql': 'cloud/prerequisites/cloud-databases/aliyun-adb-postgresql',
  'aliyun-mongodb': 'cloud/prerequisites/cloud-databases/aliyun-mongodb',
  'aliyun-rds-for-mariadb': 'cloud/prerequisites/cloud-databases/aliyun-rds-for-mariadb',
  'aliyun-rds-for-mongodb': 'cloud/prerequisites/cloud-databases/aliyun-rds-for-mongodb',
  'aliyun-rds-for-mysql': 'cloud/prerequisites/cloud-databases/aliyun-rds-for-mysql',
  'aliyun-rds-for-pg': 'cloud/prerequisites/cloud-databases/aliyun-rds-for-pg',
  'aliyun-rds-for-sql-server': 'cloud/prerequisites/cloud-databases/aliyun-rds-for-sql-server',
  'amazon-rds-mysql': 'cloud/prerequisites/cloud-databases/amazon-rds-mysql',
  'polardb-mysql': 'cloud/prerequisites/cloud-databases/polardb-mysql',
  'polardb-postgresql': 'cloud/prerequisites/cloud-databases/polardb-postgresql',
  'tencentdb-for-mariadb': 'cloud/prerequisites/cloud-databases/tencentdb-for-mariadb',
  'tencentdb-for-mongodb': 'cloud/prerequisites/cloud-databases/tencentdb-for-mongodb',
  'tencentdb-for-mysql': 'cloud/prerequisites/cloud-databases/tencentdb-for-mysql',
  'tencentdb-for-pg': 'cloud/prerequisites/cloud-databases/tencentdb-for-pg',
  'tencentdb-for-sql-server': 'cloud/prerequisites/cloud-databases/tencentdb-for-sql-server',
  activemq: 'cloud/prerequisites/mq-and-middleware/activemq',
  'ai-chat': 'cloud/prerequisites/mq-and-middleware/ai-chat',
  'bes-channels': 'cloud/prerequisites/mq-and-middleware/bes-channels',
  'hazelcast-cloud': 'cloud/prerequisites/mq-and-middleware/hazelcast-cloud',
  kafka: 'cloud/prerequisites/mq-and-middleware/kafka',
  rabbitmq: 'cloud/prerequisites/mq-and-middleware/rabbitmq',
  rocketmq: 'cloud/prerequisites/mq-and-middleware/rocketmq',
  hubspot: 'cloud/prerequisites/crm-and-sales-analytics/hubspot',
  metabase: 'cloud/prerequisites/crm-and-sales-analytics/metabase',
  salesforce: 'cloud/prerequisites/crm-and-sales-analytics/salesforce',
  'zoho-crm': 'cloud/prerequisites/crm-and-sales-analytics/zoho-crm',
  coding: 'cloud/prerequisites/saas-and-api/coding',
  github: 'cloud/prerequisites/saas-and-api/github',
  'lark-approval': 'cloud/prerequisites/saas-and-api/lark-approval',
  'lark-doc': 'cloud/prerequisites/saas-and-api/lark-doc',
  'lark-im': 'cloud/prerequisites/saas-and-api/lark-im',
  'lark-task': 'cloud/prerequisites/saas-and-api/lark-task',
  'quick-api': 'cloud/prerequisites/saas-and-api/quick-api',
  vika: 'cloud/prerequisites/saas-and-api/vika',
  'zoho-desk': 'cloud/prerequisites/saas-and-api/zoho-desk',
  'alibaba-1688': 'cloud/prerequisites/e-commerce/alibaba-1688',
  shein: 'cloud/prerequisites/e-commerce/shein',
  csv: 'cloud/prerequisites/files/csv',
  excel: 'cloud/prerequisites/files/excel',
  json: 'cloud/prerequisites/files/json',
  xml: 'cloud/prerequisites/files/xml',
  'custom-connection': 'cloud/prerequisites/others/custom-connection',
  dummy: 'cloud/prerequisites/others/dummy',
  'http-receiver': 'cloud/prerequisites/others/http-receiver',
  greenplum: 'cloud/prerequisites/warehouses-and-lake/greenplum',
}
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
}

export default {
  name: 'ConnectorDoc',

  props: {
    pdkId: String,
    pdkHash: String,
  },

  components: {
    GitBook,
  },

  data() {
    return {
      isDaas: import.meta.env.VITE_PLATFORM === 'DAAS',
      doc: '',
    }
  },

  computed: {
    docUrl() {
      const map = window.__config__?.docLinkDictionary || pdkDocMap
      return map[pdkNameDictionary[this.pdkId] || this.pdkId]
    },
    src() {
      const domain =
        !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en'
          ? 'https://docs.tapdata.io/'
          : 'https://docs.tapdata.net/'
      return domain + this.docUrl + '?from=cloud'
    },
    showIframe() {
      return !this.isDaas && this.docUrl
    },
  },

  created() {
    if (!this.showIframe) {
      this.getPdkDoc()
    }
  },

  methods: {
    getPdkDoc() {
      pdkApi.doc(this.pdkHash).then((res) => {
        this.doc = res?.data
      })
    },
  },
}
</script>
