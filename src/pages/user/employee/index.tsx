import React from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button } from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { logout, LoadSessionID } from "../../../utils/CookieOperation";
import AssetList from "../../../components/AssetList";
import UserInfo from "../../../components/UserInfoUI";
import {IfCodeSessionWrong} from "../../../utils/CookieOperation";
import {AssetData} from "../../../utils/types";
const AssetTest: AssetData[] = [
    {
        Name: "张一的车",
        ID: "110",
        Status: 0,
        Owner: "张一",
        Description: "技术部有一个车牌，车牌是阿尔法国际象棋局面。牌质的生命周期",
        CreateTime: "2020-12-01T15:00:00.000Z" 	//YYYY-MM-DDThh:mm
    },
    {
        Name: "李四的书",
        ID: "111",
        Status: 1,
        Owner: "李四",
        Description: "李四有一本好书",
        CreateTime: "2023-12-01T15:00:00.000Z" 	//YYYY-MM-DDThh:mm
    },
];
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Asset, setAsset] = useState<AssetData[]>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const router = useRouter();
    const query = router.query;
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const SiderMenu = (
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <Menu.Item key="1" onClick={() => router.push("/user/system_manager")}>用户管理</Menu.Item>
            <Menu.Item key="2" onClick={() => router.push("/user/system_manager/department")}>部门管理</Menu.Item>
            <Menu.Item key="3">操作日志</Menu.Item>
            <Menu.Item key="4">导入导出管理</Menu.Item>
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
        // setState(true);
        if (state) {
            // request(`/api/User/member/${LoadSessionID()}`, "GET")
            //     .then((res) => {
            //         // const Member = JSON.parse(res.jsonString) as MemberData;
            //         setMember(res.member);
            //     })
            //     .catch((err) => {
            //         console.log(err.message);
            //         if (IfCodeSessionWrong(err, router)) {

            //             setState(false);
            //             Modal.error({
            //                 title: "无权获取用户列表",
            //                 content: "请重新登录",
            //                 onOk: () => { window.location.href = "/"; }
            //             });
            //         }
            //     });

        }
    }, [router, query, state]);
    if (state) {

        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    {SiderMenu}
                </Sider>
                <Layout className="site-layout" >
                    <Header style={{ padding: 16, background: colorBgContainer }} />
                    <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department}></UserInfo>
                    <Content style={{ margin: "0 16px" }}>
                        
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>

                            <AssetList
                                Assets={AssetTest}
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