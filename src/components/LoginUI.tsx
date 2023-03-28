import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Image } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import BackGround from "public/LoginBackground.png";
import { useRouter } from "next/router";

const LoginUI = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const onFinish = (values: any) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log("Received values of form: ", values);
        }, 2000);
    };

    return (
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
            backgroundImage: "url(\"LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
        }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h1 style={{ marginBottom: 24 }}>企业资产管理系统</h1>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: 300 }}>

                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        style={{ width: 300 }}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: "用户名不能为空!" }]}
                        >
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "密码不能为空!" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                            />
                        </Form.Item>
                        {/* <img
              width={200}
              src="LoginBackground.png"
            ></img> */}
                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>

                            {/* <a href="/" style={{ float: "right" }}>
                Forgot password
                            </a> */}
                        </Form.Item>

                        {/* <Form.Item >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button type="disabled" htmlType="submit" className="login-form-button" loading={loading} >
                                    登录
                                </Button> */}
                                {/* Or <a href="/">register now!</a> */}
                            {/* </div>
                        </Form.Item> */}

                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginUI;