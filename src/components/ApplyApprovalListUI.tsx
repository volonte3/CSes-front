import React from "react";
import { theme, Space, Table, Button, Modal, Menu } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect, useRef  } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { ApplyApprovalData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { DateTransform } from "../utils/transformer";

interface AssetListProps {
    Assets: ApplyApprovalData[]
}
const ApplyApprovalList = () => {
    const TestData: ApplyApprovalData[] = [
        {
            Name: "小熊",
            AssetID: "123",
            ApplyID: "002",
            ApplyTime: "2023-04-18T07:47:11.258Z",
            Operation: 0,
            FromPerson: "李四",
            ToPerson: "王五",
            Applicant: "王五",
            Valid: true,
        },
        {
            Name: "披萨饼",
            AssetID: "137",
            ApplyID: "006",
            ApplyTime: "2023-04-18T07:47:11.258Z",
            Operation: 0,
            FromPerson: "李四",
            ToPerson: "王五",
            Applicant: "王五",
            Valid: false,
        },
        {
            Name: "大玩具",
            AssetID: "134",
            ApplyID: "004",
            ApplyTime: "2023-04-18T07:47:11.258Z",
            Operation: 3,
            FromPerson: "李四",
            ToPerson: "王五",
            Applicant: "王五",
            Valid: true,
        },
    ];
    const handleApproval = (type: boolean, approval_id: string) => {
        request(`/api/Asset/Approval/${LoadSessionID()}`, "POST",
            {
                "IsApproval": type,
                "Approval": [approval_id],
            }
        )
            .then(() => {
                Modal.success({
                    title: "批复成功",
                    content: type?"成功批准请求":"成功驳回请求",
                });
                ref.current?.reload();  //重新渲染表格
            })
            .catch(
                (err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "批复失败",
                            content: err.toString().substring(5),
                        });
                    }
                    ref.current?.reload(); 
                }
            );
    };
    const columns: ProColumns<ApplyApprovalData>[] = [
        {
            title: "申请编号",
            dataIndex: "ApplyID",
            key: "ApplyID",
        },
        {
            title: "资产名",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "申请者",
            dataIndex: "Applicant",
            key: "Applicant",
        },
        {
            title: "申请类型",
            dataIndex: "Operation",
            key: "Operation",
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
                }
            },
        },
        {
            title: "申请时间",
            dataIndex: "ApplyTime",
            key: "ApplyTime",
            search: false,
            render: (text: any, record) => {
                return DateTransform(text);
            },
        },
        {
            title: "操作",
            valueType: "option",
            key: "option",
            render: (text, record, _, action) => {
                return (
                    <Space>
                        <Button type="primary" disabled={!record.Valid} onClick={()=>{handleApproval(true,record.ApplyID);}}>同意申请</Button>
                        <Button danger onClick={()=>{handleApproval(false,record.ApplyID);}}>驳回申请</Button>
                    </Space>
                );
            }
        }
    ];
    const router = useRouter();
    const query = router.query;
    const ref = useRef<ActionType>();
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
    }, [router, query]);

    return (
        <ProTable
            columns={columns}
            options={{reload:true,setting:false}}
            // dataSource={TestData}
            actionRef={ref}
            request={async (params = {}) =>
                request(`/api/Asset/Approval/${LoadSessionID()}`, "GET")
                    .then(response => {    // 将request请求的对象保存到state中
                        // 对获取到的信息进行筛选，其中创建时间设为不可筛选项，描述、物品名称和所有者设为包含搜索，状态和ID设为严格搜索
                        // TODO ID到底是number还是string，前后端统一一下
                        // TODO 强等于弱等于的问题，暂时没去管
                        return Promise.resolve({ data: response.ApprovalList, success: true });
                    })
            }
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
            // scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
            pagination={{
                showSizeChanger: true
            }}
            search={false}


        // /* </ConfigProvider> */ 
        // /* </div> */ 
        />
    );
};
export default ApplyApprovalList;