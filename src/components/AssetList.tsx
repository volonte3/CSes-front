import React from "react";
import {
    FileOutlined, PlusSquareOutlined, UpOutlined, DownOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Badge, Table } from "antd";
import type { RadioChangeEvent } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { renderStatus } from "../utils/transformer";
interface AssetListProps {
    Assets: AssetData[] | undefined;
}
const AssetList = (props: AssetListProps) => {
    const [data, setData] = useState<AssetData[] | undefined>(props.Assets); // 存储加载该系统管理员管理的资产管理员和员工的信息
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
        <div>
            <Table dataSource={data}>
                {/* <Column title="姓名" dataIndex="Name" key="Name" /> */}
                <Column title="资产编号" dataIndex="ID" key="ID" />
                <Column title="资产名" dataIndex="Name" key="Name" />
                <Column title="描述" dataIndex="Description" key="Description" />
                <Column title="当前使用人" dataIndex="Owner" key="Owner" />
                <Column title="状态" dataIndex="Status" key="Status" render={(Status) => (
                    <div>

                        {Status == 0 && <Badge status="success" />}
                        {Status == 1 && <Badge status="error" />}
                        {Status == 2 && <Badge status="warning" />}
                        {Status == 3 && <Badge status="processing" />}
                        {Status == 4 && <Badge status="default" />}
                        {renderStatus(Status)}
                    </div>
                )} />
                <Column title="入库时间" dataIndex="CreateTime" key="CreateTime" />
                <Column title="操作" key="action" />
            </Table>
        </div>
    );
};
export default AssetList;