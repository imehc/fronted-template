<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">文档预览组件演示</h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          支持 PDF、Excel、Word 文档在线预览，提供加载状态管理和错误处理
        </p>
      </div>

      <!-- Controls Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div class="space-y-6">
          <!-- URL Input -->
          <div>
            <label for="url-input" class="block text-sm font-medium text-gray-700 mb-2">
              文档URL
            </label>
            <input id="url-input" v-model="documentUrl" placeholder="请输入PDF、Excel或Word文档的URL"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <!-- Test URLs -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3">快速测试</h3>
            <div class="flex flex-wrap gap-3 hidden">
              <button @click="setTestUrl('pdf')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clip-rule="evenodd" />
                </svg>
                测试 PDF
              </button>

              <button @click="setTestUrl('excel')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                    clip-rule="evenodd" />
                </svg>
                测试 Excel
              </button>

              <button @click="setTestUrl('word')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clip-rule="evenodd" />
                </svg>
                测试 Word
              </button>
            </div>

            <!-- Blob URL Test -->
            <div class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Blob URL测试</h4>
              <div class="flex gap-2">
                <input type="file" @change="handleFileSelect" accept=".pdf,.xlsx,.xls,.docx,.doc"
                  class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <button @click="clearBlob" v-if="blobUrl"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  清除
                </button>
              </div>
              <div v-if="selectedFile" class="text-xs text-gray-600 mt-1">
                已选择: {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Messages -->
      <div class="space-y-3 mb-6">
        <div v-if="isLoading" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
            <div class="flex">
              <svg class="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
              <p class="text-blue-700 font-medium">文档正在加载中...</p>
            </div>
          </div>
        </div>

        <div v-if="loadSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            <p class="text-green-700 font-medium">文档加载成功！</p>
          </div>
        </div>

        <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
            <p class="text-red-700 font-medium">{{ loadError }}</p>
          </div>
        </div>
      </div>

      <!-- Preview Container -->
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <DocumentPreview :url="documentUrl" :fileType="documentFileType" :onLoading="handleLoading"
          :onSuccess="handleSuccess" :onError="handleError" />
      </div>

      <!-- Feature Info -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="w-12 h-12 mx-auto bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">PDF 预览</h3>
          <p class="text-gray-600">支持 PDF 文档预览，提供分页导航功能</p>
        </div>

        <div class="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Excel 预览</h3>
          <p class="text-gray-600">支持多工作表切换，以表格形式展示数据</p>
        </div>

        <div class="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Word 预览</h3>
          <p class="text-gray-600">保留文档格式，支持页眉页脚等元素</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DocumentPreview from '../components/DocumentPreview.vue'

const documentUrl = ref('')
const documentFileType = ref<'pdf' | 'excel' | 'word' | 'xlsx' | 'xls' | 'docx' | 'doc' | undefined>()
const isLoading = ref(false)
const loadSuccess = ref(false)
const loadError = ref('')
const selectedFile = ref<File | null>(null)
const blobUrl = ref('')

const handleLoading = () => {
  console.log('文档开始加载')
  isLoading.value = true
  loadSuccess.value = false
  loadError.value = ''
}

const handleSuccess = () => {
  console.log('文档加载成功')
  isLoading.value = false
  loadSuccess.value = true
  loadError.value = ''
}

const handleError = (error: string) => {
  console.log('文档加载失败:', error)
  isLoading.value = false
  loadSuccess.value = false
  loadError.value = error
}

const setTestUrl = (type: 'pdf' | 'excel' | 'word') => {
  // 清理之前的blob URL
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
    blobUrl.value = ''
  }

  const testUrls = {
    pdf: 'https://example.pdf',
    excel: 'https://example.xls',
    word: 'https://example.xlsx'
  }
  documentUrl.value = testUrls[type]
  documentFileType.value = undefined // 让组件自动检测
  selectedFile.value = null
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 清理之前的blob URL
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
  }

  // 创建新的blob URL
  const newBlobUrl = URL.createObjectURL(file)

  // 根据文件扩展名设置fileType
  const fileName = file.name.toLowerCase()
  let fileType: typeof documentFileType.value

  if (fileName.endsWith('.pdf')) {
    fileType = 'pdf'
  } else if (fileName.endsWith('.xlsx')) {
    fileType = 'xlsx'
  } else if (fileName.endsWith('.xls')) {
    fileType = 'xls'
  } else if (fileName.endsWith('.docx')) {
    fileType = 'docx'
  } else if (fileName.endsWith('.doc')) {
    fileType = 'doc'
  }

  selectedFile.value = file
  blobUrl.value = newBlobUrl
  documentUrl.value = newBlobUrl
  documentFileType.value = fileType

  console.log('Selected file:', file.name, 'Type:', fileType, 'Blob URL:', newBlobUrl)
}

const clearBlob = () => {
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
    blobUrl.value = ''
  }
  selectedFile.value = null
  documentUrl.value = ''
  documentFileType.value = undefined
}
</script>