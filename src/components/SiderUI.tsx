import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button } from "antd";
import Sider from "antd/es/layout/Sider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { AppData } from "../utils/types";

const SiderMenu = (UserAuthority: number) => {
    const [AppList, setAppList] = useState<AppData[]>(); // 储存所有已有应用的信息
    const router = useRouter();
    const query = router.query;
    const GetApp = (Authority: number) => {
        request(
            `/api/User/App/${LoadSessionID()}/${Authority}`,
            "GET"
        )
            .then((res) => {
                setAppList(res.AppList);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "获取应用信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });

    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        GetApp(UserAuthority);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    const handleUser = (App: AppData) => {
        if (App.AppUrl != "empty"){
            if(App.IsInternal) router.push(App.AppUrl);
            else window.location.href=App.AppUrl;
        }
    };
    const menuItems = AppList ? AppList.map((AppInfo,index) => (
        <Menu.Item key={index} disabled={AppInfo.IsLock} onClick={()=>{handleUser(AppInfo);}}>
            {AppInfo.AppName}
        </Menu.Item>
    )):[];
    return (
        <Menu theme="dark" mode="inline">
            {menuItems}
        </Menu>
    );
};
export default SiderMenu;