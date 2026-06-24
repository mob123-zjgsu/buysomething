const cloud = require('wx-server-sdk');
cloud.init({ env: 'buysomething-6gbmbtpxff05be35' });
const db = cloud.database();

/**
 * 地址管理 API
 * 支持: list, add, update, delete, setDefault
 */
exports.main = async (event, context) => {
  const { action, addressId, name, phone, province, city, district, detail, tag, isDefault } = event;
  const userId = event.userId || 'test-user-001';

  try {
    switch (action) {
    case 'list':
      // 获取地址列表
      const result = await db.collection('addresses')
        .where({ userId })
        .orderBy('isDefault', 'desc')
        .orderBy('updateTime', 'desc')
        .get();
      return { code: 0, message: 'success', data: result.data };

    case 'add':
      // 添加地址
      if (!name || !phone || !province || !city || !district || !detail) {
        return { code: 1001, message: '地址信息不完整' };
      }
      const newAddress = {
        userId,
        name,
        phone,
        province,
        city,
        district,
        detail,
        tag: tag || '',
        isDefault: isDefault || false,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      };
      // 如果设置为默认，取消其他默认
      if (newAddress.isDefault) {
        await db.collection('addresses').where({ userId, isDefault: true }).update({ data: { isDefault: false } });
      }
      const addResult = await db.collection('addresses').add({ data: newAddress });
      return { code: 0, message: '添加成功', data: { addressId: addResult._id } };

    case 'update':
      // 更新地址
      if (!addressId) {
        return { code: 1001, message: '缺少地址ID' };
      }
      const updateData = { updateTime: db.serverDate() };
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (province !== undefined) updateData.province = province;
      if (city !== undefined) updateData.city = city;
      if (district !== undefined) updateData.district = district;
      if (detail !== undefined) updateData.detail = detail;
      if (tag !== undefined) updateData.tag = tag;
      if (isDefault !== undefined) {
        updateData.isDefault = isDefault;
        if (isDefault) {
          await db.collection('addresses').where({ userId, isDefault: true }).update({ data: { isDefault: false } });
        }
      }
      await db.collection('addresses').doc(addressId).update({ data: updateData });
      return { code: 0, message: '更新成功' };

    case 'delete':
      // 删除地址
      if (!addressId) {
        return { code: 1001, message: '缺少地址ID' };
      }
      await db.collection('addresses').doc(addressId).remove();
      return { code: 0, message: '删除成功' };

    case 'setDefault':
      // 设置默认地址
      if (!addressId) {
        return { code: 1001, message: '缺少地址ID' };
      }
      await db.collection('addresses').where({ userId, isDefault: true }).update({ data: { isDefault: false } });
      await db.collection('addresses').doc(addressId).update({ data: { isDefault: true, updateTime: db.serverDate() } });
      return { code: 0, message: '已设为默认地址' };

    default:
      return { code: 4001, message: '未知操作' };
    }
  } catch (err) {
    console.error('地址操作失败:', err);
    return { code: 5001, message: '操作失败', data: { error: err.message } };
  }
};
