import React from "react";
import { Layout, Modal, Space, Button, Typography, TreeSelect } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { LoadSessionID } from "../../../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../../../utils/network";
import { useState, useEffect } from "react";
const { Header, Content } = Layout;

const App = () => {
    const router = useRouter();
    const query = router.query;
    const { Title } = Typography;
    const [value, setValue] = useState<string>();
    const [state, setState] = useState(false); // 用户是否处在登录状态
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [Asset, setAsset] = useState<[]>(); // 储存资产列表树
    const rolelist = ["超级管理员","系统管理员","资产管理员","员工"];

    const onChange = (newValue: string) => {
        console.log(newValue);
        setValue(newValue);
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
                console.log(err.message);
                setState(false);
                Modal.error({
                    title: "无权获取资产列表",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [router, query, state]);
    if (state) {
        return (
            <Layout style={{
                display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
                backgroundImage: "url(\"../../LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
            }}>
                <Header style = {{background : "transparent"}}>
                    <div className="logo">CSCompany资产管理系统</div>
                    <div className="right-menu">
                        <Button type = "text" className="header_button" icon={<ArrowLeftOutlined />} onClick={() =>router.push("/main_page")}>返回</Button>
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
                    <Space>
                        <div>
                            <Space direction='horizontal' size={450} align='start'>
                                <TreeSelect
                                    style={{ width: "300%" }}
                                    size="large"
                                    value={value}
                                    dropdownStyle={{ maxHeight: 1600, overflow: "auto" }}
                                    treeData={Asset}
                                    placeholder="查看或修改资产"
                                    treeDefaultExpandAll
                                    onChange={onChange}
                                />
                                <Space direction="vertical" style={{ display: "flex" }} size={20}>
                                    <Button type="primary" block>在其下创建</Button>
                                    <Button type="primary" block>重命名</Button>
                                    <Button type="primary" danger block>删除</Button>
                                </Space>
                            </Space>
                        </div>
                    </Space>
                </Content>
            </Layout>
        );
    }
};

export default App;