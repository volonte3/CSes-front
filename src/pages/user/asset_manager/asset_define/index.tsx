import React,{useRef} from "react";
import { 
    Breadcrumb, Layout, message, Modal, Drawer, Form, Input, Row, Select, Col, Button, Space, TreeSelect,Tour 
} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import type {TourProps} from "antd";
import {
    EditOutlined, ScissorOutlined, DeleteOutlined, PlusOutlined
} from "@ant-design/icons";
import {
    ModalForm,
    ProForm,
    ProFormText,
} from "@ant-design/pro-components";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";
import EChartsReact from "echarts-for-react";
const { Option } = Select;
const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

const App = () => {
    const [form] = Form.useForm<{ property: string}>();
    const router = useRouter();
    const query = router.query;
    const [messageApi, contextHolder] = message.useMessage();
    const [state, setState] = useState(false); // 用户是否处在登录状态
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [Asset, setAsset] = useState<[]>(); // 储存资产列表树
    const [value, setValue] = useState<string>();
    const [ButtonDisable, setButtonDisable] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);
    const [openModify, setOpenModify] = useState(false);
    const [AssetName, setAssetName] = useState<string>("");
    const [LossStyle, setLossStyle] = useState<number>(-1);
    const [Change, setChange] = useState(false);
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [UserID, setUserID]= useState(0);
    const [TourOpen, setTourOpen] = useState(false);

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "查看资产分类树",
            description: "资产分为条目型和数量型两类，点击有箭头的分类项可展开显示其下属子分类，用户可以在这个分类的基础上对定义进行进一步细化调整",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "创建分类",
            description: "用户可根据自己需要，选择一个已有资产分类后，在其下定义新的子分类",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "修改分类",
            description: "用户可根据自己需要，修改分类的定义，包括分类名称、折旧策略",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "删除操作",
            description: "用户可以删除对应子分类",
            target: () => ref4.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "增加自定义属性",
            description: "用户可以在某一资产分类中定义该分类特有的自定义属性，在添加自定义属性时，推荐在属性名中提示属性应填入的键，如房产（大、中、小），从而便于员工及其它资产管理员查看",
            target: () => ref5.current,
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
        }
    ];

    const initvalue = () => {
        setAssetName("");
        setLossStyle(-1);
    };

    const submit = () => {
        if (AssetName && LossStyle != -1) {
            onClose(); 
            request(
                "/api/Asset/AddAssetClass",
                "POST",
                {
                    SessionID: LoadSessionID(),
                    ParentNodeValue: value,
                    AssetClassName: AssetName,
                    LossStyle: LossStyle,
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
        if (AssetName && LossStyle != -1) {
            onClose(); 
            request(
                "/api/Asset/ModifyAssetClass",
                "POST",
                {
                    SessionID: LoadSessionID(),
                    NodeValue: value,
                    AssetClassName: AssetName,
                    LossStyle: LossStyle,
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
        if (value == "l") {
            setLossStyle(1);
        }
        if (value == "e") {
            setLossStyle(0);
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
                if(res.Authority != 2 ){
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
                setUserID(res.ID);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, state, Change]);
    if (state) {
        return (
            <div className="Div">
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider className= "sidebar" width="10%">
                        <SiderMenu UserAuthority={UserAuthority} />
                    </Sider>
                    <Layout className="site-layout" >
                        {contextHolder}
                        <Header className="ant-layout-header">
                            <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                            <Button style={{  margin: 30}} className="header_button" onClick={() => { setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                                使用帮助
                            </Button>
                        </Header>
                        <Content>
                            <Breadcrumb style={{ margin: "30px" }}>
                                <Breadcrumb.Item>资产定义</Breadcrumb.Item>
                            </Breadcrumb>
                            <Row style={{ margin: "30px" }} gutter={[8,6]}>
                                <Col>
                                    <Button 
                                        type="primary"
                                        style={{ float: "left"}}
                                        icon={<EditOutlined />} 
                                        disabled={ButtonDisable} 
                                        block 
                                        onClick={() => {if(!TourOpen){initvalue(); setOpenAdd(true);}}}
                                        ref={ref2}
                                    >
                                    在其下创建
                                    </Button>
                                </Col>
                                <Col>
                                    <Button 
                                        type="primary"
                                        style={{ float: "left"}}
                                        icon={<ScissorOutlined />} 
                                        disabled={ButtonDisable} 
                                        block 
                                        onClick={() => {if(!TourOpen){initvalue(); setOpenModify(true);}}}
                                        ref={ref3}
                                    >
                                    修改
                                    </Button>
                                </Col>
                                <Col>
                                    <Button 
                                        type="primary"
                                        style={{ float: "left"}}
                                        icon={<DeleteOutlined />} 
                                        disabled={ButtonDisable} 
                                        danger 
                                        block 
                                        onClick={() => {if(!TourOpen){delete_asset();}}}
                                        ref={ref4}
                                    >
                                    删除
                                    </Button>
                                </Col>
                                <Col offset={9}>
                                    <ModalForm<{
                                property: string;
                                }>
                                        title="增加自定义属性"
                                        trigger={
                                            <Button type="primary" ref={ref5} disabled={TourOpen||ButtonDisable}>
                                                <PlusOutlined />
                                            增加自定义属性
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
                                            console.log(values.property);
                                            console.log(value);
                                            request(
                                                `/api/Asset/DefineProp/${LoadSessionID()}`,
                                                "POST",
                                                {
                                                    AssetClassID: value,
                                                    Property: [values.property],
                                                }
                                            )
                                                .then((res) => {
                                                    message.success("添加成功");
                                                })
                                                .catch((err) => {
                                                    Modal.error({
                                                        title: "错误",
                                                        content: err.message.substring(5),
                                                    });
                                                });
                                            return true;
                                        }}
                                    >
                                        <ProForm.Group>
                                            <ProFormText
                                                width="md"
                                                name="property"
                                                label="属性名称"
                                                placeholder="请输入名称"
                                                rules={[{ required: true, message: "这是必填项" }]} 
                                            />
                                        </ProForm.Group>
                                    </ModalForm>
                                </Col>
                            </Row>
                            <Row style={{ margin: "30px" }} align="top">
                                <Col span={18} ref={ref1}>
                                    <TreeSelect
                                        style={{ width: "100%" }}
                                        size="large"
                                        value={value}
                                        dropdownStyle={{ maxHeight: 1600, overflow: "auto" }}
                                        treeData={Asset}
                                        placeholder="查看或修改资产"
                                        treeDefaultExpandAll
                                        onChange={onChange}
                                        // ref={ref1}
                                    />
                                </Col>
                            </Row>
                    
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
                                            name="loss"
                                            label="折旧策略"
                                            rules={[{ required: true, message: "必选项" }]}
                                        >
                                            <Select placeholder="请选择该资产是否为品类" onChange={handlechange1}>
                                                <Option value="l">线性折旧</Option>
                                                <Option value="e">指数折旧</Option>
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
                                            name="loss"
                                            label="折旧策略"
                                            rules={[{ required: true, message: "必选项" }]}
                                        >
                                            <Select placeholder="请选择该资产是否为品类" onChange={handlechange1}>
                                                <Option value="l">线性折旧</Option>
                                                <Option value="e">指数折旧</Option>
                                            </Select>
                                        </Form.Item>
                                    </Row>
                                </Form>
                            </Drawer>
                            <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                        </Content>
                    </Layout>
                </Layout>
            </div>
        );
    }
};

export default App;