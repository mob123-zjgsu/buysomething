const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { productId } = event;
    
    if (!productId) {
      return { success: false, message: '商品ID不能为空' };
    }
    
    // 删除商品
    const result = await db.collection('products').doc(productId).remove();
    
    return { 
      success: true, 
      message: '删除成功',
      deleted: result.deleted
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
