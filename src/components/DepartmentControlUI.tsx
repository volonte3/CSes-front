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
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";
import MenuItem from "antd/es/menu/MenuItem";
import MemberList from "../components/MemberList";

// type MenuItem = Required<MenuProps>["items"][number];
interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
interface DepartmentData {
    DepartmentName: string;
    DepartmentPath: string;
    DepartmentId: number;
}
interface DepartmentUIProps {
    DepartmentPath: string
}

const DepartmentUI = (props: DepartmentUIProps) => {
    const [open1, setOpen1] = useState(false);    //添加部门侧边栏的显示
    const [open2, setOpen2] = useState(false);    //创建员工侧边栏的显示
    const [DepartmentName, setDepartmentName] = useState(""); //注册新部门名
    const [IsLeafDepartment, setLeafDepartment] = useState(false);//判断是否为叶子部门，若是则显示用户列表
    const [DepartmentList, setDepartmentList] = useState<DepartmentData[]>(); // 存储当前部门下所有部门的信息 
    const [DepartmentMemberList, setMemberList] = useState<MemberData[]>(); // 存储叶子部门下所有用户的信息
    const [UserName, setUserName] = useState("");// 储存新建用户的名称
    const [DepartmentPath, setDepartmentPath] = useState("000000000"); //储存当前的部门路径
    const router = useRouter();
    const handleDepartmentAdd = (e: any) => {
        setDepartmentName(e.target.value);
    };
    const handleUserAdd = (e: any) => {
        setUserName(e.target.value);
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
    const GoUp = (NowPath: string) => {
        let new_path = "000000000";
        let i = 0;
        for(i; i<9; i++){
            if(NowPath[i] == "0"){
                break;
            }
        }
        let newstr = i>1 ? NowPath.substring(0, i-2)+new_path.substring(i): new_path;
        setDepartmentPath(newstr);
    };
    // 向后端发送创建用户和实体的请求，如果创建成功提示成功并关闭抽屉，否则向用户提示错误信息
    const CreateNewDepartment = (DepartmentPath: string, DepartmentName: string) => {
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
    const CreateNewUser = (DeparmentPath: string, UserName: string) => {
        request(
            "/api/User/add",
            "POST",
            {
                "SessionID": LoadSessionID(),
                "UserName": UserName,
                "Department": DeparmentPath
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
    const RemoveDepartment = (DepartmentPath: string, DepartmentName: string) => {
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
            `/api/User/member/${LoadSessionID()}/${DepartmentPath}`,
            "GET"
        )
            .then((res) => {
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
                Modal.error({
                    title: "无权获取对应部门信息",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [router, DepartmentPath]);
    return (
        <Content style={{ margin: "0 16px" }}>
            {DepartmentPath != "000000000" && <Button
                type="primary"
                icon={<PlusSquareOutlined />}
                style={{ float: "left", margin: 10 }}
                onClick={() => {GoUp(DepartmentPath);}}
            >
                回到上一级目录
            </Button>}
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
                        <Button type="primary" htmlType="submit" onClick={() => CreateNewDepartment(DepartmentPath, DepartmentName)}>
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
                        <Input onChange={handleUserAdd} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" onClick={() => CreateNewUser(DepartmentPath, UserName)}>
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
                {!IsLeafDepartment && <Table  dataSource={DepartmentList}>
                    <Column
                        title="部门名称"
                        key="action"
                        render={(_: any, record: DepartmentData) => (
                            <>
                                <a type="primary" onClick={() => { setDepartmentPath(record.DepartmentPath);}}>{record.DepartmentName}</a>
                            </>
                        )}
                    />
                    <Column title="部门编号" dataIndex="DepartmentId" key="DepartmentId" />
                    <Column
                        title="管理"
                        key="action"
                        render={(_: any, record: DepartmentData) => (
                            <Space size="middle">
                                <Button type="primary" onClick={() => { RemoveDepartment(record.DepartmentPath, record.DepartmentName);}}>移除该部门</Button>
                            </Space>
                        )}
                    />
                </Table>}
            </div>
        </Content>
    );
};

export default DepartmentUI;
