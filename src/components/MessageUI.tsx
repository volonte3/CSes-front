import React, { useRef } from "react";
import { theme, Form, Modal, Button, Space, Breadcrumb} from "antd";
import {
    FormOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { 
    ProTable, 
    ProColumns, 
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormSelect,
    ProFormMoney,
    ActionType,
} from "@ant-design/pro-components";
import { DateTransform } from "../utils/transformer";
interface MessageData {
    Time: string;
    Detail: string;
    Is_Read:boolean;
    ID: number;
}
const MessageUI = () => {
    const [MessageList, setMessageList] = useState<MessageData[]>();
    const [changekey, setchangekey] = useState(Date.now());
    const [newinfo, setnewinfo] = useState(true);
    const tableRef = useRef<ActionType>();
    const [loading, setloading] = useState(false);
    const columns: ProColumns<MessageData>[] = [
        {
            title: "消息编号",
            dataIndex: "ID",
            key: "ID",
        },
        {
            title: "状态",
            dataIndex: "Is_Read",
            key: "Is_Read",
            valueType: "select",
            valueEnum: {
                true: {
                    text: "已读",
                    status: "Success",
                },
                false: {
                    text: "未读",
                    status: "Error",
                }
            },
        },
        {
            title: "描述",
            dataIndex: "Detail",
            key: "Detail",
        },
        {
            title: "时间",
            dataIndex: "Time",
            key: "Time",
            search: false,
            render: (text: any, record) => {
                return DateTransform(text);
            },
        },
        {
            title: "操作",
            dataIndex: "",
            key: "",
            render: (_: any, record) => {
                if(record.Is_Read == false){
                    return (
                        <Button loading={loading} type="primary" key = "0" onClick={()=>handleChange(record.ID)}>设为已读</Button>
                    );
                }
                else if(record.Is_Read == true){
                    return (
                        <Button loading={loading} key = "0" onClick={()=>handleChange(record.ID)}>设为未读</Button>
                    );
                }
                    
            },
        },
    ];
    const router = useRouter();
    const query = router.query;
    const fetchList = (all:number) => {
        if (all == 0) {
            request(`/api/User/Message/New/${LoadSessionID()}`, "GET")
                .then((res) => {
                    setMessageList(res.Message);
                    setchangekey(Date.now());
                })
                .catch((err) => {
                    console.log(err.message);
                    Modal.error({
                        title: "无权获取对应信息",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                });
        }
        else {
            request(`/api/User/Message/All/${LoadSessionID()}`, "GET")
                .then((res) => {
                    setMessageList(res.Message);
                    setchangekey(Date.now());
                })
                .catch((err) => {
                    console.log(err.message);
                    Modal.error({
                        title: "无权获取对应信息",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                });
        }
    };
    const handleChange = (ID:number) => {
        setloading(true);
        request(`/api/User/Message/New/${LoadSessionID()}`, "PUT",
            {
                "ID":ID
            }
        )
            .then(() => {
                Modal.success({
                    title: "操作成功",
                    content: "成功更改消息状态",
                });
                setloading(false);
                if(newinfo) fetchList(0);
                else fetchList(1);
            })
            .catch(
                (err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "操作失败",
                            content: err.toString().substring(5),
                        });
                    }
                    setloading(false);
                }
            );
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        fetchList(0);
    }, [router, query]);
    const themeConfig = {
        token: {
            colorPrimary: "red",
            borderRadius: 4,
            // TODO 可以验证下是否透明也行
            colorBgElevated: "white",
        },
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    };
    return (
        <div className="Div">
            <Breadcrumb style={{ margin: "16px 0" }}>
                <Breadcrumb.Item>消息列表</Breadcrumb.Item>
                {newinfo && <Breadcrumb.Item>最新消息</Breadcrumb.Item>}
                {!newinfo && <Breadcrumb.Item>全部消息</Breadcrumb.Item>}
            </Breadcrumb>
            <ProTable
                key={changekey}
                columns={columns}
                actionRef={tableRef}
                options={false}
                rowKey="ID"
                dataSource={MessageList}
                form={{
                // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                    syncToUrl: (values, type) => {
                        if (type === "get") {
                            return {
                                ...values,
                                created_at: [values.startTime, values.endTime],
                            };
                        }
                        return values;
                    },
                }}
                scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
                pagination={{
                    showSizeChanger: true
                }}
                search={false} />
            <Space size="large">
                {newinfo && <Button onClick={() => { setnewinfo(false);fetchList(1);}}>更多信息</Button>}
                {!newinfo && <Button onClick={() => { setnewinfo(true);fetchList(0);}}>最新信息</Button>}
                <Button onClick={() => handleChange(-1)}>全部已读</Button>
            </Space>
            
        </div>
    );
};
export default MessageUI;