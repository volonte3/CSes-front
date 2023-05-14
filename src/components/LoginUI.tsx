import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Image, Modal } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { LoadSessionID,CreateCookie } from "../utils/CookieOperation";
import { request } from "../utils/network";
import CryptoJS from "crypto-js";

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
    const loginSendMessage = () => {
        setLoading(true);
        request(
            "/api/User/login",
            "POST",
            {
                UserName: UserName,
                SessionID: LoadSessionID(),
                Password: CryptoJS.MD5(Password).toString(),
            }
        )
            .then(() => {router.push("/main_page"); setLoading(false);})
            // .catch((err) => alert(FAILURE_PREFIX + err));
            .catch((err) => ErrorInfo(err));
    };
    const onFinish = (values: any) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log("Received values of form: ", values);
        }, 2000);
    };

    const ErrorInfo = (errinfo:string) => {
        Modal.error({
            title: "登录失败",
            content: errinfo.toString().substring(5),
        });
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
                        <Form.Item >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} 
                                    onClick={() => {CreateCookie("SessionID");loginSendMessage();}}>
                                    登录
                                </Button>
                                <Button type="link" htmlType="submit" className="login-form-button" loading={loading} 
                                    onClick={() => {router.push("https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=cli_a4d587450378500e&redirect_uri=http%3A%2F%2Fcs-company-frontend-debug-cses.app.secoder.net%2Fmain_page&response_type=code&state=STATE");}}>
                                    使用飞书登录
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