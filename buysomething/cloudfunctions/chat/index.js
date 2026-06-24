const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();
const _ = db.command;

/**
 * 聊天消息云函数
 * conversationId = merchantId_userId_productId
 */
exports.main = async (event, context) => {
  const { action } = event;

  try {
    // 发送消息
    if (action === 'send') {
      const { conversationId, senderType, senderName, content, productId, productName, merchantId, merchantName, userId, productImage } = event;
      if (!conversationId || !content || !senderType) {
        return { code: 1001, message: '参数不完整' };
      }

      const msg = {
        conversationId,
        senderType, // 'user' | 'merchant'
        senderName: senderName || '',
        content,
        productId: productId || '',
        productName: productName || '',
        productImage: productImage || '',
        merchantId: merchantId || '',
        merchantName: merchantName || '',
        userId: userId || '',
        createTime: db.serverDate(),
        isRead: false
      };

      const result = await db.collection('chat_messages').add({ data: msg });

      // 更新或创建会话记录（方便列表展示）
      const convKey = conversationId;
      const existingConv = await db.collection('chat_messages')
        .where({ conversationId: convKey, type: 'conversation_meta' })
        .limit(1).get();

      const convMeta = {
        type: 'conversation_meta',
        conversationId: convKey,
        lastMessage: content,
        lastTime: db.serverDate(),
        productId: productId || '',
        productName: productName || '',
        productImage: productImage || '',
        merchantId: merchantId || '',
        merchantName: merchantName || '',
        userId: userId || '',
        userName: senderType === 'user' ? (senderName || '用户') : undefined,
        unreadByMerchant: senderType === 'user',
        unreadByUser: senderType === 'merchant'
      };

      if (existingConv.data && existingConv.data.length > 0) {
        const updateData = {
          lastMessage: content,
          lastTime: db.serverDate(),
        };
        if (senderType === 'user') {
          updateData.unreadByMerchant = true;
          if (convMeta.userName) updateData.userName = convMeta.userName;
        } else {
          updateData.unreadByUser = true;
        }
        await db.collection('chat_messages').doc(existingConv.data[0]._id).update({ data: updateData });
      } else {
        await db.collection('chat_messages').add({ data: convMeta });
      }

      return { code: 0, message: '发送成功', data: { msgId: result._id } };
    }

    // 获取消息列表
    if (action === 'list') {
      const { conversationId, limit = 50, offset = 0 } = event;
      if (!conversationId) {
        return { code: 1001, message: '缺少会话ID' };
      }

      const result = await db.collection('chat_messages')
        .where({
          conversationId,
          type: _.neq('conversation_meta')
        })
        .orderBy('createTime', 'asc')
        .skip(offset)
        .limit(limit)
        .get();

      return { code: 0, message: 'success', data: result.data };
    }

    // 商家获取会话列表
    if (action === 'merchantConversations') {
      const { merchantId } = event;
      if (!merchantId) {
        return { code: 1001, message: '缺少商家ID' };
      }

      const result = await db.collection('chat_messages')
        .where({
          type: 'conversation_meta',
          merchantId
        })
        .orderBy('lastTime', 'desc')
        .limit(50)
        .get();

      return { code: 0, message: 'success', data: result.data };
    }

    // 用户获取自己的会话列表
    if (action === 'userConversations') {
      const { userId } = event;
      if (!userId) {
        return { code: 1001, message: '缺少用户ID' };
      }

      const result = await db.collection('chat_messages')
        .where({
          type: 'conversation_meta',
          userId
        })
        .orderBy('lastTime', 'desc')
        .limit(50)
        .get();

      return { code: 0, message: 'success', data: result.data };
    }

    // 标记已读
    if (action === 'markRead') {
      const { conversationId, readerType } = event;
      if (!conversationId || !readerType) {
        return { code: 1001, message: '参数不完整' };
      }

      // 标记消息已读
      const field = readerType === 'merchant' ? 'unreadByMerchant' : 'unreadByUser';
      await db.collection('chat_messages')
        .where({ conversationId, type: 'conversation_meta' })
        .update({ data: { [field]: false } });

      return { code: 0, message: '已标记已读' };
    }

    return { code: 4001, message: '未知操作' };
  } catch (err) {
    console.error('聊天操作失败:', err);
    return { code: 5001, message: '服务器错误', data: { error: err.message } };
  }
};
