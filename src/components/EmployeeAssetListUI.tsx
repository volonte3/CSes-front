import { ProTable, ProColumns, ProFormDateTimePicker, ModalForm, ProForm, ProFormTreeSelect, ActionType, ProList } from "@ant-design/pro-components";
import React from "react";
import { Form, Input, List, Slider, InputNumber, Select } from "antd";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { Breadcrumb, Layout, Menu, Col, Space, Table, Row, DatePicker, Modal, Button, TimePicker } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { MemberData } from "../utils/types";
import dayjs from "dayjs";

interface EmployeeAssetListProps {
    EmployeeName: string;
}
interface UrlData {
    pageSize: number;
    current?: number;
    Name?: string;
    ID?: number;
    Class?: string;
    Status?: number;
    Owner?: string;
    Prop?: string;
    PropValue?: string;
}
const { Option } = Select;

const layout = {
    labelCol: {
        // xs: {span:24},
        // sm: {sapn:7}
        flex: "100px",
    },
    wrapperCol: {
        xs: { span: 24 },
        // sm: {span:17}
        // span: "1"
    },
};

const tailLayout = {
    wrapperCol: { offset: 16, span: 8 },
};
const EmployeeAssetList = (props: EmployeeAssetListProps) => {
    const [IsSomeRowReceiveFalse, setIsSomeRowReceiveFalse] = useState<boolean>(true); // 是否能领用
    const [IsSomeRowTransfersFalse, setIsSomeRowTransfersFalse] = useState<boolean>(true);// 是否能转移
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [SelectedRows, setSelectedRows] = useState<AssetData[]>([]); // 选择的所有行
    const [AssetList, setAssetList] = useState<AssetData[]>([]); // 最初获取的资产列表
    const [MyAsset, setMyAsset] = useState(1);// 当前是否显示个人所有资产，值为1则显示个人,否则显示闲置\
    const tableRef = useRef<ActionType>();
    // 下面是资产转移Modal的部分
    const [searchText, setSearchText] = useState(""); // 搜索框中的内容
    const [selectedEmployee, setSelectedEmployee] = useState<MemberData | null>(null); // 最后选中的员工
    const [Employee, setEmployee] = useState<MemberData[] | null>(null); // 获取转移时的员工列表
    const [selectedTransferAsset, setTransferAsset] = useState<AssetData>();
    const [treeData, setAsset] = useState<[]>(); // 储存要转移到的部门的资产列表树
    const [Open1, setOpen1] = useState(false); // 判断是否需要打开资产转移的第一步Modal
    const [Open2, setOpen2] = useState(false); // 判断是否需要打开资产转移的第二步Modal
    const [form] = Form.useForm<{ class: string; }>(); // 第二个Modal的格式
    const [loading, setloading] = useState(false);
    const [OpenApplyCondition, setOpenApplyCondition] = useState(false);  //显示申请条件modal
    const [ApplyType, setApplyType] = useState(-2);  //当前申请的类型，-1: 领用所有(用于批量领用) 0：领用，1：退库，2：维保，3：转移 4:批量转移
    const [ApplyReason, setApplyReason] = useState("");  //申请理由
    const [ApplyTime, setApplyTime] = useState(""); //申请更新的截止日期，仅仅用于维保
    const [ApplyDate, setApplyDate] = useState(""); //申请更新的截止日期，仅仅用于维保
    const [ApplyVolumn, setApplyVolumn] = useState(0); //申请的量,仅用于领用数量型资产,目前的规则是，对于批量领用，统一用-1.对于单个领用，若是条目型资产，则是1，若是数量型资产
    const [NowAssetID, setNowAssetID] = useState<number[]>([]);  //当前操作资产的ID
    const [ApplyMaxVolumn, setApplyMaxVolumn] = useState(0); //允许的最大领用量，即该资产的数量
    const [ApplyAssetType, setApplyAssetType] = useState(0); //获取资产的类型0就是条目型，1就是数量型
    const fetchList = (myasset: number) => { // 传入1代表显示个人资产，传入0代表显示闲置资产
        setMyAsset(myasset);
        request(`/api/Asset/Info/${LoadSessionID()}`, "GET")
            .then(response => {
                if (myasset == 1) {
                    const newlist = response.Asset.filter((item: AssetData) => (
                        item.Owner == props.EmployeeName
                    ));
                    console.log("fetchlist 1");
                    setAssetList(newlist);
                }
                if (myasset == 0) {
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
    const renderApplyType2Apply = (apply: number) => {
        switch (apply) {
        case -1: return 0;
        case 4: return 3;
        default: return apply;
        }
    };
    const handleChange = (AssetIDList: number[], MoveTo: string = "", Type: string = "") => {
        setloading(true);
        handleMySelectedRowKeys([]);
        request(`/api/Asset/Apply/${LoadSessionID()}`, "POST",
            {
                "operation": renderApplyType2Apply(ApplyType),
                "AssetList": AssetIDList,
                "MoveTo": MoveTo,
                "Type": Type,
                "number": ApplyVolumn,
                "Time": `${ApplyDate} ${ApplyTime}`,
                "Message": ApplyReason
            }
        )
            .then(() => {
                setloading(false);
                setOpen2(false);
                setOpenApplyCondition(false);
                setApplyDate("");
                setApplyTime("");
                setApplyReason("");
                setApplyMaxVolumn(0);
                Modal.success({
                    title: "申请成功",
                    content: "成功提交请求",
                });
            })
            .catch(
                (err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        setOpenApplyCondition(false);
                        setApplyDate("");
                        setApplyTime("");
                        setApplyReason("");
                        setApplyMaxVolumn(0);
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
                        {MyAsset == 0 &&
                            <Button loading={loading} key="receive" title="领用" disabled={!IsReceive}
                                onClick={() => {
                                    setOpenApplyCondition(true);
                                    setApplyType(0);
                                    setApplyVolumn(1);
                                    setApplyMaxVolumn(record.Number);
                                    setApplyAssetType(record.Type);
                                    setNowAssetID([record.ID]);
                                }}>
                                领用
                            </Button>}
                        {MyAsset == 1 &&
                            <Button loading={loading} key="receive" title="退库" disabled={!IsReturn}
                                onClick={() => {
                                    setNowAssetID([record.ID]);
                                    setOpenApplyCondition(true);
                                    setApplyType(1);
                                }}>
                                退库
                            </Button>}
                        {MyAsset == 1 &&
                            <Button loading={loading} key="receive" title="维保" disabled={!IsMaintenance}
                                onClick={() => {
                                    setNowAssetID([record.ID]);
                                    setOpenApplyCondition(true);
                                    setApplyTime(record.Time);
                                    setApplyType(2);
                                }}>
                                维保
                            </Button>}
                        {MyAsset == 1 &&
                            <Button loading={loading} key="receive" title="转移" disabled={!IsTransfers}
                                onClick={() => {
                                    setNowAssetID([record.ID]);
                                    setOpenApplyCondition(true);
                                    setTransferAsset(record);
                                    setApplyType(3);
                                    GetMemberList("", 1);
                                }}>
                                转移
                            </Button>}
                    </Space>
                );
            },
        }
    ];
    // 分页多选相关
    const [mySelectedRowKeys, handleMySelectedRowKeys] = useState<number[]>([]);  // 选中的项目
    // 由于cancleRowKeys不影响dom，所以不使用useState定义
    let cancleRowKeys: number[] = []; // 取消选择的项目

    const onSelect = (record: AssetData, selected: any) => {
        if (!selected) {
            cancleRowKeys = [record.ID];
        }
    };

    const onMulSelect = (selected: any, selectedRows: any, changeRows: any) => {
        if (!selected) {
            cancleRowKeys = changeRows.map((item: AssetData) => item.ID);
        }
    };

    const onChange = (selectedRowKeys: any, selectedRows: any) => {
        if (cancleRowKeys.length) {
            const keys = mySelectedRowKeys.filter((item) => !cancleRowKeys.includes(item));
            handleMySelectedRowKeys(keys);
            cancleRowKeys = [];
        } else {
            const mergedRowKeys = mySelectedRowKeys.concat(selectedRowKeys);
            const uniqueRowKeys: number[] = [];
            for (const key of mergedRowKeys) {
                if (!uniqueRowKeys.includes(key)) {
                    uniqueRowKeys.push(key);
                }
            }
            handleMySelectedRowKeys(uniqueRowKeys);
        }
    };
    // 资产转移第一步modal的相关函数
    const [PageID, setPageID] = useState(1);
    const [TotalNum, setTotalNum] = useState(0);
    const GetMemberList = (Name:string,PageID: number) => {
        request(`/api/User/member/${LoadSessionID()}/${PageID}/Name=${Name}/Department=/Authority=3`, "GET")
            .then((res) => {
                setTotalNum(res.TotalNum);
                setEmployee(res.member);
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
    const handleSearch = (e: any) => {
        setSearchText(e.target.value);
        setPageID(1);
        GetMemberList(e.target.value, 1);
    };
    const handleSelectEmployee = (employee: MemberData) => {
        setSelectedEmployee(employee);
    };
    const pagination = {
        current: PageID,
        pageSize: 20,
        total: TotalNum,
        onChange: (page: number) => {
            setPageID(page);
            GetMemberList(searchText, page);
        },
    };
    const handleOk1 = () => { // 资产转移第一步的ok键，获取部门的资产分类树，同时打开第二步的modal
        request(
            "/api/Asset/DepartmentTree",
            "POST",
            {
                SessionID: LoadSessionID(),
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
    const handleChangeReason = (e: any) => {  //更新申请理由
        setApplyReason(e.target.value);
        console.log("ApplyReason", e.target.value);
    };
    const handleChangeDate = (value: any) => {
        const formattedValue = value.format("YYYY-MM-DD");
        console.log("ApplyDate", formattedValue);
        setApplyDate(formattedValue);
    };
    const handleChangeTime = (value: any) => {
        const formattedValue = value.format("HH:mm:ss");
        console.log("ApplyTime", formattedValue);
        setApplyTime(formattedValue);
    };
    const handleChangeVolumn = (newValue: any) => {
        console.log("ApplyVolumn", newValue);
        setApplyVolumn(newValue);
    };
    // 自定义属性相关
    const [PropForm] = Form.useForm();
    const onPropChange = (value: string) => {
        PropForm.setFieldsValue({ Prop: value });
    };
    const [PropList, setPropList] = useState<string[]>([]);
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
                style={{ maxWidth: 600 }}

            >
                <ProForm.Group>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginLeft: "28px" }}>
                        <Form.Item name="Prop" label="自定义属性"
                        // rules={[{ required: true, message: "属性不能为空" }]}
                        >
                            <Select
                                placeholder="选择部门下资产的自定义属性"
                                onChange={onPropChange}
                                allowClear
                                style={{ width: "100px" }}
                            >
                                {PropList.map((item) => (
                                    <Option key={item} value={item}>
                                        {item}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="PropValue" label="属性值"
                        // rules={[{ required: true, message: "属性值不能为空" }]}
                        >
                            <Input placeholder="属性值" />
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
    return (
        <div>
            <Breadcrumb className="ant-breadcrumb" style={{ margin: "5px" }}>
                <Breadcrumb.Item key={0}>
                    资产列表
                </Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ height: "15px" }}></div>
            <Button className={MyAsset == 1 ? "log_title_select" : "log_title"} type="text" key="1" onClick={() => fetchList(1)}>
                个人资产
            </Button>
            <Button className={MyAsset == 0 ? "log_title_select" : "log_title"} type="text" key="0" onClick={() => fetchList(0)}>
                部门闲置资产
            </Button>
            <ProTable className="ant-pro-table"
                columns={columns}
                options={{ reload: true, setting: false }}
                rowKey="ID"
                rowSelection={{
                    selectedRowKeys: mySelectedRowKeys,
                    onSelect,
                    onSelectMultiple: onMulSelect,
                    onSelectAll: onMulSelect,
                    onChange,
                }}
                tableAlertRender={() => {
                    return (
                        <Space size={4}>
                                已选 {mySelectedRowKeys.length} 项
                            <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={() => {
                                handleMySelectedRowKeys([]);
                            }}>
                                    取消选择
                            </a>

                        </Space>
                    );
                }}
                tableAlertOptionRender={() => {
                    return (
                        <Space size={16}>
                            {MyAsset == 0 &&
                                <Button loading={loading} type="primary" disabled={IsSomeRowReceiveFalse}
                                    onClick={() => {
                                        setNowAssetID(mySelectedRowKeys);
                                        setApplyType(-1);
                                        setApplyVolumn(-1);
                                        setOpenApplyCondition(true);
                                    }}>
                                    领用资产
                                </Button>}
                            {MyAsset == 1 &&
                                <Button type="primary" disabled={IsSomeRowTransfersFalse}
                                    onClick={() => {
                                        setApplyType(4);
                                        setOpenApplyCondition(true);
                                        GetMemberList("", 1);
                                    }}>转移资产</Button>}
                        </Space>
                    );
                }}
                actionRef={tableRef}
                request={async (params = {}) => {
                    const loadSessionID = LoadSessionID();
                    let urldata: UrlData = { pageSize: 20, current: params.current, Name: "", ID: -1, Status: -1, Class: "", Owner: "", Prop: "", PropValue: "" };
                    if (params.Name != undefined) urldata.Name = params.Name;
                    if (params.ID != undefined) urldata.ID = params.ID;
                    if (params.Status != undefined) urldata.Status = params.Status;
                    if (params.Class != undefined) urldata.Class = params.Class;
                    if (params.Owner != undefined) urldata.Owner = params.Owner;
                    if (PropForm.getFieldValue("Prop")) {
                        urldata.Prop = PropForm.getFieldValue("Prop");
                        if (PropForm.getFieldValue("PropValue")) {
                            urldata.PropValue = PropForm.getFieldValue("PropValue");
                        }
                    }
                    let url = `/api/Asset/Info/${loadSessionID}/${urldata.current}/ID=${urldata.ID}/Name=${urldata.Name}/Class=${urldata.Class}/Status=${urldata.Status}/Owner=${urldata.Owner}/Prop=${urldata.Prop}/PropValue=${urldata.PropValue}`;
                    console.log(url);
                    return (
                        request(
                            url,
                            "GET"
                        )
                            .then((res) => {
                                setPropList(res.DepartmentProp);
                                return Promise.resolve({ data: res.Asset, success: true, total: res.TotalNum });
                            })
                    );

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
                    showSizeChanger: false
                }}
                search={{
                    defaultCollapsed: false,
                    defaultColsNumber: 1,
                    split: true,
                    span: 8,
                    searchText: "查询",
                }}
                toolBarRender={() => []}
            >
            </ProTable>
            <Modal
                title="完善申请信息"
                onCancel={() => {
                    setApplyType(-1);
                    setOpenApplyCondition(false);
                    setApplyDate("");
                    setApplyTime("");
                    setApplyReason("");
                    setApplyMaxVolumn(0);

                }}
                open={OpenApplyCondition}
                onOk={
                    () => {
                        if (ApplyType === 3 || ApplyType === 4) {
                            setOpenApplyCondition(false);
                            console.log("NowAssetID!!!!!!!!!!!!", NowAssetID);
                            setOpen1(true);
                        }
                        else {
                            handleChange(NowAssetID);
                        }
                    }
                }
            >
                <Row>
                    <Col span={24}>
                        <div style={{ "display": "flex", "alignItems": "center" }}>
                            <Col span={4}>
                                <h4>申请理由</h4>
                            </Col>
                            <Col span={20}>
                                <Input
                                    placeholder="对申请解释说明"
                                    value={ApplyReason}
                                    onChange={handleChangeReason}
                                />
                            </Col>
                        </div>
                    </Col>
                    {ApplyType === 2 && <Col span={24}>

                        <div style={{ "display": "flex", "alignItems": "center" }}>
                            <Col span={6}>
                                <h4>资产截止时间</h4>
                            </Col>
                            <Col span={9}>
                                {ApplyType === 2 && <DatePicker
                                    onChange={handleChangeDate}
                                    format="YYYY-MM-DD"
                                    placeholder="年-月-日"
                                    defaultOpenValue={dayjs(ApplyTime.split(" ")[0], "YYYY-MM-DD")}
                                />}
                            </Col>
                            <Col span={9}>
                                {ApplyType === 2 && <TimePicker
                                    onChange={handleChangeTime}
                                    format="HH:mm:ss"
                                    placeholder="时-分-秒"
                                    defaultOpenValue={dayjs(ApplyTime.split(" ")[1], "HH:mm:ss")}
                                />}
                            </Col>
                        </div>
                    </Col>}
                    {ApplyType === 0 && ApplyAssetType === 1 && <Col span={24}>

                        <div style={{ "display": "flex", "alignItems": "center" }}>

                            <Col span={4}>
                                <h4> 申请数量 </h4>
                            </Col>
                            <Col span={12}>
                                <Slider
                                    min={1}
                                    max={ApplyMaxVolumn}
                                    onChange={handleChangeVolumn}
                                    defaultValue={1}
                                    value={typeof ApplyVolumn === "number" ? ApplyVolumn : 0}
                                />
                            </Col>
                            <Col span={8}>
                                <InputNumber
                                    min={1}
                                    max={ApplyMaxVolumn}
                                    style={{ margin: "0 16px" }}
                                    value={ApplyVolumn}
                                    defaultValue={1}
                                    onChange={handleChangeVolumn}
                                />
                            </Col>
                        </div>
                    </Col>}
                </Row>
            </Modal>
            <Modal
                title="请选择要转移到的员工"
                bodyStyle={{ padding: "20px" }}
                open={Open1}
                onCancel={() => setOpen1(false)}
                onOk={handleOk1}
                okButtonProps={{ disabled: !selectedEmployee }}
                okText="下一步"
            >
                <Input placeholder="搜索员工名称" value={searchText} onChange={handleSearch} />
                <ProList
                    dataSource={Employee ? Employee : []}
                    renderItem={item => (
                        <List.Item
                            onClick={() => handleSelectEmployee(item)}
                            className={`employee-item ${selectedEmployee && selectedEmployee.Name === item.Name ? "selected" : ""}`}
                        >
                            <div className="employee-name">{item.Name}</div>
                            <div className="department">{item.Department}</div>
                        </List.Item>
                    )}
                    pagination={pagination}
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
                    onCancel: () => { setOpen2(false); setOpen1(true); },
                }}
                submitTimeout={1000}
                open={Open2}
                loading={loading}
                onFinish={async (values) => {
                    if (SelectedRows.length > 0) {
                        console.log("SelectedRows", SelectedRows);
                        setApplyType(3);
                        handleChange(mySelectedRowKeys, selectedEmployee?.Name, values.class);
                    }
                    else {
                        console.log("selectedTransferAsset", selectedTransferAsset);
                        setNowAssetID([selectedTransferAsset ? selectedTransferAsset.ID : 0]);
                        setApplyType(3);
                        handleChange(NowAssetID, selectedEmployee?.Name, values.class);
                    }
                    if (tableRef.current?.clearSelected) tableRef.current?.clearSelected();
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