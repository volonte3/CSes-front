import React from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button } from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { logout, LoadSessionID } from "../../../../utils/CookieOperation";
import AssetList from "../../../../components/AssetListAssetManagerUI";
import UserInfo from "../../../../components/UserInfoUI";
import { AssetData } from "../../../../utils/types";
import SiderMenu from "../../../../components/SiderUI";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Asset, setAsset] = useState<AssetData[]>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const router = useRouter();
    const query = router.query;
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [VisibleDetail,setVisibleDetail] = useState(false); //是否显示详细信息页面
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
                setUserApp(res.UserApp);
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
    }, [router, query, state]);
    if (state) {

        return (
            <div className="Div">
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider className= "sidebar" width="10%">
                        <SiderMenu UserAuthority={UserAuthority} />
                    </Sider>
                    <Layout className="site-layout" >
                        <Header className="site-header">
                            <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD}></UserInfo>
                        </Header>
                        <Content>
                            <Breadcrumb style={{ margin: "30px" }}>
                                <Breadcrumb.Item onClick={()=>setVisibleDetail(false)}>资产列表</Breadcrumb.Item>
                                {VisibleDetail && <Breadcrumb.Item>资产详细信息</Breadcrumb.Item>}
                            </Breadcrumb>
                            <div className="Div">
                                <AssetList ManagerName={UserName} setVisibleDetail={setVisibleDetail} VisibleDetail={VisibleDetail}/>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        );
    }
};

export default App;