// Supabase 配置 - 需要替换为你的 Supabase 项目信息
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// 简易 Supabase REST API 封装
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('插入失败');
    return response.json();
  }

  async select(table, options = {}) {
    let query = `${this.url}/rest/v1/${table}?select=*&order=created_at.desc`;
    if (options.limit) query += `&limit=${options.limit}`;
    
    const response = await fetch(query, {
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`
      }
    });
    if (!response.ok) throw new Error('查询失败');
    return response.json();
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM 元素
const studentNameInput = document.getElementById('studentName');
const messageInput = document.getElementById('message');
const durationSelect = document.getElementById('duration');
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.getElementById('status');
const historyList = document.getElementById('historyList');
const radioButtons = document.querySelectorAll('input[name="msgType"]');

// 消息类型中文名
const typeNames = {
  call: '叫到讲台',
  notice: '通知',
  custom: '自定义'
};

// 消息类型模板
const templates = {
  call: (name) => name ? `请 ${name} 同学到讲台` : '请到讲台',
  notice: (name) => name ? `${name}：请注意` : '请注意',
  custom: () => ''
};

// 更新消息预览
function updatePreview() {
  const name = studentNameInput.value.trim();
  const type = document.querySelector('input[name="msgType"]:checked').value;
  
  if (type === 'custom') {
    messageInput.placeholder = '输入自定义消息内容';
    if (messageInput.value === '' || templates.notice('') === messageInput.value) {
      messageInput.value = '';
    }
  } else {
    messageInput.placeholder = '自动填充，也可手动修改';
    messageInput.value = templates[type](name);
  }
}

// 事件绑定
radioButtons.forEach(radio => {
  radio.addEventListener('change', updatePreview);
});

studentNameInput.addEventListener('input', updatePreview);

// 发送消息
sendBtn.addEventListener('click', async () => {
  const name = studentNameInput.value.trim();
  const type = document.querySelector('input[name="msgType"]:checked').value;
  const message = messageInput.value.trim();
  const duration = parseInt(durationSelect.value);

  if (!message) {
    alert('请输入消息内容');
    return;
  }

  try {
    sendBtn.disabled = true;
    sendBtn.textContent = '发送中...';

    await supabase.insert('messages', {
      message_type: type,
      student_name: name || null,
      content: message,
      duration: duration,
      is_read: false
    });

    // 添加到历史记录
    addToHistory(name, type, message);
    
    // 重置表单
    messageInput.value = '';
    updatePreview();
    
    // 显示成功提示
    sendBtn.textContent = '✓ 已发送';
    setTimeout(() => {
      sendBtn.textContent = '发 送';
      sendBtn.disabled = false;
    }, 1500);

  } catch (error) {
    console.error('发送失败:', error);
    alert('发送失败，请检查网络连接和 Supabase 配置');
    sendBtn.textContent = '发 送';
    sendBtn.disabled = false;
  }
});

// 添加到历史记录
function addToHistory(name, type, message) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const historyItem = document.createElement('div');
  historyItem.className = 'history-item';
  historyItem.innerHTML = `
    <div class="history-content">
      <div class="name">${name || '全班'}</div>
      <div class="type">${typeNames[type]} - ${message}</div>
    </div>
    <div class="history-time">${timeStr}</div>
  `;

  // 移除空提示
  const emptyTip = historyList.querySelector('.empty-tip');
  if (emptyTip) emptyTip.remove();

  // 添加到顶部
  historyList.insertBefore(historyItem, historyList.firstChild);

  // 限制历史记录数量
  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}

// 检查连接状态
async function checkConnection() {
  try {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
      statusEl.textContent = '未配置';
      statusEl.className = 'status';
      return;
    }
    
    await supabase.select('messages', { limit: 1 });
    statusEl.textContent = '已连接';
    statusEl.className = 'status connected';
  } catch (error) {
    statusEl.textContent = '连接失败';
    statusEl.className = 'status';
  }
}

// 初始化
checkConnection();
updatePreview();
