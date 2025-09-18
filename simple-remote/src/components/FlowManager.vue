<template>
  <div class="flow-manager">
    <div class="manager-header">
      <h2>🔄 Flow Manager</h2>
      <p>這是 FlowManager 組件 - 模擬工作流程管理功能</p>
    </div>
    
    <div class="flow-content">
      <div class="flow-stats">
        <div class="stat-item">
          <div class="stat-number">{{ activeFlows }}</div>
          <div class="stat-label">活躍流程</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ completedFlows }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ totalNodes }}</div>
          <div class="stat-label">總節點數</div>
        </div>
      </div>
      
      <div class="flow-actions">
        <button @click="createFlow" class="action-btn primary">
          ➕ 建立新流程
        </button>
        <button @click="startFlow" class="action-btn success" :disabled="activeFlows === 0">
          ▶️ 啟動流程
        </button>
        <button @click="pauseFlow" class="action-btn warning" :disabled="activeFlows === 0">
          ⏸️ 暫停流程
        </button>
      </div>
      
      <div class="flow-list">
        <h3>流程列表</h3>
        <div v-if="flows.length === 0" class="empty-state">
          尚無流程，點擊「建立新流程」開始
        </div>
        <div v-else class="flow-items">
          <div 
            v-for="flow in flows" 
            :key="flow.id" 
            class="flow-item"
            :class="{ active: flow.status === 'running' }"
          >
            <div class="flow-info">
              <strong>{{ flow.name }}</strong>
              <span class="flow-status" :class="flow.status">{{ getStatusText(flow.status) }}</span>
            </div>
            <div class="flow-meta">
              建立時間: {{ flow.createdAt }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Flow {
  id: number
  name: string
  status: 'idle' | 'running' | 'paused' | 'completed'
  createdAt: string
}

const flows = ref<Flow[]>([])
const flowIdCounter = ref(1)

const activeFlows = computed(() => flows.value.filter(f => f.status === 'running').length)
const completedFlows = computed(() => flows.value.filter(f => f.status === 'completed').length)
const totalNodes = computed(() => flows.value.length * 3) // 假設每個流程有3個節點

const createFlow = () => {
  const newFlow: Flow = {
    id: flowIdCounter.value++,
    name: `工作流程 ${flowIdCounter.value - 1}`,
    status: 'idle',
    createdAt: new Date().toLocaleString('zh-TW')
  }
  flows.value.push(newFlow)
}

const startFlow = () => {
  const idleFlow = flows.value.find(f => f.status === 'idle')
  if (idleFlow) {
    idleFlow.status = 'running'
  }
}

const pauseFlow = () => {
  const runningFlow = flows.value.find(f => f.status === 'running')
  if (runningFlow) {
    runningFlow.status = 'paused'
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    'idle': '待機',
    'running': '運行中',
    'paused': '已暫停',
    'completed': '已完成'
  }
  return statusMap[status as keyof typeof statusMap] || status
}
</script>

<style scoped>
.flow-manager {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.manager-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  border-radius: 12px;
}

.manager-header h2 {
  margin: 0 0 10px 0;
  font-size: 2em;
}

.flow-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
}

.flow-actions {
  display: flex;
  gap: 10px;
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

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.action-btn.success {
  background: #28a745;
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: #1e7e34;
}

.action-btn.warning {
  background: #ffc107;
  color: #212529;
}

.action-btn.warning:hover:not(:disabled) {
  background: #e0a800;
}

.flow-list {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.flow-list h3 {
  margin: 0 0 20px 0;
  color: #495057;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px;
}

.flow-items {
  display: grid;
  gap: 10px;
}

.flow-item {
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.flow-item.active {
  border-color: #28a745;
  background: #f8fff9;
}

.flow-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.flow-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
}

.flow-status.idle {
  background: #e9ecef;
  color: #495057;
}

.flow-status.running {
  background: #d4edda;
  color: #155724;
}

.flow-status.paused {
  background: #fff3cd;
  color: #856404;
}

.flow-status.completed {
  background: #cce5ff;
  color: #004085;
}

.flow-meta {
  font-size: 0.9em;
  color: #6c757d;
}
</style>
