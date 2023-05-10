import { ProColumns, ProList, ProTable } from "@ant-design/pro-components";
import { Badge, Button, Modal, Space, Table } from "antd";
import { ColumnsType } from "antd/lib/table/InternalTable";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { DateTransform } from "../utils/transformer";
const { Column } = Table;
interface LogData {
    ID: number;
    CreateTime: string;
    Initiator: string;
    Type: number;
    Detail: string;
}

// DateTransform(DetailInfo?.CreateTime);
const LogList = () => {
    const [activeKey, setActiveKey] = useState<React.Key | undefined>("0");
    const [PageId, setPageId] = useState(1);
    const [TotalNum, setTotalNum] = useState(0);
    const [LogList, setLogList] = useState<LogData[]>([]);
    const router = useRouter();
    const query = router.query;
    const getLog = (PageType: React.Key | undefined,PageId: number) => {
        request(
            `/api/Log/Detail/${LoadSessionID()}/${PageType}/${PageId}`,
            "GET"
        )
            .then((res) => {
                setTotalNum(res.TotalNum);
                setLogList(res.LogList);
                console.log(res.LogList);
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "获取用户信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const pagination = {
        current: PageId,
        pageSize: 20,
        total: TotalNum,
        onChange: (page: number) => {
            setPageId(page);
            getLog(activeKey, page);
        },
    };
    const columns: ProColumns<LogData>[] = [
        {
            title: "创建时间",
            dataIndex: "CreateTime",
            key: "CreateTime",
            search: false,
            render: (text: any) => {
                return DateTransform(text);
            },
        },
        {
            title: "描述",
            dataIndex: "Detail",
            key: "Detail",
        },
        {
            title: "用户",
            dataIndex: "Initiator",
            key: "Initiator",
        },
        {
            title: "类型",
            dataIndex: "Type",
            key: "Type",
            valueType: "select",
            valueEnum: {
                1: {
                    text: "登录登出",
                    status: "Processing",
                },
                2: {
                    text: "用户相关",
                    status: "Warning",
                },
                3: {
                    text: "资产相关",
                    status: "Error",
                },
                4: {
                    text: "业务实体相关",
                    status: "Default",
                }
            },
        },];
    const changeloglist = (PageType: number)=>{
        setActiveKey(PageType);
        setPageId(1);
        getLog(PageType, 1);
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        getLog(0,1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
    return (
        <>
            <Button className={activeKey=="0"? "log_title_select":"log_title"} type="text" key="0" onClick={()=>changeloglist(0)}>
                全部日志
            </Button> 
            <Button className={activeKey=="1"? "log_title_select":"log_title"} type="text" key="1" onClick={()=>changeloglist(1)}>
                登录登出
            </Button> 
            <Button className={activeKey=="2"? "log_title_select":"log_title"} type="text" key="2" onClick={()=>changeloglist(2)}>
                用户管理
            </Button>
            <Button className={activeKey=="3"? "log_title_select":"log_title"} type="text" key="3" onClick={()=>changeloglist(3)}>
                资产管理
            </Button>
            <Button className={activeKey=="4"? "log_title_select":"log_title"} type="text" key="4" onClick={()=>changeloglist(4)}>
                业务实体
            </Button>
            <ProTable style={{margin:"-18px 0px"}}dataSource={LogList} columns={columns} pagination={pagination} search={false} toolBarRender={false}>
            </ProTable>
        </>
    );
};
export default LogList;