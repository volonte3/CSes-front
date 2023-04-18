import React from "react";
import { 
    Breadcrumb, Layout, Menu, theme, message, Modal, Typography, Drawer, Form, Input, Row, Select, Col, Button, Space, TreeSelect 
} from "antd";
import {
    EditOutlined, ScissorOutlined, DeleteOutlined
} from "@ant-design/icons";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { LoadSessionID } from "../../../utils/CookieOperation";
import AssetAddUI from "../../../components/AssetAddUI";
import UserInfo from "../../../components/UserInfoUI";
const { Option } = Select;

const App = () => {
    const router = useRouter();
    const query = router.query;
    const [messageApi, contextHolder] = message.useMessage();
    const { Title } = Typography;
    const [collapsed, setCollapsed] = useState(false);
    const [state, setState] = useState(false); // 用户是否处在登录状态
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [Asset, setAsset] = useState<[]>(); // 储存资产列表树
    const [value, setValue] = useState<string>();
    const [ButtonDisable, setButtonDisable] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);
    const [openModify, setOpenModify] = useState(false);
    const [openDetail, setOpenDetail] = useState(true);
    const [AssetName, setAssetName] = useState<string>("");
    const [CategoryStyle, setCategoryStyle] = useState<number>(-1);
    const [Change, setChange] = useState(false);
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    
    const rolelist = ["超级管理员","系统管理员","资产管理员","员工"];
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const SiderMenu = (
        <Menu theme="dark" defaultSelectedKeys={["2"]} mode="inline">
            <Menu.Item key="1">资产审批</Menu.Item>
            <Menu.Item key="2" onClick={() => router.push("/asset/asset_define")}>资产定义</Menu.Item>
            <Menu.Item key="3" onClick={() => router.push("/asset/asset_add")}>资产录入</Menu.Item>
            <Menu.Item key="4">资产变更</Menu.Item>
            <Menu.Item key="5">资产查询</Menu.Item>
            <Menu.Item key="6">资产清退</Menu.Item>
            <Menu.Item key="7">资产调拨</Menu.Item>
            <Menu.Item key="8">资产统计</Menu.Item>
            <Menu.Item key="9">资产告警</Menu.Item>
        </Menu>
    );
    const initvalue = () => {
        setAssetName("");
        setCategoryStyle(-1);
        setOpenDetail(true);
    };

    const submit = () => {
        if (AssetName && CategoryStyle != -1) {
            onClose(); 
            request(
                "/api/Asset/AddAssetClass",
                "POST",
                {
                    SessionID: LoadSessionID(),
                    ParentNodeValue: value,
                    AssetClassName: AssetName,
                    NaturalClass: CategoryStyle,
                }
            )
                .then(() => {
                    success_add();
                    setChange((e) => !e);
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
        }
        else {
            error_add();
        }
    };

    const modify = () => {
        if (AssetName && CategoryStyle != -1) {
            onClose(); 
            request(
                "/api/Asset/ModifyAssetClass",
                "POST",
                {
                    SessionID: LoadSessionID(),
                    NodeValue: value,
                    AssetClassName: AssetName,
                    NaturalClass: CategoryStyle,
                }
            )
                .then(() => {
                    success_modify();
                    setChange((e) => !e);
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
        }
        else {
            error_add();
        }
    };
    
    const delete_asset = () => {
        onClose(); 
        request(
            `/api/Asset/DeleteAssetClass/${LoadSessionID()}/${value}`,
            "DELETE",
        )
            .then(() => {
                success_delete();
                setChange((e) => !e);
                setValue("");
            })
            .catch((err) => {
                console.log(err.name);
                console.log(err.message);
                Modal.error({
                    title: "错误",
                    content: err.message.substring(5),
                });
            });
    };

    const onChange = (newValue: string) => {
        console.log(newValue);
        setButtonDisable(false);
        setValue(newValue);
    };

    const handlechange1 = (value: string) => {
        if (value == "yes") {
            setOpenDetail(false);
            setCategoryStyle(1);
        }
        if (value == "no") {
            setOpenDetail(true);
            setCategoryStyle(0);
        }
    };

    const handlechange2 = (value: string) => {
        if (value == "shuliang") {
            setCategoryStyle(1);
        }
        if (value == "tiaomu") {
            setCategoryStyle(2);
        }
    };

    const success_add = () => {
        messageApi.open({
            type: "success",
            content: "成功增加资产",
        });
    };

    const success_modify = () => {
        messageApi.open({
            type: "success",
            content: "成功修改资产",
        });
    };

    const success_delete = () => {
        messageApi.open({
            type: "success",
            content: "成功删除资产",
        });
    };

    const error_add = () => {
        messageApi.open({
            type: "error",
            content: "请填入完整信息",
        });
    };
    
    const onClose = () => {
        setOpenAdd(false);
        setOpenModify(false);
        initvalue();
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
                setUserAuthority(res.Authority);
                setEntity(res.Entity);
                setDepartment(res.Department);
                request(
                    "/api/Asset/tree",
                    "POST",
                    {
                        SessionID: LoadSessionID(),
                    }
                )
                    .then((res) => {
                        if (res) {
                            setAsset(res.treeData);
                        }
                    })
                    .catch((err) => {
                        console.log(err.code);
                        Modal.error({
                            title: "错误",
                            content: err.message.substring(5),
                            // onOk: () => { window.location.href = "/"; }
                        });
                    });
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
    }, [router, query, state, Change]);
    if (state) {

        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
                    {SiderMenu}
                </Sider>
                <Layout className="site-layout" >
                    <Header style={{ padding: 16, background: colorBgContainer }} />
                    {contextHolder}
                    <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department}></UserInfo>
                    <Content style={{ margin: "0 16px" }}>
                        <Breadcrumb style={{ margin: "16px 0" }}>
                            <Breadcrumb.Item>资产定义</Breadcrumb.Item>
                        </Breadcrumb>
                        <Row gutter={[8,6]}>
                            <Col>
                                <Button 
                                    type="primary"
                                    style={{ float: "left", margin: 10 }}
                                    icon={<EditOutlined />} 
                                    disabled={ButtonDisable} 
                                    block 
                                    onClick={() => {initvalue(); setOpenAdd(true);}}
                                >
                                    在其下创建
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    type="primary"
                                    style={{ float: "left", margin: 10 }}
                                    icon={<ScissorOutlined />} 
                                    disabled={ButtonDisable} 
                                    block 
                                    onClick={() => {initvalue(); setOpenModify(true);}}
                                >
                                    修改
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    type="primary"
                                    style={{ float: "left", margin: 10 }}
                                    icon={<DeleteOutlined />} 
                                    disabled={ButtonDisable} 
                                    danger 
                                    block 
                                    onClick={() => {delete_asset();}}
                                >
                                    删除
                                </Button>
                            </Col>
                        </Row>
                        <Row align="top">
                            <Col span={18}>
                                <TreeSelect
                                    style={{ width: "100%" }}
                                    size="large"
                                    value={value}
                                    dropdownStyle={{ maxHeight: 1600, overflow: "auto" }}
                                    treeData={Asset}
                                    placeholder="查看或修改资产"
                                    treeDefaultExpandAll
                                    onChange={onChange}
                                />
                            </Col>
                        </Row>
                    </Content>
                    <Drawer
                        title="增加资产"
                        width={420}
                        onClose={onClose}
                        destroyOnClose={true}
                        open={openAdd}
                        bodyStyle={{ paddingBottom: 80 }}
                        extra={
                            <Space>
                                <Button onClick={onClose}>取消</Button>
                                <Button onClick={() => {submit();}} type="primary" >
                                提交
                                </Button>
                            </Space>
                        }
                    >
                        <Form layout="vertical" initialValues={[]}>
                            <Row>
                                <Form.Item
                                    name="assetname"
                                    label="资产名称"
                                    rules={[{ required: true, message: "必填项" }]}
                                >
                                    <Input placeholder="请输入要增加的资产名称" onChange={(e) => setAssetName(e.target.value)}/>
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item
                                    name="owner"
                                    label="是否为品类"
                                    rules={[{ required: true, message: "必选项" }]}
                                >
                                    <Select placeholder="请选择该资产是否为品类" onChange={handlechange1}>
                                        <Option value="yes">是</Option>
                                        <Option value="no">否</Option>
                                    </Select>
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item
                                    name="style"
                                    label="具体类型"
                                    hidden={openDetail}
                                    rules={[{ required: true, message: "必选项" }]}
                                >
                                    <Select placeholder="请选择品类的具体类型" onChange={handlechange2} defaultValue={"shuliang"}>
                                        <Option value="shuliang">数量型品类</Option>
                                        <Option value="tiaomu">条目型品类</Option>
                                    </Select>
                                </Form.Item>
                            </Row>
                        </Form>
                    </Drawer>
                    <Drawer
                        title="修改资产"
                        width={420}
                        onClose={onClose}
                        destroyOnClose={true}
                        open={openModify}
                        bodyStyle={{ paddingBottom: 80 }}
                        extra={
                            <Space>
                                <Button onClick={onClose}>取消</Button>
                                <Button onClick={() => {modify();}} type="primary" >
                                提交
                                </Button>
                            </Space>
                        }
                    >
                        <Form layout="vertical">
                            <Row>
                                <Form.Item
                                    name="assetname"
                                    label="资产名称"
                                    rules={[{ required: true, message: "必填项" }]}
                                >
                                    <Input placeholder="请输入要修改的资产名称" onChange={(e) => setAssetName(e.target.value)}/>
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item
                                    name="owner"
                                    label="是否为品类"
                                    rules={[{ required: true, message: "必选项" }]}
                                >
                                    <Select placeholder="请选择该资产是否为品类" onChange={handlechange1}>
                                        <Option value="yes">是</Option>
                                        <Option value="no">否</Option>
                                    </Select>
                                </Form.Item>
                            </Row>
                            <Row>
                                <Form.Item
                                    name="style"
                                    label="具体类型"
                                    hidden={openDetail}
                                    rules={[{ required: true, message: "必选项" }]}
                                >
                                    <Select placeholder="请选择品类的具体类型" onChange={handlechange2} defaultValue={"shuliang"}>
                                        <Option value="shuliang">数量型品类</Option>
                                        <Option value="tiaomu">条目型品类</Option>
                                    </Select>
                                </Form.Item>
                            </Row>
                        </Form>
                    </Drawer>
                    <Footer style={{ textAlign: "center" }}>EAMS ©2023 Designed by CSes</Footer>
                </Layout>
            </Layout>
        );
    }
};

export default App;