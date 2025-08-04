<template>
  <div class="sort-condition-display">
    <span class="bracket">(</span>
    <span
        v-for="(order, index) in orders"
        :key="index"
        class="sort-item"
    >
      <span class="bracket">[</span>
      <span class="field-name">{{ order.fieldName }}</span>
      <span class="separator">, </span>
      <span class="sort-type" :class="`sort-${order.type}`">{{ order.type }}</span>
      <span class="bracket">]</span>
      <span v-if="index < orders.length - 1" class="separator">, </span>
    </span>
    <span class="bracket">)</span>
  </div>
</template>

<script setup>
const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.sort-condition-display {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  white-space: nowrap;
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
</style>