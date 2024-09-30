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
  'aliyun-adb-postgresql': 'prerequisites/cloud-databases/aliyun-adb-postgresql',
  'aliyun-mongodb': 'prerequisites/cloud-databases/aliyun-mongodb',
  'aliyun-rds-for-mariadb': 'prerequisites/cloud-databases/aliyun-rds-for-mariadb',
  'aliyun-rds-for-mongodb': 'prerequisites/cloud-databases/aliyun-rds-for-mongodb',
  'aliyun-rds-for-mysql': 'prerequisites/cloud-databases/aliyun-rds-for-mysql',
  'aliyun-rds-for-pg': 'prerequisites/cloud-databases/aliyun-rds-for-pg',
  'aliyun-rds-for-sql-server': 'prerequisites/cloud-databases/aliyun-rds-for-sql-server',
  'amazon-rds-mysql': 'prerequisites/cloud-databases/amazon-rds-mysql',
  'huawei-cloud-gaussdb': 'prerequisites/cloud-databases/huawei-cloud-gaussdb',
  'polardb-mysql': 'prerequisites/cloud-databases/polardb-mysql',
  'polardb-postgresql': 'prerequisites/cloud-databases/polardb-postgresql',
  'tencentdb-for-mariadb': 'prerequisites/cloud-databases/tencentdb-for-mariadb',
  'tencentdb-for-mongodb': 'prerequisites/cloud-databases/tencentdb-for-mongodb',
  'tencentdb-for-pg': 'prerequisites/cloud-databases/tencentdb-for-pg',
  'tencentdb-for-sql-server': 'prerequisites/cloud-databases/tencentdb-for-sql-server',
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
  'mock-target': 'prerequisites/others/mock-target'
}

export default {
  name: 'ConnectorDoc',

  props: {
    pdkId: String,
    pdkHash: String
  },

  components: {
    GitBook
  },

  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      doc: ''
    }
  },

  computed: {
    docUrl() {
      return pdkDocMap[this.pdkId]
    },
    src() {
      let domain

      if (this.isDaas) {
        domain = this.$i18n.locale === 'en' ? '/docs/en/' : '/docs/'
      } else {
        domain =
          !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en'
            ? 'https://docs.tapdata.io/'
            : 'https://docs.tapdata.net/'
      }

      return domain + this.docUrl + '?from=cloud'
    },
    showIframe() {
      return !!this.docUrl
    }
  },

  created() {
    if (!this.showIframe) {
      this.getPdkDoc()
    }
  },

  methods: {
    getPdkDoc() {
      pdkApi.doc(this.pdkHash).then(res => {
        this.doc = res?.data
      })
    }
  }
}
</script>

<style scoped lang="scss"></style>
