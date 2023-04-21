import React from "react";
import { theme, Space, Table, Button, Modal, Menu } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, TableDropdown } from "@ant-design/pro-components";
import { DateTransform } from "../utils/transformer";

interface AssetListProps {
    Assets: AssetData[]
}
const AssetList = () => {
    const [IsSomeRowReceiveFalse, setIsSomeRowReceiveFalse] = useState<boolean>(true);
    const [IsSomeRowTransfersFalse, setIsSomeRowTransfersFalse] = useState<boolean>(true);
    const [SelectedRows, setSelectedRows] = useState<AssetData[]>([]);
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
                const { IsReceive, IsReturn, IsMaintenance, IsTransfers } = record;
                const options = [
                    { key: "receive", name: "领用", disabled: !IsReceive,onClick: ()=>hanleChange([record.ID], 0,"")},
                    { key: "return", name: "退库", disabled: !IsReturn,onClick: ()=>hanleChange([record.ID], 1,"")},
                    { key: "maintenance", name: "维保", disabled: !IsMaintenance, onClick: ()=>hanleChange([record.ID], 2,"") },
                    { key: "transfers", name: "转移", disabled: !IsTransfers},
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
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
    }, [router, query]);
    const hanleChange = (AssetIDList: number[], operation: number, MoveTo: string) => {
        console.log("11111111111",AssetIDList);
        request(`/api/Asset/Apply/${LoadSessionID()}`, "POST",
            {
                "operation": operation,
                "AssetList": AssetIDList,
                "MoveTo": MoveTo,
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
            options={false}
            rowKey="ID"
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                defaultSelectedRowKeys: [],
            }}
            tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
                setIsSomeRowReceiveFalse(selectedRows.some(row => !row.IsReceive));
                setIsSomeRowTransfersFalse(selectedRows.some(row => !row.IsTransfers));
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
                        <Button type="primary" disabled={IsSomeRowReceiveFalse} onClick={() => hanleChange(SelectedRows.map((row: any) => row.ID), 0,"")}>领用资产</Button>
                        <Button type="primary" disabled={IsSomeRowTransfersFalse}>转移资产</Button>
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
        />
    );
};
export default AssetList;