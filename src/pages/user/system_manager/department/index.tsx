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

type MenuItem = Required<MenuProps>["items"][number];
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
    const [open1, setOpen1] = useState(false);    //添加部门侧边栏的显示
    const [open2, setOpen2] = useState(false);    //创建员工侧边栏的显示
    const [DepartmentName, setDepartmentName] = useState(""); //注册新实体名
    const [UserValue, setUserValue] = useState(""); //注册新系统管理员名
    const [IsLeafDepartment, setLeafDepartment] = useState(false);
    const [DepartmentList, setDepartmentList] = useState<DepartmentData[]>(); // 存储当前部门下所有部门的信息 
    const [DepartmentMemberList, setMemberList] = useState<MemberData[]>(); // 存储叶子部门下所有用户的信息
    const [DepartmentPath, setDepartmentPath] = useState("000000000");
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const router = useRouter();
    const handleDepartmentAdd = (e: any) => {
        setDepartmentName(e.target.value);
    };
    const handleUserInputChange = (e: any) => {
        setUserValue(e.target.value);
    };
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const showDrawer1 = () => {
        setOpen1(true);
    };

    const onClose1 = () => {
        setOpen1(false);
    };
    const showDrawer2 = () => {
        setOpen2(true);
    };

    const onClose2 = () => {
        setOpen2(false);
    };
    const onFinish = (values: any) => {
        console.log("Success:", values);
    };
    // 向后端发送创建用户和实体的请求，如果创建成功提示成功并关闭抽屉，否则向用户提示错误信息
    const CreateNew = (DepartmentPath: string, DepartmentName: string) => {
        request(
            "/api/User/department/add",
            "POST",
            {
                "SessionID": LoadSessionID(),
                "DepartmentPath": DepartmentPath,
                "DepartmentName": DepartmentName
            }
        )
            .then((res) => {
                let answer: string = `成功创建部门 ${DepartmentName}`;
                Modal.success({ title: "创建成功", content: answer });
                onClose1();
            })
            .catch((err: string) => {
                Modal.error({
                    title: "创建失败",
                    content: err.toString().substring(5),
                });
            });
    };
    //像后端发送删除用户和实体的请求，如果删除成功提示成功并关闭抽屉，否则向用户提示错误信息
    const Remove = (DepartmentPath: string, DepartmentName: string) => {
        request(
            `/api/User/department/delete/${LoadSessionID()}/${DepartmentPath}`,
            "DELETE"
        )
            .then((res) => {
                let answer: string = `成功删除部门 ${DepartmentName}`;
                Modal.success({ title: "删除成功", content: answer });
            })
            .catch((err) => {
                if (err.code == 1) {
                    Modal.error({
                        title: "删除失败",
                        content: "该部门不存在或部门路径无效"
                    });
                }
                if (err.code == 2) {
                    Modal.error({
                        title: "删除失败",
                        content: "该部门有子部门或员工，请先删除子部门或部门员工"
                    });
                }
                if (err.code == 3) {
                    Modal.error({
                        title: "删除失败",
                        content: "无权限删除"
                    });
                }
                if (err.code == 4) {
                    Modal.error({
                        title: "删除失败",
                        content: "身份无效"
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
                `/api/User/member/${LoadSessionID()}/000000000`,
                "GET"
            )
                .then((res) => {
                    setState(true);
                    setLeafDepartment(res.is_leaf);
                    if (res.has_member == true) {
                        setMemberList(res.member);
                    }
                    else {
                        setDepartmentList(res.department);
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                    setState(false);
                    Modal.error({
                        title: "无权获取对应部门信息",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                });
        }

    }, [state, router]);
    const SiderMenu = (
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <Menu.Item key="1" onClick={() => router.push("/user/system_manager")}>用户管理</Menu.Item>
            <Menu.Item key="2" onClick={() => router.push("/user/system_manager/department")}>部门管理</Menu.Item>
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
                    <Content style={{ margin: "0 16px" }}>
                        <Button
                            type="primary"
                            icon={<PlusSquareOutlined />}
                            style={{ float: "left", margin: 10 }}
                            onClick={showDrawer1}
                        >
                            添加部门
                        </Button>
                        {IsLeafDepartment && <Button
                            type="primary"
                            icon={<PlusSquareOutlined />}
                            style={{ float: "left", margin: 10 }}
                            onClick={showDrawer2}
                        >
                            新增员工
                        </Button>}
                        <Drawer title="添加部门" placement="right" onClose={onClose1} open={open1}>
                            <Form
                                name="basic"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label="部门名称"
                                    rules={[{ required: true, message: "请输入部门名称" }]}
                                >
                                    <Input onChange={handleDepartmentAdd} />
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit" onClick={() => CreateNew(DepartmentPath, DepartmentName)}>
                                        确认提交
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Drawer>
                        {IsLeafDepartment && <Drawer title="创建新员工" placement="right" onClose={onClose2} open={open2}>
                            <Form
                                name="basic"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label="用户名"
                                    rules={[{ required: true, message: "请输入员工用户名" }]}
                                >
                                    <Input onChange={handleDepartmentAdd} />
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit" onClick={() => CreateNew(DepartmentPath, DepartmentName)}>
                                        确认提交
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Drawer>}
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            {IsLeafDepartment && <MemberList
                                Members={DepartmentMemberList}
                                department_page = {true}
                            />}
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout >
        );
    };
};

export default App;