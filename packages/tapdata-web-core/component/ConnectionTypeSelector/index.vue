<template>
  <div class="database">
    <span class="title" v-if="types.length">Database</span>
    <ul class="item clearfix">
      <li v-for="item in types" :key="item" @click="$emit('select', item)">
        <div class="img-box">
          <img :src="getImgByType(item)" />
        </div>
        <div class="content">{{ typeMap[item] }}</div>
      </li>
      <li v-for="item in comingTypes" :key="item" class="item--disabled">
        <div class="img-box position-relative">
          <img :src="getImgByType(item)" />
          <div
            class="
              img-box__mask
              flex
              justify-center
              align-center
              position-absolute
              top-0
              bottom-0
              start-0
              end-0
            "
          >
            <span class="mask-text">即将上线</span>
          </div>
        </div>
        <div class="content">{{ typeMap[item] }}</div>
      </li>
    </ul>
    <span class="title" v-if="otherTypes && otherTypes.length > 0"
      >Other Type</span
    >
    <ul class="item clearfix">
      <li v-for="item in otherTypes" :key="item" @click="$emit('select', item)">
        <div class="img-box">
          <img :src="getImgByType(item)" />
        </div>
        <div class="content">{{ typeMap[item] }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
const TYPEMAP = {
  mysql: 'MySQL',
  oracle: 'Oracle',
  mongodb: 'MongoDB',
  elasticsearch: 'Elasticsearch',
  redis: 'Redis',
  postgres: 'PostgreSQL',
  sqlserver: 'SQL Server',
  'gbase-8s': 'GBase 8s',
  'sybase ase': 'Sybase ASE',
  gaussdb200: 'GaussDB200',
  db2: 'IBM Db2',
  mem_cache: 'Memory Cache',
  file: 'File(s)',
  custom_connection: 'Custom connection',
  'rest api': 'REST API',
  'dummy db': 'Dummy DB',
  gridfs: 'GridFS',
  kafka: 'Kafka',
  mariadb: 'MariaDB',
  'mysql pxc': 'MySQL PXC',
  jira: 'jira',
  dameng: 'DM DB',
  hive: 'Hive',
  tcp_udp: 'TCP/IP'
}
export default {
  name: 'ConnectionTypeSelector',
  props: {
    types: {
      value: Array,
      default: () => {
        return []
      }
    },
    comingTypes: {
      value: Array,
      default: () => {
        return []
      }
    },
    otherTypes: {
      value: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      typeMap: TYPEMAP
    }
  },
  methods: {
    getImgByType(type) {
      if (!type) {
        type = 'default'
      }
      return require(`./images/${type.toLowerCase()}.png`)
    }
  }
}
</script>

<style scoped lang="scss">
.database {
  .title {
    color: #999;
    margin-left: 20px;
    margin-bottom: 20px;
    display: inline-block;
  }
  .item {
    li {
      float: left;
      margin-left: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    .img-box {
      display: flex;
      width: 120px;
      height: 70px;
      justify-content: center;
      align-items: center;
      background: #fafafa;
      border: 1px solid #dedee4;
      border-radius: 3px;
      cursor: pointer;
      img {
        width: 35%;
      }
      &:hover {
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
      }
      .img-box__mask {
        margin: -1px;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.4);
        .mask-text {
          opacity: 0;
          color: #fff;
          font-weight: bold;
        }
        &:hover {
          .mask-text {
            opacity: 1;
          }
        }
      }
    }
    .content {
      font-size: 12px;
      margin-top: 5px;
    }
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: '';
  }

  .clearfix:after {
    clear: both;
  }

  .clearfix {
    *zoom: 1;
  }
}
</style>
