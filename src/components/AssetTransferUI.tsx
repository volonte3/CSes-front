import { useEffect, useState } from "react";
import { List, Modal, Input, Form } from "antd";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { MemberData } from "../utils/types";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormTreeSelect,
    ProFormSelect,
    ProFormMoney,
    ProList,
} from "@ant-design/pro-components";
interface emloyedata{
    id: number;
    name: string;
    department: string;
}
const data = [
    {
        id: 1,
        name: "张三",
        department: "技术部"
    },
    {
        id: 2,
        name: "李四",
        department: "市场部"
    },
    {
        id: 3,
        name: "王五",
        department: "财务部"
    },
    {
        id: 4,
        name: "王五",
        department: "财务部"
    },
    {
        id: 5,
        name: "王五",
        department: "财务部"
    },
    {
        id: 6,
        name: "王五",
        department: "财务部"
    },
];
interface employeeprops{
    visible: boolean;
    onCancel: () => void;
    onOk: (employee: MemberData | null) => void
}
const EmployeeListModal = (props: employeeprops) => {
    const [searchText, setSearchText] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<MemberData | null>(null);
    const [Employee, setEmployee] = useState<MemberData[] | null>(null);
    const [open1, setOpen1] = useState(props.visible);
    const [open2, setOpen2] = useState(false);
    const [treeData, setAsset] = useState<[]>(); // 储存资产列表树
    const [form] = Form.useForm<{class: string;}>();
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        console.log("md");
        setOpen1(props.visible);
        request(`/api/User/member/${LoadSessionID()}`, "GET")
            .then((res) => {
                // const Member = JSON.parse(res.jsonString) as MemberData;
                setEmployee(res.member);
            })
            .catch((err) => {
                console.log(err.message);
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "无权获取用户列表",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                }
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, props]);
    const handleSearch = (e:any) => {
        setSearchText(e.target.value);
    };

    const handleSelectEmployee = (employee:MemberData) => {
        setSelectedEmployee(employee);
    };

    const handleOk1 = () => {
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

    const filteredData = Employee ? Employee.filter(
        item =>
            (item.Name.includes(searchText) ||
      item.Department.includes(searchText)) && item.Authority == 3
    ):[];

    return (
        <>
            <Modal
                title="请选择要转移到的员工"
                bodyStyle={{ padding: "20px" }}
                visible={open1}
                onCancel={props.onCancel}
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
                open={open2}
                
                // onFinish={async (values) => {
                //     await waitTime(1000);
                //     AddList.push(
                //         {
                //             id: AssetID.toString(),
                //             name: values.name,
                //             class: values.class,
                //             father: values.father,
                //             count: values.count,
                //             money: values.money,
                //             position: values.position,
                //             describe: values.describe,
                //         }
                //     );
                //     setAssetID((e) => (e+1));
                //     setChange((e) => !e);
                //     return true;
                // }}
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

export default EmployeeListModal;