import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormTreeSelect,
} from "@ant-design/pro-components";
import { useRouter } from "next/router";
import { Button, Form, message, TreeSelect, Modal } from "antd";
import { LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { useState } from "react";

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

// const treeData = [
//     {
//         title: "Node1",
//         value: "0",
//         children: [
//             {
//                 title: "Child Node1",
//                 value: "2",
//             },
//         ],
//     },
//     {
//         title: "Node2",
//         value: "1",
//         children: [
//             {
//                 title: "Child Node3",
//                 value: "3",
//             },
//             {
//                 title: "Child Node4",
//                 value: "4",
//             },
//             {
//                 title: "Child Node5",
//                 value: "5",
//             },
//         ],
//     },
// ];

const AssetAddUI = () => {
    const [form] = Form.useForm<{ name: string; class: string; count: number; describe: string }>();
    const router = useRouter();
    const query = router.query;
    const [treeData, setAsset] = useState<[]>(); // 储存资产列表树
    if (!treeData) {
        request(
            "/api/Asset/tree",
            "POST",
            {
                SessionID: LoadSessionID(),
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
    }
    return (
        <ModalForm<{
                name: string;
                class: string;
                count: number;
                describe: string;
            }>
            title="新建资产"
            trigger={
                <Button type="primary">
                    <PlusOutlined />
                        新建资产
                </Button>
            }
            form={form}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                onCancel: () => console.log("run"),
            }}
            submitTimeout={2000}
            onFinish={async (values) => {
                await waitTime(2000);
                console.log(values.name);
                console.log(values.class);
                console.log(values.count);
                console.log(values.describe);
                message.success("提交成功");
                return true;
            }}
        >
            <ProForm.Group>
                <ProFormText 
                    width="md" 
                    name="name" 
                    label="资产名称" 
                    placeholder="请输入名称"
                    rules={[{ required: true, message: "这是必填项" }]} 
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormTreeSelect
                    label="资产分类"
                    name="class"
                    width={600}
                    rules={[{ required: true, message: "这是必填项" }]} 
                    fieldProps={{
                        fieldNames: {
                            label: "title",
                        },
                        treeData,
                        // treeCheckable: true,
                        // showCheckedStrategy: TreeSelect.SHOW_PARENT,
                        placeholder: "请选择资产分类",
                    }}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormDigit 
                    name="count" 
                    label="资产数量" 
                    width="lg"
                    placeholder="请输入数量"
                    rules={[{ required: true, message: "这是必填项" }]} 
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormTextArea
                    name="describe"
                    label="资产描述"
                    width="lg"
                    placeholder="请输入描述"
                />
            </ProForm.Group>
        </ModalForm>
    );
};
export default AssetAddUI;