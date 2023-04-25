import React from "react";
import {
    FileOutlined, PlusSquareOutlined, LogoutOutlined, UserOutlined, DownOutlined, SmileOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Space, Table, Modal, Button, Input, Form, Drawer, Avatar, Dropdown, Row } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { LoadSessionID, logout, IfCodeSessionWrong } from "../../../utils/CookieOperation";
import UserInfo from "../../../components/UserInfoUI";
import SiderMenu from "../../../components/SiderUI";


type MenuItem = Required<MenuProps>["items"][number];
type SystemData = {
    Entity: string;
    Manager: string;
};
// const DataTest: SystemData[] = [
//     {
//         Entity: "大象金融",
//         Manager: "张三",
//     },
//     {
//         Entity: "小明搜题",
//         Manager: "李四",
//     },
// ];
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
const items_: MenuItem[] = [
    getItem("管理列表", "1", <FileOutlined />),
];


const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [open, setOpen] = useState(false);    //右侧注册新实体边栏是否开启
    const [EntityValue, setEntityValue] = useState(""); //注册新实体名
    const [UserValue, setUserValue] = useState(""); //注册新系统管理员名
    const [System, setSystem] = useState<SystemData[]>(); // 存储所有系统管理员和其对应业务实体的信息
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const router = useRouter();
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const items: MenuProps["items"] = [
        {
            key: "2",
            label: (
                <Button
                    type="link"
                    icon={<LogoutOutlined />}
                    style={{ float: "right", margin: 10 }}
                    danger
                    onClick={() => { logoutSendMessage(); logout(); }}
                >
                    退出登录
                </Button>
            ),
            // icon: <SmileOutlined />,
            // disabled: true,
        },
    ];
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => { router.push("/"); })
            .catch((err) => { router.push("/"); });
    };
    const handleEntityInputChange = (e: any) => {
        setEntityValue(e.target.value);
    };
    const handleUserInputChange = (e: any) => {
        setUserValue(e.target.value);
    };
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    const onFinish = (values: any) => {
        console.log("Success:", values);
    };

    // 向后端发送创建用户和实体的请求，如果创建成功提示成功并关闭抽屉，否则向用户提示错误信息
    const CreateNew = (UserName: string, EntityName: string) => {
        request(
            "/api/SuperUser/Create",
            "PUT",
            {
                "SessionID": LoadSessionID(),
                "UserName": UserName,
                "EntityName": EntityName
            }
        )
            .then((res) => {
                let answer: string = `成功创建业务实体 ${EntityName} 并委派系统管理员 ${UserName}, 初始密码为 yiqunchusheng`;
                Modal.success({ title: "创建成功", content: answer, afterClose: () => { window.location.reload(); } });
                onClose();
            })
            .catch((err: any) => {
                console.log(err.type);
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "创建失败",
                        content: err.message.toString().substring(5),
                    });
                }
            });

    };
    //像后端发送删除用户和实体的请求，如果删除成功提示成功并关闭抽屉，否则向用户提示错误信息        const Delete = (UserName:string,
    const Remove = (UserName: string, EntityName: string) => {
        request(
            `/api/SuperUser/Delete/${LoadSessionID()}/${EntityName}`,
            "DELETE"
        )
            .then((res) => {
                let answer: string = `成功注销业务实体 ${EntityName} 及系统管理员 ${UserName}`;
                Modal.success({ title: "注销成功", content: answer, afterClose: () => { window.location.reload(); } });
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {

                    Modal.error({
                        title: "注销失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };
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
                if(res.Authority != 0 ){
                    Modal.error({
                        title: "无权访问",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
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
        if (state) {

            request(
                `/api/SuperUser/info/${LoadSessionID()}`,
                "GET"
            )
                .then((res) => {
                    setState(true);
                    setSystem(res.entity_manager);
                })
                .catch((err) => {
                    console.log(err.message);
                    setState(false);
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "无权获取系统管理员及实体信息",
                            content: "请重新登录",
                            onOk: () => { window.location.href = "/"; }
                        });
                    }
                });
        }

    }, [state, router]);
    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD}></UserInfo>
                    <Content style={{ margin: "0 16px" }}>
                        <Button
                            type="primary"
                            icon={<PlusSquareOutlined />}
                            style={{ float: "left", margin: 10 }}
                            onClick={showDrawer}
                        // loading={loadings[1]}
                        // onClick={() => enterLoading(1)}
                        >
                            添加业务实体
                        </Button>
                        <Drawer title="添加业务实体" placement="right" onClose={onClose} open={open}>
                            <Form
                                name="basic"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label="业务实体名"
                                    name="Entity"
                                    rules={[{ required: true, message: "请输入业务实体名" }]}
                                >
                                    <Input onChange={handleEntityInputChange} />
                                </Form.Item>

                                <Form.Item
                                    label="系统管理员"
                                    name="Manager"
                                    rules={[{ required: true, message: "请输入资产管理员用户名" }]}
                                >
                                    <Input onChange={handleUserInputChange} />
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit" onClick={() => { if (UserValue && EntityValue) { CreateNew(UserValue, EntityValue); } }}>
                                        确认提交
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Drawer>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>

                            <Table dataSource={System}>
                                <Column title="业务实体" dataIndex="Entity" key="Entity" />
                                <Column title="系统管理员" dataIndex="Manager" key="Manager" />
                                <Column
                                    title="管理"
                                    key="action"
                                    render={(_: any, record: SystemData) => (
                                        <Space size="middle">
                                            <Button danger onClick={() => Remove(record.Manager, record.Entity)}>移除</Button>
                                        </Space>
                                    )}
                                />
                            </Table>

                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout >
        );
    };
};

export default App;