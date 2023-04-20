import React from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button } from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { logout, LoadSessionID } from "../../../../utils/CookieOperation";
import ApplyApprovalList from "../../../../components/ApplyApprovalListUI";
import UserInfo from "../../../../components/UserInfoUI";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const router = useRouter();
    const query = router.query;
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const SiderMenu = (
        <Menu theme="dark" defaultSelectedKeys={["5"]} mode="inline">
            <Menu.Item key="1">资产审批</Menu.Item>
            <Menu.Item key="2" onClick={() => router.push("/asset/asset_define")}>资产定义</Menu.Item>
            <Menu.Item key="3" onClick={() => router.push("/asset/asset_add")}>资产录入</Menu.Item>
            <Menu.Item key="4">资产变更</Menu.Item>
            <Menu.Item key="5" onClick={() => router.push("/user/asset_manager/asset_info")}>资产查询</Menu.Item>
            <Menu.Item key="6">资产清退</Menu.Item>
            <Menu.Item key="7">资产调拨</Menu.Item>
            <Menu.Item key="8">资产统计</Menu.Item>
            <Menu.Item key="9">资产告警</Menu.Item>
        </Menu>
    );
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setState(true);
                setUserName(res.UserName);
                setUserApp(res.UserApp);
                setUserAuthority(res.Authority);
                setEntity(res.Entity);
                setDepartment(res.Department);
            })
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
    if (state) {

        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    {SiderMenu}
                </Sider>
                <Layout className="site-layout" >
                    <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department}></UserInfo>
                    <Content style={{ margin: "0 16px" }}>

                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            <ApplyApprovalList />
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout>
        );
    }
};

export default App;