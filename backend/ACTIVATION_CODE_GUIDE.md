# 激活码系统使用指南

## 概述

本系统使用激活码来控制用户使用次数。用户购买后，管理员生成激活码并通过邮件发送给用户。

## 套餐类型

### 基础套餐 ($3)
- 使用次数：20次
- 激活码类型：`basic`
- 特点：经济实惠，适合偶尔使用

### 专业套餐 ($15)
- 使用次数：无限次
- 激活码类型：`pro`
- 特点：不限次数，永久有效

## 激活码管理

### 1. 生成新激活码

**生成基础套餐激活码（20次）：**
```bash
cd backend
python generate_code.py create basic
```

**生成专业套餐激活码（无限次）：**
```bash
python generate_code.py create pro
```

**生成自定义激活码：**
```bash
python generate_code.py create basic MY-CUSTOM-CODE-2024
python generate_code.py create pro PREMIUM-USER-001
```

**生成带备注的激活码：**
```bash
python generate_code.py create pro SPECIAL-2024 "给VIP客户的专属激活码"
```

### 2. 查看所有激活码

```bash
python generate_code.py list
```

输出示例：
```
📋 激活码列表 (共 3 个):

激活码                类型        剩余次数      备注                          
--------------------------------------------------------------------------------
DEMO-TEST-2024      unlimited   无限          演示用无限次激活码
BASIC-20-SAMPLE     basic       20            基础套餐示例 - 20次使用
ABCD-1234-EFGH-5678 pro         无限          专业套餐 - 无限次使用
```

### 3. 删除激活码

```bash
python generate_code.py delete ABCD-1234-EFGH-5678
```

## 购买流程

1. **用户购买**
   - 用户在网站选择套餐
   - 点击"立即购买"跳转到PayPal付款
   - 完成付款

2. **管理员处理**
   - 收到PayPal付款通知
   - 运行脚本生成对应类型的激活码
   - 通过邮件将激活码发送给用户

3. **用户激活**
   - 用户在网站输入激活码
   - 系统验证激活码有效性
   - 开始使用服务

## 激活码格式

- **自动生成格式**：`XXXX-XXXX-XXXX-XXXX`（16位，大写字母+数字）
- **自定义格式**：任意字符串（建议使用有意义的命名）

## 数据存储

激活码数据存储在 `activation_codes.json` 文件中，格式如下：

```json
{
  "ABCD-1234-EFGH-5678": {
    "type": "pro",
    "remaining_uses": -1,
    "created_date": "2024-01-01T00:00:00",
    "expire_date": null,
    "last_used": "2024-01-15T10:30:00",
    "note": "专业套餐 - 无限次使用"
  },
  "TEST-BASIC-CODE": {
    "type": "basic",
    "remaining_uses": 15,
    "created_date": "2024-01-01T00:00:00",
    "expire_date": null,
    "last_used": "2024-01-10T14:20:00",
    "note": "基础套餐 - 20次使用"
  }
}
```

## 字段说明

- `type`: 套餐类型（`basic` 或 `pro`）
- `remaining_uses`: 剩余使用次数（`-1` 表示无限次）
- `created_date`: 创建时间
- `expire_date`: 过期时间（`null` 表示永不过期）
- `last_used`: 最后使用时间
- `note`: 备注信息

## 测试激活码

系统预置了两个测试激活码：

1. **无限次测试码**
   - 激活码：`DEMO-TEST-2024`
   - 类型：无限次
   - 用途：演示和测试

2. **基础套餐测试码**
   - 激活码：`BASIC-20-SAMPLE`
   - 类型：20次使用
   - 用途：测试基础套餐功能

## 邮件模板

### 基础套餐邮件模板

```
主题：Text2Contract 激活码 - 基础套餐

您好，

感谢您购买 Text2Contract 基础套餐！

您的激活码：XXXX-XXXX-XXXX-XXXX
套餐类型：基础套餐
使用次数：20次

使用方法：
1. 访问 https://your-domain.com
2. 在生成合同页面输入激活码
3. 输入合同信息并点击"生成合同PDF"

注意事项：
- 请妥善保管激活码
- 每次生成合同将消耗1次使用次数
- 激活码永久有效

如有问题，请联系：hrzblog@gmail.com

祝使用愉快！
Text2Contract 团队
```

### 专业套餐邮件模板

```
主题：Text2Contract 激活码 - 专业套餐

您好，

感谢您购买 Text2Contract 专业套餐！

您的激活码：XXXX-XXXX-XXXX-XXXX
套餐类型：专业套餐
使用次数：无限次

使用方法：
1. 访问 https://your-domain.com
2. 在生成合同页面输入激活码
3. 输入合同信息并点击"生成合同PDF"

专业套餐特权：
✓ 不限次数使用
✓ 永久有效
✓ 优先技术支持
✓ 未来新功能优先体验

如有问题，请联系：hrzblog@gmail.com

祝使用愉快！
Text2Contract 团队
```

## 注意事项

1. **备份数据**：定期备份 `activation_codes.json` 文件
2. **安全性**：不要将激活码数据文件公开
3. **监控使用**：定期查看激活码使用情况
4. **及时发货**：收到付款后及时生成并发送激活码

## 常见问题

**Q: 如何批量生成激活码？**
A: 可以编写简单的bash脚本循环调用生成命令。

**Q: 激活码可以重复使用吗？**
A: 基础套餐激活码在用完20次后无法继续使用；专业套餐可以无限次使用。

**Q: 如何设置激活码过期时间？**
A: 目前不支持过期时间，所有激活码永久有效。如需此功能可在代码中添加。

**Q: 激活码被盗用怎么办？**
A: 可以使用 `delete` 命令删除被盗用的激活码，然后为用户生成新的。

