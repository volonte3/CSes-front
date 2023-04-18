import React from "react";
import {
    DownOutlined, LogoutOutlined, UserOutlined
} from "@ant-design/icons";
import { Space, Modal, Button, Dropdown, Row, Descriptions, Card, Spin } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { LoadSessionID, logout, IfCodeSessionWrong } from "../utils/CookieOperation";
import type { MenuProps } from "antd";
import { renderAuthority } from "../utils/transformer";
type MenuItem = Required<MenuProps>["items"][number];

interface UserinfoProps {
    Name: string;
    Authority: number;
    Department: string;
    Entity: string;

}
const UserInfo = (props:UserinfoProps) => {
    const router = useRouter();
    const query = router.query;
    const [state, setState] = useState(false);  //路径保护变量
    const [LogoutLoadings, setLogoutLoadings] = useState<boolean>(true); //登出按钮是否允许点击
    const [Logouting, setLogouting] = useState<boolean>(false); //登出是否正在进行中
    const items: MenuProps["items"] = [
        {
            key: "1",
            label: (
                <Descriptions title={props.Name} bordered>
                    <UserOutlined />
                    <Descriptions.Item label="身份">{renderAuthority(props.Authority)}</Descriptions.Item>
                    {props.Authority != 0 && <Descriptions.Item label="业务实体">{props.Entity}</Descriptions.Item>}
                    {(props.Authority == 2 || props.Authority == 3) && <Descriptions.Item label="部门">{props.Department}</Descriptions.Item>}
                </Descriptions>
            ),
        },
        {
            key: "2",
            label: (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {/* <Spin /> */}
                    <Button
                        type="link"
                        icon={<LogoutOutlined />}
                        style={{ margin: "auto" }}
                        danger
                        onClick={() => {
                            setLogouting(true);
                            Modal.info({"title":"成功登出","content":"点击确认回到登录界面","onOk":()=>{router.push("/");},"okButtonProps":{"disabled":Logouting}});
                            console.log("log out!!!!!!!!!!!!!!!!"); logoutSendMessage(); logout();setLogouting(false);
                        }}
                        loading={LogoutLoadings}
                    >
                        退出登录
                    </Button>
                </div>
            ),
        },
    ];
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => {setLogouting(true);  })
            .catch((err) => { router.push("/"); });
    };

    const enterLoading = () => {
        setTimeout(() => {
            setLogoutLoadings(false);
        }, 1000);
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // FetchUserinfo();
        enterLoading();
    }, [router, query]);
    return (
        <div>
            <Row justify="end">
                <Space>
                    
                    <Dropdown menu={{ items }} >
                        <Card onClick={(e) => e.preventDefault()}>
                            <Space>
                                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{props.Name}</span>
                                <DownOutlined />
                                <Button  size = "large" color="white" htmlType="submit"  onClick={() => {router.push("/main_page");}}>
                                    返回主界面
                                </Button>
                            </Space>
                        </Card>
                    </Dropdown>
                </Space>
            </Row >
            
        </div>
    );
};
export default UserInfo;