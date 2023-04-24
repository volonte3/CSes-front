import React, { useRef } from "react";
import { theme, Space, Table, Button, Modal, Menu, Tooltip, Badge, Form, Select, Input, List } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData, AssetDetailInfo, AssetHistory, MemberData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, TableDropdown, ProCard, ProList, ProForm, ModalForm, ProFormTreeSelect, ActionType } from "@ant-design/pro-components";
import { DateTransform, renderStatus, renderStatusBadge } from "../utils/transformer";

interface AssetListProps {
    ManagerName: string;
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
const TestPropList: string[] = ["a", "b", "c", "d"];
const { Option } = Select;

const layout = {
    labelCol: { span:8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 16, span: 8 },
};
const AssetList = (props:AssetListProps) => {
    const [IsSomeRowCanNotDispatch, setIsSomeRowCanNotDispatch] = useState<boolean>(false);  //退还维保
    const [SelectedRows, setSelectedRows] = useState<AssetData[]>([]);
    const [Detail, setDetail] = useState<boolean>(false);
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>();
    const [PropList, setPropList] = useState<string[]>([]);
    const tableRef = useRef<ActionType>(null);
    // 资产调拨的内容
    const [searchText, setSearchText] = useState(""); // 搜索框中的内容
    const [selectedEmployee, setSelectedEmployee] = useState<MemberData | null>(null); // 最后选中的员工
    const [Employee, setEmployee] = useState<MemberData[] | null>(null); // 获取转移时的员工列表
    const [selectedTransferAsset, setTransferAsset] = useState<AssetData>();
    const [treeData, setAsset] = useState<[]>(); // 储存要转移到的部门的资产列表树
    const [Open1, setOpen1] = useState(false); // 判断是否需要打开资产转移的第一步Modal
    const [Open2, setOpen2] = useState(false); // 判断是否需要打开资产转移的第二步Modal
    const [form] = Form.useForm<{class: string;}>(); // 第二个Modal的格式
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
            render: (text: any, record) => {
                console.log(text);
                // TODO 不是很理解如果返回值为 undefined，前端默认会解析为 -
                return (text != "-") ? DateTransform(text) : "-";
            },
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
            tip: "点击资产可查看详情信息",
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
                    { key: "maintenance", name: "调拨", disabled: record.Status != 0, onClick:()=>{setOpen1(true);setTransferAsset(record);GetMemberList();}},
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
    const [PropForm] = Form.useForm();
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
        request(`/api/Asset/Manage/${LoadSessionID()}`, "POST",
            {
                "operation": operation,
                "AssetList": AssetIDList,
                "MoveTo": MoveTo,
                "Type": Type,
            }
        )
            .then(() => {
                Modal.success({
                    title: "操作成功",
                    content: "成功更改资产状态",
                });
                tableRef.current?.reload();
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
    const onPropChange = (value: string) => {
        PropForm.setFieldsValue({ Prop: value });
    };

    const onFinish = (values: any) => {
        console.log(values);

    };

    const onReset = () => {
        console.log(PropForm.getFieldValue("Prop"), PropForm.getFieldValue("PropValue"));
        PropForm.resetFields();
    };
    const PropSearch = () => {
        return (
            <Form
                {...layout}
                form={PropForm}
                name="control-hooks"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}

            >
                <ProForm.Group>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Form.Item name="Prop" label="自定义属性" rules={[{ required: true }]} >
                            <Select
                                placeholder="选择部门下资产的自定义属性"
                                onChange={onPropChange}
                                allowClear
                            >
                                {PropList.map((item) => (
                                    <Option key={item} value={item}>
                                        {item}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="PropValue" label="属性值" rules={[{ required: true }]} >
                            <Input />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button htmlType="button" onClick={onReset}>
                                重置
                            </Button>
                        </Form.Item>
                    </div>
                </ProForm.Group>
            </Form>
        );
    };
    // 资产转移第一步modal的相关函数
    const GetMemberList = () => {
        request(`/api/User/member/${LoadSessionID()}`, "GET")
            .then((res) => {
                const members = res.member.filter((item: MemberData) =>(item.Name != props.ManagerName && item.Authority == 2));
                console.log(members);
                setEmployee(members);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "无权获取用户列表",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                }
            });
    };
    const handleSearch = (e:any) => {
        setSearchText(e.target.value);
    };
    const handleSelectEmployee = (employee:MemberData) => {
        setSelectedEmployee(employee);
    };
    const filteredData = Employee ? Employee.filter(
        item =>
            (item.Name.includes(searchText) ||
      item.Department.includes(searchText))
    ):[];
    const handleOk1 = () => { // 资产转移第一步的ok键，获取部门的资产分类树，同时打开第二步的modal
        request(
            "/api/Asset/DepartmentTree",
            "POST",
            {
                SessionID:LoadSessionID(),
                UserName: selectedEmployee?.Name,
            }
        )
            .then((res) => {
                setAsset(res.treeData);
                console.log(res.treeData);
            })
            .catch((err) => {
                Modal.error({
                    title: "错误",
                    content: err.message.substring(5),
                });
            });
        setOpen1(false);
        setOpen2(true);
    };
    return (
        <>
            <PropSearch />
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
                            <Button type="primary" disabled={IsSomeRowCanNotDispatch} onClick={() => { setOpen1(true); GetMemberList();}}>调拨资产</Button>
                        </Space>
                    );
                }}
                actionRef={tableRef}
                request={async (params = {}) => {
                    const loadSessionID = LoadSessionID();
                    let url = `/api/Asset/Info/${loadSessionID}`;
                    if (PropForm.getFieldValue("Prop") && PropForm.getFieldValue("PropValue")) {
                        url += `/${PropForm.getFieldValue("Prop")}/${PropForm.getFieldValue("PropValue")}`;
                    }
                    return (request(url, "GET")
                        .then(response => {    // 将request请求的对象保存到state中
                            // 对获取到的信息进行筛选，其中创建时间设为不可筛选项，描述、物品名称和所有者设为包含搜索，状态和ID设为严格搜索
                            // TODO ID到底是number还是string，前后端统一一下
                            // TODO 强等于弱等于的问题，暂时没去管
                            // setPropList(response.DepartmentProp);
                            setPropList(TestPropList);
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
                        }));
                }


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
            <Modal
                title="请选择要转移到的管理员"
                bodyStyle={{ padding: "20px" }}
                visible={Open1}
                onCancel={() => setOpen1(false)}
                onOk={handleOk1}
                okButtonProps={{ disabled: !selectedEmployee }}
                okText="下一步"
            >
                <Input placeholder="搜索员工或部门名称" value={searchText} onChange={handleSearch} />
                <List
                    dataSource={filteredData}
                    renderItem={item => (
                        <List.Item
                            onClick={() => handleSelectEmployee(item)}
                            className={`employee-item ${selectedEmployee && selectedEmployee.Name === item.Name ? "selected" : ""}`}
                        >
                            <div className="employee-name">{item.Name}</div>
                            <div className="department">{item.Department}</div>
                        </List.Item>
                    )}
                    pagination={{
                        pageSize: 20
                    }}
                />
            </Modal>
            <ModalForm<{
            class: string;
            }>
                title="请选择资产分类"
                form={form}
                autoFocusFirstInput
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {setOpen2(false);setOpen1(true);},
                }}
                submitTimeout={1000}
                open={Open2}
                onFinish={async (values) => {
                    if(SelectedRows.length > 0) hanleChange(SelectedRows.map((row: any) => row.ID),2,selectedEmployee?.Name,values.class);
                    else hanleChange([selectedTransferAsset?selectedTransferAsset.ID:0],2,selectedEmployee?.Name,values.class);
                    setOpen2(false);
                    if(tableRef.current?.clearSelected)tableRef.current?.clearSelected();
                    return true;
                }}
            >
                <ProForm.Group>
                    <ProFormTreeSelect
                        label="资产分类"
                        name="class"
                        width="lg"
                        rules={[{ required: true, message: "这是必选项" }]} 
                        fieldProps={{
                            fieldNames: {
                                label: "title",
                            },
                            treeData,
                            placeholder: "请选择资产分类",
                        }}
                    />
                </ProForm.Group>
                
            </ModalForm>
        </>
    );
};
export default AssetList;