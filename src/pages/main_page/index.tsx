import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space, Modal, MenuProps, Descriptions } from "antd";
import { UserOutlined, BellOutlined, DownOutlined, PoweroffOutlined } from "@ant-design/icons";
import { logout, LoadSessionID, IfCodeSessionWrong } from "../../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../../utils/network";
import { useState, useEffect } from "react";
import CardUI from "../../components/CardUI";
import { AppData } from "../../utils/types";
import { renderAuthority } from "../../utils/transformer";
import Sider from "antd/es/layout/Sider";
import SiderMenu from "../../components/SiderUI";
import UserInfo from "../../components/UserInfoUI";
const { Header, Content } = Layout;

const App = () => {
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => { router.push("/"); })
            .catch((err) => { router.push("/"); });
    };
    const router = useRouter();
    const query = router.query;
    const [AppList, setAppList] = useState<AppData[]>(); // 储存所有已有应用的信息 
    const [state, setState] = useState(false); // 用户是否处在登录状态
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const rolelist = ["超级管理员","系统管理员","资产管理员","员工"];
    const user_applist = ["资产查看","资产领用","资产退库","资产维保","资产转移"];
    const assetmanager_applist = ["资产审批","资产定义","资产录入","资产变更","资产查询","资产清退","资产调拨","资产统计","资产告警"];
    const systemmanager_applist = ["用户列表","角色管理","部门管理","应用管理","操作日志","导入导出"];
    const supermanager_applist = ["业务实体管理","系统管理员列表"];
    const systemmanager_urllist = ["/user/system_manager","/user/system_manager","/user/system_manager/department","/user/system_manager/application","",""];
    const supermanager_urllist = ["/user/super_manager","/user/super_manager"];
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const GetApp = (Authority: number) => {
        request(
            `/api/User/App/${LoadSessionID()}/${Authority}`,
            "GET"
        )
            .then((res) => {
                setAppList(res.AppList);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "获取应用信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });

    };
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
                if(res.Authority == 2 || res.Authority == 3) GetApp(res.Authority);
                setEntity(res.Entity);
                setDepartment(res.Department);
                setTODO(res.TODO);
                setTOREAD(res.TOREAD);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, state]);
    const DropdownMenu = (
        <Menu>
            {UserAuthority==2 && TODO && 
                <Menu.Item key="1" onClick={() => router.push("/user/asset_manager/apply_approval")}>
                    您有新的待办事项
                </Menu.Item>
            }
            {UserAuthority==2 && !TODO && 
                <Menu.Item key="2">
                    暂无新待办事项
                </Menu.Item>
            }
            {TOREAD && 
                <Menu.Item key="3" onClick={() => {if(UserAuthority == 3) router.push("/user/employee/message");else router.push("/user/asset_manager/message");}}>
                    您有新的消息
                </Menu.Item>
            }
            {!TOREAD && 
                <Menu.Item key="4" onClick={() => {if(UserAuthority == 3) router.push("/user/employee/message");else router.push("/user/asset_manager/message");}}>
                    暂无新消息
                </Menu.Item>
            }
        </Menu>
    );
    const sm_apps = UserApp.split("").filter((item, index) => index >= 14 && index <= 19).map((char) => (char === "0" ? 0 : 1));
    const superm_apps = UserApp.split("").filter((item, index) => index >= 20).map((char) => (char === "0" ? 0 : 1));
    const items: MenuProps["items"] = [
        {
            key: "1",
            label: (
                <Descriptions title={UserName} bordered>
                    <Descriptions.Item label="身份" span={2}>
                        <UserOutlined /> {renderAuthority(UserAuthority)}
                    </Descriptions.Item>
  
                    {UserAuthority !== 0 && (
                        <Descriptions.Item label="业务实体" span={2}>
                            {Entity}
                        </Descriptions.Item>
                    )}

                    {(UserAuthority === 2 || UserAuthority === 3) && (
                        <Descriptions.Item label="部门" span={2}>
                            {Department}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            ),
        },

    ];
    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className= "sidebar" width="10%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD}></UserInfo>
                    </Header>
                    <Content>
                        <div className="site-layout-content">
                            <div className="title">您的权限：{rolelist[UserAuthority]}</div>
                            <div className="title">应用导航:</div>
                            <div style={{margin:"40px"}}>
                                {UserAuthority == 0 && <Space size="large" wrap>{
                                    supermanager_applist.map((name, index) => (
                                        < CardUI 
                                            key={index} 
                                            state={superm_apps[index]} 
                                            appname={name} img={name+".jpg"}
                                            url={supermanager_urllist[index]}
                                            internal={true}
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
                                                    internal={true}
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
                                                    internal={true}
                                                />
                                            ))
                                        }</Space>
                                    </>
                                }</Space>}
                                {UserAuthority == 2 && <Space direction="vertical" size="middle" style={{ display: "flex" }}>{
                                    <>
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => item.IsInternal).filter((item, index) => index<3).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={true}
                                                />
                                            ))
                                        }</Space>}
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => item.IsInternal).filter((item, index) => index<6 && index>2).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={true}
                                                />
                                            ))
                                        }</Space>}
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => item.IsInternal).filter((item, index) => index>=6).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={true}
                                                />
                                            ))
                                        }</Space>}
                                    </>
                                }</Space>}
                                {UserAuthority == 3 && <Space direction="vertical" size="middle" style={{ display: "flex" }}>{
                                    <>
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => item.IsInternal).filter((item, index) => index<3).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={true}
                                                />
                                            ))
                                        }</Space>}
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => item.IsInternal).filter((item, index) => index<6 && index>2).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={true}
                                                />
                                            ))
                                        }</Space>}
                                    </>
                                }</Space>}
                                {AppList && AppList.filter((item) => !item.IsInternal).length>0 && <div className="title">外部应用</div>}
                                <Space direction="vertical" size="middle" style={{ display: "flex" }}>{
                                    <>
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => !item.IsInternal).filter((item, index) => index<3).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={false}
                                                />
                                            ))
                                        }</Space>}
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => !item.IsInternal).filter((item, index) => index<6 && index>2).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={false}
                                                />
                                            ))
                                        }</Space>}
                                        {AppList && <Space size="large" wrap>{
                                            AppList.filter((item) => !item.IsInternal).filter((item, index) => index>=6).map((app, index) => (
                                                < CardUI 
                                                    key={index} 
                                                    state={app.IsLock ? 0 : 1} 
                                                    appname={app.AppName} 
                                                    img={app.AppName+".jpg"}
                                                    url={app.AppUrl}
                                                    internal={false}
                                                />
                                            ))
                                        }</Space>}
                                    </>
                                }</Space>
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;
