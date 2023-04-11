import React from "react";
import { Layout, Menu, Breadcrumb, Card } from "antd";
import { Form, Input, Button, Checkbox, Image } from "antd";
import cookie from "react-cookies";
import { useRouter } from "next/router";
import { request } from "../../utils/network";

const { Header, Content, Footer } = Layout;

function App() {
    // 用户登出，删除cookie
    const logout = () => {
        cookie.remove("SessionID");
        // window.location.href = "/";
    };
    const logoutSendMessage = () => {
        // Step 6 BEGIN

        request(
            "/api/User/logout",
            "POST"
        )
            .then(() => { router.push("/"); })
            .catch((err) => { router.push("/"); });
        // Step 6 END
    };
    const router = useRouter();
    return (
        <div>
            <Form.Item >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={() => { logoutSendMessage();logout(); }}>
                        登出
                    </Button>
                </div>
            </Form.Item>
        </div>
    );
}

export default App;