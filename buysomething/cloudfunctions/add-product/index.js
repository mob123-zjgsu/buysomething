const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

exports.main = async (event, context) => {
  const { name, price, description, image, stock, merchantId } = event;

  if (!name || !price) {
    return { code: 4001, message: '请填写商品名称和价格' };
  }

  try {
    const productData = {
      name,
      price: Number(price),
      description: description || '',
      image: image || '/images/product1.jpg',
      stock: stock || 0,
      merchantId: merchantId || '',
      status: 0, // 0=待审核, 1=已上架, -1=已拒绝
      sales: 0,
      rating: 5,
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    const result = await db.collection('products').add({ data: productData });
    return { code: 0, message: '商品已提交，等待审核', data: { productId: result._id } };
  } catch (err) {
    console.error('添加商品失败:', err);
    return { code: 5001, message: '添加失败，请稍后重试' };
  }
};