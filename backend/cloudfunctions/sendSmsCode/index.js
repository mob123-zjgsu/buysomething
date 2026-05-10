const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { phone } = event;

  console.log('发送验证码请求:', phone);

  try {
    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return {
        success: false,
        message: '手机号格式不正确'
      };
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 将验证码存储到数据库(实际应该用Redis)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期
    
    // 检查是否有未过期的验证码
    const existingCode = await db.collection('sms_codes')
      .where({
        phone: phone,
        expiresAt: db.command.gt(new Date())
      })
      .get();

    if (existingCode.data.length > 0) {
      return {
        success: false,
        message: '验证码已发送,请稍后再试'
      };
    }

    // 存储验证码
    await db.collection('sms_codes').add({
      data: {
        phone: phone,
        code: code,
        expiresAt: expiresAt,
        createTime: db.serverDate()
      }
    });

    // 调用腾讯云短信服务发送验证码
    // 注意: 这里需要配置腾讯云短信服务
    // 暂时返回固定验证码用于测试
    console.log('验证码:', code);
    
    // 实际发送短信的代码示例(需要先开通短信服务):
    /*
    const tencentcloud = require("tencentcloud-sdk-nodejs")
    const SmsClient = tencentcloud.sms.v20210111.Client
    
    const clientConfig = {
      credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
      },
      region: "ap-guangzhou",
      profile: {
        httpProfile: {
          endpoint: "sms.tencentcloudapi.com",
        },
      },
    }
    
    const client = new SmsClient(clientConfig)
    const params = {
      PhoneNumberSet: [`+86${phone}`],
      TemplateId: "你的短信模板ID",
      TemplateParamSet: [code],
      SmsSdkAppId: "你的短信应用ID"
    }
    
    await client.SendSms(params)
    */

    return {
      success: true,
      message: '验证码已发送',
      code: code // 测试时返回验证码,生产环境应该去掉
    };

  } catch (err) {
    console.error('发送验证码失败:', err);
    return {
      success: false,
      message: '发送失败,请稍后重试'
    };
  }
};
