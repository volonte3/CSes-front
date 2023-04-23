import React from "react";
import { theme, Space, Table, Button, Modal, Menu, Tooltip, Badge } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData, AssetDetailInfo, AssetHistory } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, TableDropdown, ProCard, ProList } from "@ant-design/pro-components";
import { DateTransform,renderStatus,renderStatusBadge } from "../utils/transformer";

interface AssetListProps {
    Assets: AssetData[]
}
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
};
const AssetList = () => {
    const [IsSomeRowCanNotDispatch, setIsSomeRowCanNotDispatch] = useState<boolean>(false);  //退还维保
    const [SelectedRows, setSelectedRows] = useState<AssetData[]>([]);
    const [Detail, setDetail] = useState<boolean>(false);
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>();
    const Historycolumns: ProColumns<AssetHistory>[] = [

        {
            title: "审批号",
            dataIndex: "ID",
            search: false
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
        },
    ];
    const columns: ProColumns<AssetData>[] = [
        {
            title: "资产编号",
            dataIndex: "ID",
            key: "ID",
        },
        {
            title: "资产名称",
            dataIndex: "Name",
            key: "Name",
            tip: "标题过长会自动收缩",
            render: (_: any, record) => {
                return (
                    <div>
                        <Tooltip title="点击查看详情">
                            <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={() => { FetchDetail(record.ID); }}>{record.Name}</a>
                        </Tooltip>
                        <Modal title="资产详细信息"
                            centered
                            open={Detail}
                            onCancel={() => { setDetail(false); }}
                            footer={[
                                <Button key="ok" type="primary" onClick={() => { setDetail(false); }}>
                                    确定
                                </Button>,
                            ]}
                            mask={false}
                            destroyOnClose={true}
                        >
                            <ProCard
                                tabs={{
                                    type: "card",
                                }}
                            >
                                <ProCard.TabPane key="Info" tab="资产信息">
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
                                </ProCard.TabPane>
                                <ProCard.TabPane key="History" tab="历史记录">
                                    <ProTable
                                        columns={Historycolumns}
                                        options={false}
                                        rowKey="ID"
                                        request={async (params = {}) =>
                                            request(`/api/User/Asset_Detail/${LoadSessionID()}/${DetailInfo?.ID}`, "GET")
                                                .then(response => {
                                                    console.log("===============", response.Asset_Detail.History);
                                                    let filteredData = response.Asset_Detail.History;
                                                    if (params.Type) {
                                                        filteredData = filteredData.filter(
                                                            (item: AssetHistory) => item.Type == params.Type
                                                        );
                                                    }
                                                    if (params.Initiator) {
                                                        filteredData = filteredData.filter(
                                                            (item: AssetHistory) => item.Initiator == params.Initiator
                                                        );
                                                    }
                                                    if (params.Asset_Admin) {
                                                        filteredData = filteredData.filter(
                                                            (item: AssetHistory) => item.Asset_Admin == params.Asset_Admin
                                                        );
                                                    }
                                                    return Promise.resolve({ data: filteredData, success: true });
                                                })
                                                .catch((err) => {

                                                    let filteredData = TestDetailInfo.History;
                                                    if (params.Type) {
                                                        filteredData = filteredData.filter(
                                                            (item: AssetHistory) => item.Type == params.Type
                                                        );
                                                    }
                                                    if (params.Initiator) {
                                                        filteredData = filteredData.filter(
                                                            (item: AssetHistory) => item.Initiator == params.Initiator
                                                        );
                                                    }
                                                    if (params.Asset_Admin) {
                                                        filteredData = filteredData.filter(
                                                            (item: AssetHistory) => item.Asset_Admin == params.Asset_Admin
                                                        );
                                                    }
                                                    return Promise.resolve({ data: filteredData, success: false });
                                                })
                                        }
                                    // dataSource={DetailInfo?.History}
                                    // search={{
                                    //     defaultCollapsed: false,
                                    //     defaultColsNumber: 1,
                                    //     split: true,
                                    //     span: 8,
                                    //     searchText: "查询"
                                    // }}
                                    />
                                </ProCard.TabPane>
                            </ProCard>

                        </Modal>
                    </div>);
            },
        },
        {
            title: "状态",
            dataIndex: "Status",
            key: "Status",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "闲置中",
                    status: "Success",
                },
                1: {
                    text: "使用中",
                    status: "Error",
                },
                2: {
                    text: "维保中",
                    status: "Warning",
                },
                3: {
                    text: "已清退",
                    status: "Processing",
                },
                4: {
                    text: "已删除",
                    status: "Default",
                    disabled: true,
                }
            },
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
        },
        {
            title: "创建时间",
            dataIndex: "CreateTime",
            key: "CreateTime",
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
                const options = [
                    { key: "receive", name: "清退", onClick: () => hanleChange([record.ID], 0) },
                    { key: "return", name: "退维", disabled: record.Status != 2, onClick: () => hanleChange([record.ID], 1) },
                    { key: "maintenance", name: "调拨", disabled: record.Status != 0 },
                ];
                const menuItems = options.map(option => (
                    <Menu.Item key={option.key} disabled={option.disabled} onClick={option.onClick}>
                        {option.name}
                    </Menu.Item>
                ));
                return (
                    <TableDropdown
                        key="actionGroup"
                        onSelect={() => action?.reload()}
                        menus={options}
                    />
                );
            },
        }
    ];
    const router = useRouter();
    const query = router.query;
    const FetchDetail = (AssetID: number) => {
        request(`/api/User/Asset_Detail/${LoadSessionID()}/${AssetID}`, "GET")
            .then(
                (res) => {
                    setDetailInfo(res.Asset_Detail);
                    setDetail(true);

                }
            )
            .catch(
                (err: string) => {
                    setDetailInfo(TestDetailInfo);
                    setDetail(true);
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "获取详情信息失败",
                            content: err.toString().substring(5),
                        });
                    }
                }
            );
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
    }, [router, query, DetailInfo]);
    const hanleChange = (AssetIDList: number[], operation: number, MoveTo: string = "", Type = "") => {
        request(`api/Asset/Manage/${LoadSessionID()}`, "POST",
            {
                "operation": operation,
                "AssetList": AssetIDList,
                "MoveTo": MoveTo,
                "Type": Type,
            }
        )
            .then(() => {

                Modal.success({
                    title: "申请成功",
                    content: "成功提交请求",
                });
            })
            .catch(
                (err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "申请失败",
                            content: err.toString().substring(5),
                        });
                    }
                }
            );
    };
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
        <ProTable
            columns={columns}
            options={{ reload: true, setting: false }}
            rowKey="ID"
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                defaultSelectedRowKeys: [],
            }}
            tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
                setIsSomeRowCanNotDispatch(selectedRows.some(row => row.Status != 0));
                setSelectedRows(selectedRows);
                console.log(selectedRowKeys, selectedRows);
                return (
                    <Space size={4}>
                        已选 {selectedRowKeys.length} 项
                        <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={onCleanSelected} >
                            取消选择
                        </a>
                    </Space>
                );
            }}
            tableAlertOptionRender={() => {
                return (
                    <Space size={16} >
                        <Button type="primary" onClick={() => hanleChange(SelectedRows.map((row: any) => row.ID), 0)}>清退资产</Button>
                        <Button type="primary" disabled={IsSomeRowCanNotDispatch}>调拨资产</Button>
                    </Space>
                );
            }}
            request={async (params = {}) =>
                request(`/api/Asset/Info/${LoadSessionID()}`, "GET")
                    .then(response => {    // 将request请求的对象保存到state中
                        // 对获取到的信息进行筛选，其中创建时间设为不可筛选项，描述、物品名称和所有者设为包含搜索，状态和ID设为严格搜索
                        // TODO ID到底是number还是string，前后端统一一下
                        // TODO 强等于弱等于的问题，暂时没去管
                        let filteredData = response.Asset;
                        console.log(filteredData);
                        if (params.Description) {
                            filteredData = filteredData.filter(
                                (item: AssetData) => item.Description.includes(params.Description)
                            );
                        }
                        if (params.Owner) {
                            filteredData = filteredData.filter(
                                (item: AssetData) => item.Owner.includes(params.Owner)
                            );
                        }
                        if (params.ID) {
                            filteredData = filteredData.filter(
                                (item: AssetData) => item.ID == params.ID
                            );
                        }
                        if (params.Name) {
                            filteredData = filteredData.filter(
                                (item: AssetData) => item.Name.includes(params.Name)
                            );
                        }
                        if (params.Status) {
                            filteredData = filteredData.filter(
                                (item: AssetData) => item.Status == params.Status
                            );
                        }
                        return Promise.resolve({ data: filteredData, success: true });
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
            scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
            pagination={{
                showSizeChanger: true
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

    );
};
export default AssetList;