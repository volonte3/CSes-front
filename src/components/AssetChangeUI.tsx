import React from "react";
import { theme, Form, Modal, Button} from "antd";
import {
    FormOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { 
    ProTable, 
    ProColumns, 
    StepsForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormSelect,
    ProFormMoney,
} from "@ant-design/pro-components";
import { DateTransform } from "../utils/transformer";
import OSS from "ali-oss";
import "react-quill/dist/quill.snow.css"; // 导入默认的样式文件
import { Rule } from "rc-field-form/lib/interface"; // 导入正确的规则类型

interface AssetListProps {
    Assets: AssetData[]
}

const { Item } = Form;
interface MyEditorState {
    content: string;
}

class MyEditor extends React.Component<{ 
    name: string;
    label: string;
    width: string;
    placeholder: string;
    rules: Rule[];
  }, MyEditorState> {
    constructor(props: { 
      name: string;
      label: string;
      width: string;
      placeholder: string;
      rules: Rule[];
    }) {
        super(props);
        this.state = {
            content: ""
        };
    }
  
    handleChange = (value: string) => {
        this.setState({ content: value });
    };
  
    render() {
        const { name, label, width, placeholder, rules } = this.props;
        let ReactQuill;
        if (typeof window !== "undefined") {
            ReactQuill = require("react-quill");
            require("react-quill/dist/quill.snow.css");
        }
        return (
            <Item
                name={name}
                label={label}
                rules={rules} // 将规则传递给表单项
            >
                {ReactQuill ? <ReactQuill value={this.state.content} onChange={this.handleChange} /> : null}
            </Item>
        );
    }
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
const AssetChange = () => {
    const [AssetList, setAssetList] = useState<{[key : number] : string}>({});
    const [changekey, setchangekey] = useState(Date.now());
    const [form] = Form.useForm<{ name: string; father: number; count: number; money: number; position: string; describe: string }>();

    const [files, setfiles] = useState<File[]>([]);
    const [nowid, setnowid] = useState(0);
    const [visible, setVisible] = useState(false);
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const handleFileChange = (e: any) => {
        const files: File[] = Array.from(e.target.files); // 获取所有选择的文件
        setfiles(files); // 存储文件数组
        const selectedFileName = document.getElementById("selected-file-name");
        if(selectedFileName) {
            selectedFileName.textContent="";
            for (let i=0; i<files.length;i++){
                if(i>0) selectedFileName.textContent= selectedFileName.textContent+"  ;  "+ files[i].name;
                else selectedFileName.textContent = files[i].name;            
            }
            selectedFileName.textContent += `  共 ${files.length}个文件`;
        }
        // 在这里处理获取到的文件
        console.log("上传的文件:", files);
    };
    
    const handleUpload = async () => {
    // 创建 OSS 客户端实例
        const client = new OSS({
            region: "oss-cn-beijing",
            accessKeyId: "LTAI5tNdCBrFK5BGXqTiMhwG",
            accessKeySecret: "vZpHyptCPojSG1uNGucDtWcqzMOEeF",
            bucket: "cs-company",
            secure: true,
        });

        const headers = {
            // 添加跨域请求头
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            // 其他自定义请求头
            "x-oss-storage-class": "Standard",
            "x-oss-object-acl": "public-read",
            "x-oss-tagging": "Tag1=1&Tag2=2",
            "x-oss-forbid-overwrite": "true",
        };
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > MAX_FILE_SIZE) {
                Modal.error({
                    title: "图片" + file.name + "无法上传",
                    content: "图片大小过大",
                });
                continue;
            }
            try {
                const filename = Date.now();
                const fileExtension = file?.name.split(".").pop();
                const path = "/photos/" + nowid.toString() + "/" + filename + "." + fileExtension;
                console.log(file);
                const result = await client.put(path, file, { headers });
                console.log("上传成功", result);
            } catch (e) {
                console.error("上传失败", e);
            }
            console.log("上传的文件:", file);
        }
    };
    
    const columns: ProColumns<AssetData>[] = [
        {
            title: "编号",
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
            dataIndex: "",
            key: "",
            render: (_: any, record) => {
                const handlechange = () => {
                    console.log(record.Name);
                    form.setFieldsValue({ // 使用 setFieldsValue 方法更新表单域的值
                        name: record.Name,
                        describe: record.Description,
                        count: record.Number,
                        position: record.Position,
                        money: record.AssetValue,
                    });
                    setnowid(record.ID);
                    console.log(nowid);
                };
                return (
                    <div>
                        <Button type="link" 
                            onClick={() => {
                                setVisible(true);
                                handlechange();
                            }
                            }>
                            <FormOutlined />
                            信息变更
                        </Button>
                        <StepsForm<{
                                name: string;
                                father: number;
                                count: number;
                                money: number;
                                position: string;
                                describe: string;
                            }>
                            formProps={{
                                validateMessages: {
                                    required: "此项为必填项",
                                },
                                form: form,
                                initialValues: {
                                    name: record.Name,
                                    describe: record.Description,
                                    count: record.Number,
                                    position: record.Position,
                                    money: record.AssetValue,
                                },                             
                            }}
                            stepsFormRender={(dom, submitter) => {
                                return (
                                    <Modal
                                        title="分步表单"
                                        width={800}
                                        onCancel={() => setVisible(false)}
                                        open={visible}
                                        footer={submitter}
                                        destroyOnClose
                                    >
                                        {dom}
                                    </Modal>
                                );
                            }}
                            onFinish={async (values) => { 
                                setVisible(false); 
                                request(
                                    `/api/Asset/Change/${LoadSessionID()}`,
                                    "POST",
                                    {
                                        ID: nowid,
                                        Name: values.name,
                                        Number: values.count,
                                        Position: values.position,
                                        Describe: values.describe,
                                        Value: values.money,
                                        Parent: values.father? values.father: null,
                                    }
                                )   
                                    .then(() => {
                                        handleUpload();
                                        setchangekey(Date.now());
                                    })
                                    .catch((err) => {
                                        console.log(err.message);
                                        Modal.error({
                                            title: "资产变更失败",
                                            content: err.message.substring(5),
                                        });
                                    });
                                return true;
                            }}
                        >
                            <StepsForm.StepForm name="base" title="更改基本信息">
                                <ProForm.Group>
                                    <ProFormText 
                                        width="lg" 
                                        name="name" 
                                        label="资产名称" 
                                        placeholder="请输入名称"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormSelect
                                        name="father"
                                        label="所属主资产"
                                        width="lg"
                                        tooltip="即设置主从关系"
                                        valueEnum={AssetList}
                                        showSearch={true}
                                        rules={[
                                            {
                                                validator: () => {
                                                    return new Promise((resolve, reject) => {
                                                        if (form.getFieldValue("father") == record.ID) {
                                                            reject("不能将自己设置为主资产");
                                                        } else {
                                                            resolve("pass");
                                                        }
                                                    });
                                                },
                                            },
                                        ]}
                                        placeholder="请选择所属的主资产"    
                                    />
                                </ProForm.Group>
                            </StepsForm.StepForm>
                            <StepsForm.StepForm name="more" title="更改详细信息">
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
                                    <ProFormMoney
                                        label="资产价值"
                                        name="money"
                                        locale="zh-CN"
                                        min={0.01}
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <ProFormTextArea
                                        name="position"
                                        label="资产位置"
                                        width="lg"
                                        placeholder="请输入位置"
                                        rules={[{ required: true, message: "这是必填项" }]} 
                                    />
                                </ProForm.Group>
                                <ProForm.Group>
                                    <MyEditor
                                        name="describe"
                                        label="资产描述"
                                        width="lg"
                                        placeholder="请输入描述"
                                        rules={[{ required: true, message: "这是必填项" }]}
                                    />
                                </ProForm.Group>
                                <ProForm.Group tooltip="支持一次性选中多个图片，单个图片不能超过10MB" title="资产图片">
                                    <label htmlFor="upload-input" style={{marginTop:"-20px"}}className="custom-upload-button-add">
                                    </label>
                                    <input
                                        type="file"
                                        id="upload-input"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                        multiple
                                    />
                                    <span id="selected-file-name"></span>
                                </ProForm.Group>
                            </StepsForm.StepForm>
                        </StepsForm>
                    </div>);
            },
            search:false
        },
    ];
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/Asset/Info/${LoadSessionID()}`,
            "GET",
        )
            .then((res) => {
                let assetlist = res.Asset;
                for (let i = 0; i < assetlist.length; i = i + 1) {
                    let item = assetlist[i];
                    setAssetList((AssetList) => {
                        AssetList[item.ID] = item.Name + " (" + item.ID + ")";
                        return AssetList;
                    });
                }
            })
            .catch((err) => {
                Modal.error({
                    title: "错误",
                    content: err.message.substring(5),
                });
            });
    }, [router, query]);
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
            key={changekey}
            columns={columns}
            options={false}
            rowKey="ID"
            request={async (params = {}) => {
                const loadSessionID = LoadSessionID();
                let urldata: UrlData = { pageSize: 20, current: params.current, Name: "", ID: -1, Status: -1, Class: "", Owner: "", Prop: "", PropValue: "" };
                if (params.Name != undefined) urldata.Name = params.Name;
                if (params.ID != undefined) urldata.ID = params.ID;
                if (params.Status != undefined) urldata.Status = params.Status;
                if (params.Class != undefined) urldata.Class = params.Class;
                if (params.Owner != undefined) urldata.Owner = params.Owner;
                let url = `/api/Asset/Info/${loadSessionID}/${urldata.current}/ID=${urldata.ID}/Name=${urldata.Name}/Class=${urldata.Class}/Status=${urldata.Status}/Owner=${urldata.Owner}/Prop=${urldata.Prop}/PropValue=${urldata.PropValue}`;
                console.log(url);
                return (
                    request(
                        url,
                        "GET"
                    )
                        .then((res) => {
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
            scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
            pagination={{
                showSizeChanger: false
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
export default AssetChange;