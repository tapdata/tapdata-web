<template>
  <ElDialog
    :title="$t('connection_form_creat_connection')"
    :visible.sync="dialogVisible"
    :width="width"
    custom-class="connection-type-dialog"
    @close="$emit('input', false)"
  >
    <div class="search-box flex">
      <ElSelect v-model="searchType" class="search-box__select" @change="changeFnc">
        <ElOption v-for="(item, index) in options" :key="index" :value="item.name" :label="item.desc"></ElOption>
      </ElSelect>
      <ElInput
        v-model="searchKey"
        :placeholder="$t('gl_placeholder_input')"
        class="search-box__input"
        clearable
        @input="searchFnc"
      ></ElInput>
    </div>
    <div class="database">
      <ul v-if="list.length" class="database__list">
        <li v-for="(item, index) in list" :key="index" class="database__item" @click="selectItem(item)">
          <div class="database__img">
            <ElImage :src="$util.getConnectionTypeDialogImg(item.type)" />
          </div>
          <div class="database__name">{{ item.name }}</div>
        </li>
      </ul>
      <div v-else class="flex flex-column justify-content-center align-items-center h-100">
        <VIcon size="120">search-no-data-color</VIcon>
        <div class="flex justify-content-center lh-sm font-color-sub">
          <span>{{ $t('gl_no_match_result') }}</span>
          <span class="color-primary cursor-pointer" @click="reset">{{ $t('gl_search_show_all') }}</span>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import VIcon from '@/components/VIcon'
import { setDatabaseTypes } from '@/util'

export default {
  name: 'connectionTypeDialog',
  components: { VIcon },
  props: {
    value: {
      type: Boolean
    },
    width: {
      type: String,
      default: '780px'
    }
  },
  data() {
    return {
      dialogVisible: false,
      searchKey: '',
      searchType: '',
      options: [],
      list: []
    }
  },
  watch: {
    value(v) {
      this.dialogVisible = !!v
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getOptions()
      this.getData()
    },
    getOptions() {
      this.$axios.get('tm/api/DatabaseTags/availableTags').then(data => {
        this.options = [{ name: '', desc: this.$t('gl_select_option_all') }, ...data]
      })
    },
    getData() {
      let filter = {
        limit: 999,
        where: {}
      }
      const { searchKey, searchType } = this
      if (searchKey) {
        filter.where.name = { $regex: searchKey, $options: 'i' }
      }
      if (searchType) {
        filter.where.tags = searchType
      }
      this.$axios.get('tm/api/DatabaseTypes?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        this.list = data
        setDatabaseTypes(data)
      })
    },
    changeFnc() {
      this.getData()
    },
    searchFnc(debounce = 800) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.getData()
      }, debounce)
    },
    selectItem(item) {
      this.$emit('select', item.type, item)
    },
    reset() {
      this.searchKey = ''
      this.searchType = ''
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-box {
  margin-bottom: 24px;
}
.search-box__select {
  width: 240px;
}
.search-box__input {
  margin-left: 16px;
  width: 240px;
}
.database {
  height: 380px;
  font-size: 12px;
  overflow: auto;
}
.database__list {
  overflow: auto;
}
.database__item {
  float: left;
  margin-right: 48px;
  margin-bottom: 12px;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  &:nth-child(6n) {
    margin-right: 0;
  }
}
.database__img {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e8e9eb;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  .el-image {
    width: 40px;
  }
}
.database__name {
  margin-top: 8px;
  width: 80px;
  height: 30px;
  word-wrap: break-word;
  word-break: normal;
}
</style>
<style lang="scss">
.connection-type-dialog {
  background: #f4f5f7;
  border-radius: 4px;
  .el-dialog__header {
    padding: 24px 24px 0;
  }
  .el-dialog__body {
    padding: 24px;
  }
}
</style>
