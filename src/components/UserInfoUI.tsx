import React from "react";
import {
    DownOutlined, LogoutOutlined, UserOutlined
} from "@ant-design/icons";
import { Space, Modal, Button, Dropdown, Row, Descriptions } from "antd";
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
const UserInfo = () => {
    const router = useRouter();
    const query = router.query;
    const [state, setState] = useState(false);  //路径保护变量
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Entity, setEntity] = useState(null);  //用户所属业务实体，没有则为null
    const [Department, setDepartment] = useState(null);  //用户所属部门，没有则为null
    const items: MenuProps["items"] = [
        {
            key: "1",
            label: (
                <Descriptions title={UserName} bordered>
                    <UserOutlined />
                    <Descriptions.Item label="身份">{renderAuthority(UserAuthority)}</Descriptions.Item>
                    {UserAuthority != 0 && <Descriptions.Item label="业务实体">{Entity}</Descriptions.Item>}
                    {(UserAuthority == 2 || UserAuthority == 3) && <Descriptions.Item label="部门">{Entity}</Descriptions.Item>}
                </Descriptions>
            ),
        },
        {
            key: "2",
            label: (
                <div style={{ display: "flex", justifyContent: "center" }}>

                    <Button
                        type="link"
                        icon={<LogoutOutlined />}
                        style={{margin: "auto" }}
                        danger
                        onClick={() => { logoutSendMessage(); logout(); }}
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
            .then(() => { router.push("/"); });
        // .catch((err) => { alert(FAILURE_PREFIX + err); setRefreshing(true); });
    };
    const FetchUserinfo = () => {
        request(
            `/api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setState(true);
                setUserName(res.UserName);
                setUserApp(res.UserApp);
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
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        FetchUserinfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    return (
        <Row justify="end">
            <Dropdown menu={{ items }} >
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        {UserName}
                        <DownOutlined />
                    </Space>
                </a>
            </Dropdown>
        </Row >
    );
};
export default UserInfo;