<script setup lang="ts">
defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="sort-condition-display bg-light rounded-xl">
    <span class="bracket" :class="orders.length > 0 ? '' : 'empty-class'">{{
      orders.length > 0 ? '(' : '-'
    }}</span>
    <span v-for="(order, index) in orders" :key="index" class="sort-item">
      <span class="bracket">[</span>
      <span class="field-name">{{ order.fieldName }}</span>
      <span class="separator">, </span>
      <span class="sort-type" :class="`sort-${order.type}`">{{
        order.type
      }}</span>
      <span class="bracket">]</span>
      <span v-if="index < orders.length - 1" class="separator">, </span>
    </span>
    <span class="bracket" :class="orders.length > 0 ? '' : 'empty-class'">{{
      orders.length > 0 ? ')' : ''
    }}</span>
  </div>
</template>

<style scoped>
.sort-condition-display {
  font-family: var(--code-font-family);
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 12px;
  word-wrap: break-word;
}

.bracket {
  color: #6c757d;
  font-weight: bold;
}

.field-name {
  color: #495057;
  font-weight: 500;
}

.separator {
  color: #6c757d;
}

.sort-type {
  font-weight: bold;
  text-transform: uppercase;
}

.sort-asc {
  color: #28a745;
}

.sort-desc {
  color: #dc3545;
}

.sort-item {
  display: inline;
}
.empty-class {
  color: #6c757d;
  font-weight: bold;
  text-transform: uppercase;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
