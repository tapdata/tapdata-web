<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { computed, ref } from 'vue'

defineOptions({ name: 'MqlHelpDialog' })

const { t } = useI18n()

const keyword = ref('')

type Operator = {
  name: string
  descKey: string
  example: string
  related?: string[]
}

type Group = {
  key: string
  title: string
  items: Operator[]
}

const groups = ref<Group[]>([
  {
    key: 'comparison',
    title: t('packages_business_comparison'),
    items: [
      {
        name: '$eq',
        descKey: 'packages_business_mongo_operator_eq',
        example: `{"price": {"$eq": 10}} // ${t(
          'packages_business_example_eq',
          {
            a: 'price',
            b: 10,
          },
        )}`,
        related: ['$ne', '$in'],
      },
      {
        name: '$ne',
        descKey: 'packages_business_mongo_operator_ne',
        example: `{"status": {"$ne": "archived"}} // ${t(
          'packages_business_example_ne',
          {
            a: 'status',
            b: 'archived',
          },
        )}`,
        related: ['$eq'],
      },
      {
        name: '$gt',
        descKey: 'packages_business_mongo_operator_gt',
        example: `{"age": {"$gt": 18}} // ${t('packages_business_example_gt', {
          a: 'age',
          b: 18,
        })}`,
        related: ['$gte', '$lt'],
      },
      {
        name: '$gte',
        descKey: 'packages_business_mongo_operator_gte',
        example: `{"score": {"$gte": 90}} // ${t(
          'packages_business_example_gte',
          {
            a: 'score',
            b: 90,
          },
        )}`,
        related: ['$gt', '$lte'],
      },
      {
        name: '$lt',
        descKey: 'packages_business_mongo_operator_lt',
        example: `{"age": {"$lt": 65}} // ${t('packages_business_example_lt', {
          a: 'age',
          b: 65,
        })}`,
        related: ['$lte', '$gt'],
      },
      {
        name: '$lte',
        descKey: 'packages_business_mongo_operator_lte',
        example: `{"price": {"$lte": 100}} // ${t(
          'packages_business_example_lte',
          {
            a: 'price',
            b: 100,
          },
        )}`,
        related: ['$lt', '$gte'],
      },
      {
        name: '$in',
        descKey: 'packages_business_mongo_operator_in',
        example: `{"category": {"$in": ["A", "B", "C"]}} // ${t(
          'packages_business_example_in',
          {
            a: 'category',
            b: 'A, B, C',
          },
        )}`,
        related: ['$nin', '$eq'],
      },
      {
        name: '$nin',
        descKey: 'packages_business_mongo_operator_nin',
        example: `{"category": {"$nin": ["A", "B"]}} // ${t(
          'packages_business_example_nin',
          {
            a: 'category',
            b: 'A, B',
          },
        )}`,
        related: ['$in'],
      },
    ],
  },
  {
    key: 'logical',
    title: t('packages_business_logical'),
    items: [
      {
        name: '$and',
        descKey: 'packages_business_mongo_operator_and',
        example: `{"$and": [{"age": {"$gt": 18}}, {"status": "A"}]}`,
        related: ['$or', '$nor'],
      },
      {
        name: '$or',
        descKey: 'packages_business_mongo_operator_or',
        example: '{"$or": [{"age": {"$lt": 18}}, {"status": "B"}]}',
        related: ['$and', '$nor'],
      },
      {
        name: '$nor',
        descKey: 'packages_business_mongo_operator_nor',
        example: '{"$nor": [{"price": {"$gt": 100}}, {"qty": {"$lt": 10}}]}',
        related: ['$and', '$or'],
      },
    ],
  },
  {
    key: 'element',
    title: t('packages_business_element'),
    items: [
      {
        name: '$exists',
        descKey: 'packages_business_mongo_operator_exists',
        example: `{"deletedAt": {"$exists": false}} // ${t(
          'packages_business_example_exists',
        )}`,
      },
      {
        name: '$type',
        descKey: 'packages_business_mongo_operator_type',
        example: `{"age": {"$type": "int"}} // ${t(
          'packages_business_example_type',
        )}`,
      },
    ],
  },
  {
    key: 'evaluation',
    title: t('packages_business_evaluation'),
    items: [
      {
        name: '$regex',
        descKey: 'packages_business_mongo_operator_regex',
        example: `{"name": {"$regex": "^A", "$options": "i"}} // ${t(
          'packages_business_example_regex',
        )}`,
      },
    ],
  },
  {
    key: 'array',
    title: t('public_array'),
    items: [
      {
        name: '$all',
        descKey: 'packages_business_mongo_operator_all',
        example: '{"tags": {"$all": ["red", "blue"]}}',
      },
      {
        name: '$elemMatch',
        descKey: 'packages_business_mongo_operator_elemMatch',
        example:
          '{"grades": {"$elemMatch": {"score": {"$gte": 80}, "mean": {"$gt": 75}}}}',
      },
      {
        name: '$size',
        descKey: 'packages_business_mongo_operator_size',
        example: `{"tags": {"$size": 3}} // ${t(
          'packages_business_example_size',
          {
            a: 'tags',
            b: 3,
          },
        )}`,
      },
    ],
  },
  {
    key: 'other',
    title: t('public_others'),
    items: [
      {
        name: '$mod',
        descKey: 'packages_business_mongo_operator_mod',
        example: `{"qty": {"$mod": [5, 0]}} // ${t(
          'packages_business_example_mod',
          {
            a: 'qty',
            b: 5,
          },
        )}`,
      },
    ],
  },
])

const filteredGroups = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return groups.value
  return groups.value
    .map((g) => ({
      ...g,
      items: g.items.filter((op) =>
        [op.name, ...(op.related || []), t(op.descKey)]
          .join(' ')
          .toLowerCase()
          .includes(k),
      ),
    }))
    .filter((g) => g.items.length)
})

function copy(text: string) {
  copyToClipboard(
    text.replace(/\/\/.*$/, '').trim(),
    document.querySelector('#mql-help-dialog'),
  )
  ElMessage.success(t('public_message_copy_success'))
}

function open() {
  visible.value = true
}
function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<template>
  <ElDialog
    append-to-body
    :close-on-click-modal="false"
    width="45vw"
    top="6vh"
    :title="$t('package_business_mongodb_query_operators')"
    class="px-0"
    header-class="px-6"
  >
    <div id="mql-help-dialog" class="mql-help-dialog">
      <div class="px-6">
        <el-input
          v-model="keyword"
          clearable
          class="mb-3"
          :placeholder="$t('package_business_operators_search')"
        >
          <template #prefix>
            <el-icon><i-mingcute:search-line /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="px-6 overflow-y-auto" style="max-height: 72vh">
        <div v-for="group in filteredGroups" :key="group.key" class="group">
          <div
            class="fw-sub py-2 mb-1 position-sticky top-0 bg-white z-10 pl-0.5"
            style="margin-inline-start: -2px"
          >
            {{ group.title }}
            <span class="text-caption">({{ group.items.length }})</span>
          </div>
          <div class="grid">
            <div
              v-for="op in group.items"
              :key="op.name"
              class="card p-3 rounded-xl shadow-sm"
            >
              <div class="card-head">
                <code
                  class="card-head-code fs-8 rounded-lg fw-sub border px-2 py-0.5"
                >
                  {{ op.name }}
                </code>
              </div>
              <div class="desc mt-2">{{ t(op.descKey) }}</div>
              <div class="example mt-2">
                <div
                  class="flex align-center justify-content-between mb-1 lh-6"
                >
                  <span class="fs-8 text-caption">{{
                    $t('public_example')
                  }}</span>
                  <el-button
                    class="copy-btn"
                    text
                    size="small"
                    @click="copy(op.example)"
                  >
                    <el-icon class="mr-1"><i-mingcute:copy-2-line /></el-icon>
                    {{ t('public_button_copy') }}
                  </el-button>
                </div>
                <pre class="example-code p-2 rounded-lg">{{ op.example }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<style lang="scss" scoped>
.mql-help-dialog {
  .group + .group {
    margin-top: 12px;
  }
  .group-title {
    color: var(--el-text-color-secondary);
    margin: 8px 0 6px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .card {
    border: 1px solid var(--el-border-color-lighter);
    background: #fff;
  }
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-head-code {
    line-height: 1rem;
    border: 1px solid oklch(0.922 0 0);
    background-color: oklch(98.5% 0 0);
    font-family: var(--code-font-family);
  }
  .copy-btn {
    display: none;
  }
  .card:hover .copy-btn {
    display: inline-flex;
  }
  .desc {
    color: var(--el-text-color-regular);
  }
  .example-code {
    position: relative;
    background: oklch(98.5% 0 0);
    border: 1px solid oklch(0.922 0 0);
  }
  pre {
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
