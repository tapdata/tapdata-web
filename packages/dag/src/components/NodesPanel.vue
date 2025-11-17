<script lang="ts" setup></script>

<template>
  <div
    class="nodes-panel position-absolute start-3 rounded-2xl bg-card shadow-canvas z-10"
  >
    <div>
      <div class="flex align-center p-3">
        <el-icon class="mr-2"><i-lucide-database /></el-icon>
        <span class="flex-1 user-select-none text-truncate flex align-center">
          {{ $t('packages_dag_dag_connection') }}
        </span>

        <el-button text size="small" @click.stop="">
          <template #icon>
            <VIcon size="18">search-outline</VIcon>
          </template>
        </el-button>

        <el-button text size="small" class="ml-1" @mousedown.stop>
          <template #icon>
            <VIcon size="20">add-outline</VIcon>
          </template>
        </el-button>
      </div>
    </div>
    <el-divider />
    <div>
      <div class="flex align-center p-3">
        <el-icon class="mr-2"><i-lucide-table /></el-icon>
        <span class="flex-1 user-select-none text-truncate flex align-center">
          <!--表-->
          {{ $t('packages_dag_dag_table') }}
        </span>
        <el-button id="table-search-btn" text size="small">
          <template #icon>
            <VIcon size="18">search-outline</VIcon>
          </template>
        </el-button>

        <ElTooltip
          :content="$t('packages_dag_dag_create_table_as_node')"
          placement="top"
        >
          <el-button text size="small" @mousedown.stop>
            <template #icon>
              <VIcon size="20">add-outline</VIcon>
            </template>
          </el-button>
        </ElTooltip>
      </div>
    </div>
    <el-divider />
    <div>
      <div class="flex align-center p-3">
        <el-icon class="mr-2"><i-lucide-workflow /></el-icon>
        <span class="flex-1 user-select-none text-start">
          <!--处理节点-->
          {{ $t('public_node_processor') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.nodes-panel {
  top: 72px;
  bottom: 12px;
  width: 260px;
}
</style>
