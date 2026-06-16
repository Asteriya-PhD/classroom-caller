// DOM 元素
const configModal = document.getElementById('configModal');
const mainScreen = document.getElementById('mainScreen');
const configUrlInput = document.getElementById('configUrl');
const configKeyInput = document.getElementById('configKey');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const connectionStatus = document.getElementById('connectionStatus');
const currentTimeEl = document.getElementById('currentTime');
const messageContainer = document.getElementById('messageContainer');
const messageBox = document.getElementById('messageBox');
const messageType = document.getElementById('messageType');
const messageContent = document.getElementById('messageContent');
const messageTimer = document.getElementById('messageTimer');

// 全局变量
let supabaseUrl = '';
let supabaseKey = '';
let pollInterval = null;
let messageTimeout = null;
let lastMessageId = null;

// 消息类型中文名
const typeNames = {
  call: '📢 叫到讲台',
  notice: '🔔 通知',
  custom: '💬 自定义'
};

// 初始化
async function init() {
  // 检查是否有 electron API（Electron 环境）
  if (window.electronAPI) {
    const config = await window.electronAPI.getConfig();
    if (config.supabaseUrl && config.supabaseKey) {
      supabaseUrl = config.supabaseUrl;
      supabaseKey = config.supabaseKey;
      configModal.classList.add('hidden');
      mainScreen.classList.remove('hidden');
      startPolling();
    }
  } else {
    // 浏览器环境，使用 localStorage
    supabaseUrl = localStorage.getItem('supabaseUrl') || '';
    supabaseKey = localStorage.getItem('supabaseKey') || '';
    
    if (supabaseUrl && supabaseKey) {
      configModal.classList.add('hidden');
      mainScreen.classList.remove('hidden');
      startPolling();
    }
  }
  
  // 更新时间
  updateTime();
  setInterval(updateTime, 1000);
}

// 保存配置
saveConfigBtn.addEventListener('click', async () => {
  const url = configUrlInput.value.trim();
  const key = configKeyInput.value.trim();
  
  if (!url || !key) {
    alert('请填写完整的配置信息');
    return;
  }
  
  supabaseUrl = url;
  supabaseKey = key;
  
  if (window.electronAPI) {
    await window.electronAPI.saveConfig({
      supabaseUrl: url,
      supabaseKey: key,
      fullscreen: false
    });
  } else {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);
  }
  
  configModal.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  startPolling();
});

// 开始轮询消息
function startPolling() {
  // 先检查连接
  checkConnection();
  
  // 每2秒轮询一次
  pollInterval = setInterval(checkNewMessages, 2000);
}

// 检查连接状态
async function checkConnection() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/messages?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      connectionStatus.textContent = '● 已连接';
      connectionStatus.classList.add('connected');
    } else {
      throw new Error('连接失败');
    }
  } catch (error) {
    connectionStatus.textContent = '● 连接失败';
    connectionStatus.classList.remove('connected');
  }
}

// 检查新消息
async function checkNewMessages() {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/messages?is_read=eq.false&order=created_at.asc&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    
    if (!response.ok) return;
    
    const messages = await response.json();
    
    if (messages.length > 0) {
      const message = messages[0];
      
      // 避免重复显示
      if (message.id === lastMessageId) return;
      
      lastMessageId = message.id;
      showMessage(message);
      
      // 标记为已读
      await markAsRead(message.id);
    }
  } catch (error) {
    console.error('获取消息失败:', error);
  }
}

// 显示消息
function showMessage(message) {
  // 清除之前的定时器
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  
  // 设置消息类型样式
  messageBox.className = 'message-box';
  if (message.message_type) {
    messageBox.classList.add(`type-${message.message_type}`);
  }
  
  // 设置内容
  messageType.textContent = typeNames[message.message_type] || '消息';
  messageContent.textContent = message.content;
  
  // 显示弹窗
  messageContainer.classList.remove('hidden');
  
  // 播放提示音
  playSound();
  
  // 倒计时
  let remaining = message.duration || 10;
  messageTimer.textContent = `${remaining}秒后关闭`;
  
  const countdown = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(countdown);
      hideMessage();
    } else {
      messageTimer.textContent = `${remaining}秒后关闭`;
    }
  }, 1000);
  
  // 保存定时器引用
  messageTimeout = setTimeout(() => {
    clearInterval(countdown);
    hideMessage();
  }, (message.duration || 10) * 1000);
}

// 隐藏消息
function hideMessage() {
  messageContainer.classList.add('hidden');
  lastMessageId = null;
}

// 标记消息为已读
async function markAsRead(messageId) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/messages?id=eq.${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ is_read: true })
    });
  } catch (error) {
    console.error('标记已读失败:', error);
  }
}

// 播放提示音
function playSound() {
  // 使用 Web Audio API 播放提示音
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 创建提示音
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // 播放两声
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
  } catch (error) {
    console.error('播放声音失败:', error);
  }
}

// 更新时间显示
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  currentTimeEl.textContent = timeStr;
}

// 启动
init();
