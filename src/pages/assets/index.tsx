import { useRouter } from "next/router";
import { Collapse, Card, Toast, List, Button, Image } from "antd-mobile";
import { ProCard, ProTable, ProColumns } from "@ant-design/pro-components";
import { request } from "../../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../../utils/CookieOperation";
import { useState, useEffect } from "react";
import { AssetDetailInfo, AssetHistory } from "../../utils/types"; //对列表中数据的定义在 utils/types 中
import { Modal, Badge } from "antd";
import { DateTransform, renderStatus, renderStatusBadge, renderStatusChanges } from "../../utils/transformer";
const url_list = [
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/blue.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/chess1.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/chess2.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/green.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/player.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/okset.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/asset_label/1.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/asset_label/47.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/asset_label/53.png",
];
const TestDetailInfo: AssetDetailInfo = {
    Name: "测试资产",
    ID: 1,
    Status: 1,
    Owner: "张三",
    Description: "这是一个测试资产",
    CreateTime: "2022-04-23",
    Class: "一本好书",
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
        Class: true,
        Status: true,
        Owner: true,
        Description: true,
        CreateTime: false,
    },
    ImageUrl:url_list,
};
const AssetPage = () => {
    const router = useRouter();
    const query = router.query;
    const id = query.id;
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>();
    const [NoUpdate, setNoUpdate] = useState(false);
    const [ShowHistoryDetail, setShowHistoryDetail] = useState(0);
    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get("id");
    const assetData = {
        name: "Asset Name",
        type: "Asset Type",
        value: "$1,000",
        description: "Asset Description",
    };
    const Historycolumns: ProColumns<AssetHistory>[] = [

        {
            title: "审批号",
            dataIndex: "ID",
            search: false,
            // fixed:"left"
        },
        {
            title: "申请类型",
            dataIndex: "Type",
            key: "Type",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "领用",
                    status: "Success",
                },
                1: {
                    text: "退库",
                    status: "Error",
                },
                2: {
                    text: "维保",
                    status: "Warning",
                },
                3: {
                    text: "转移",
                    status: "Processing",
                },
                4: {
                    text: "清退",
                    status: "Default",
                },
                5: {
                    text: "退维",
                    status: "Success",
                },
                6: {
                    text: "调拨",
                    status: "Processing",
                },
                7: {
                    text: "录入",
                    status: "Success",
                },
                8: {
                    text: "变更",
                    status: "Warning",
                }
            },
        },
        {
            title: "发起者",
            dataIndex: "Initiator",
        },
        {
            title: "参与者",
            dataIndex: "Participant",
            search: false,
        },
        {
            title: "审批人",
            dataIndex: "Asset_Admin",
        },
        {
            title: "审批时间",
            dataIndex: "Review_Time",
            search: false,
            render: (text: any, record: any) => {
                console.log(text);
                // TODO 不是很理解如果返回值为 undefined，前端默认会解析为 -
                return (text != "-") ? DateTransform(text) : "-";
            },
            // fixed:"right"
        },
    ];
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if (!NoUpdate) {
            request(`/api/User/QR_Asset_Detail/${id}`, "GET")
                .then(
                    (res) => {
                        setDetailInfo(res.Asset_Detail);
                        setNoUpdate(true);
                        console.log(res.Asset_Detail);
                        console.log(DetailInfo);

                    }
                )
                .catch(
                    (err: string) => {
                        setDetailInfo(TestDetailInfo);
                    }
                );
        }
    }, [router, query, id, DetailInfo, NoUpdate]);

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
                                <ProCard title="资产类别">{DetailInfo?.Class}</ProCard>
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
                <Collapse.Panel key="2" title="历史记录">
                    <List mode="card" header='资产历史记录(最近十条)'>
                        {DetailInfo?.History.map(row => (

                            <div key={row.ID}>

                                <List.Item key={row.ID} title={"审批号:"+row.ID} description={DateTransform(row.Review_Time)} clickable onClick={() => setShowHistoryDetail(ShowHistoryDetail==0?row.ID:0)}>

                                    <Badge status={renderStatusBadge(row.Type)} />{" "+renderStatusChanges(row.Type)}
                                </List.Item>
                                {ShowHistoryDetail == row.ID && <Card title="详细信息" >
                                    <ProCard split="horizontal">
                                        <ProCard split="horizontal">
                                            <ProCard split="vertical">
                                                <ProCard title="审批号">{row.ID}</ProCard>
                                                <ProCard title="申请类型"><Badge status={renderStatusBadge(row.Type)} />{renderStatusChanges(row.Type)}</ProCard>
                                                <ProCard title="审批时间">{DateTransform(row.Review_Time)}</ProCard>
                                            </ProCard>
                                            <ProCard split="vertical">
                                                <ProCard title="发起者">{row.Initiator}</ProCard>
                                                <ProCard title="参与者">{row.Participant}</ProCard>
                                                <ProCard title="审批人">{row.Asset_Admin} </ProCard>
                                            </ProCard>
                                            {/* <ProCard split="vertical">
                                                        <ProCard title="资产描述">{DetailInfo?.Description}</ProCard>
                                                    </ProCard> */}
                                        </ProCard>
                                    </ProCard>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                setShowHistoryDetail(0);
                                            }}

                                        >
                                            关闭
                                        </Button>
                                    </div>
                                </Card>}
                            </div>


                        ))}
                    </List>
                </Collapse.Panel>
                <Collapse.Panel key="3" title="资产图片">
                    <div style={{ height: "500px", overflowY: "auto", overflowX: "hidden", display: "flex", flexWrap: "wrap" }}>
                        {url_list.map((url, index) => (
                            <div
                                style={{ flex: "0 0 50%", marginBottom: "10px" }}
                                key={url}
                            >
                                <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                                    <Image
                                        key={index}
                                        src={url}
                                        fit="scale-down"
                                        style={{position: "absolute", top: 0, left: 0,borderRadius: 8, width: "100%", height: "100%" }}
                                        alt={url}
                                        lazy
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Collapse.Panel>
            </Collapse>
        </div >
    );
};

export default AssetPage;