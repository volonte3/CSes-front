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

    const [state, setState] = useState(false); // 用户是否处在登录状态
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const rolelist = ["超级管理员","系统管理员","资产管理员","员工"];
    const user_applist = ["资产查看","资产领用","资产退库","资产维保","资产转移"];
    const assetmanager_applist = ["资产审批","资产定义","资产录入","资产信息变更","资产查询","资产清退","资产调拨","资产统计","资产告警"];
    const systemanager_applist = ["用户列表","角色权限管理","部门管理","应用管理","操作日志","导入导出管理"];
    const supermanager_applist = ["业务实体管理","系统管理员列表"];
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res)=>{
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
                        <Button type = "text" className="header_button" color="#fff" icon={<UserOutlined /> }>{UserName}</Button>
                        <Dropdown overlay={DropdownMenu} trigger={["click"]}>
                            <Button type = "text" className="header_button" icon={<BellOutlined />}>待办事项<DownOutlined /></Button>
                        </Dropdown>
                        <Button type = "text" className="header_button" icon={<PoweroffOutlined />} onClick={() => { logoutSendMessage();logout(); }}>退出登录</Button>
                    </div>
                </Header>
                <Content>
                    <div className="site-layout-content">
                        <div className="title">您的权限：{rolelist[UserAuthority]}</div>
                        
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
                            <DepartmentTreeCard state = {UserApp[0]} name = "部门管理"/>
                            <RoleControlCard/>
                        </Space> 
                    </div>
                </Content>
            </Layout>
        );
    }
};

export default App;
