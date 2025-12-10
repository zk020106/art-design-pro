<template>
  <div class="ca-input-group">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  .ca-input-group {
    display: flex;

    > :deep(*:not(:last-child)) {
      margin-right: -1px;
    }

    > :deep(*:first-child:last-child) {
      border-radius: var(--el-border-radius-base);

      .el-input__wrapper,
      .el-select__wrapper {
        border-radius: var(--el-border-radius-base);
      }
    }

    > :deep(*:not(:first-child, :last-child)) {
      border-radius: 0;

      .el-input__wrapper,
      .el-select__wrapper {
        border-radius: 0;
      }
    }

    > :deep(*:first-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;

      .el-input__wrapper,
      .el-select__wrapper {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    > :deep(*:last-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;

      .el-input__wrapper,
      .el-select__wrapper {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }

    > :deep(*:hover, *:focus, *:active) {
      z-index: 1;
    }

    > :deep(*) {
      .el-input__wrapper.is-focus,
      .el-select__wrapper.is-focused {
        z-index: 2;
      }
    }
  }
</style>
