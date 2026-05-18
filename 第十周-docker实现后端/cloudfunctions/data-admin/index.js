const cloud = require('wx-server-sdk');

cloud.init({
  env: 'buysomething-6gbmbtpxff05be35'
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;

  try {
    switch (action) {
      
      // 1. 添加待审核商家
      case 'addPendingMerchant':
        const merchantData = {
          phone: '13900004444',
          password: '123456',
          merchantName: '潮流服饰',
          contactPerson: '赵六',
          mainProducts: '潮流服饰、时尚配饰',
          status: 'pending',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        };
        
        const merchantResult = await db.collection('merchants').add({
          data: merchantData
        });
        
        return {
          success: true,
          message: '待审核商家添加成功',
          id: merchantResult._id,
          data: merchantData
        };

      // 2. 添加未审核的短袖商品
      case 'addUnreviewedProduct':
        // 使用优品服饰的商家ID
        const merchantId = '97b16bdb69fde9ea018468c710a9a009';
        
        const productData = {
          name: '纯棉短袖T恤男款',
          description: '2026年新款纯棉短袖，采用优质面料，透气舒适，适合夏季穿着。简约设计，百搭款式，多色可选。',
          price: 79,
          originalPrice: 159,
          image: '/images/product1.jpg',
          images: ['/images/product1.jpg', '/images/product2.jpg'],
          categoryId: 'category_001',
          stock: 500,
          sales: 0,
          rating: 5,
          specs: {
            colors: ['白色', '黑色', '蓝色', '灰色'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL']
          },
          status: 0, // 0=待审核
          merchantId: merchantId,
          merchantName: '优品服饰',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        };
        
        const productResult = await db.collection('products').add({
          data: productData
        });
        
        return {
          success: true,
          message: '未审核短袖商品添加成功',
          id: productResult._id,
          data: productData
        };

      // 3. 删除指定商品
      case 'deleteProducts':
        const productIds = [
          'f6fcfb9c69cb4f07024b699566c5109b', // AirPods Pro
          '4d75389069cb4f07024b699566c5109b', // 小米14 Pro (第一张)
          '4d75389069cb4f07024b6995fe0d376c7424', // 小米14 Pro
          '4d75389069cb4f07024b699566c5109b', // 小米14 Pro
          '4d75389069cb4f0e00ae5f0e53af13a9', // MacBook Air M3
          '4d75389069cb4f0e00ae5f0f3cd6830a', // Apple Watch S9
          '97b16bdb69fde9f2018469536a5809eb', // 高腰牛仔裤
          '97b16bdb69fde9f20184695248791ed2', // 纯棉短袖T恤
          '97b16bdb69fde9f20184695100b3c356', // 男士休闲西装
          '97b16bdb69fde9f2018469542b13b9bb', // iPhone 15 Pro
          'd3a457a269dcef6d0423a88233859df9'  // 时尚休闲运动鞋
        ];
        
        // 去重
        const uniqueIds = [...new Set(productIds)];
        
        const deleted = [];
        const failed = [];
        
        for (const id of uniqueIds) {
          try {
            await db.collection('products').doc(id).remove();
            deleted.push(id);
          } catch (err) {
            failed.push({ id, error: err.message });
          }
        }
        
        return {
          success: true,
          message: `删除完成`,
          deleted: deleted,
          failed: failed
        };

      // 获取所有商品（用于确认要删除的ID）
      case 'getAllProducts':
        const allProducts = await db.collection('products').get();
        return {
          success: true,
          products: allProducts.data.map(p => ({
            id: p._id,
            name: p.name,
            status: p.status,
            merchantId: p.merchantId
          }))
        };

      // 初始化测试数据
      case 'initTestData':
        // 添加待审核商家
        await db.collection('merchants').add({
          data: {
            phone: '13900004444',
            password: '123456',
            merchantName: '潮流服饰',
            contactPerson: '赵六',
            mainProducts: '潮流服饰、时尚配饰',
            status: 'pending',
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
        
        // 添加未审核短袖商品
        await db.collection('products').add({
          data: {
            name: '纯棉短袖T恤男款',
            description: '2026年新款纯棉短袖，采用优质面料，透气舒适，适合夏季穿着。简约设计，百搭款式，多色可选。',
            price: 79,
            originalPrice: 159,
            image: '/images/product1.jpg',
            images: ['/images/product1.jpg', '/images/product2.jpg'],
            categoryId: 'category_001',
            stock: 500,
            sales: 0,
            rating: 5,
            specs: {
              colors: ['白色', '黑色', '蓝色', '灰色'],
              sizes: ['S', 'M', 'L', 'XL', 'XXL']
            },
            status: 0,
            merchantId: '97b16bdb69fde9ea018468c710a9a009',
            merchantName: '优品服饰',
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
        
        return {
          success: true,
          message: '测试数据初始化完成'
        };

      default:
        return {
          success: false,
          message: '未知操作: ' + action
        };
    }
  } catch (err) {
    console.error('操作失败:', err);
    return {
      success: false,
      message: '操作失败: ' + err.message,
      error: err
    };
  }
};
