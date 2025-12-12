# CaDetail 组件使用指南

## 概述

CaDetail 是一个配置化的详情展示组件，支持国际化、自定义组件、多种字段类型等功能。

## 功能特性

- ✅ 支持多种字段类型（文本、标签、枚举、字典、日期等）
- ✅ 支持自定义组件渲染
- ✅ 支持插槽扩展
- ✅ 支持国际化
- ✅ 支持字典数据自动加载
- ✅ 支持条件显示
- ✅ 支持自定义布局

## 基础用法

### 1. 基本使用

```vue
<template>
  <CaDetail :data="userDetail" :fields="detailFields" :column="2" size="large" :border="true" />
</template>

<script setup lang="ts">
  import CaDetail from '@/components/base/CaDetail'
  import type { DetailField } from '@/components/base/CaDetail'

  const userDetail = {
    id: '123',
    username: 'admin',
    status: 1
  }

  const detailFields: DetailField[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'text',
      copyable: true
    },
    {
      key: 'username',
      label: '用户名',
      type: 'text'
    },
    {
      key: 'status',
      label: '状态',
      type: 'enum',
      enum: {
        '1': { label: '启用', type: 'success' },
        '0': { label: '禁用', type: 'danger' }
      }
    }
  ]
</script>
```

## 字段类型详解

### 1. 文本类型 (text)

```typescript
{
  key: 'username',
  label: 'user.field.username',
  type: 'text',
  copyable: true,  // 可复制
  emptyText: '暂无',  // 空值文本
  props: {
    type: 'primary'  // ElText的类型
  }
}
```

### 2. 标签类型 (tag)

```typescript
{
  key: 'status',
  label: '状态',
  type: 'tag',
  emptyText: '无状态',
  props: {
    type: 'success'  // ElTag的类型
  }
}
```

### 3. 枚举类型 (enum)

```typescript
{
  key: 'gender',
  label: '性别',
  type: 'enum',
  enum: {
    '1': { label: '男', type: 'primary' },
    '2': { label: '女', type: 'success' },
    'other': { label: '未知', type: 'info' }
  }
}
```

### 4. 字典类型 (dict)

```typescript
{
  key: 'status',
  label: '状态',
  type: 'dict',
  dictCode: 'user_status'  // 字典编码
}
```

### 5. 日期类型 (date/datetime)

```typescript
{
  key: 'createTime',
  label: '创建时间',
  type: 'datetime',
  emptyText: '暂无'
}
```

### 6. 布尔类型 (boolean)

```typescript
{
  key: 'enabled',
  label: '是否启用',
  type: 'boolean'
}
```

### 7. 数字类型 (number)

```typescript
{
  key: 'orderNum',
  label: '排序号',
  type: 'number',
  props: {
    type: 'danger'
  }
}
```

### 8. 图片类型 (image)

```typescript
{
  key: 'avatar',
  label: '头像',
  type: 'image',
  props: {
    width: '80px',
    height: '80px',
    fit: 'cover'
  }
}
```

### 9. 自定义组件 (component)

```typescript
{
  key: 'roles',
  label: '角色',
  type: 'component',
  component: CaCellTags,
  props: {
    data: [],  // 组件props
    max: 3
  },
  slots: {
    default: (scope) => '自定义插槽内容'
  }
}
```

### 10. 插槽类型 (slot)

```typescript
{
  key: 'custom',
  label: '自定义',
  type: 'slot'
}
```

在模板中使用：

```vue
<CaDetail :data="data" :fields="fields">
  <template #field-custom="{ value, data }">
    <div>自定义渲染：{{ value }}</div>
  </template>
</CaDetail>
```

## 高级功能

### 条件显示

```typescript
{
  key: 'secret',
  label: '密钥',
  type: 'text',
  show: (data) => data.role === 'admin'  // 只在角色为admin时显示
}
```

### 自定义渲染函数

```typescript
{
  key: 'fullName',
  label: '姓名',
  type: 'text',
  render: (value, data) => {
    return `${data.lastName} ${data.firstName}`
  }
}
```

### 占据多列

```typescript
{
  key: 'description',
  label: '描述',
  type: 'text',
  span: 2  // 占据2列
}
```

### 国际化

```typescript
{
  key: 'username',
  label: 'user.field.username',  // i18n key
  type: 'text'
}
```

在 i18n 配置中添加：

```json
{
  "user": {
    "detail": {
      "username": "用户名"
    }
  }
}
```

## 配置化示例

参考项目中的配置文件：

- `src/configs/user-detail.ts` - 用户详情配置
- `src/configs/role-detail.ts` - 角色详情配置
- `src/configs/dept-detail.ts` - 部门详情配置

## 最佳实践

1. **统一配置**：将字段配置抽离到独立的配置文件中
2. **国际化**：使用 i18n key 进行国际化
3. **组件复用**：对于复杂的字段渲染，封装为独立组件
4. **类型安全**：使用 TypeScript 类型定义确保类型安全
5. **可维护性**：保持配置文件的结构清晰，易于维护

## 常见问题

### Q: 如何处理角色等多值字段？

A: 使用 `CaCellTags` 组件：

```typescript
{
  key: 'roleNames',
  label: '角色',
  type: 'component',
  component: CaCellTags,
  props: {
    data: data.roleNames || [],
    max: 3
  }
}
```

### Q: 如何自定义样式？

A: 通过 `valueStyle` 或 `labelStyle`：

```typescript
{
  key: 'highlight',
  label: '高亮字段',
  type: 'text',
  valueStyle: {
    color: '#ff4d4f',
    fontWeight: 'bold'
  }
}
```
