-- 班级大屏叫号系统 - Supabase 数据库结构
-- 创建 messages 表存储叫号消息

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_type VARCHAR(20) NOT NULL DEFAULT 'call', -- call: 叫上来, notice: 通知, custom: 自定义
  student_name VARCHAR(100), -- 学生姓名（可选）
  content TEXT NOT NULL, -- 消息内容
  duration INTEGER DEFAULT 10, -- 弹窗显示时长（秒）
  is_read BOOLEAN DEFAULT FALSE, -- 大屏是否已读
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- 启用实时订阅（Supabase Realtime）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 插入测试数据（可选）
-- INSERT INTO messages (message_type, student_name, content, duration) 
-- VALUES ('call', '张三', '请张三同学到讲台', 10);
