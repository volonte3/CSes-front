import { ActionType, ParamsType, ProColumns, ProList, ProTable } from "@ant-design/pro-components";
import { Badge, Button, Modal, Space, Table, Descriptions } from "antd";
import { ColumnsType } from "antd/lib/table/InternalTable";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { DateTransform } from "../utils/transformer";
const { Column } = Table;
interface AssetWarnData {
    Name:string;
    ID: number;
    AssetType: number;
    WarnType: number;
    WarnStrategy: string;
    Description: string;
}
interface UrlData {
    Name?:string;
    AssetType?: number;
    WarnType?: number;
    pageSize:number;
    current: number;
}

// DateTransform(DetailInfo?.CreateTime);
const AssetWarnList = () => {
    const [activeKey, setActiveKey] = useState<React.Key | undefined>("0");
    const [PageId, setPageId] = useState(1);
    const [TotalNum, setTotalNum] = useState(0);
    const [AssetList, setAssetList] = useState<AssetWarnData[]>([]);
    const router = useRouter();
    const query = router.query;
    const tableRef = useRef<ActionType>(null);
    // const getList = (PageType: React.Key | undefined,PageId: number) => {
    //     request(
    //         `/api/Asset/Warn/${LoadSessionID()}/${PageType}/${PageId}`,
    //         "GET"
    //     )
    //         .then((res) => {
    //             setTotalNum(res.TotalNum);
    //             setAssetList(res.AssetList);
    //         })
    //         .catch((err: string) => {
    //             if (IfCodeSessionWrong(err, router)) {
    //                 Modal.error({
    //                     title: "获取用户信息失败",
    //                     content: err.toString().substring(5),
    //                 });
    //             }
    //         });
    // };
    // const pagination = {
    //     current: PageId,
    //     pageSize: 20,
    //     total: TotalNum,
    //     onChange: (page: number) => {
    //         setPageId(page);
    //         getList(activeKey, page);
    //     },
    // };
    const columns: ProColumns<AssetWarnData>[] = [
        {
            title: "资产名称",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "类型",
            dataIndex: "AssetType",
            key: "AssetType",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "条目型",
                    status: "Error",
                },
                1: {
                    text: "数量型",
                    status: "Warning",
                },
            },
        },
        {
            title: "告警策略",
            dataIndex: "WarnType",
            key: "WarnType",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "数量告警",
                    status: "Error",
                },
                1: {
                    text: "年限告警",
                    status: "Warning",
                },
                2: {
                    text: "无告警策略",
                    status: "Warning",
                },
            },
        },
        {
            title: "具体告警策略",
            dataIndex: "WarnStrategy",
            key: "WarnStrategy",
        },
        {
            title: "描述",
            dataIndex: "Description",
            key: "Description",
        },
        {
            title: "操作",
            valueType: "option",
            key: "option",
            render: (text, record, _, action) => {
                return (
                    <Button loading = {loading} key= "receive" title= "领用" disabled={!IsReceive} onClick={()=>handleChange([record.ID], 0)}>领用</Button>
                );
            },
        }
    ];
    // const changeloglist = (PageType: number)=>{
    //     setActiveKey(PageType);
    //     setPageId(1);
    //     getLog(PageType, 1);
    // };

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // getLog(0,1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
    return (
        <>
            {/* <Button className={activeKey=="0"? "log_title_select":"log_title"} type="text" key="0" onClick={()=>changeassetlist(0)}>
                告警资产
            </Button> 
            <Button className={activeKey=="1"? "log_title_select":"log_title"} type="text" key="1" onClick={()=>changeassetlist(1)}>
                全部资产
            </Button>  */}
            <ProTable className="ant-pro-table"
                columns={columns}
                options={{ reload: true, setting: false }}
                rowKey="ID"
                actionRef={tableRef}
                request={async (params = {}) => {
                    const loadSessionID = LoadSessionID();
                    let urldata:UrlData={pageSize:20, current:PageId, Name:"", AssetType:-1, WarnType:-1};
                    if(params.Name) urldata.Name=params.Name;
                    if(params.AssetType) urldata.AssetType=params.AssetType;
                    if(params.WarnType) urldata.WarnType=params.WarnType;
                    let url = `/api/Asset/Warn/${loadSessionID}/${activeKey}/${urldata.current}
                               /Name=${urldata.Name}/AssetType=${urldata.Name}/WarnType=${urldata.WarnType}`;
                    return (request(url, "GET")
                        .then(res => {    
                            setTotalNum(res.TotalNum);
                            setAssetList(res.AssetList);
                            let filteredData = res.AssetList;
                            return Promise.resolve({ data: filteredData, success: true });
                        }));
                }


                }
                scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
                pagination={{
                    showSizeChanger: false
                }}
                search={{
                    defaultCollapsed: false,
                    defaultColsNumber: 1,
                    split: true,
                    span: 8,
                    searchText: "查询"
                }}
                toolBarRender={() => []}
            />
        </>
    );
};
export default AssetWarnList;