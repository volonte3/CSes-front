import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Card } from "antd";
import Sider from "antd/es/layout/Sider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { AppData } from "../utils/types";
import c7w from "../../public/c7w.jpg";
import { AppstoreOutlined, MailOutlined, SettingOutlined, HomeOutlined, PartitionOutlined,TeamOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";


type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group",
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

const items: MenuProps["items"] = [
    getItem("Navigation One", "sub1", <MailOutlined />, [
        getItem("Item 1", "g1", null, [getItem("Option 1", "1"), getItem("Option 2", "2")], "group"),
        getItem("Item 2", "g2", null, [getItem("Option 3", "3"), getItem("Option 4", "4")], "group"),
    ]),

    getItem("Navigation Two", "sub2", <AppstoreOutlined />, [
        getItem("Option 5", "5"),
        getItem("Option 6", "6"),
        getItem("Submenu", "sub3", null, [getItem("Option 7", "7"), getItem("Option 8", "8")]),
    ]),

    { type: "divider" },

    getItem("Navigation Three", "sub4", <SettingOutlined />, [
        getItem("Option 9", "9"),
        getItem("Option 10", "10"),
        getItem("Option 11", "11"),
        getItem("Option 12", "12"),
    ]),

    getItem("Group", "grp", null, [getItem("Option 13", "13"), getItem("Option 14", "14")], "group"),
];
const items_super:MenuProps["items"] = [
    getItem("首页", "1", <HomeOutlined />),
    // <CompassOutlined />
    // <ApartmentOutlined />
    // <TeamOutlined />
    // <PartitionOutlined />
    getItem("业务实体管理", "2", <PartitionOutlined />),
    
];

const items_system:MenuProps["items"] = [
    getItem("首页", "1", <HomeOutlined />),
    // <CompassOutlined />
    // <ApartmentOutlined />
    // <TeamOutlined />
    // <PartitionOutlined />
    getItem("员工管理", "2", <TeamOutlined />, [
        getItem("用户列表", "2-1"),
        getItem("部门管理", "2-2"),
    ]),
];
// submenu keys of first level
const rootSubmenuKeys = ["sub1", "sub2", "sub4"];
const SiderMenu = ({ UserAuthority }: { UserAuthority: number }) => {
    const [AppList, setAppList] = useState<AppData[]>(); // 储存所有已有应用的信息
    const router = useRouter();
    const query = router.query;
    const [openKeys, setOpenKeys] = useState(["sub1"]);

    const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };
    const handleset = (applist: AppData[]) => {
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
    const super_onCLick: MenuProps["onClick"] = (e) => {
        switch (e.key){
        case "1": router.push("/main_page"); return;
        case "2": router.push("/user/super_manager"); return;
        default: router.push("/main_page"); return;
        }
    };
    const super_now = () => {
        switch (router.pathname){
        case "/main_page": return ["1"];
        case "/user/super_manager": return ["2"];
        default: return ["1"];
        }
    };
    const handleUser = (App: AppData) => {
        if (App.AppUrl != "empty") {
            if (App.IsInternal) router.push(App.AppUrl);
            else window.location.href = App.AppUrl;
        }
    };
    const menuItems = AppList ? AppList.map((AppInfo, index) => (
        <Menu.Item key={index} disabled={AppInfo.IsLock} onClick={() => {
            if (AppInfo.AppUrl != "empty") {
                if (AppInfo.IsInternal) router.push(AppInfo.AppUrl);
                else window.location.href = AppInfo.AppUrl;
            }
        }}>
            {AppInfo.AppName}
        </Menu.Item>
    )) : [];
    return (
        <>
            <div className="blank">
                <img src="/company.png" className="img_style" />
            </div>
            {/* <Menu mode="inline">
                <Menu.Item key={30} onClick={() => { router.push("/main_page"); }}>
                    {"首页"}
                </Menu.Item>
                {UserAuthority == 3 && <Menu.Item key={40} onClick={() => { router.push("/user/employee/message"); }}>
                    消息列表
                </Menu.Item>}
                {UserAuthority == 2 && <Menu.Item key={40} onClick={() => { router.push("/user/asset_manager/message"); }}>
                    消息列表
                </Menu.Item>}
                {menuItems}
            </Menu> */}
            <Menu
                onClick={super_onCLick}
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["sub1"]}
                mode="inline"
                items={items_system}
            />
        </>
    );
};
export default SiderMenu;