<template>
  <div class="api-doc">
    <div class="section-wrap-box h-100">
      <div class="api-doc-box">
        <el-button :title="$t('daas_api_page_apidocandtest_daochudaopo')" size="mini" @click="exportJson">
          {{ $t('button_export') }}
        </el-button>
      </div>
      <iframe src frameborder="0" class="doc-test-iframe" id="docTestIframe"></iframe>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'

import { ApiClient, apiServerApi } from '@tap/api'
import Cookie from '@tap/shared/src/cookie'
export default {
  name: 'ApiDocAndTest',
  data() {
    return {
      openapi: {},
      openapiAll: {},
      token: ''
    }
  },
  created() {
    // this.$emit('amount').$attrs.classname.isclass = true
    if (!parseInt(Cookie.get('user_id'))) {
      return this.$router.push({
        name: 'login',
        query: { redirect: '/apiAnalysis' }
      })
    }
  },
  async mounted() {
    try {
      let servers = await apiServerApi.get({
        'filter[where][clientName]': 'Default APIServer'
      })

      if (servers?.items?.length) {
        let defaultCollection = this.$route.query.collection || this.$route.query['id']

        this.apiClient = new ApiClient(defaultCollection)
        this.apiClient.setApiServer(servers.items[0])

        let openApi = `${servers.items[0].clientURI}/openapi-readOnly.json`
        // let openApiObj = await axios.get(openApi)
        let res = await fetch(openApi)
        let openApiObj = await res.json()

        if (openApiObj) {
          this.openapi = openApiObj
        }
        //全局open
        let openapiAll = `${servers.items[0].clientURI}/openapi.json`
        let resOpenApiAll = await fetch(openapiAll)
        let openapiAllObj = await resOpenApiAll.json()
        if (openapiAllObj) {
          this.openapiAll = openapiAllObj
        }

        // let token = this.$route.query.token || '';
        let token = await this.apiClient.getAPIServerToken()
        this.token = token

        let url = `${location.origin}/static/explorer/index.html?url=${openApi}&token=${token}#/`

        if (defaultCollection) {
          url = url + defaultCollection
        }

        let ifm = document.getElementById('docTestIframe')
        ifm.src = url
      } else {
        this.$message.error(this.$t('api_server_no_available')) || 'No available API Server'
      }
    } catch (e) {
      // eslint-disable-next-line
      console.log(e)
    }
  },
  methods: {
    exportJson() {
      let obj = this.openapiAll
      let tokenField = {
        in: 'header',
        name: 'access_token',
        schema: {
          type: 'string',
          default: this.token
        }
      }
      if (obj && obj.paths) {
        for (let x in obj.paths) {
          if (obj.paths[x]) {
            for (let y in obj.paths[x]) {
              if (obj.paths[x][y]) {
                if (!obj.paths[x][y].parameters || !Array.isArray(obj.paths[x][y].parameters)) {
                  obj.paths[x][y].parameters = []
                }
                obj.paths[x][y].parameters.push(tokenField)
              }
            }
          }
        }
        let server = window.location.origin
        obj.paths['/oauth/token'] = {
          servers: [{ url: server }],
          post: {
            'x-controller-name': 'oauth',
            'x-operation-name': 'oauth',
            tags: ['oauth'],
            summary: i18n.global.t('daas_api_page_apidocandtest_shouquanjiekou'),
            responses: {
              200: {
                description:
                  'Object of page data, result.data is AccessToken1 model instances, result.total is model count.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/AccessToken1'
                          }
                        },
                        total: {
                          type: 'object',
                          properties: {
                            count: {
                              type: 'number'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            requestBody: {
              description: '',
              content: {
                'application/x-www-form-urlencoded': {
                  schema: {
                    properties: {
                      grant_type: {
                        type: 'String',
                        default: 'client_credentials'
                      },
                      client_id: {
                        type: 'String'
                      },
                      client_secret: {
                        type: 'String'
                      }
                    }
                  }
                }
              }
            }
          }
        }

        let fileName = 'openApi.json'
        let fileString = JSON.stringify(obj)
        let urlObject = window.URL || window.webkitURL || window
        let export_blob = new Blob([fileString])
        let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
        save_link.href = urlObject.createObjectURL(export_blob)
        save_link.download = fileName
        let fakeClick = function (obj) {
          let ev = document.createEvent('MouseEvents')
          ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
          obj.dispatchEvent(ev)
        }
        fakeClick(save_link)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.api-doc {
  position: relative;
  height: 100%; /*// overflow: hidden !important;*/
  .api-doc-box {
    position: absolute;
    left: 43px;
    top: 20px;
    overflow: hidden;
  }
  .doc-test-iframe {
    min-height: 100%;
    width: 100%;
    padding-left: 85px;
  }
}
</style>
