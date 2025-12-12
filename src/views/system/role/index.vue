<template>
  <div class="role-management">
    <!-- 左侧角色树 -->
    <div class="role-left">
      <RoleTree @node-click="handleSelectRole" />
    </div>

    <!-- 右侧内容区 -->
    <div class="role-right">
      <!-- 标签页 -->
      <div class="role-tabs">
        <ElTabs v-model="activeTab" class="role-tabs-container">
          <ElTabPane label="功能权限" name="1">
            <template #label>
              <span class="tab-label"> 功能权限 </span>
            </template>
          </ElTabPane>
          <ElTabPane label="角色用户" name="2">
            <template #label>
              <span class="tab-label"> 角色用户 </span>
            </template>
          </ElTabPane>
        </ElTabs>
      </div>

      <!-- 内容区域 -->
      <div class="role-content">
        <Permission v-if="activeTab === '1'" :role-id="roleId" />
        <RoleUser v-if="activeTab === '2'" :role-id="roleId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElTabPane, ElTabs } from 'element-plus'
  import Permission from './components/Permission.vue'
  import RoleUser from './components/RoleUser.vue'
  import RoleTree from './tree/index.vue'

  defineOptions({ name: 'SystemRole' })

  const activeTab = ref('1')
  const roleId = ref('')

  // 根据选中角色查询
  const handleSelectRole = (keys: Array<any>) => {
    roleId.value = keys.length === 1 ? keys[0] : ''
  }
</script>

<style scoped lang="scss">
  .role-management {
    display: flex;
    gap: 16px;
    height: 100%;
    padding: 16px;

    &-left {
      flex-shrink: 0;
      width: 280px;
      min-width: 280px;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
    }

    &-right {
      display: flex;
      flex: 1;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
    }
  }

  .role-tabs {
    flex-shrink: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &-container {
      :deep(.el-tabs__header) {
        margin: 0;

        .el-tabs__nav-wrap {
          padding: 0 16px;
        }

        .el-tabs__item {
          height: 48px;
          padding: 0 20px;
          font-weight: 500;
          line-height: 48px;
          color: var(--el-text-color-regular);

          &.is-active {
            font-weight: 600;
            color: var(--el-color-primary);
          }
        }
      }

      :deep(.el-tabs__content) {
        display: none;
      }
    }
  }

  .tab-label {
    font-size: 14px;
  }

  .role-content {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
</style>
