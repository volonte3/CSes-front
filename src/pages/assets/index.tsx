import { useRouter } from "next/router";
import { Collapse, Card, Toast, List } from "antd-mobile";
import { ProCard } from "@ant-design/pro-components";
import { request } from "../../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../../utils/CookieOperation";
import { useState, useEffect } from "react";
import { AssetDetailInfo } from "../../utils/types"; //对列表中数据的定义在 utils/types 中
import { Modal, Badge } from "antd";
import { DateTransform, renderStatus, renderStatusBadge } from "../../utils/transformer";
const TestDetailInfo: AssetDetailInfo = {
    Name: "测试资产",
    ID: 1,
    Status: 1,
    Owner: "张三",
    Description: "这是一个测试资产",
    CreateTime: "2022-04-23",
    History: [
        {
            Review_Time: "2022-04-23",
            ID: 1,
            Type: 1,
            Initiator: "李四",
            Participant: "王五",
            Asset_Admin: "赵六",
        },
        {
            Review_Time: "2022-04-22",
            ID: 2,
            Type: 2,
            Initiator: "王五",
            Participant: "赵六",
            Asset_Admin: "李四",
        },
        {
            Review_Time: "2022-04-21",
            ID: 3,
            Type: 3,
            Initiator: "赵六",
            Participant: "李四",
            Asset_Admin: "王五",
        },
    ],
    PropertyName: ["大小", "高低"],
    // PropertyValue: ["100", "200"],
    LabelVisible: {
        Name: true,
        ID: true,
        Status: true,
        Owner: true,
        Description: true,
        CreateTime: false,
    }
};
const AssetPage = () => {
    const router = useRouter();
    const query = router.query;
    const id = query.id;
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>(TestDetailInfo);
    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get("id");
    const assetData = {
        name: "Asset Name",
        type: "Asset Type",
        value: "$1,000",
        description: "Asset Description",
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(`/api/User/Asset_Detail/${LoadSessionID()}/${id}`, "GET")
            .then(
                (res) => {
                    setDetailInfo(res.Asset_Detail);
                    console.log(res.Asset_Detail);
                    console.log(DetailInfo);

                }
            )
            .catch(
                (err: string) => {
                    setDetailInfo(TestDetailInfo);
                }
            );
    }, [router, query, id, DetailInfo]);

    return (
        <div>
            <Collapse defaultActiveKey={["1"]}>
                <Collapse.Panel key="1" title="基本信息">
                    <ProCard split="horizontal">
                        <ProCard split="horizontal">
                            <ProCard split="vertical">
                                <ProCard title="资产名称">{DetailInfo?.Name}</ProCard>
                                <ProCard title="ID">{DetailInfo?.ID}</ProCard>
                                <ProCard title="创建时间">{DateTransform(DetailInfo?.CreateTime)}</ProCard>
                            </ProCard>
                            <ProCard split="vertical">
                                <ProCard title="当前所有者">{DetailInfo?.Owner}</ProCard>
                                <ProCard title="状态">
                                    <Badge status={renderStatusBadge(DetailInfo?.Status)} text={renderStatus(DetailInfo?.Status)} />
                                </ProCard>
                            </ProCard>
                            <ProCard split="vertical">
                                <ProCard title="资产描述">{DetailInfo?.Description}</ProCard>
                            </ProCard>
                        </ProCard>
                    </ProCard>
                </Collapse.Panel>
            </Collapse>
        </div>
    );
};

export default AssetPage;