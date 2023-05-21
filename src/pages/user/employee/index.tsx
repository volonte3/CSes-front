import React,{useRef} from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Tour } from "antd";
const { Column, ColumnGroup } = Table;
import { QuestionCircleOutlined } from "@ant-design/icons";
import type { TourProps } from "antd";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { logout, LoadSessionID } from "../../../utils/CookieOperation";
import AssetList from "../../../components/EmployeeAssetListUI";
import UserInfo from "../../../components/UserInfoUI";
import { AssetData } from "../../../utils/types";
import SiderMenu from "../../../components/SiderUI";
import EmployeeAssetList from "../../../components/EmployeeAssetListUI";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(3); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Asset, setAsset] = useState<AssetData[]>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const router = useRouter();
    const query = router.query;
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
            title: "资产列表",
            description: "展示员工所属部门下所有资产，员工可以根据资产的状态向资产管理员提出对资产的领用、退库、维保、清退请求",
            target: () => ref1.current,
            nextButtonProps: { children: "下一步" },
            prevButtonProps: { children: "上一步" },
        },
        {
            title: "查看资产",
            description: "员工可查看部门内闲置资产或个人资产",
            target: () => ref2.current,
            nextButtonProps: { children: "下一步" },
            prevButtonProps: { children: "上一步" },
        },
        {
            title: "资产操作",
            description: "包括领用、退库、维保、清退操作，其中第一种操作只能对闲置资产执行，后三种只能对个人资产执行，在执行对应操作后，部门内资产管理员会收到申请信息，并对申请进行批复，员工可通过查看消息列表了解批复结果",
            target: () => ref3.current,
            nextButtonProps: { children: "结束导览" },
            prevButtonProps: { children: "上一步" },
        }
    ];
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
                if(res.Authority != 3 ){
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
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className= "sidebar" width="10%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                        <Button style={{ margin: 30 }} className="header_button" onClick={() => { setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                            使用帮助
                        </Button>
                    </Header>
                    <Content>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            <EmployeeAssetList EmployeeName={UserName}  refList={[ref2,ref3]} TourOpen={TourOpen} setTourOpen={setTourOpen}/>
                        </div>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;