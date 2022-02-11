<template>
  <div>
    <Mapping ref="mapping"></Mapping>
  </div>
</template>

<script>
import Mapping from '../../editor/plugins/link/Mapping'
import _ from 'lodash'

export default {
  name: 'Test',
  components: { Mapping },

  data() {
    return {}
  },

  mounted() {
    // let source = {"table_name":"Application","cdc_enabled":true,"meta_type":"collection","fields":[{"field_name":"_id","table_name":"Application","data_type":"OBJECT_ID","primary_key_position":1,"dataType":7,"is_nullable":true,"original_field_name":"_id","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3e9"},{"field_name":"clientName","table_name":"Application","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"clientName","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3ea"},{"field_name":"clientSecret","table_name":"Application","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"clientSecret","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3eb"},{"field_name":"clientType","table_name":"Application","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"clientType","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3ec"},{"field_name":"clientURI","table_name":"Application","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"clientURI","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3ed"},{"field_name":"grantTypes","table_name":"Application","data_type":"ARRAY","primary_key_position":0,"dataType":4,"is_nullable":true,"original_field_name":"grantTypes","javaType":"Array","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3ee"},{"field_name":"redirectURIs","table_name":"Application","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"redirectURIs","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3ef"},{"field_name":"responseTypes","table_name":"Application","data_type":"ARRAY","primary_key_position":0,"dataType":4,"is_nullable":true,"original_field_name":"responseTypes","javaType":"Array","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3f0"},{"field_name":"scopes","table_name":"Application","data_type":"ARRAY","primary_key_position":0,"dataType":4,"is_nullable":true,"original_field_name":"scopes","javaType":"Array","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3f1"},{"field_name":"tokenType","table_name":"Application","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"tokenType","javaType":"String","columnSize":0,"autoincrement":false,"id":"5e743ceef99e458eb31fc3f2"}]};
    let target = {
      table_name: 'Application',
      cdc_enabled: true,
      meta_type: 'collection',
      fields: [
        {
          field_name: '_id',
          table_name: 'Application',
          data_type: 'OBJECT_ID',
          primary_key_position: 1,
          dataType: 7,
          is_nullable: true,
          original_field_name: '_id',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3e9'
        },
        {
          field_name: 'clientName',
          table_name: 'Application',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'clientName',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3ea'
        },
        {
          field_name: 'clientSecret',
          table_name: 'Application',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'clientSecret',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3eb'
        },
        {
          field_name: 'clientType',
          table_name: 'Application',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'clientType',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3ec'
        },
        {
          field_name: 'clientURI',
          table_name: 'Application',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'clientURI',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3ed'
        },
        {
          field_name: 'grantTypes',
          table_name: 'Application',
          data_type: 'ARRAY',
          primary_key_position: 0,
          dataType: 4,
          is_nullable: true,
          original_field_name: 'grantTypes',
          javaType: 'Array',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3ee'
        },
        {
          field_name: 'redirectURIs',
          table_name: 'Application',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'redirectURIs',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3ef'
        },
        {
          field_name: 'responseTypes',
          table_name: 'Application',
          data_type: 'ARRAY',
          primary_key_position: 0,
          dataType: 4,
          is_nullable: true,
          original_field_name: 'responseTypes',
          javaType: 'Array',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3f0'
        },
        {
          field_name: 'scopes',
          table_name: 'Application',
          data_type: 'ARRAY',
          primary_key_position: 0,
          dataType: 4,
          is_nullable: true,
          original_field_name: 'scopes',
          javaType: 'Array',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3f1'
        },
        {
          field_name: 'tokenType',
          table_name: 'Application',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'tokenType',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc3f2'
        },
        {
          field_name: 'ApiServer',
          javaType: 'Map',
          data_type: 'DOCUMENT',
          table_name: 'ApiServer',
          original_field_name: 'ApiServer'
        },
        {
          field_name: 'ApiServer._id',
          table_name: 'ApiServer',
          data_type: 'OBJECT_ID',
          primary_key_position: 1,
          dataType: 7,
          is_nullable: true,
          original_field_name: 'ApiServer._id',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc5b7'
        },
        {
          field_name: 'ApiServer.clientName',
          table_name: 'ApiServer',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'ApiServer.clientName',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc5b8'
        },
        {
          field_name: 'ApiServer.clientURI',
          table_name: 'ApiServer',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'ApiServer.clientURI',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc5b9'
        },
        {
          field_name: 'ApiServer.processId',
          table_name: 'ApiServer',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'ApiServer.processId',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc5ba'
        },
        {
          field_name: 'ApiServer.user_id',
          table_name: 'ApiServer',
          data_type: 'STRING',
          primary_key_position: 0,
          dataType: 2,
          is_nullable: true,
          original_field_name: 'ApiServer.user_id',
          javaType: 'String',
          columnSize: 0,
          autoincrement: false,
          id: '5e743ceef99e458eb31fc5bb'
        }
      ]
    }
    this.$refs.mapping.setSchema(_.cloneDeep(target), target)
  }
}
</script>

<style lang="scss" scoped></style>
