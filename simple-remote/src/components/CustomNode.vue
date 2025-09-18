<template>
  <div class="custom-node">
    <div class="node-header">
      <h2>🔗 Custom Node</h2>
      <p>這是 CustomNode 組件 - 模擬自定義節點功能</p>
    </div>
    
    <div class="node-content">
      <div class="node-config">
        <h3>節點配置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>節點名稱:</label>
            <input v-model="nodeName" type="text" class="form-input" placeholder="輸入節點名稱">
          </div>
          
          <div class="form-group">
            <label>節點類型:</label>
            <select v-model="nodeType" class="form-select">
              <option value="start">開始節點</option>
              <option value="process">處理節點</option>
              <option value="decision">決策節點</option>
              <option value="end">結束節點</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>描述:</label>
            <textarea v-model="nodeDescription" class="form-textarea" placeholder="輸入節點描述"></textarea>
          </div>
        </div>
      </div>
      
      <div class="node-preview">
        <h3>節點預覽</h3>
        <div class="node-visual" :class="nodeType">
          <div class="node-icon">{{ getNodeIcon(nodeType) }}</div>
          <div class="node-title">{{ nodeName || '未命名節點' }}</div>
          <div class="node-desc">{{ nodeDescription || '無描述' }}</div>
        </div>
      </div>
      
      <div class="node-actions">
        <button @click="saveNode" class="action-btn primary">
          💾 儲存節點
        </button>
        <button @click="resetNode" class="action-btn secondary">
          🔄 重置
        </button>
        <button @click="exportNode" class="action-btn info">
          📤 匯出配置
        </button>
      </div>
      
      <div v-if="savedNodes.length > 0" class="saved-nodes">
        <h3>已儲存的節點</h3>
        <div class="nodes-grid">
          <div 
            v-for="node in savedNodes" 
            :key="node.id" 
            class="saved-node-item"
            :class="node.type"
          >
            <div class="saved-node-icon">{{ getNodeIcon(node.type) }}</div>
            <div class="saved-node-name">{{ node.name }}</div>
            <div class="saved-node-type">{{ getTypeText(node.type) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SavedNode {
  id: number
  name: string
  type: string
  description: string
  createdAt: string
}

const nodeName = ref('')
const nodeType = ref('start')
const nodeDescription = ref('')
const savedNodes = ref<SavedNode[]>([])
const nodeIdCounter = ref(1)

const getNodeIcon = (type: string) => {
  const iconMap = {
    'start': '🚀',
    'process': '⚙️',
    'decision': '❓',
    'end': '🏁'
  }
  return iconMap[type as keyof typeof iconMap] || '📦'
}

const getTypeText = (type: string) => {
  const typeMap = {
    'start': '開始',
    'process': '處理',
    'decision': '決策',
    'end': '結束'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

const saveNode = () => {
  if (!nodeName.value.trim()) {
    alert('請輸入節點名稱')
    return
  }
  
  const newNode: SavedNode = {
    id: nodeIdCounter.value++,
    name: nodeName.value,
    type: nodeType.value,
    description: nodeDescription.value,
    createdAt: new Date().toLocaleString('zh-TW')
  }
  
  savedNodes.value.push(newNode)
  alert(`節點 "${nodeName.value}" 已儲存！`)
}

const resetNode = () => {
  nodeName.value = ''
  nodeType.value = 'start'
  nodeDescription.value = ''
}

const exportNode = () => {
  const config = {
    name: nodeName.value,
    type: nodeType.value,
    description: nodeDescription.value,
    exportTime: new Date().toISOString()
  }
  
  console.log('節點配置:', config)
  alert('節點配置已匯出到控制台！')
}
</script>

<style scoped>
.custom-node {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.node-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.node-header h2 {
  margin: 0 0 10px 0;
  font-size: 2em;
}

.node-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .node-content {
    grid-template-columns: 1fr;
  }
}

.node-config, .node-preview {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.node-config h3, .node-preview h3 {
  margin: 0 0 20px 0;
  color: #495057;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  height: 80px;
  resize: vertical;
}

.node-visual {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.node-visual.start {
  border-color: #28a745;
  background: #f8fff9;
}

.node-visual.process {
  border-color: #007bff;
  background: #f8f9ff;
}

.node-visual.decision {
  border-color: #ffc107;
  background: #fffef8;
}

.node-visual.end {
  border-color: #dc3545;
  background: #fff8f8;
}

.node-icon {
  font-size: 3em;
  margin-bottom: 10px;
}

.node-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 8px;
  color: #495057;
}

.node-desc {
  font-size: 0.9em;
  color: #6c757d;
  font-style: italic;
}

.node-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background: #545b62;
}

.action-btn.info {
  background: #17a2b8;
  color: white;
}

.action-btn.info:hover {
  background: #138496;
}

.saved-nodes {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.saved-nodes h3 {
  margin: 0 0 20px 0;
  color: #495057;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.saved-node-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: all 0.2s ease;
}

.saved-node-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.saved-node-item.start {
  border-left: 4px solid #28a745;
}

.saved-node-item.process {
  border-left: 4px solid #007bff;
}

.saved-node-item.decision {
  border-left: 4px solid #ffc107;
}

.saved-node-item.end {
  border-left: 4px solid #dc3545;
}

.saved-node-icon {
  font-size: 2em;
  margin-bottom: 8px;
}

.saved-node-name {
  font-weight: bold;
  margin-bottom: 4px;
  color: #495057;
}

.saved-node-type {
  font-size: 0.8em;
  color: #6c757d;
}
</style>
