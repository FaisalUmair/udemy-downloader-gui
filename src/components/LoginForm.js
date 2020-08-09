import React from 'react';

import { Row, Form, Input, Checkbox, Button } from 'antd';

function LoginForm(props) {
    return (
        <Row className="items-center justify-center w-full">
            <Form
                name="basic"
                className="w-3/5"
                form={props.form}
                onFinish={props.onSubmit}
            >
                <Form.Item name="isBusiness" valuePropName="checked" className="p-1 rounded bg-gray-100 border border-gray-500 text-center">
                    <Checkbox onChange={(event) => {
                        props.form.setFieldsValue({ isBusiness: event.target.checked })
                    }}>Udemy Business</Checkbox>
                </Form.Item>

                <Form.Item noStyle shouldUpdate>
                    {
                        () =>
                            props.form.getFieldValue("isBusiness") ?
                                <Form.Item
                                    name="businessName"
                                    rules={[
                                        {
                                            required: true,
                                            message: " "
                                        }
                                    ]}
                                >
                                    <Input className="p-2 pl-4 rounded" placeholder="Udemy Business Name" />
                                </Form.Item>
                                : null

                    }
                </Form.Item>

                <Form.Item>
                    <Button type="primary" shape="round" className="h-10 tracking-wide" htmlType="submit" block>
                        Login Using Credentials
                    </Button>
                </Form.Item>

            </Form>
        </Row>
    )
}

export default LoginForm;