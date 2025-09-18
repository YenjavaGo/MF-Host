<template>
  <div class="simple-remote-app">
    <div class="header">
      <h1>🚀 Simple Remote App</h1>
      <p>這是一個簡單的 Vue 3 Module Federation Remote 應用</p>
    </div>
    
    <div class="content">
      <div class="info-card">
        <h3>✅ Remote 應用資訊</h3>
        <ul>
          <li><strong>應用名稱:</strong> workflow</li>
          <li><strong>Vue 版本:</strong> {{ vueVersion }}</li>
          <li><strong>載入時間:</strong> {{ loadTime }}</li>
          <li><strong>狀態:</strong> <span class="status-active">正常運行</span></li>
        </ul>
      </div>
      
      <div class="demo-section">
        <h3>🎯 功能演示</h3>
        <div class="demo-controls">
          <button @click="counter++" class="demo-button">
            點擊計數: {{ counter }}
          </button>
          <button @click="toggleMessage" class="demo-button secondary">
            {{ showMessage ? '隱藏' : '顯示' }}訊息
          </button>
        </div>
        
        <div v-if="showMessage" class="message-box">
          <p>🎉 恭喜！Remote 組件載入成功！</p>
          <p>這證明 Module Federation 配置正確，Host 可以成功載入 Remote 組件。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { version } from 'vue'

const vueVersion = ref(version)
const loadTime = ref('')
const counter = ref(0)
const showMessage = ref(false)

const toggleMessage = () => {
  showMessage.value = !showMessage.value
}

onMounted(() => {
  loadTime.value = new Date().toLocaleString('zh-TW')
})
</script>

<style scoped>
.simple-remote-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

.header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1em;
}

.content {
  display: grid;
  gap: 20px;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.info-card h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.info-card ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.info-card li {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-card li:last-child {
  border-bottom: none;
}

.status-active {
  color: #28a745;
  font-weight: bold;
}

.demo-section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.demo-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.demo-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.demo-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #007bff;
  color: white;
}

.demo-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.demo-button.secondary {
  background: #6c757d;
}

.demo-button.secondary:hover {
  background: #545b62;
}

.message-box {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 15px;
  color: #155724;
}

.message-box p {
  margin: 0 0 10px 0;
}

.message-box p:last-child {
  margin-bottom: 0;
}
</style>
