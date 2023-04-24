import { ProTable, ProColumns, TableDropdown, ModalForm, ProForm, ProFormTreeSelect, ActionType } from "@ant-design/pro-components";
import React from "react";
import { Form, Input, List, MenuProps } from "antd";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Radio } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { MemberData } from "../utils/types";


interface EmployeeAssetListProps {
    EmployeeName: string;
}
const EmployeeAssetList = (props:EmployeeAssetListProps) => {
    const [IsSomeRowReceiveFalse, setIsSomeRowReceiveFalse] = useState<boolean>(true); // 是否能领用
    const [IsSomeRowTransfersFalse, setIsSomeRowTransfersFalse] = useState<boolean>(true);// 是否能转移
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [SelectedRows, setSelectedRows] = useState<AssetData[]>([]); // 选择的所有行
    const [AssetList, setAssetList] = useState<AssetData[]>([]); // 最初获取的资产列表
    const [MyAsset, setMyAsset] = useState(1);// 当前是否显示个人所有资产，值为1则显示个人,否则显示闲置\
    const tableRef = useRef<ActionType>(null);
    // 下面是资产转移Modal的部分
    const [searchText, setSearchText] = useState(""); // 搜索框中的内容
    const [selectedEmployee, setSelectedEmployee] = useState<MemberData | null>(null); // 最后选中的员工
    const [Employee, setEmployee] = useState<MemberData[] | null>(null); // 获取转移时的员工列表
    const [selectedTransferAsset, setTransferAsset] = useState<AssetData>();
    const [treeData, setAsset] = useState<[]>(); // 储存要转移到的部门的资产列表树
    const [Open1, setOpen1] = useState(false); // 判断是否需要打开资产转移的第一步Modal
    const [Open2, setOpen2] = useState(false); // 判断是否需要打开资产转移的第二步Modal
    const [form] = Form.useForm<{class: string;}>(); // 第二个Modal的格式
    const fetchList = (myasset: number) => { // 传入1代表显示个人资产，传入0代表显示闲置资产
        setMyAsset(myasset);
        request(`/api/Asset/Info/${LoadSessionID()}`, "GET")
            .then(response => {
                if(myasset==1) {
                    const newlist = response.Asset.filter((item: AssetData) => (
                        item.Owner == props.EmployeeName
                    ));
                    console.log("fetchlist 1");
                    setAssetList(newlist);
                }
                if(myasset==0) {
                    const newlist = response.Asset.filter((item: AssetData) => (
                        item.Owner != props.EmployeeName && item.Status == 0
                    ));
                    console.log("fetchlist 1");
                    setAssetList(newlist);
                }
            });
        console.log("fetchlist");
    };
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, props]);
    // 核心的提交函数，对应资产申请api
    const handleChange = (AssetIDList: number[], operation: number, MoveTo: string = "", Type: string="") => {
        request(`/api/Asset/Apply/${LoadSessionID()}`, "POST",
            {
                "operation": operation,
                "AssetList": AssetIDList,
                "MoveTo": MoveTo,
                "Type": Type
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
    // 资产列表的column定义
    const columns: ProColumns<AssetData>[] = [
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
            title: "描述",
            dataIndex: "Description",
            key: "Description",
        },
        {
            title: "操作",
            valueType: "option",
            key: "option",
            render: (text, record, _, action) => {
                const { IsReceive, IsReturn, IsMaintenance, IsTransfers } = record;
                return (
                    <Space>
                        {MyAsset==0 && <Button key= "receive" title= "领用" disabled={!IsReceive} onClick={()=>handleChange([record.ID], 0)}>领用</Button>}
                        {MyAsset==1 && <Button key= "receive" title= "退库" disabled={!IsReturn} onClick={()=>handleChange([record.ID], 1)}>退库</Button>}
                        {MyAsset==1 && <Button key= "receive" title= "维保" disabled={!IsMaintenance} onClick={()=>handleChange([record.ID], 2)}>维保</Button>}
                        {MyAsset==1 && <Button key= "receive" title= "转移" disabled={!IsTransfers} onClick={()=>{setOpen1(true);setTransferAsset(record);GetMemberList();}}>转移</Button>}
                    </Space>
                );
            },
        }
    ];
    // 资产转移第一步modal的相关函数
    const GetMemberList = () => {
        request(`/api/User/member/${LoadSessionID()}`, "GET")
            .then((res) => {
                const newmembers = res.member.filter((item: MemberData) =>(item.Name != props.EmployeeName));
                // const Member = JSON.parse(res.jsonString) as MemberData;
                setEmployee(newmembers);
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
      item.Department.includes(searchText)) && item.Authority == 3
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
    console.log(AssetList);
    return (
        <div>
            <Breadcrumb className="ant-breadcrumb">
                <Breadcrumb.Item key={0}>
                    {MyAsset==1?"个人资产":"部门闲置资产"}
                </Breadcrumb.Item>
            </Breadcrumb>
            {MyAsset == 1 && <Button
                type="primary"
                style={{ float: "left", margin: 10 }}
                onClick={() => {fetchList(0);}}
            >
                显示部门闲置资产
            </Button>}
            {MyAsset == 0 && <Button
                type="primary"
                style={{ float: "left", margin: 10 }}
                onClick={() => {fetchList(1);}}
            >
                显示个人资产
            </Button>}
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
                actionRef={tableRef}
                tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => {
                    setIsSomeRowReceiveFalse(selectedRows.some(row => !row.IsReceive));
                    setIsSomeRowTransfersFalse(selectedRows.some(row => !row.IsTransfers));
                    setSelectedRows(selectedRows);
                    console.log(selectedRowKeys, selectedRows);
                    return (
                        <Space size={4}>
                            已选 {selectedRowKeys.length} 项
                            <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={onCleanSelected}>
                                取消选择
                            </a>
                        </Space>
                    );
                }}
                tableAlertOptionRender={() => {
                    return (
                        <Space size={16}>
                            {MyAsset==0 && <Button type="primary" disabled={IsSomeRowReceiveFalse} onClick={() => { handleChange(SelectedRows.map((row: any) => row.ID), 0);if(tableRef.current?.clearSelected)tableRef.current?.clearSelected();} }>领用资产</Button>}
                            {MyAsset==1 && <Button type="primary" disabled={IsSomeRowTransfersFalse} onClick={() => { setOpen1(true); GetMemberList();}}>转移资产</Button>}
                        </Space>
                    );
                }}
                dataSource={AssetList}
                pagination={{
                    showSizeChanger: true
                }}
                search={false}
            >
            </ProTable>
            <Modal
                title="请选择要转移到的员工"
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
                    if(SelectedRows.length > 0) handleChange(SelectedRows.map((row: any) => row.ID),3,selectedEmployee?.Name,values.class);
                    else handleChange([selectedTransferAsset?selectedTransferAsset.ID:0],3,selectedEmployee?.Name,values.class);
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
        </div>
    );
};
export default EmployeeAssetList;