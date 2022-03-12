import mysql from './mysql'
import oracle from './oracle'
import sqlserver from './sqlserver'
import db2 from './db2'
import mongodb from './mongodb'
import postgres from './postgres'
import elasticsearch from './elasticsearch'
import redis from './redis'
import file from './file'
import kafka from './kafka'
import mariadb from './maria'
import mysqlpxc from './mysqlpxc'
import sybasease from './sybasease'
import gbase8s from './gbase8s'
import gaussdb200 from './gaussdb200'
import restapi from './restapi'
import custom_connection from './custom_connection'
import gridfs from './gridfs'
import dummydb from './dummydb'
import jira from './jira'
import dameng from './dameng'
import hive from './hive'
import tcp_udp from './tcp_udp'
import vika from './vika'
import mq from './mq'
import hbase from './hbase'
import kudu from './kudu'
import greenplum from './greenplum'
import tidb from './tidb'
import hana from './hana'
import clickhouse from './clickhouse'
import kundb from './kundb'
import adb_postgres from './adb_postgres'
import adb_mysql from './adb_mysql'
import hazelcast_cloud_cluster from './hazelcast_cloud_cluster'

export default {
  mysql,
  oracle,
  sqlserver,
  db2,
  mongodb,
  postgres,
  elasticsearch,
  redis,
  file,
  kafka,
  mariadb,
  mysqlpxc,
  jira,
  hive,
  vika,
  sybasease,
  gbase8s,
  gaussdb200,
  dummydb,
  restapi,
  custom_connection,
  gridfs,
  mq,
  dameng,
  tcp_udp,
  hbase,
  kudu,
  greenplum,
  tidb,
  hana,
  clickhouse,
  kundb,
  adb_postgres,
  adb_mysql,
  hazelcast_cloud_cluster
}
