const cloud = require('wx-server-sdk');

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { action, merchantId, productId, status } = event;

  try {
    switch (action) {
    case 'getPendingMerchants':
      // 获取待审核商家
      const merchants = await db.collection('merchants')
        .where({ status: 'pending' })
        .orderBy('createTime', 'desc')
        .get();
        
      return {
        code: 0,
        data: merchants.data
      };

    case 'getPendingProducts':
      // 获取待审核商品
      const products = await db.collection('products')
        .where({ status: 0 }) // 0=待审核
        .orderBy('createTime', 'desc')
        .get();
        
      return {
        code: 0,
        data: products.data
      };

    case 'approveMerchant':
      // 审核通过商家
      await db.collection('merchants').doc(merchantId).update({
        data: {
          status: 'approved',
          updateTime: db.serverDate()
        }
      });
      return { code: 0, message: '商家审核通过' };

    case 'rejectMerchant':
      // 审核拒绝商家
      await db.collection('merchants').doc(merchantId).update({
        data: {
          status: 'rejected',
          updateTime: db.serverDate()
        }
      });
      return { code: 0, message: '商家审核已拒绝' };

    case 'approveProduct':
      // 审核通过商品
      await db.collection('products').doc(productId).update({
        data: {
          status: 1,
          updateTime: db.serverDate()
        }
      });
      return { code: 0, message: '商品审核通过' };

    case 'rejectProduct':
      // 审核拒绝商品
      await db.collection('products').doc(productId).update({
        data: {
          status: -1,
          updateTime: db.serverDate()
        }
      });
      return { code: 0, message: '商品审核已拒绝' };

    case 'deleteMerchant':
      // 删除商家
      await db.collection('merchants').doc(merchantId).remove();
      return { code: 0, message: '商家已删除' };

    case 'deleteProduct':
      // 删除商品
      await db.collection('products').doc(productId).remove();
      return { code: 0, message: '商品已删除' };

    case 'getStats':
      // 获取统计数据
      const [merchantCount, productCount, userCount] = await Promise.all([
        db.collection('merchants').count(),
        db.collection('products').count(),
        db.collection('users').count()
      ]);
        
      return {
        code: 0,
        data: {
          totalMerchants: merchantCount.total,
          totalProducts: productCount.total,
          totalUsers: userCount.total
        }
      };

    case 'getMerchantsByStatus':
      // 按状态获取商家
      const merchantList = await db.collection('merchants')
        .where({ status: status })
        .orderBy('createTime', 'desc')
        .get();
      return { code: 0, data: merchantList.data };

    case 'getAllProducts':
      // 获取所有商品
      const allProducts = await db.collection('products')
        .orderBy('createTime', 'desc')
        .get();
      return { code: 0, data: allProducts.data };

    case 'getProductDetail':
      // 获取商品完整详情（管理员审核用）
      if (!productId) {
        return { code: 4001, message: '缺少商品ID' };
      }
      const productDetail = await db.collection('products').doc(productId).get();
      if (!productDetail.data) {
        return { code: 4002, message: '商品不存在' };
      }
      return { code: 0, data: productDetail.data };

    default:
      return {
        code: 4001,
        message: '未知操作'
      };
    }
  } catch (err) {
    console.error('管理员操作失败:', err);
    return {
      code: 5001,
      message: '操作失败，请稍后重试'
    };
  }
};