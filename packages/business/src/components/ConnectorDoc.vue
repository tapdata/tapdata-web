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
  'big-query': 'prerequisites/warehouses-and-lake/big-query',
  clickhouse: 'prerequisites/warehouses-and-lake/clickhouse',
  databend: 'prerequisites/warehouses-and-lake/databend',
  doris: 'prerequisites/warehouses-and-lake/doris',
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
  'mongodb-atlas': 'prerequisites/on-prem-databases/mongodb-atlas',
  'mrs-hive3': 'prerequisites/on-prem-databases/mrs-hive3',
  mysql: 'prerequisites/on-prem-databases/mysql',
  'mysql-pxc': 'prerequisites/on-prem-databases/mysql-pxc',
  oceanbase: 'prerequisites/on-prem-databases/oceanbase',
  opengauss: 'prerequisites/on-prem-databases/opengauss',
  oracle: 'prerequisites/on-prem-databases/oracle',
  postgresql: 'prerequisites/on-prem-databases/postgresql',
  redis: 'prerequisites/on-prem-databases/redis',
  sqlserver: 'prerequisites/on-prem-databases/sqlserver',
  tdengine: 'prerequisites/on-prem-databases/tdengine',
  tidb: 'prerequisites/on-prem-databases/tidb',
  'aliyun-adb-mysql': 'prerequisites/cloud-databases/aliyun-adb-mysql',
  'aliyun-adb-postgresql': 'prerequisites/cloud-databases/aliyun-adb-postgresql',
  'aliyun-mongodb': 'prerequisites/cloud-databases/aliyun-mongodb',
  'aliyun-rds-for-mariadb': 'prerequisites/cloud-databases/aliyun-rds-for-mariadb',
  'aliyun-rds-for-mongodb': 'prerequisites/cloud-databases/aliyun-rds-for-mongodb',
  'aliyun-rds-for-mysql': 'prerequisites/cloud-databases/aliyun-rds-for-mysql',
  'aliyun-rds-for-pg': 'prerequisites/cloud-databases/aliyun-rds-for-pg',
  'aliyun-rds-for-sql-server': 'prerequisites/cloud-databases/aliyun-rds-for-sql-server',
  'amazon-rds-mysql': 'prerequisites/cloud-databases/amazon-rds-mysql',
  'polardb-mysql': 'prerequisites/cloud-databases/polardb-mysql',
  'polardb-postgresql': 'prerequisites/cloud-databases/polardb-postgresql',
  'tencentdb-for-mariadb': 'prerequisites/cloud-databases/tencentdb-for-mariadb',
  'tencentdb-for-mongodb': 'prerequisites/cloud-databases/tencentdb-for-mongodb',
  'tencentdb-for-mysql': 'prerequisites/cloud-databases/tencentdb-for-mysql',
  'tencentdb-for-pg': 'prerequisites/cloud-databases/tencentdb-for-pg',
  'tencentdb-for-sql-server': 'prerequisites/cloud-databases/tencentdb-for-sql-server',
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
  greenplum: 'prerequisites/warehouses-and-lake/greenplum',
  dws: 'prerequisites/warehouses-and-lake/gaussdb',
  kafka_enhanced: 'prerequisites/mq-and-middleware/kafka-enhanced'
}

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
  'tencent-db-sqlserver': 'tencentdb-for-sql-server'
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
      const map = pdkDocMap // config.json 维护目前意义不大，每次还是得重新打包
      return map[pdkNameDictionary[this.pdkId] || this.pdkId]
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
