<template>
  <div class="components-demo-page p-4 md:p-6 space-y-6">
    <div class="text-2xl font-bold mb-6">Generic Components Demo</div>

    <!-- 1. Generic Select Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">1. Generic Select (gi-select)</div>
      </template>
      <div class="space-y-4">
        <div>
          <div class="text-sm text-gray-600 mb-2">Single Selection:</div>
          <GiSelect
            v-model="selectValue"
            :fetch-data="fetchSelectData"
            key-field="id"
            value-field="name"
            placeholder="Select a user"
            @change="handleSelectChange"
          />
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-2">Multiple Selection with Remote Search:</div>
          <GiSelect
            v-model="multiSelectValue"
            :fetch-data="fetchSelectData"
            key-field="id"
            value-field="name"
            multiple
            remote
            placeholder="Select multiple users"
            @change="handleMultiSelectChange"
          />
        </div>
        <div class="text-sm text-gray-500"> Selected: {{ JSON.stringify(selectValue) }} </div>
      </div>
    </ElCard>

    <!-- 2. Table Selector Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">2. Table Selector (gi-table-selector)</div>
      </template>
      <div class="space-y-4">
        <ElButton type="primary" @click="tableSelectorVisible = true">
          Open Table Selector
        </ElButton>
        <GiTableSelector
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

    <!-- 3. Generic Tree Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">3. Generic Tree (gi-tree)</div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-600 mb-2">Single Selection:</div>
          <GiTree
            :fetch-data="fetchTreeData"
            key-field="id"
            label-field="label"
            @select="handleTreeSelect"
          />
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-2">Multiple Selection (Checkboxes):</div>
          <GiTree
            :fetch-data="fetchTreeData"
            key-field="id"
            label-field="label"
            multiple
            @check="handleTreeCheck"
          />
        </div>
      </div>
    </ElCard>

    <!-- 4. File Upload Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">4. File Upload (gi-upload)</div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-600 mb-2">Standard Upload:</div>
          <GiUpload
            :upload-fn="handleFileUpload"
            :max-size="5"
            accept="image/*"
            @success="handleUploadSuccess"
          />
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-2">Drag & Drop Upload:</div>
          <GiUpload
            :upload-fn="handleFileUpload"
            :max-size="10"
            drag
            multiple
            @success="handleUploadSuccess"
          />
        </div>
      </div>
    </ElCard>

    <!-- 5. Icon Picker Demo -->
    <ElCard class="demo-card">
      <template #header>
        <div class="font-semibold">5. Icon Picker (gi-icon-picker)</div>
      </template>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-600 mb-2">Default Size:</div>
            <GiIconPicker v-model="selectedIcon" @change="handleIconChange" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-2">Large Size:</div>
            <GiIconPicker v-model="selectedIconLarge" size="large" />
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-2">Small Size:</div>
            <GiIconPicker v-model="selectedIconSmall" size="small" />
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
          <ElCollapseItem title="GiSelect Usage" name="1">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;GiSelect
  v-model="value"
  :fetch-data="fetchData"
  key-field="id"
  value-field="name"
  multiple
  remote
  @change="handleChange"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="GiTableSelector Usage" name="2">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;GiTableSelector
  v-model="visible"
  :fetch-data="fetchTableData"
  :columns="columns"
  row-key="id"
  multiple
  @confirm="handleConfirm"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="GiTree Usage" name="3">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;GiTree
  :fetch-data="fetchTreeData"
  key-field="id"
  label-field="label"
  multiple
  @check="handleCheck"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="GiUpload Usage" name="4">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;GiUpload
  :upload-fn="uploadFile"
  :max-size="10"
  accept="image/*"
  drag
  multiple
  @success="handleSuccess"
/&gt;</code></pre>
          </ElCollapseItem>
          <ElCollapseItem title="GiIconPicker Usage" name="5">
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto"><code>&lt;GiIconPicker
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
  import GiIconPicker from '@/components/business/gi-icon-picker/index.vue'
  import GiSelect from '@/components/business/gi-select/index.vue'
  import GiTableSelector from '@/components/business/gi-table-selector/index.vue'
  import { TableColumn } from '@/components/business/gi-table-selector/types'
  import GiTree from '@/components/business/gi-tree/index.vue'
  import GiUpload from '@/components/business/gi-upload/index.vue'
  import { ElButton, ElCard, ElCollapse, ElCollapseItem, ElMessage } from 'element-plus'
  import { ref } from 'vue'

  defineOptions({ name: 'ComponentsDemo' })

  // Select Demo
  const selectValue = ref()
  const multiSelectValue = ref([])

  // Mock data for select
  const mockUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com' }
  ]

  const fetchSelectData = async (params?: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (params?.query) {
      return mockUsers.filter((user) =>
        user.name.toLowerCase().includes(params.query.toLowerCase())
      )
    }

    return mockUsers
  }

  const handleSelectChange = (selected: any) => {
    console.log('Select changed:', selected)
  }

  const handleMultiSelectChange = (selected: any) => {
    console.log('Multi-select changed:', selected)
  }

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

  // Tree Demo
  const mockTreeData = [
    {
      id: 1,
      label: 'Level 1-1',
      children: [
        { id: 11, label: 'Level 2-1' },
        { id: 12, label: 'Level 2-2' }
      ]
    },
    {
      id: 2,
      label: 'Level 1-2',
      children: [
        { id: 21, label: 'Level 2-3' },
        { id: 22, label: 'Level 2-4' }
      ]
    }
  ]

  const fetchTreeData = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockTreeData
  }

  const handleTreeSelect = (node: any) => {
    console.log('Tree node selected:', node)
    ElMessage.info(`Selected: ${node.label}`)
  }

  const handleTreeCheck = (checkedNodes: any[]) => {
    console.log('Tree checked nodes:', checkedNodes)
    ElMessage.info(`Checked ${checkedNodes.length} nodes`)
  }

  // Upload Demo
  const handleFileUpload = async (file: File) => {
    // Simulate file upload
    console.log('Uploading file:', file.name)

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url: URL.createObjectURL(file),
          name: file.name
        })
      }, 2000)
    })
  }

  const handleUploadSuccess = (file: File, response: any) => {
    console.log('Upload success:', file.name, response)
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
