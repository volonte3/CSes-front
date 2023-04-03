import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space, Modal } from "antd";
import {AssetQueryCard,GetAssetCard, AssetReturnCard, AssetDefineCard} from "../../components/UserPageUI/AssetManageUI";
import {DepartmentTreeCard, RoleControlCard} from "../../components/UserPageUI/UserManageUI";
import { UserOutlined, BellOutlined, DownOutlined, PoweroffOutlined } from "@ant-design/icons";
import { logout, LoadSessionID } from "../../utils/CookieOperation";
import { useRouter } from "next/router";
import cookie from "react-cookies";
import { request } from "../../utils/network";
import { useState, useEffect } from "react";
const { Header, Content } = Layout;

const DropdownMenu = (
    <Menu>
        <Menu.Item key="1">待办事项</Menu.Item>
        <Menu.Item key="2">已完成事项</Menu.Item>
    </Menu>
);

const App = () => {
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => { router.push("/"); });
        // .catch((err) => { alert(FAILURE_PREFIX + err); setRefreshing(true); });
    };
    const router = useRouter();
    const query = router.query;
    const [state, setState] = useState(false);
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then(()=>setState(true))
            .catch((err) => {
                console.log(err.message);
                setState(false);
                Modal.error({
                    title: "登录失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [router, query, state]);
    // if (typeof document !== "undefined" && !document.cookie) { window.location.href = "/"; }
    if (state) {
        return (
            <Layout style={{
                display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
                backgroundImage: "url(\"LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
            }}>
                <Header style = {{background : "transparent"}}>
                    <div className="logo">CSCompany资产管理系统</div>
                    <div className="right-menu">
                        <Button type = "text" className="header_button" color="#fff" icon={<UserOutlined /> }>个人信息</Button>
                        <Dropdown overlay={DropdownMenu} trigger={["click"]}>
                            <Button type = "text" className="header_button" icon={<BellOutlined />}>待办事项<DownOutlined /></Button>
                        </Dropdown>
                        <Button type = "text" className="header_button" icon={<PoweroffOutlined />} onClick={() => { logoutSendMessage();logout(); }}>退出登录</Button>
                    </div>
                </Header>
                <Content>
                    <div className="site-layout-content">
                        <div className="title">资产管理</div>
                        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
                            <Space size="large" wrap>
                                <AssetQueryCard/>
                                <AssetReturnCard/>
                                <GetAssetCard/>
                            </Space>
                            <Space size="large" wrap>
                                <AssetDefineCard/>
                                <AssetReturnCard/>
                                <GetAssetCard/>
                            </Space>
                        </Space>
                        <div className="title">用户管理</div>
                        <Space size='large'>
                            <DepartmentTreeCard/>
                            <RoleControlCard/>
                        </Space>
                    </div>
                </Content>
            </Layout>
        );
    }
};

export default App;
