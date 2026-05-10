const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

exports.main = async (event, context) => {
  const { productId, merchantId } = event;

  if (!productId) {
    return { code: 4001, message: '商品ID不能为空' };
  }

  try {
    // 验证商品属于该商家
    const product = await db.collection('products').doc(productId).get();
    
    if (!product.data) {
      return { code: 4002, message: '商品不存在' };
    }

    if (product.data.merchantId !== merchantId) {
      return { code: 4003, message: '无权删除该商品' };
    }

    await db.collection('products').doc(productId).remove();
    return { code: 0, message: '商品已删除' };
  } catch (err) {
    console.error('删除商品失败:', err);
    return { code: 5001, message: '删除失败，请稍后重试' };
  }
};