import React from "react";
import {
    FileOutlined, PlusSquareOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button } from "antd";
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
const MemberList = (props: MemberListProps) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    const RemakePassword = (username: string) => {
        // 重置密码操作，将用户输入的旧密码重新生成到<一个固定值>
        request(
            "/api/User/remakepassword",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .then(() => {
                Modal.success({
                    title: "成功",
                    content: "密码已重置为******",
                        
                });
            })
            .catch();
    };
    const RemakeAuthority = (username: string)=>{
        request(
            "/api/User/remakepassword",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .then(() => {
                Modal.success({
                    title: "成功",
                    content: "身份已变更为",
                        
                });
            })
            .catch();
    }; 
    const lock = (username: string) => {
        // 重置密码操作，将用户输入的旧密码重新生成到<一个固定值>
        request(
            "/api/User/lock/${LoadSessionID()}",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .catch();
    };
    return (
        <div>
            {props.department_page && 
                <>
                    <Button type="primary" disabled={!hasSelected}>移动员工</Button>
                    <span style={{ marginLeft: 8 }}>
                        {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
                    </span>
                </>
            }
            
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
                            <Switch checkedChildren="解锁" unCheckedChildren="锁定" defaultChecked />
                            <Button danger onClick={() => { RemakePassword(record.Name); }}>重置密码</Button>
                            <Button type="primary" onClick={() => { RemakeAuthority(record.Name); }}>设置角色</Button>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};
export default MemberList;