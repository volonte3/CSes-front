import React from "react";
import {
    FileOutlined, PlusSquareOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Radio } from "antd";
import type { RadioChangeEvent } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";
import MenuItem from "antd/es/menu/MenuItem";
import { renderAuthority } from "../utils/transformer";
import type { ColumnsType } from "antd/es/table";
interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
interface MemberListProps {
    Members: MemberData[] | undefined;
    department_page: boolean;
}
const plainOptions = ["Apple", "Pear"];
const options = [
    { label: "资产管理员", value: 2 },
    { label: "普通用户", value: 3 },
];
const MemberList = (props: MemberListProps) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [ChangeAuthorityValue, setChangeAuthorityValue] = useState(2);
    const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState(false);
    const [isRemakeModalOpen, setIsRemakeModalOpen] = useState(false);
    const [NowUser, setNowUser]  =useState("");
    const [NowAuthority,setNowAuthority] = useState("");
    const [LockLoading,setLockLoading] = useState(false);
    
    const showRemakeModal = (UserName:string,Authority:number) => {
        setNowUser(UserName);
        setNowAuthority(renderAuthority(Authority));
        setIsRemakeModalOpen(true);
    };

    const handleRemakeOk = () => {
        setIsRemakeModalOpen(false);
    };

    const handleRemakeCancel = () => {
        setIsRemakeModalOpen(false);
    };
    const showAuthorityModal = () => {
        setIsAuthorityModalOpen(true);
    };

    const handleAuthorityOk = () => {
        setIsAuthorityModalOpen(false);
    };

    const handleAuthorityCancel = () => {
        setIsAuthorityModalOpen(false);
    };
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const onChange3 = ({ target: { value } }: RadioChangeEvent) => {
        console.log("radio3 checked", value);
        setChangeAuthorityValue(value);
    };
    const hasSelected = selectedRowKeys.length > 0;
    const RemakePassword = (username: string) => {
        // 重置密码操作，将用户输入的旧密码重新生成到<一个固定值>
        request(
            "/api/User/RemakePassword",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .then(() => {
                Modal.success({
                    title: "成功",
                    content: "密码已重置为yiqunchusheng",
                });
                handleRemakeOk();
            })
            .catch((err: string) => {
                Modal.error({
                    title: "重置失败",
                    content: err.toString().substring(5),
                });
            });
    };
    const ChangeAuthority = (username: string,value:number) => {
        request(
            "/api/User/ChangeAuthority",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
                Authority: value,
            }
        )
            .then(() => {
                Modal.success({
                    title: "成功",
                    content: `身份已设为${renderAuthority(value)}$`,

                });
                handleAuthorityOk();
            })
            .catch((err: string) => {
                Modal.error({
                    title: "设置失败",
                    content: err.toString().substring(5),
                });
            });
    };
    const ChangeLock = (username: string)=>{
        setLockLoading(true);
        request(
            "/api/User/lock",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .then(() => {
                setLockLoading(false);
            })
            .catch((err: string) => {
                Modal.error({
                    title: "解锁/锁定失败",
                    content: err.toString().substring(5),
                });
                setLockLoading(false);
            });
    };
    return (
        <div>
            <Table rowSelection={props.department_page ? rowSelection : undefined} dataSource={props.Members}>
                <Column title="姓名" dataIndex="Name" key="Name" />
                <Column title="所属部门" dataIndex="Department" key="Department" />
                <Column
                    title="身份"
                    dataIndex="Authority"
                    key="Authority"
                    render={(Authority) => (
                        <Tag color="blue" key={Authority}>{renderAuthority(Authority)}</Tag>
                    )}
                />
                <Column
                    title="管理"
                    key="action"
                    render={(_: any, record: MemberData) => (
                        <Space size="middle">
                            <Switch checkedChildren="解锁" unCheckedChildren="锁定" onChange={()=>{ChangeLock(record.Name);}} checked= {record.lock} loading={LockLoading}/>
                            <Button danger onClick={()=>{showRemakeModal(record.Name,record.Authority);}}>重置密码</Button>
                            <Modal title="重置密码" open={isRemakeModalOpen} onOk={()=>{RemakePassword(record.Name);}} onCancel={handleRemakeCancel}>
                                将 {NowAuthority} {NowUser} 密码重置为 yiqunchusheng
                            </Modal>
                            <Button type="primary" onClick={showAuthorityModal} >设置角色</Button>
                            <Modal title="设置角色" open={isAuthorityModalOpen} onOk={()=>{ChangeAuthority(record.Name,ChangeAuthorityValue);}} onCancel={handleAuthorityCancel}>
                                <Radio.Group options={options} onChange={onChange3} optionType="button" />
                            </Modal>
                        </Space>
                    )}
                />
            </Table>
            {props.department_page &&
                <>
                    <Button type="primary" disabled={!hasSelected}>移动员工</Button>
                    <span style={{ marginLeft: 8 }}>
                        {hasSelected ? `选择了${selectedRowKeys.length}位用户` : ""}
                    </span>
                </>
            }
        </div>
    );
};
export default MemberList;