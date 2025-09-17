<template>
  <div class="hello-world">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <el-icon><Star /></el-icon>
          <span>Hello World 組件</span>
        </div>
      </template>
      
      <div class="demo-content">
        <el-alert
          title="歡迎使用微前端Host應用！"
          type="success"
          :closable="false"
          show-icon
        >
          <p>這是一個基於Vue 3 + Webpack Module Federation + Element Plus的示例組件</p>
        </el-alert>
        
        <div class="demo-buttons">
          <el-button type="primary" @click="showMessage">
            <el-icon><Message /></el-icon>
            顯示訊息
          </el-button>
          
          <el-button type="success" @click="incrementCounter">
            <el-icon><Plus /></el-icon>
            計數器: {{ counter }}
          </el-button>
        </div>
        
        <el-divider />
        
        <div class="tech-stack">
          <h4>技術棧資訊：</h4>
          <el-tag v-for="tech in techStack" :key="tech.name" :type="tech.type" class="tech-tag">
            {{ tech.name }} {{ tech.version }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, Message, Plus } from '@element-plus/icons-vue';

export default {
  name: 'HelloWorld',
  components: {
    Star,
    Message,
    Plus
  },
  setup() {
    const counter = ref(0);
    
    const techStack = [
      { name: 'Vue', version: '3.3.4', type: 'success' },
      { name: 'Webpack', version: '5.88.0', type: 'primary' },
      { name: 'Element Plus', version: '2.3.14', type: 'warning' },
      { name: 'Module Federation', version: '5.x', type: 'info' }
    ];

    const showMessage = () => {
      ElMessage({
        message: '恭喜！微前端Host應用運行成功！',
        type: 'success',
        duration: 3000
      });
    };

    const incrementCounter = () => {
      counter.value++;
      ElMessage({
        message: `計數器已更新為: ${counter.value}`,
        type: 'info',
        duration: 2000
      });
    };

    return {
      counter,
      techStack,
      showMessage,
      incrementCounter
    };
  }
};
</script>

<style scoped>
.hello-world {
  padding: 20px;
}

.demo-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.tech-stack h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.tech-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
