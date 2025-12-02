<template>
  <div class="components-demo-page p-4 md:p-6 space-y-6">
    <div class="text-2xl font-bold mb-6">Generic Components Demo</div>
    <!-- 2. Table Selector Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">2. Table Selector (ca-table-selector)</div>
      </template>
      <div class="space-y-4">
        <ElButton type="primary" @click="tableSelectorVisible = true">
          Open Table Selector
        </ElButton>
        <CaTableSelector
          v-model="tableSelectorVisible"
          :fetch-data="fetchTableData"
          :columns="tableColumns"
          row-key="id"
          multiple
          title="Select Users"
          @confirm="handleTableConfirm"
        />
        <div class="text-sm text-gray-500"> Selected {{ selectedTableRows.length }} rows </div>
      </div>
    </ElCard>

    <!-- 5. Icon Picker Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">5. Icon Picker (ca-icon-picker)</div>
      </template>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-600 mb-2">Default Size:</div>
            <CaIconPicker v-model="selectedIcon" @change="handleIconChange" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-2">Large Size:</div>
            <CaIconPicker v-model="selectedIconLarge" size="large" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-2">Small Size:</div>
            <CaIconPicker v-model="selectedIconSmall" size="small" />
          </div>
        </div>
        <div class="text-sm text-gray-500"> Selected Icon: {{ selectedIcon || 'None' }} </div>
      </div>
    </ElCard>

    <!-- Usage Examples -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">Usage Examples</div>
      </template>
      <div class="space-y-4">
        <ElCollapse>
          <ElCollapseItem title="CaSelect Usage" name="1">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;CaSelect
  v-model="value"
  :fetch-data="fetchData"
  key-field="id"
  value-field="name"
  multiple
  remote
  @change="handleChange"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="CaTableSelector Usage" name="2">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;CaTableSelector
  v-model="visible"
  :fetch-data="fetchTableData"
  :columns="columns"
  row-key="id"
  multiple
  @confirm="handleConfirm"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="CaTree Usage" name="3">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;CaTree
  :fetch-data="fetchTreeData"
  key-field="id"
  label-field="label"
  multiple
  @check="handleCheck"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="CaUpload Usage" name="4">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;CaUpload
  :upload-fn="uploadFile"
  :max-size="10"
  accept="image/*"
  drag
  multiple
  @success="handleSuccess"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="CaIconPicker Usage" name="5">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;CaIconPicker
  v-model="icon"
  size="default"
  @change="handleIconChange"
/&gt;</code></pre>
          </ElCollapseItem>
        </ElCollapse>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import CaIconPicker from '@/components/business/ca-icon-picker/index.vue'
  import CaTableSelector from '@/components/business/ca-table-selector/index.vue'
  import { TableColumn } from '@/components/business/ca-table-selector/types'
  import { ElButton, ElCard, ElCollapse, ElCollapseItem, ElMessage } from 'element-plus'
  import { ref } from 'vue'

  defineOptions({ name: 'ComponentsDemo' })

  // Mock data for select
  const mockUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com' }
  ]

  // Table Selector Demo
  const tableSelectorVisible = ref(false)
  const selectedTableRows = ref<any[]>([])

  const tableColumns: TableColumn[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' }
  ]

  const fetchTableData = async (params: any) => {
    // Simulate API call with pagination
    await new Promise((resolve) => setTimeout(resolve, 800))

    const { page, pageSize, query } = params
    let filteredData = [...mockUsers]

    if (query) {
      filteredData = filteredData.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      )
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      data: filteredData.slice(start, end),
      total: filteredData.length
    }
  }

  const handleTableConfirm = (rows: any[]) => {
    selectedTableRows.value = rows
    ElMessage.success(`Selected ${rows.length} rows`)
  }
  // Icon Picker Demo
  const selectedIcon = ref('User')
  const selectedIconLarge = ref('Setting')
  const selectedIconSmall = ref('Star')

  const handleIconChange = (icon: string) => {
    console.log('Icon changed:', icon)
  }
</script>

<style scoped></style>
