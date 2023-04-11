import React from "react";
import { Layout, Modal, Space, Button, Typography, TreeSelect, message, Drawer, Form, Input, Row, Select, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { LoadSessionID } from "../../../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../../../utils/network";
import { useState, useEffect } from "react";
import UserInfo from "../../../components/UserInfoUI";
const { Header, Content } = Layout;
const { Option } = Select;


const App = () => {
    const router = useRouter();
    const query = router.query;
    const [messageApi, contextHolder] = message.useMessage();
    const { Title } = Typography;
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
    const rolelist = ["超级管理员","系统管理员","资产管理员","员工"];

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
                setValue("1");
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
            <Layout style={{
                display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
                backgroundImage: "url(\"../../LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
            }}>
                {contextHolder}
                <Header style = {{background : "transparent"}}>
                    <div className="logo">CSCompany资产管理系统</div>
                    <div className="right-menu">
                        <Button type = "text" className="header_button" icon={<ArrowLeftOutlined />} onClick={() =>router.push("/main_page")}>返回</Button>
                        <UserInfo></UserInfo>
                    </div>
                </Header>
                <br />
                <br />
                <br />
                <br />
                <Content>
                    <div>
                        <Title level={1}>资产定义</Title>
                    </div>
                    <Space align="center" size={200}>
                        <div className="title">用户名：{UserName}</div>
                        <div className="title">您的权限：{rolelist[UserAuthority]}</div>
                    </Space>
                    <br />
                    <br />
                    <br />
                    <br />
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
                        <Col span={2}>
                        </Col>
                        <Col span={4} className="gutter-row">
                            <Row gutter={[16, 24]}>
                                <Button type="primary" disabled={ButtonDisable} block onClick={() => {initvalue(); setOpenAdd(true);}}>在其下创建</Button>
                                <Button type="primary" disabled={ButtonDisable} block onClick={() => {initvalue(); setOpenModify(true);}}>修改</Button>
                                <Button type="primary" disabled={ButtonDisable} danger block onClick={() => {delete_asset();}}>删除</Button>
                            </Row>
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
            </Layout>
        );
    }
};

export default App;