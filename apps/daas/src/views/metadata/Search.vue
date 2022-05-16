<template>
  <section class="metadata-search-wrap section-wrap" :class="{ 'metadata-change-background': !showNoSearch }">
    <div class="section-wrap-box">
      <div class="no-search-box-wrap" v-show="showNoSearch">
        <div class="no-search-box">
          <header class="metadata-search-title link-primary">
            {{ $t('metadata.metadataSearch.title') }}
          </header>
          <el-input
            :placeholder="$t('metadata.metadataSearch.placeholder')"
            v-model="keyword"
            class="input-with"
            maxlength="100"
          >
            <el-select v-model="meta_type" slot="prepend" placeholder="请选择" class="input-with-select">
              <el-option :label="$t('metadata.metadataSearch.table')" value="table"></el-option>
              <el-option :label="$t('metadata.metadataSearch.column')" value="column"></el-option>
            </el-select>
            <el-button type="primary" slot="append" @click="handleSearch">{{
              $t('metadata.metadataSearch.search')
            }}</el-button>
          </el-input>
          <div class="desc">
            {{ $t('metadata.metadataSearch.desc') }}
          </div>
        </div>
      </div>
      <div class="search-box-wrap" v-show="!showNoSearch">
        <div class="search-box">
          <div class="search-header">
            <span class="search-title">{{ $t('metadata.metadataSearch.title') }}</span>
            <el-input
              class="input-with"
              :placeholder="$t('metadata.metadataSearch.placeholder')"
              v-model="keyword"
              ref="searchInput"
              maxlength="100"
              @keyup.native.13="handleSearch('')"
            >
              <el-select v-model="meta_type" slot="prepend" placeholder="请选择" class="input-with-select">
                <el-option :label="$t('metadata.metadataSearch.table')" value="table"></el-option>
                <el-option :label="$t('metadata.metadataSearch.column')" value="column"></el-option>
              </el-select>
              <el-button type="primary" slot="append" @click="handleSearch('')">{{
                $t('metadata.metadataSearch.search')
              }}</el-button>
            </el-input>
          </div>
          <div class="no-result" v-if="searchData.length === 0 && firstSearch === 0">
            {{ $t('metadata.metadataSearch.noSearch') }}
          </div>
          <div class="no-result" v-else-if="searchData.length === 0 && firstSearch !== 0">
            {{ $t('metadata.metadataSearch.noResult') }}
          </div>
          <div ref="searchResult" class="search-result" v-else>
            <ul class="metadata-table">
              <li class="table-li" v-for="item in searchData" :key="item.id">
                <div class="table-box-wrap" v-if="item.table" @click="goMetaInfo(item.id)">
                  <div class="image-box">
                    <el-image :src="require('@/assets/images/metaSearchTable.png')"></el-image>
                  </div>
                  <div class="info-box">
                    <span class="title" v-html="item.table.name"></span>
                    <span class="title" v-if="item.table.original_name">( 原表名:</span>
                    <span class="title" v-html="item.table.original_name"></span>
                    <span class="title" v-if="item.table.original_name"> )</span>
                    <div class="desc" v-html="item.table.comment"></div>
                  </div>
                </div>
                <ul class="column" v-if="item.columns && item.columns.length > 0">
                  <li v-for="filed in item.columns" :key="filed.field_name">
                    <div class="image-box">
                      <el-image :src="getImgByType(filed.type) || getImgByType('Default')"></el-image>
                    </div>
                    <div class="info-box">
                      <span class="title" v-html="filed.field_name"></span>
                      <span class="title" v-if="filed.original_name">( 原表名:</span>
                      <span class="title" v-html="filed.original_name"></span>
                      <span class="title" v-if="filed.original_name"> )</span>
                      <div class="desc" v-html="filed.comment"></div>
                    </div>
                  </li>
                </ul>
              </li>
              <li class="more" v-if="noMore">{{ $t('metadata.metadataSearch.noMore') }} ?_(:з」∠)......</li>
              <li v-else class="more" v-loading="loading" @click="handleSearch(lastId)">
                {{ $t('metadata.metadataSearch.more') }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { getImgByType } from '../../utils/util'
export default {
  name: 'Search',
  data() {
    return {
      meta_type: 'table',
      first: true,
      keyword: '',
      showNoSearch: true,
      noMore: false,
      searchData: [],
      originalData: [],
      firstSearch: 0,
      lastId: '',
      loading: true
    }
  },
  watch: {
    keyword: {
      handler() {
        if (this.keyword !== '') {
          this.showNoSearch = false
          this.$nextTick(() => {
            this.$refs.searchInput.focus()
          })
        }
      }
    }
  },
  methods: {
    getImgByType,
    handleSearch(id) {
      if (this.keyword === '') {
        this.showNoSearch = true
        this.searchData = []
        return
      }
      if (id === '') {
        this.firstSearch = 0
        this.searchData = [] //没有id 视为重新搜索
      }
      let params = this.handleParams(id)
      this.firstSearch = this.firstSearch === 0 ? 1 : this.firstSearch
      this.loading = true
      this.$api('MetadataInstances')
        .search(params)
        .then(result => {
          let data = result.data || []
          this.noMore = false
          if (data.length === 0 || (data.length < data.pageSize && !this.first)) {
            this.noMore = true
            return
          }
          let resultData = result.data || []
          //关键字标记
          this.handleKeywords(resultData || [])
          this.searchData = this.searchData.concat(resultData)
          this.lastId = this.searchData[this.searchData.length - 1].id
          this.first = false //不是第一次请求
        })
        .catch(err => {
          if (err && err.response) {
            this.$message.error(err.response.msg)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleParams(id) {
      let params = {
        type: this.meta_type,
        keyword: this.keyword,
        pageSize: 16,
        lastId: id || ''
      }
      return params
    },
    handleKeywords(data) {
      let targetData = data || []
      if (targetData.length === 0) return
      targetData.forEach(item => {
        if (item.table) {
          item.table.name = this.markKeyword(this.keyword, item.table.name ? item.table.name : '')
          item.table.original_name = this.markKeyword(this.keyword, item.table.original_name)
          if (item.table.comment) item.table.comment = this.markKeyword(this.keyword, item.table.comment)
        }
        if (item.columns && item.columns.length > 0) {
          item.columns.forEach(field => {
            field.field_name = this.markKeyword(this.keyword, field.field_name)
            field.original_field_name = this.markKeyword(this.keyword, field.original_field_name)
            if (field.comment) field.comment = this.markKeyword(this.keyword, field.comment)
          })
        }
      })
    },
    markKeyword(keyword, text) {
      if (keyword && text.indexOf(keyword) !== -1) {
        return text.split(keyword).join(`<span style="color: red">${keyword}</span>`)
      }
      return text
    },
    goMetaInfo(id) {
      this.$router.push({
        name: 'metadataDetails',
        params: {
          id: id
        }
      })
    }
  }
}
</script>

<style lang="scss">
.metadata-search-wrap {
  .el-input-group__append {
    background-color: map-get($color, primary);
    border-color: map-get($color, primary);
    color: map-get($fontColor, white);
    .el-button {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
  .no-search-box {
    .el-input-group__prepend {
      background-color: map-get($bgColor, white);
      color: map-get($color, primary);
    }
  }
  .search-box {
    .el-input-group__prepend {
      background-color: map-get($bgColor, white);
      color: map-get($fontColor, light);
    }
  }
}
</style>
<style scoped lang="scss">
.metadata-change-background {
  // background: map-get($bgColor, normal);
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
}
.metadata-search-wrap {
  height: 100%;
  overflow: hidden;
  .input-with-select {
    width: 140px;
  }
  .input-with {
    width: 605px;
    ::v-deep {
      .el-input-group__prepend {
        .el-input__inner {
          color: map-get($color, primary);
        }
      }
    }
  }
  .no-search-box-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70%;
    .no-search-box {
      display: flex;
      flex-direction: column;
      .metadata-search-title {
        width: 250px;
        height: 40px;
        // color: rgba(72, 182, 226, 100);
        font-size: 24px;
        text-align: left;
        margin-bottom: 10px;
        font-weight: bold;
      }
      .desc {
        margin-top: 10px;
        font-size: 12px;
        color: map-get($fontColor, slight);
      }
    }
  }
  .search-box-wrap {
    width: 100%;
    overflow: hidden;
    .search-box {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      height: 100%;
      width: 100%;
    }
    .search-result {
      display: flex;
      flex: 1;
    }
    .keyword {
      color: #d54e21;
    }
    .search-header {
      padding: 15px 0;
      background: map-get($bgColor, white);
      overflow: hidden;
      border-bottom: 1px solid #dedee4;
      .search-title {
        font-size: 14px;
        color: map-get($fontColor, dark);
        font-weight: bold;
        margin-right: 10px;
      }
    }
    .no-result {
      padding-left: 105px;
      margin-top: 20px;
      font-size: 13px;
      color: map-get($fontColor, light);
    }
    .search-result {
      // margin: 10px;
      // padding: 10px;
      max-height: 800px;
      overflow-y: auto;
      border-radius: 3px;
      background-color: rgba(255, 255, 255, 100);
      color: rgba(16, 16, 16, 100);
      font-size: 14px;
      // box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 100);
    }
    .desc {
      color: map-get($fontColor, light);
      margin-top: 5px;
      margin-bottom: 10px;
    }
    .metadata-table {
      width: 100%;
      li {
        box-sizing: border-box;
        .table-box-wrap {
          display: flex;
        }
        &:hover {
          background: map-get($bgColor, normal);
        }
      }
      .table-li {
        border-bottom: 1px solid rgba(238, 238, 238, 100);
        padding-bottom: 6px;
        padding-top: 12px;
        cursor: pointer;
      }
    }
    .column {
      margin-left: 30px;
      li {
        display: flex;
      }
    }
    .image-box {
      width: 20px;
      height: 20px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .info-box {
      margin-left: 10px;
      .title {
        color: map-get($color, primary);
      }
    }
    .more {
      color: map-get($fontColor, light);
      font-size: 12px;
      cursor: pointer;
      text-align: center;
      line-height: 40px;
    }
  }
}
</style>
