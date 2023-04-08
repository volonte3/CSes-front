import React from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined, CheckOutlined, CloseOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button } from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { logout, LoadSessionID } from "../../../utils/CookieOperation";
import { renderAuthority } from "../../../utils/transformer";
import MemberList from "../../../components/MemberList";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem("用户管理", "1", <FileOutlined />),
    getItem("部门管理", "2", <FileOutlined />),
    getItem("操作日志", "3", <FileOutlined />),
    getItem("导入导出管理", "4", <FileOutlined />),
];
interface DataType {
    key: React.Key;
    Name: string;
    Department: string;
    Authority: string[];
}
interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
const MemberTest: MemberData[] = [
    {
        Name: "张一",
        Department: "技术部",
        Authority: 2,
        lock: false,
    },
    {
        Name: "张二",
        Department: "运维部",
        Authority: 3,
        lock: true,
    },
];
const data: DataType[] = [
    {
        key: "1",
        Name: "John",
        Department: "部门0.0",
        Authority: ["老大", "老二"],
    },
    {
        key: "2",
        Name: "Jim",
        Department: "部门0.0",
        Authority: ["老三"],
    },
    {
        key: "3",
        Name: "Joe",
        Department: "部门0.0",
        Authority: ["老四", "老五"],
    },
];
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Member, setMember] = useState<MemberData[]>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const router = useRouter();
    const query = router.query;
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // request(
        //     `/api/User/info/${LoadSessionID()}`,
        //     "GET"
        // )
        //     .then((res) => {
        //         setState(true);
        //         setUserName(res.UserName);
        //         setUserApp(res.UserApp);
        //         setUserAuthority(res.Authority);
        //     })
        //     .catch((err) => {
        //         console.log(err.message);
        //         setState(false);
        //         Modal.error({
        //             title: "登录失败",
        //             content: "请重新登录",
        //             onOk: () => { window.location.href = "/"; }
        //         });
        //     });
        setState(true);
        if(state){
            request(`/api/User/member/${LoadSessionID()}`, "GET")
                .then((res) => {
                    // const Member = JSON.parse(res.jsonString) as MemberData;
                    setMember(res);
                })
                .catch((err) => {
                    console.log(err.message);
                    setState(false);
                    Modal.error({
                        title: "无权获取用户列表",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                });
        }
    }, [router, query, state]);
    if (state) {

        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items} />
                </Sider>
                <Layout className="site-layout" >
                    <Header style={{ padding: 0, background: colorBgContainer }} />
                    <Content style={{ margin: "0 16px" }}>
                        <Breadcrumb style={{ margin: "16px 0" }}>
                            <Breadcrumb.Item>用户管理</Breadcrumb.Item>
                            {/* <Breadcrumb.Item>Bill</Breadcrumb.Item> */}
                        </Breadcrumb>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            
                            <MemberList
                                Members={Member}
                                department_page={false}
                            />
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout>
        );
    }
};

export default App;