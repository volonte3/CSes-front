import React from "react";
import { Badge, Table, List, Button } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, Search } from "@ant-design/pro-components";
const columns: ProColumns<AssetData>[] = [
    {
        title: "资产名称",
        dataIndex: "Name",
        key: "Name",
    },
    {
        title: "资产编号",
        dataIndex: "ID",
        key: "ID",
    },
    {
        title: "生命周期状态",
        dataIndex: "Status",
        key: "Status",
    },
    {
        title: "所有者",
        dataIndex: "Owner",
        key: "Owner",
    },
    {
        title: "描述",
        dataIndex: "Description",
        key: "Description",
        // search: {
        //     placeholder: "请输入描述",
        //     width: 200,
        // },
    },
    {
        title: "创建时间",
        dataIndex: "CreateTime",
        key: "CreateTime",
    },
];
interface AssetListProps {
    Assets: AssetData[] | undefined;
}
const AssetList = (props: AssetListProps) => {
    const [data, setData] = useState<AssetData[] | undefined>(props.Assets); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const [searchText, setSearchText] = useState<string>(""); // 存储搜索框中输入的值
    const FetchAssetList = () => {
        request(`/api/User/member/${LoadSessionID()}`, "GET")
            .then((res) => {
                setData(res.Asset);
            });
    };
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // FetchAssetList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    return (
        // <div>
        <ProTable
            columns={columns}
            options={false}
            request={() => Promise.resolve({ data, success: true })}
            rowKey="id"
            search={{
                labelWidth: 100,
                defaultCollapsed: false
            }}
            scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
            pagination={{
                showSizeChanger: true
            }}
            
        />
        // </div>
    );
};
export default AssetList;