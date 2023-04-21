import React from "react";
import {
    PlusOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormTreeSelect,
    ProFormSelect,
    ProFormMoney,
    ProList,
} from "@ant-design/pro-components";
import { Layout, Menu, theme, Modal, Button, Breadcrumb, Row, Col, Form, message, Tag, Space } from "antd";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { LoadSessionID } from "../../../utils/CookieOperation";
import UserInfo from "../../../components/UserInfoUI";
import SiderMenu from "../../../components/SiderUI";

interface DepartmentData {
    DepartmentName: string;
    DepartmentId: string;
}

let ListLike = [
    {
        id: "1",
        name: "语雀的天空",
        class: "",
        father: 0,
        count: 0,
        money: 0,
        position: "",
        describe: "",
    },
];

type DataItem = (typeof ListLike)[number];

let AddList: DataItem[] = [];

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [form] = Form.useForm<{ name: string; class: string; father: number; count: number; money: number; position: string; describe: string }>();
    const [treeData, setAsset] = useState<[]>(); // 储存资产列表树
    const [dataSource, setDataSource] = useState<DataItem[]>(AddList);
    const [Change, setChange] = useState(false);
    const [AssetID, setAssetID] = useState<number>(1);
    const router = useRouter();
    const query = router.query;
    const add = () => {
        let ok = true;
        for (let i = 0; i < AddList.length; i = i + 1) {
            let item = AddList[i];
            request(
                `/api/Asset/Append/${LoadSessionID()}`,
                "POST",
                {
                    Name: item.name,
                    Type: item.class,
                    Number: item.count,
                    Position: item.position,
                    Describe: item.describe,
                    Value: item.money,
                    Parent: item.father? item.father: null,
                }
            )
                .catch((err) => {
                    ok = false;
                    console.log(err.message);
                    Modal.error({
                        title: "资产" + AddList[i].name +  "录入错误",
                        content: err.message.substring(5),
                    });
                });
        }
        if (ok) {
            message.success("提交成功");
        }
        AddList.splice(0);
        setChange((e) => !e);
    };
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
    }, [state, router, Change]);
    if (state) {
        if (!treeData) {
            request(
                "/api/Asset/tree",
                "POST",
                {
                    SessionID: LoadSessionID(),
                }
            )
                .then((res) => {
                    setAsset(res.treeData);
                    console.log(res.treeData);
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
        }
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department}></UserInfo>              
                    <Breadcrumb style={{ margin: "16px 0" }}>
                        <Breadcrumb.Item>资产录入</Breadcrumb.Item>
                    </Breadcrumb>
                    <Row gutter={[8, 6]}>
                        <Col>
                            <ModalForm<{
                                name: string;
                                class: string;
                                father: number;
                                count: number;
                                money: number;
                                position: string;
                                describe: string;
                            }>
                                title="新建资产"
                                trigger={
                                    <Button type="primary">
                                        <PlusOutlined />
                                        新建资产
                                    </Button>
                                }
                                form={form}
                                autoFocusFirstInput
                                modalProps={{
                                    destroyOnClose: true,
                                    onCancel: () => console.log("run"),
                                }}
                                submitTimeout={1000}
                                onFinish={async (values) => {
                                    await waitTime(1000);
                                    AddList.push(
                                        {
                                            id: AssetID.toString(),
                                            name: values.name,
                                            class: values.class,
                                            father: values.father,
                                            count: values.count,
                                            money: values.money,
                                            position: values.position,
                                            describe: values.describe,
                                        }
                                    );
                                    setAssetID((e) => (e+1));
                                    setChange((e) => !e);
                                    // console.log(AddList);
                                    // console.log("--------------------");
                                    // console.log(values.name);
                                    // console.log(values.class);
                                    // console.log(values.father);
                                    // console.log(values.count);
                                    // console.log(values.money);
                                    // console.log(values.position);
                                    // console.log(values.describe);
                                    return true;
                                }}
                            >
                                <ProForm.Group>
                                    <ProFormText 
                                        width="lg" 
                                        name="name" 
                                        label="资产名称" 
                                        placeholder="请输入名称"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormTreeSelect
                                        label="资产分类"
                                        name="class"
                                        width="lg"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                        fieldProps={{
                                            fieldNames: {
                                                label: "title",
                                            },
                                            treeData,
                                            // treeCheckable: true,
                                            // showCheckedStrategy: TreeSelect.SHOW_PARENT,
                                            placeholder: "请选择资产分类",
                                        }}
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormSelect
                                        name="father"
                                        label="所属主资产"
                                        width="lg"
                                        tooltip="如果该资产有所属的主资产，请在这里添加"
                                        valueEnum={{
                                            1: "资产1",
                                            2: "资产2",
                                        }}
                                        placeholder="请选择所属的主资产"
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormDigit 
                                        name="count" 
                                        label="资产数量" 
                                        width="lg"
                                        placeholder="请输入数量"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormMoney
                                        label="资产价值"
                                        name="money"
                                        locale="zh-CN"
                                        initialValue={0.00}
                                        min={0}
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormTextArea
                                        name="position"
                                        label="资产位置"
                                        width="lg"
                                        placeholder="请输入位置"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormTextArea
                                        name="describe"
                                        label="资产描述"
                                        width="lg"
                                        placeholder="请输入描述"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                            </ModalForm>
                        </Col>
                        <Col offset={17}>
                            <Button type="primary" icon={<CheckOutlined />} onClick={add}>
                                录入
                            </Button>
                        </Col>
                    </Row>
                    <br></br>
                    <Row align="top">
                        <Col span={20}>
                            <ProList<DataItem>
                                rowKey="id"
                                headerTitle="待录入资产列表"
                                dataSource={dataSource}
                                showActions="hover"
                                editable={{
                                    onSave: async (key, record, originRow) => {
                                        console.log(key, record, originRow);
                                        return true;
                                    },
                                }}
                                onDataSourceChange={setDataSource}
                                metas={{
                                    title: {
                                        dataIndex: "name",
                                    },
                                    subTitle: {
                                        render: () => {
                                            return (
                                                <Space size={0}>
                                                    <Tag color="blue">Ant Design</Tag>
                                                    <Tag color="#5BD8A6">TechUI</Tag>
                                                </Space>
                                            );
                                        },
                                    },
                                    actions: {
                                        render: (text, row, index, action) => [
                                            <a
                                                onClick={() => {
                                                    AddList.splice(index, 1);
                                                    setChange((e) => !e);
                                                }}
                                                key="link"
                                            >
                                                    删除
                                            </a>,
                                        ],
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout >
        );
    };
};

export default App;