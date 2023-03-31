import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space } from "antd";
import AssetQueryCard from "../../components/UserPageUI/AssetQueryUI";
import UserManageCard from "../../components/UserPageUI/UserManageUI";
import GetAssetCard from "../../components/UserPageUI/GetAssetUI";
import { logout,LoadSessionID } from "../../utils/CookieOperation";
import { useRouter } from "next/router";
import cookie from "react-cookies";
import { request } from "../../utils/network";
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
    return (
        <Layout style={{
            display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
            backgroundImage: "url(\"LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
        }}>
            <Header style={{ background: "transparent", display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                <Button>用户姓名</Button>
                <Dropdown overlay={DropdownMenu}>
                    <Button>待办事项</Button>
                </Dropdown>
                <Button onClick={() => { logoutSendMessage(); logout(); }}>登出</Button>
            </Header>
            <Content style={{ padding: "50px" }}>
                <Space size='large'>
                    <AssetQueryCard />
                    <UserManageCard />
                    <GetAssetCard />
                </Space>
            </Content>
        </Layout>

    );
};

export default App;
