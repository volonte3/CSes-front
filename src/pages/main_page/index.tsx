import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space, Modal, MenuProps, Descriptions } from "antd";
import { UserOutlined, BellOutlined, DownOutlined, PoweroffOutlined } from "@ant-design/icons";
import { logout, LoadSessionID, IfCodeSessionWrong, CreateCookie } from "../../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../../utils/network";
import { useState, useEffect } from "react";
import CardUI from "../../components/CardUI";
import { AppData } from "../../utils/types";
import { renderAuthority } from "../../utils/transformer";
import SiderMenu from "../../components/SiderUI";
import UserInfo from "../../components/UserInfoUI";
import cookie from "react-cookies";
const { Header, Content, Footer, Sider } = Layout;
import {
    ProFormRadio,
    ProFormSwitch,
    ProList,
} from "@ant-design/pro-components";

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
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const rolelist = ["超级管理员", "系统管理员", "资产管理员", "员工"];
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [ghost, setGhost] = useState<boolean>(false);
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
        console.log("query.code",query);
        console.log("cookie.load(\"SessionID\")",cookie.load("SessionID"));
        if (query.hasOwnProperty("code") && !cookie.load("SessionID")) { //飞书登录
            CreateCookie("SessionID");
            request("/api/User/feishu_login", "POST", {
                "code": query.code,
                "SessionID": LoadSessionID()
            })
                .then((res) => {
                    request(
                        `/api/User/info/${LoadSessionID()}`,
                        "GET"
                    )
                        .then((res) => {
                            setState(true);
                            setUserName(res.UserName);
                            setUserAuthority(res.Authority);
                            if (res.Authority == 2 || res.Authority == 3) GetApp(res.Authority);
                            else if (res.Authority == 0) {
                                let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "业务实体管理", AppUrl: "/user/super_manager" },
                                    { IsInternal: true, IsLock: false, AppName: "系统管理员列表", AppUrl: "/user/super_manager" }];
                                setAppList(userapp);
                            }
                            else if (res.Authority == 1) {
                                let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "用户列表", AppUrl: "/user/system_manager" },
                                    { IsInternal: true, IsLock: false, AppName: "角色管理", AppUrl: "/user/system_manager" },
                                    { IsInternal: true, IsLock: false, AppName: "部门管理", AppUrl: "/user/system_manager/department" },
                                    { IsInternal: true, IsLock: false, AppName: "应用管理", AppUrl: "/user/system_manager/application" },
                                    { IsInternal: true, IsLock: false, AppName: "操作日志", AppUrl: "/user/system_manager/log" }];
                                setAppList(userapp);
                            }
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
                })
                .catch((err) => {
                    setState(false);
                    cookie.remove("SessionID");
                    Modal.error({
                        title: "登录失败",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                });
        }
        else{   //正常登录，获取用户名和密码
            request(
                `/api/User/info/${LoadSessionID()}`,
                "GET"
            )
                .then((res) => {
                    setState(true);
                    setUserName(res.UserName);
                    setUserAuthority(res.Authority);
                    if (res.Authority == 2 || res.Authority == 3) GetApp(res.Authority);
                    else if (res.Authority == 0) {
                        let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "业务实体管理", AppUrl: "/user/super_manager" },
                            { IsInternal: true, IsLock: false, AppName: "系统管理员列表", AppUrl: "/user/super_manager" }];
                        setAppList(userapp);
                    }
                    else if (res.Authority == 1) {
                        let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "用户列表", AppUrl: "/user/system_manager" },
                            { IsInternal: true, IsLock: false, AppName: "角色管理", AppUrl: "/user/system_manager" },
                            { IsInternal: true, IsLock: false, AppName: "部门管理", AppUrl: "/user/system_manager/department" },
                            { IsInternal: true, IsLock: false, AppName: "应用管理", AppUrl: "/user/system_manager/application" },
                            { IsInternal: true, IsLock: false, AppName: "操作日志", AppUrl: "/user/system_manager/log" }];
                        setAppList(userapp);
                    }
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
        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, state]);

    const [modalopen, setModal] = useState(false);
    const handle_cancel = () => {
        setModal(false);
    };
    const data = AppList ? AppList.map((item) => ({
        content: (
            <div style={{ display: "flex" }} onClick={() => {
                if (item.IsLock) setModal(true);
                else if (item.IsInternal) router.push(item.AppUrl);
                else { window.location.href = item.AppUrl; }
            }}>
                {item.IsInternal &&
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="img_style_card" alt="" src={"/" + item.AppName + ".jpg"} />}
                {!item.IsInternal &&
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="img_style_card" alt="" src="/跳转.jpg" />}
                <div>
                    <h1 className="card__title">{item.AppName}</h1>
                    {!item.IsLock && <h1 className="card__description">点击前往</h1>}
                    {item.IsLock && <h1 className="card__description_ban">已禁用</h1>}
                </div>
            </div>
        ),
    })) : [];
    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className="sidebar" width="10%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD}></UserInfo>
                    </Header>
                    <Content>
                        <h1 className="main_page_headword">{"Welcome " + rolelist[UserAuthority] + "  " + UserName + "!"}</h1>
                        <h1 className="main_page_headword">应用导航</h1>
                        <ProList<any>
                            ghost={ghost}
                            itemCardProps={{
                                ghost,
                            }}
                            showActions="hover"
                            rowSelection={{}}
                            grid={{ gutter: 16, column: 3 }}
                            onItem={(record: AppData) => {
                                return {
                                    onMouseEnter: () => {
                                        console.log(record);
                                    },
                                    onClick: () => {
                                        // console.log(record);
                                        console.log(record.AppUrl);
                                    },
                                };
                            }}
                            metas={{
                                content: {},
                                // actions: {cardActionProps}
                            }}
                            dataSource={data}
                        />
                    </Content>
                </Layout>
                <Modal
                    title="抱歉，该功能已被您的管理员禁用"
                    centered
                    open={modalopen}
                    onCancel={handle_cancel}
                    footer={[
                        <Button key="ok" type="primary" onClick={handle_cancel}>
                            确定
                        </Button>,
                    ]}
                >
                    <p>请联系管理员申请解封</p>
                </Modal>
            </Layout>

        );
    }
};

export default App;
