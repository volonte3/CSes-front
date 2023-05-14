import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Card } from "antd";
import Sider from "antd/es/layout/Sider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { AppData } from "../utils/types";
import c7w from "../../public/c7w.jpg";
const SiderMenu = ({ UserAuthority }: { UserAuthority: number }) => {
    const [AppList, setAppList] = useState<AppData[]>(); // 储存所有已有应用的信息
    const router = useRouter();
    const query = router.query;
    const handleset = (applist:AppData[]) => {
        setAppList(applist);
    };
    const GetApp = (Authority: number) => {
        request(
            `/api/User/App/${LoadSessionID()}/${Authority}`,
            "GET"
        )
            .then((res) => {
                handleset(res.AppList);
                console.log(res.AppList);
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
        <Menu.Item key={index} disabled={AppInfo.IsLock} onClick={()=>{
            if (AppInfo.AppUrl != "empty"){
                if(AppInfo.IsInternal) router.push(AppInfo.AppUrl);
                else window.location.href=AppInfo.AppUrl;
            }}}>
            {AppInfo.AppName}
        </Menu.Item>
    )):[];
    return (
        <>
            <div className="blank">
                <img src="/company.png" className="img_style"/>
            </div>
            <Menu mode="inline">
                <Menu.Item key={30} onClick={()=>{router.push("/main_page");}}>
                    {"首页"}
                </Menu.Item>
                {UserAuthority == 3 && <Menu.Item key={40} onClick={()=>{router.push("/user/employee/message");}}>
                消息列表
                </Menu.Item>}
                {UserAuthority == 2 && <Menu.Item key={40} onClick={()=>{router.push("/user/asset_manager/message");}}>
                消息列表
                </Menu.Item>}
                {menuItems}
            </Menu>
        </>
    );
};
export default SiderMenu;