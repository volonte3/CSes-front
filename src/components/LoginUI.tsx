import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Image } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import BackGround from "public/LoginBackground.png";
import { useRouter } from "next/router";
import cookie from "react-cookies";
import { request } from "../utils/network";

export const loginUser = () => {
    return cookie.load("userInfo");
};
interface LoginInit {
    initUserName: string,
    initPassword: string,
}
export interface LoginScreenProps {
    init?: LoginInit,
}


const LoginUI = (props: LoginScreenProps) => {
    const [UserName, setUserName] = useState<string>(props.init?.initUserName ?? "");
    const [Password, setPassword] = useState<string>(props.init?.initPassword ?? "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const loginUser = () => {
        return cookie.load("userInfo");
    };
    const loginSendMessage = () => {
        // Step 6 BEGIN

        request(
            "/api/User/login",
            "POST",
            {
                UserName: UserName,
                Password: Password,
            }
        );
        // .then(() => { alert(DELETE_USER_BOARD_SUCCESS); router.push("/list"); })
        // .catch((err) => { alert(FAILURE_PREFIX + err); setRefreshing(true); });
        // Step 6 END
    };
    const onFinish = (values: any) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log("Received values of form: ", values);
        }, 2000);
    };
    // 用户登录，保存cookie
    const onLogin = (user: any) => {
        cookie.save("userInfo", user, { path: "/" });
    };

    // 用户登出，删除cookie
    const logout = () => {
        cookie.remove("userInfo");
        window.location.href = "/";
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
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username"
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "密码不能为空!" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
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

                        <Form.Item >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} onClick={() => { onLogin("zhyggyyds"), loginSendMessage(); }}>
                                    登录
                                </Button>
                            </div>
                        </Form.Item>

                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginUI;