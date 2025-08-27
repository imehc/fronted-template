<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[500px]">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-80 space-y-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="text-lg text-gray-600">正在加载文档...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mx-4 mt-4">
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- PDF Preview -->
    <div v-if="isPDF && !loading && !error">
      <VuePdfEmbed :source="url" :page="currentPage" @loading-failed="onPDFError" @loaded="onPDFLoaded"
        @loading="onLoading" />
      <div v-if="totalPages > 1"
        class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-center space-x-4">
        <div class="flex space-x-1">
          <button :disabled="currentPage <= 1" @click="previousPage"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            上一页
          </button>
          <button :disabled="currentPage >= totalPages" @click="nextPage"
            class="inline-flex items-center px-3 py-2 border-l-0 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
            下一页
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <span class="text-gray-700 font-medium">{{ currentPage }} / {{ totalPages }}</span>
      </div>
    </div>

    <!-- Excel Preview -->
    <div v-if="isExcel && !loading && !error" class="p-5">
      <div ref="excelContainer" class="excel-content"></div>
    </div>

    <!-- Word Preview -->
    <div v-if="isWord && !loading && !error" class="p-5">
      <div ref="wordContainer" class="word-content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import { renderAsync } from 'docx-preview'

interface Props {
  url: string
  fileType?: 'pdf' | 'excel' | 'word' | 'xlsx' | 'xls' | 'docx' | 'doc'
  onLoading?: () => void
  onSuccess?: () => void
  onError?: (error: string) => void
}

const props = defineProps<Props>()

const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const excelContainer = ref<HTMLElement>()
const wordContainer = ref<HTMLElement>()

const fileExtension = computed(() => {
  const url = props.url.toLowerCase()
  
  // 如果提供了fileType prop，优先使用它
  if (props.fileType) {
    if (props.fileType === 'pdf') return 'pdf'
    if (props.fileType === 'excel' || props.fileType === 'xlsx' || props.fileType === 'xls') return 'excel'
    if (props.fileType === 'word' || props.fileType === 'docx' || props.fileType === 'doc') return 'word'
  }
  
  // 处理blob URL的情况 - 如果没有fileType prop，尝试从URL片段中推断
  if (url.startsWith('blob:')) {
    // 尝试从blob URL中查找文件扩展名提示
    const urlParams = new URLSearchParams(url.split('?')[1] || '')
    const fileName = urlParams.get('filename') || urlParams.get('name')
    if (fileName) {
      const lowerFileName = fileName.toLowerCase()
      if (lowerFileName.includes('.pdf')) return 'pdf'
      if (lowerFileName.includes('.xlsx') || lowerFileName.includes('.xls')) return 'excel'
      if (lowerFileName.includes('.docx') || lowerFileName.includes('.doc')) return 'word'
    }
    // 如果无法确定，返回空字符串
    return ''
  }
  
  // 处理普通URL
  if (url.includes('.pdf')) return 'pdf'
  if (url.includes('.xlsx') || url.includes('.xls')) return 'excel'
  if (url.includes('.docx') || url.includes('.doc')) return 'word'
  return ''
})

const isPDF = computed(() => fileExtension.value === 'pdf')
const isExcel = computed(() => fileExtension.value === 'excel')
const isWord = computed(() => fileExtension.value === 'word')

const onLoading = () => {
  loading.value = true
  error.value = ''
  props.onLoading?.()
}

const onSuccess = () => {
  loading.value = false
  error.value = ''
  props.onSuccess?.()
}

const onPDFLoaded = (pdf: { numPages: number }) => {
  totalPages.value = pdf.numPages
  onSuccess()
}

const onPDFError = () => {
  const errorMsg = 'PDF加载失败'
  error.value = errorMsg
  loading.value = false
  props.onError?.(errorMsg)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const loadExcel = async () => {
  try {
    onLoading()
    
    console.log('Loading Excel file from:', props.url)
    
    const response = await fetch(props.url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,*/*'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    
    // 检查文件类型
    let isXlsx = false
    let isXls = false
    
    // 优先使用props.fileType
    if (props.fileType) {
      isXlsx = props.fileType === 'xlsx'
      isXls = props.fileType === 'xls'
    } else {
      // 从URL推断文件类型
      const url = props.url.toLowerCase()
      if (url.startsWith('blob:')) {
        // 对于blob URL，尝试通过文件头检测格式
        const header = new Uint8Array(arrayBuffer.slice(0, 4))
        // XLSX文件以PK开头（ZIP格式）
        if (header[0] === 0x50 && header[1] === 0x4B) {
          isXlsx = true
        } else {
          // 假设是XLS格式
          isXls = true
        }
      } else {
        isXlsx = url.includes('.xlsx')
        isXls = url.includes('.xls') && !isXlsx
      }
    }
    
    console.log(`文件类型检测: ${isXlsx ? 'XLSX' : isXls ? 'XLS' : 'Unknown'} (来源: ${props.fileType ? 'fileType prop' : props.url.startsWith('blob:') ? 'file header' : 'URL'})`)
    
    const worksheetsData: Array<{
      name: string
      data: unknown[][]
      index: number
    }> = []
    
    if (isXlsx) {
      // 使用 ExcelJS 处理 .xlsx 文件
      try {
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)
        
        if (workbook.worksheets.length === 0) {
          throw new Error('Excel文件中没有找到工作表')
        }
        
        workbook.worksheets.forEach((worksheet, index) => {
          const sheetName = worksheet.name || `Sheet${index + 1}`
          const data: unknown[][] = []
          
          worksheet.eachRow({ includeEmpty: true }, (row) => {
            const rowData: unknown[] = []
            const maxCol = Math.max(row.cellCount, worksheet.columnCount || 10)
            
            for (let colNumber = 1; colNumber <= maxCol; colNumber++) {
              const cell = row.getCell(colNumber)
              let cellValue = ''
              
              if (cell.value !== null && cell.value !== undefined) {
                if (cell.value instanceof Date) {
                  cellValue = cell.value.toLocaleDateString()
                } else if (typeof cell.value === 'object' && cell.value !== null && 'text' in cell.value) {
                  cellValue = String(cell.value.text)
                } else if (typeof cell.value === 'object' && cell.value !== null && 'result' in cell.value) {
                  cellValue = String(cell.value.result)
                } else {
                  cellValue = String(cell.value)
                }
              }
              
              rowData.push(cellValue)
            }
            data.push(rowData)
          })
          
          worksheetsData.push({
            name: sheetName,
            data: data,
            index: index
          })
        })
      } catch (excelJsError) {
        console.warn('ExcelJS 解析失败，尝试使用 XLSX:', excelJsError)
        // 如果 ExcelJS 失败，回退到 XLSX
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        
        workbook.SheetNames.forEach((sheetName, index) => {
          const worksheet = workbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: '',
            raw: false 
          }) as unknown[][]
          
          worksheetsData.push({
            name: sheetName,
            data: data,
            index: index
          })
        })
      }
    } else {
      // 使用 XLSX 处理 .xls 文件
      console.log('使用 XLSX 解析 XLS 文件')
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellText: false,
        cellDates: true
      })
      
      if (!workbook.SheetNames.length) {
        throw new Error('Excel文件中没有找到工作表')
      }
      
      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName]
        console.log(`处理工作表: ${sheetName}`, worksheet)
        
        // 使用 sheet_to_json 获取数据
        const data = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: '',
          raw: false,
          dateNF: 'yyyy-mm-dd'
        }) as unknown[][]
        
        console.log(`工作表 ${sheetName} 数据:`, data)
        
        worksheetsData.push({
          name: sheetName,
          data: data,
          index: index
        })
      })
    }
    
    if (worksheetsData.length === 0) {
      throw new Error('没有找到有效的工作表')
    }
    
    // 生成 HTML
    let html = '<div class="excel-tabs mb-4">'
    
    // 创建工作表选项卡
    html += '<div class="flex border-b border-gray-200 mb-4">'
    worksheetsData.forEach((sheet, index) => {
      html += `
        <button 
          class="sheet-tab px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${index === 0 ? 'text-blue-600 border-blue-600 bg-blue-50 active' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}"
          data-sheet="${index}"
        >
          ${sheet.name}
        </button>
      `
    })
    html += '</div>'
    
    // 创建工作表内容
    worksheetsData.forEach((sheet, index) => {
      try {
        let tableHtml = ''
        
        console.log(`处理工作表 ${sheet.name}，数据行数: ${sheet.data ? sheet.data.length : 0}`)
        
        if (!sheet.data || sheet.data.length === 0) {
          tableHtml = '<div class="p-4 text-gray-500">工作表为空</div>'
        } else {
          tableHtml = '<div class="overflow-auto max-h-[600px]"><table class="excel-table w-full"><tbody>'
          
          let rowCount = 0
          sheet.data.forEach((row) => {
            if (row && row.length > 0) {
              rowCount++
              const isHeaderRow = rowCount === 1
              tableHtml += `<tr class="${isHeaderRow ? 'header-row' : ''}">`
              row.forEach((cell) => {
                const cellValue = cell != null ? String(cell).replace(/&/g, '&amp;')
                                                            .replace(/</g, '&lt;')
                                                            .replace(/>/g, '&gt;')
                                                            .replace(/"/g, '&quot;')
                                                            .replace(/'/g, '&#39;') : ''
                const cellTag = isHeaderRow ? 'th' : 'td'
                const title = cellValue.length > 20 ? cellValue : ''
                tableHtml += `<${cellTag} class="excel-cell" title="${title}">${cellValue}</${cellTag}>`
              })
              tableHtml += '</tr>'
            }
          })
          
          console.log(`工作表 ${sheet.name} 生成了 ${rowCount} 行HTML`)
          tableHtml += '</tbody></table></div>'
        }
        
        html += `
          <div class="sheet-content ${index === 0 ? 'block' : 'hidden'}" data-sheet="${index}">
            ${tableHtml}
          </div>
        `
        
      } catch (sheetError) {
        console.error(`处理工作表 ${sheet.name} 时出错:`, sheetError)
        html += `
          <div class="sheet-content ${index === 0 ? 'block' : 'hidden'}" data-sheet="${index}">
            <div class="p-4 text-red-600">工作表 "${sheet.name}" 处理失败: ${sheetError instanceof Error ? sheetError.message : '未知错误'}</div>
          </div>
        `
      }
    })
    
    html += '</div>'
    
    // 先调用onSuccess来更新状态，让Vue渲染Excel容器
    console.log(`Excel 文件加载成功，包含 ${worksheetsData.length} 个工作表`)
    onSuccess()
    
    // 等待Vue更新DOM
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (excelContainer.value) {
      console.log('Excel容器找到，容器元素:', excelContainer.value)
      console.log('插入HTML到Excel容器，HTML长度:', html.length)
      console.log('HTML预览:', html.substring(0, 500) + '...')
      excelContainer.value.innerHTML = html
      
      // 检查插入后的内容
      console.log('插入后容器内容:', excelContainer.value.innerHTML.substring(0, 200) + '...')
      
      // 添加工作表切换功能
      const tabs = excelContainer.value.querySelectorAll('.sheet-tab')
      const contents = excelContainer.value.querySelectorAll('.sheet-content')
      
      console.log(`找到 ${tabs.length} 个选项卡和 ${contents.length} 个内容区域`)
      
      tabs.forEach((tab, tabIndex) => {
        tab.addEventListener('click', () => {
          const sheetIndex = tab.getAttribute('data-sheet')
          console.log(`点击了选项卡 ${tabIndex}，工作表索引: ${sheetIndex}`)
          
          // 更新选项卡样式
          tabs.forEach((t, i) => {
            if (i === tabIndex) {
              t.className = 'sheet-tab px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors text-blue-600 border-blue-600 bg-blue-50 active'
              console.log(`激活选项卡 ${i}`)
            } else {
              t.className = 'sheet-tab px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }
          })
          
          // 更新内容可见性
          contents.forEach((c, i) => {
            if (i === tabIndex) {
              c.classList.remove('hidden')
              c.classList.add('block')
              console.log(`显示内容区域 ${i}`)
            } else {
              c.classList.add('hidden')
              c.classList.remove('block')
            }
          })
        })
      })
    } else {
      console.error('等待DOM更新后Excel容器仍未找到！')
    }
    
  } catch (err) {
    console.error('Excel loading error:', err)
    const errorMsg = `Excel文件加载失败: ${err instanceof Error ? err.message : '未知错误'}`
    error.value = errorMsg
    loading.value = false
    props.onError?.(errorMsg)
  }
}

const loadWord = async () => {
  try {
    onLoading()
    
    console.log('Loading Word document from:', props.url)
    
    const response = await fetch(props.url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,*/*'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('Word文档下载完成，大小:', arrayBuffer.byteLength, 'bytes')
    
    // 检测文件格式
    let isDocx = false
    let isDoc = false
    
    // 优先使用props.fileType
    if (props.fileType) {
      isDocx = props.fileType === 'docx'
      isDoc = props.fileType === 'doc'
    } else {
      // 从URL推断文件类型
      const url = props.url.toLowerCase()
      if (url.startsWith('blob:')) {
        // 对于blob URL，尝试通过文件头检测格式
        const header = new Uint8Array(arrayBuffer.slice(0, 4))
        // DOCX文件以PK开头（ZIP格式）
        if (header[0] === 0x50 && header[1] === 0x4B) {
          isDocx = true
        } else {
          // 假设是DOC格式
          isDoc = true
        }
      } else {
        isDocx = url.includes('.docx')
        isDoc = url.includes('.doc') && !isDocx
      }
    }
    
    console.log(`文件格式检测: ${isDocx ? 'DOCX' : isDoc ? 'DOC' : 'Unknown'} (来源: ${props.fileType ? 'fileType prop' : props.url.startsWith('blob:') ? 'file header' : 'URL'})`)
    
    // 先更新状态让Vue渲染Word容器
    onSuccess()
    
    // 等待Vue更新DOM
    await new Promise(resolve => setTimeout(resolve, 150))
    
    if (!wordContainer.value) {
      console.error('wordContainer.value is:', wordContainer.value)
      console.error('DOM elements:', document.querySelectorAll('.word-content'))
      throw new Error('Word容器未找到，请检查组件是否正确渲染')
    }
    
    console.log('Word容器找到，容器元素:', wordContainer.value)
    
    // 清空容器
    wordContainer.value.innerHTML = ''
    
    // 处理不同格式的Word文档
    if (isDoc) {
      console.log('检测到.doc格式文件，docx-preview库不支持此格式')
      wordContainer.value.innerHTML = `
        <div class="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <div class="text-yellow-600 mb-4">
            <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-lg font-medium text-gray-900 mb-2">不支持的文档格式</div>
          <div class="text-gray-600 mb-4">
            此文档是旧版Word格式 (.doc)，当前预览器仅支持新版Word格式 (.docx)
          </div>
          <div class="text-sm text-gray-500">
            建议：
            <br>• 使用Microsoft Word或WPS将文档另存为.docx格式
            <br>• 或者直接下载文档在本地查看
          </div>
          <div class="mt-4">
            <a href="${props.url}" target="_blank" 
               class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下载文档
            </a>
          </div>
        </div>
      `
      console.log('已显示.doc格式不支持提示')
      return
    }
    
    console.log('开始渲染DOCX文档...')
    
    try {
      await renderAsync(arrayBuffer, wordContainer.value, undefined, {
        className: 'word-document',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: true,
        trimXmlDeclaration: true,
        useBase64URL: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true
      })
      
      console.log('renderAsync完成，等待渲染结果...')
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 检查是否有内容被渲染
      if (!wordContainer.value || wordContainer.value.children.length === 0) {
        console.warn('Word文档渲染后没有可见内容')
        // 添加一个提示信息而不是报错
        wordContainer.value.innerHTML = '<div class="p-4 text-gray-600 text-center">Word文档已加载，但可能内容为空或格式不支持显示</div>'
      } else {
        console.log('Word document rendered successfully, children count:', wordContainer.value.children.length)
      }
      
    } catch (renderError) {
      console.error('Word rendering error:', renderError)
      
      // 尝试显示错误信息而不是抛出异常
      if (wordContainer.value) {
        wordContainer.value.innerHTML = `
          <div class="p-6 text-center">
            <div class="text-red-600 mb-2">Word文档渲染失败</div>
            <div class="text-gray-600 text-sm mb-2">${renderError instanceof Error ? renderError.message : '未知渲染错误'}</div>
            <div class="text-gray-500 text-xs mb-4">可能是文档格式不兼容或文件损坏</div>
            <a href="${props.url}" target="_blank" 
               class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下载查看
            </a>
          </div>
        `
      }
      
      // 不抛出异常，让成功回调执行
      console.log('Word文档加载完成，但渲染失败')
    }

  } catch (err) {
    console.error('Word loading error:', err)
    const errorMsg = `Word文档加载失败: ${err instanceof Error ? err.message : '未知错误'}`
    error.value = errorMsg
    loading.value = false
    props.onError?.(errorMsg)
  }
}

const loadDocument = async () => {
  if (!props.url) return

  currentPage.value = 1
  totalPages.value = 0

  // 对于 Word 和 Excel，等待 DOM 更新
  if (isExcel.value || isWord.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  if (isExcel.value) {
    loadExcel()
  } else if (isWord.value) {
    loadWord()
  }
}

watch(() => props.url, loadDocument, { immediate: false })

onMounted(() => {
  if (props.url && (isExcel.value || isWord.value)) {
    // 确保组件完全挂载后再加载文档
    setTimeout(() => {
      loadDocument()
    }, 100)
  } else if (props.url && isPDF.value) {
    loadDocument()
  }
})
</script>

<style scoped>
.excel-content :deep(.excel-table) {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  border: 1px solid #c0c0c0;
  background-color: white;
  table-layout: auto;
}

.excel-content :deep(.excel-cell) {
  border: 1px solid #c0c0c0;
  padding: 4px 8px;
  text-align: left;
  vertical-align: top;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  min-width: 80px;
  max-width: 300px;
  min-height: 20px;
  line-height: 1.3;
}

.excel-content :deep(.header-row th) {
  background-color: #f2f2f2;
  font-weight: 600;
  color: #333;
  border: 1px solid #a6a6a6;
  text-align: center;
}

.excel-content :deep(tr:nth-child(even) td) {
  background-color: #fafafa;
}

.excel-content :deep(tr:hover td) {
  background-color: #e8f4f8;
}

.excel-content :deep(.sheet-content) {
  min-height: 300px;
  background-color: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
}

.sheet-tab {
  position: relative;
  background-color: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-bottom: none;
  font-size: 12px;
  min-width: 80px;
  text-align: center;
}

.sheet-tab:hover {
  background-color: #e0e0e0 !important;
}

.sheet-tab.active {
  background-color: white !important;
  border-top: 2px solid #4285f4;
  font-weight: 600;
}

/* 工作表选项卡容器样式 */
.excel-content :deep(.excel-tabs) {
  background-color: #f8f8f8;
  border: 1px solid #d0d0d0;
  border-radius: 4px 4px 0 0;
}

.excel-content :deep(.excel-tabs .flex) {
  background-color: #f0f0f0;
  border-bottom: 1px solid #d0d0d0;
  padding: 0;
  margin: 0;
}

/* 表格容器的滚动条样式 */
.excel-content :deep(.overflow-auto) {
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f0f0f0;
}

.excel-content :deep(.overflow-auto)::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.excel-content :deep(.overflow-auto)::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.excel-content :deep(.overflow-auto)::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.excel-content :deep(.overflow-auto)::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.word-content {
  background: white;
  padding: 32px;
  max-width: 100%;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.word-content :deep(.word-document) {
  max-width: 100%;
  line-height: 1.75;
  color: #111827;
  overflow-wrap: break-word;
}

.word-content :deep(p) {
  margin-bottom: 1rem;
}

.word-content :deep(h1), 
.word-content :deep(h2), 
.word-content :deep(h3), 
.word-content :deep(h4), 
.word-content :deep(h5), 
.word-content :deep(h6) {
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  font-weight: 600;
}
</style>