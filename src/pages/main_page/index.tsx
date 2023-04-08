import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space, Modal } from "antd";
import { UserOutlined, BellOutlined, DownOutlined, PoweroffOutlined } from "@ant-design/icons";
import { logout, LoadSessionID } from "../../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../../utils/network";
import { useState, useEffect } from "react";
import CardUI from "../../components/CardUI";
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
    const assetmanager_applist = ["资产审批","资产定义","资产录入","资产变更","资产查询","资产清退","资产调拨","资产统计","资产告警"];
    const systemmanager_applist = ["用户列表","角色管理","部门管理","应用管理","操作日志","导入导出管理"];
    const supermanager_applist = ["业务实体管理","系统管理员列表"];
    const user_urllist = ["","","","",""];
    const assetmanager_urllist = ["","/asset/asset_define","","","","","","",""];
    const systemmanager_urllist = ["/user/system_manager","/user/system_manager","/user/system_manager/department","","",""];
    const supermanager_urllist = ["/user/super_manager","/user/super_manager"];
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/User/info/${LoadSessionID()}`,
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
    const user_apps = UserApp.split("").filter((item, index) => index >= 0 && index <= 4).map((char) => (char === "0" ? 0 : 1));
    const am_apps = UserApp.split("").filter((item, index) => index >= 5 && index <= 13).map((char) => (char === "0" ? 0 : 1));
    const sm_apps = UserApp.split("").filter((item, index) => index >= 14 && index <= 19).map((char) => (char === "0" ? 0 : 1));
    const superm_apps = UserApp.split("").filter((item, index) => index >= 20).map((char) => (char === "0" ? 0 : 1));
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
                        <div className="title">应用导航</div>
                        {UserAuthority == 0 && <Space size="large" wrap>{
                            supermanager_applist.map((name, index) => (
                                < CardUI 
                                    key={index} 
                                    state={superm_apps[index]} 
                                    appname={name} img={name+".jpg"}
                                    url={supermanager_urllist[index]}
                                />
                            ))
                        }</Space>}
                        {UserAuthority == 1 && <Space direction="vertical" size="middle" style={{ display: "flex" }}>{
                            <>
                                <Space size="large" wrap>{
                                    systemmanager_applist.filter((item, id) => id <= 2).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={sm_apps[index]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={systemmanager_urllist[index]}
                                        />
                                    ))
                                }</Space>
                                <Space size="large" wrap>{
                                    systemmanager_applist.filter((item, index) => 3 <= index).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={sm_apps[index+3]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={systemmanager_urllist[index+3]}
                                        />
                                    ))
                                }</Space>
                            </>
                        }</Space>}
                        {UserAuthority == 2 && <Space direction="vertical" size="middle" style={{ display: "flex" }}>{
                            <>
                                <Space size="large" wrap>{
                                    assetmanager_applist.filter((item, index) => index <= 2).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={am_apps[index]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={assetmanager_urllist[index]}
                                        />
                                    ))
                                }</Space>
                                <Space size="large" wrap>{
                                    assetmanager_applist.filter((item, index) => 3 <= index && index <= 5).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={am_apps[index+3]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={assetmanager_urllist[index+3]}
                                        />
                                    ))
                                }</Space>
                                <Space size="large" wrap>{
                                    assetmanager_applist.filter((item, index) => 6 <= index).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={am_apps[index+6]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={assetmanager_urllist[index+6]}
                                        />
                                    ))
                                }</Space>
                            </>
                        }</Space>}
                        {UserAuthority == 3 && <Space direction="vertical" size="middle" style={{ display: "flex" }}>{
                            <>
                                <Space size="large" wrap>{
                                    user_applist.filter((item, index) => index <= 2).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={user_apps[index]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={user_urllist[index]}
                                        />
                                    ))
                                }</Space>
                                <Space size="large" wrap>{
                                    user_applist.filter((item, index) => 3 <= index).map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={user_apps[index+3]} 
                                            appname={name} 
                                            img={name+".jpg"}
                                            url={user_urllist[index+3]}
                                        />
                                    ))
                                }</Space>
                            </>
                        }</Space>}
                    </div>
                </Content>
            </Layout>
        );
    }
};

export default App;
