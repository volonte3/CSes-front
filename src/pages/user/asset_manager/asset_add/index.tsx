import { FC, useMemo, useRef} from "react";
import React from "react";
import {
    PlusOutlined,
    CheckOutlined,
} from "@ant-design/icons";
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
    ProFormUploadButton,
} from "@ant-design/pro-components";
import { Layout, Menu, theme, Modal, Button, Breadcrumb, Row, Col, Form, message, Tag, Space } from "antd";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";
import AssetAddFromExcelUI from "../../../../components/AssetAddFromExcelUI";
import OSS from "ali-oss";
import "react-quill/dist/quill.snow.css"; // 导入默认的样式文件
import { Rule } from "rc-field-form/lib/interface"; // 导入正确的规则类型

interface MyEditorState {
    content: string;
}

const { Item } = Form;

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
  
  
  

interface DepartmentData {
    DepartmentName: string;
    DepartmentId: string;
}

let ListLike = [
    {
        id: "1",
        name: "语雀的天空",
        class: "",
        father: 0,
        count: 0,
        money: 0,
        position: "",
        describe: "",
    },
];

interface MyDic {
    [key: string]: string;
}

type DataItem = (typeof ListLike)[number];

let AddList: DataItem[] = [];

let AllProList: string[][][] = [];

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};


interface MyFormProps {
    inputCount: number;
  }
  
  


const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [form] = Form.useForm<{ name: string; class: string; father: number; count: number; money: number; position: string; describe: string }>();
    const [treeData, setAsset] = useState<[]>(); // 储存资产列表树
    const [dataSource, setDataSource] = useState<DataItem[]>(AddList);
    const [Change, setChange] = useState(false);
    const [AssetID, setAssetID] = useState<number>(1);
    const [AssetList, setAssetList] = useState<{[key : number] : string}>({});
    const [ListKey, setListKey] = useState<number>(0);
    const [ProperList, setProperList] = useState<[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const query = router.query;


    const [file, setFile] = useState<File|null>(null);

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        setFile(file);
        // 在这里处理获取到的文件
        console.log("上传的文件:", file);
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

        try {
            const filename = form.getFieldValue("name");
            const fileExtension = file?.name.split(".").pop(); // 获取文件的原始扩展名
            const path = "photos/" + filename + "." + fileExtension;
            // 上传文件到 OSS
            console.log(file);
            const result = await client.put(path, file, {headers});
            // 打印上传成功的文件信息
            console.log("上传成功", result);
        } catch (e) {
            // 打印上传失败的错误信息
            console.error("上传失败", e);
        }
    };


    const MyForm: FC<MyFormProps> = ({ inputCount }) => {
        const inputs = useMemo(() => {
            const result = [];
            for (let i = 0; i < inputCount; i++) {
                result.push(
                    <ProForm.Group>
                        <ProFormText
                            name={`property${i}`}
                            label={ProperList[i]}
                            placeholder={"请输入"}
                            rules={[{ required: true, message: "这是必填项" }]}
                        />
                    </ProForm.Group>
                );
            }
            return result;
        }, [inputCount]);
      
        return (
            <div>
                {inputs}
            </div>     
        );
    };

    const add = () => {
        setLoading(true);
        let ok = true;
        if (AddList.length == 0) {
            message.warning("没有数据!");
            return;
        }
        for (let i = 0; i < AddList.length; i = i + 1) {
            let item = AddList[i];
            console.log(AllProList[i]);
            let nowList = AllProList[i];
            let body: MyDic = {};
            for (let k = 0; k < nowList.length; k = k + 1) {
                body[nowList[k][0]] = nowList[k][1];
            }
            request(
                `/api/Asset/Append/${LoadSessionID()}`,
                "POST",
                {
                    Name: item.name,
                    Type: item.class,
                    Number: item.count,
                    Position: item.position,
                    Describe: item.describe,
                    Value: item.money,
                    Parent: item.father? item.father: null,
                    Property: {...body},
                }
            )
                .catch((err) => {
                    setLoading(false);
                    ok = false;
                    console.log(err.message);
                    Modal.error({
                        title: "资产" + item.name +  "录入错误",
                        content: err.message.substring(5),
                    });
                });
        }
        if (ok) {
            message.success("提交成功");
            setLoading(false);
        }
        AddList.splice(0);
        setChange((e) => !e);
    };

    const changeProperList = (value: number) => {
        request(
            `/api/Asset/AppendType/${LoadSessionID()}/${value}`,
            "GET"
        )
            .then((res) => {
                setProperList(res.Property);
            })
            .catch((err) => {
                Modal.error({
                    title: "错误",
                    content: err.message.substring(5),
                });
            });
    };

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setState(true);
                setUserName(res.UserName);
                setUserAuthority(res.Authority);
                if(res.Authority != 2 ){
                    Modal.error({
                        title: "无权访问",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                }
                setEntity(res.Entity);
                setDepartment(res.Department);
                setTODO(res.TODO);
                setTOREAD(res.TOREAD);
            })
            .catch((err) => {
                console.log(err.message);
                setState(false);
                Modal.error({
                    title: "登录失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [state, router, Change]);
    if (state) {
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
        if (!AssetList[0]) {
            request(
                `/api/Asset/Info/${LoadSessionID()}`,
                "GET",
            )
                .then((res) => {
                    let assetlist = res.Asset;
                    for (let i = 0; i < assetlist.length; i = i + 1) {
                        let item = assetlist[i];
                        setAssetList((AssetList) => {
                            AssetList[item.ID] = item.Name + " (" + item.Description + ")";
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
        }
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className= "sidebar" width="10%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD}></UserInfo>
                    </Header>   
                    <Content>           
                        <Breadcrumb style={{ margin: "30px" }}>
                            <Breadcrumb.Item>资产录入</Breadcrumb.Item>
                        </Breadcrumb>
                        <Row gutter={[8, 6]} style={{ margin: "25px" }}>
                            <Col>
                                <ModalForm<{
                                name: string;
                                class: string;
                                father: number;
                                count: number;
                                money: number;
                                position: string;
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
                                    submitTimeout={1000}
                                    onFinish={async (values) => {
                                        await waitTime(1000);
                                        handleUpload();
                                        console.log(values.describe);
                                        AddList.push(
                                            {
                                                id: AssetID.toString(),
                                                name: values.name,
                                                class: values.class,
                                                father: values.father,
                                                count: values.count,
                                                money: values.money,
                                                position: values.position,
                                                describe: values.describe,
                                            }
                                        );
                                        let tempList: string[][] = [];
                                        for (let k = 0; k < ProperList.length; k = k + 1) {
                                            tempList.push([ProperList[k], form.getFieldValue(`property${k}`)]);
                                        }
                                        AllProList.push(tempList);
                                        setAssetID((e) => (e+1));
                                        setChange((e) => !e);
                                        setListKey((e) => (e+1));
                                        // console.log(AddList);
                                        // console.log("--------------------");
                                        // console.log(values.name);
                                        // console.log(values.class);
                                        // console.log(values.father);
                                        // console.log(values.count);
                                        // console.log(values.money);
                                        // console.log(values.position);
                                        // console.log(values.describe);
                                        return true;
                                    }}
                                >
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
                                        <ProFormTreeSelect
                                            label="资产分类"
                                            name="class"
                                            width="lg"
                                            rules={[{ required: true, message: "这是必填项" }]} 
                                            fieldProps={{
                                                fieldNames: {
                                                    label: "title",
                                                },
                                                treeData,
                                                // treeCheckable: true,
                                                // showCheckedStrategy: TreeSelect.SHOW_PARENT,
                                                placeholder: "请选择资产分类",
                                                onChange: (value) => {
                                                    changeProperList(value);
                                                },
                                            }}
                                        />
                                    </ProForm.Group>
                                    <ProForm.Group>
                                        <ProFormSelect
                                            name="father"
                                            label="所属主资产"
                                            width="lg"
                                            tooltip="如果该资产有所属的主资产，请在这里添加"
                                            valueEnum={AssetList}
                                            showSearch={true}
                                            placeholder="请选择所属的主资产"
                                        
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
                                        <ProFormMoney
                                            label="资产价值"
                                            name="money"
                                            locale="zh-CN"
                                            initialValue={0.00}
                                            min={0}
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
                                    <ProForm.Group>
                                        <div>
                                            资产图片
                                        </div>
                                        <input type="file" onChange={handleFileChange} />
                                    </ProForm.Group>
                                    <MyForm inputCount={ProperList.length} />
                                </ModalForm>
                            </Col>
                            <Col offset={17}>
                                <Button loading={loading} type="primary" icon={<CheckOutlined />} onClick={add}>
                                    录入
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ margin: "30px" }}>
                                <AssetAddFromExcelUI/>
                            </Col>
                        </Row>
                        <Row align="top">
                            <Col span={20}>
                                <ProList<DataItem>
                                    key={ListKey}
                                    rowKey="id"
                                    headerTitle="待录入资产列表"
                                    dataSource={dataSource}
                                    showActions="hover"
                                    editable={{
                                        onSave: async (key, record, originRow) => {
                                            console.log(key, record, originRow);
                                            return true;
                                        },
                                    }}
                                    onDataSourceChange={setDataSource}
                                    metas={{
                                        title: {
                                            dataIndex: "name",
                                        },
                                        // subTitle: {
                                        //     render: () => {
                                        //         return (
                                        //             <Space size={0}>
                                        //                 <Tag color="blue">Ant Design</Tag>
                                        //                 <Tag color="#5BD8A6">TechUI</Tag>
                                        //             </Space>
                                        //         );
                                        //     },
                                        // },
                                        actions: {
                                            render: (text, row, index, action) => [
                                                <a
                                                    onClick={() => {
                                                        AddList.splice(index, 1);
                                                        setChange((e) => !e);
                                                    }}
                                                    key="link"
                                                >
                                                    删除
                                                </a>,
                                            ],
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Layout >
        );
    };
};

export default App;