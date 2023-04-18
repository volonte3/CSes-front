import React from "react";
import {
    FileOutlined, PlusSquareOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Modal, Button, Breadcrumb, Row, Col } from "antd";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { LoadSessionID } from "../../../utils/CookieOperation";
import AssetAddUI from "../../../components/AssetAddUI";
import  UserInfo  from "../../../components/UserInfoUI";

interface DepartmentData {
    DepartmentName: string;
    DepartmentId: string;
}

const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const router = useRouter();
    const {
        token: { colorBgContainer },
    } = theme.useToken();
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
    }, [state, router]);
    const SiderMenu = (
        <Menu theme="dark" defaultSelectedKeys={["3"]} mode="inline">
            <Menu.Item key="1">资产审批</Menu.Item>
            <Menu.Item key="2" onClick={() => router.push("/asset/asset_define")}>资产定义</Menu.Item>
            <Menu.Item key="3" onClick={() => router.push("/asset/asset_add")}>资产录入</Menu.Item>
            <Menu.Item key="4">资产变更</Menu.Item>
            <Menu.Item key="5">资产查询</Menu.Item>
            <Menu.Item key="6">资产清退</Menu.Item>
            <Menu.Item key="7">资产调拨</Menu.Item>
            <Menu.Item key="8">资产统计</Menu.Item>
            <Menu.Item key="9">资产告警</Menu.Item>
        </Menu>
    );
    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    {SiderMenu}
                </Sider>
                <Layout className="site-layout" >
                    <Header style={{ padding: 0, background: colorBgContainer }} />
                    <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department}></UserInfo>
                    <Content style={{ margin: "0 16px" }}>
                        <Breadcrumb style={{ margin: "16px 0" }}>
                            <Breadcrumb.Item>资产录入</Breadcrumb.Item>
                        </Breadcrumb>
                        <Row gutter={[8,6]}>
                            <Col>
                                <AssetAddUI/>
                            </Col>
                        </Row>
                        <Row align="top">
                            
                        </Row>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout >
        );
    };
};

export default App;