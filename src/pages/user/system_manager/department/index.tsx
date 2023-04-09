import React from "react";
import {
    FileOutlined, PlusSquareOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Space, Table, Modal, Button, Input, Form, Drawer } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import MenuItem from "antd/es/menu/MenuItem";
import MemberList from "../../../../components/MemberList";
import DepartmentUI from "../../../../components/DepartmentControlUI";
interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
interface DepartmentData {
    DepartmentName: string;
    DepartmentId: string;
}


const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [DepartmentPath, setDepartmentPath] = useState("000000000");
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
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
                setUserApp(res.UserApp);
                setUserAuthority(res.Authority);
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
        <Menu theme="dark" defaultSelectedKeys={["2"]} mode="inline">
            <Menu.Item key="1" onClick={() => router.push("/user/system_manager")}>用户管理</Menu.Item>
            <Menu.Item key="2" onClick={() => router.push("/user/system_manager/department")}>部门管理</Menu.Item>
            <Menu.Item key="3">操作日志</Menu.Item>
            <Menu.Item key="4">导入导出管理</Menu.Item>
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
                    <DepartmentUI DepartmentPath={DepartmentPath}/>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout >
        );
    };
};

export default App;