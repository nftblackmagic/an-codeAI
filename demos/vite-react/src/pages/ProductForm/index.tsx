import React from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

const ProductForm = () => {
  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form error:', errorInfo);
  };

  return (
    <Form
      name="productForm"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ remember: true }}
    >
      <Form.Item
        label="表单名称"
        name="formName"
        rules={[{ required: true, message: '请输入表单名称' }]}
      >
        <Input placeholder="请输入表单名称" />
      </Form.Item>

      <Form.Item
        label="表单详情"
        name="formDetails"
        rules={[{ required: true, message: '请输入表单详情' }]}
      >
        <TextArea rows={4} placeholder="请输入表单详情" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;