import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space, Modal, MenuProps, Descriptions, Form, Input, Collapse } from "antd";
import { UserOutlined, BellOutlined, DownOutlined, PoweroffOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { logout, LoadSessionID, IfCodeSessionWrong, CreateCookie } from "../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { useState, useEffect } from "react";
import CardUI from "../components/CardUI";
import { AppData } from "../utils/types";
import { renderAuthority } from "../utils/transformer";
import cookie from "react-cookies";
const { Header, Content, Footer, Sider } = Layout;
const { Panel } = Collapse;
import { Image } from "antd-mobile";
import OSS from "ali-oss";
interface UserSettingProps {
    ChangeName:(username:string)=>void;
    ChangeProfile: ()=>void;
    UserAuthority:number,
    UserName:string
}
const UserSetting = (props:UserSettingProps) => {
    const [ProfileUrl, setProfileUrl] = useState("");
    const [File, setFile] = useState<File>(); // 使用useState来管理files数组
    const [ProfileChangeOpen, setProfileChangeOpen] = useState<boolean>(false);  //更新头像的modal是否打开
    const [form] = Form.useForm();
    const [UserName, setUserName] = useState<string>(props.UserName);
    const [UserPhone, setUserPhone] = useState("暂未绑定");
    const [UserAuthority, setUserAuthority] = useState(props.UserAuthority);
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const handleSubmit1 = (values: any) => {
        if (values.username.length > 0) {
            setUserName(values.username);
            request(
                `/api/Asset/ChangeUserName/${LoadSessionID()}`,
                "POST",
                {
                    NewUserName: values.username
                }
            )
                .then((res) => {
                    Modal.success({
                        title: "更改成功",
                        content: `成功将用户名改为  ${values.username}`
                    });
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
            form.resetFields();
        }
        props.ChangeName(values.username);
    };
    const handleSubmit3 = (values: any) => {
        if (values.old > 0 && values.new1.length > 0 && values.new2.length > 0) {
            request(
                `/api/Asset/ChangePassword/${LoadSessionID()}`,
                "POST",
                {
                    OldPassword: CryptoJS.MD5(values.old).toString(),
                    NewPassword1: CryptoJS.MD5(values.new1).toString(),
                    NewPassword2: CryptoJS.MD5(values.new2).toString()
                }
            )
                .then((res) => {
                    Modal.success({
                        title: "更改成功",
                        content: "成功修改密码"
                    });
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
        }
        form.resetFields();
    };
    const handleSubmit2 = (values: any) => {
        if (values.phone.length > 0) {
            setUserPhone(values.phone);
            request(
                "/api/User/change_mobile",
                "POST",
                {
                    SessionID: LoadSessionID(),
                    Mobile: values.phone
                }
            )
                .then((res) => {
                    Modal.success({
                        title: "更改成功",
                        content: `成功绑定手机号  ${values.phone}`
                    });
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
            form.resetFields();
        }
    };
    const handleCancel = () => {
        form.resetFields();
    };
    const UserInfoName = (
        <p className="userinfo-title">
            {"用户名：" + UserName}
        </p>
    );
    const UserInfoPassword = (
        <p className="userinfo-title">
            {"密码"}
        </p>
    );
    const UserInfoPhone = (
        <p className="userinfo-title">
            {UserPhone == null ? "电话：暂未绑定" : ("电话：" + UserPhone)}
        </p>
    );
    const UserInfoAuthority = (
        <p className="userinfo-title">
            {"身份："} {renderAuthority(UserAuthority)}
        </p>
    );
    const UserInfoEntity = (
        <p className="userinfo-title">
            {"业务实体："} {Entity}
        </p>
    );
    const UserInfoDepartment = (
        <p className="userinfo-title">
            {"部门："} {Department}
        </p>
    );
    const getProfile = async () => {
        // 获取头像url
        const ossClient = new OSS({
            accessKeyId: "LTAI5tMmQshPLDwoQEMm8Xd7",
            accessKeySecret: "YG0kjDviIqxkz9GtTZGTLhhlVsPqID",
            region: "oss-cn-beijing",
            bucket: "cs-company",
            secure: true // true for https
        });
        ossClient.get(`/Profile/${UserName}.png`)
            .then(response => {
                const blob = new Blob([response.content], response.res.headers);
                setProfileUrl(URL.createObjectURL(blob));

            })
            .catch(error => {
                console.log(error);
            });
    };
    const handleFileChange = (e: any) => {
        const file = e.target.files[0]; // 获取所有选择的文件
        console.log(e.target);
        const selectedFileName = document.getElementById("selected-file-name");
        if(selectedFileName) selectedFileName.textContent = file.name;
        setFile(file); // 存储文件数组
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
            // 首先检查用户之前是否有文件，如果有则删除
            let result = await client.delete(`/Profile/${UserName}.png`);
            console.log("解析结果："+ result);
        } catch (error) {
            console.log(error);
        }
        try {
            //更新头像
            const path = `/Profile/${UserName}.png`;
            console.log(File);
            const result = await client.put(path, File, { headers });
            console.log("上传成功", result);
            const selectedFileName = document.getElementById("selected-file-name");
            if(selectedFileName) selectedFileName.textContent = "";
            setProfileChangeOpen(false);
            getProfile();
        } catch (e) {
            console.error("上传失败", e);
        }
        console.log("上传的文件:", File);
        props.ChangeProfile();
    };
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setUserName(res.UserName);
                setUserAuthority(res.Authority);
                setEntity(res.Entity);
                setDepartment(res.Department);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "登录失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    return(
        <Content style={{ width: "10px" }}>
            <div style={{ display: "flex" }}>
                <h1 className="main_page_headword">个人信息</h1>
                <Image
                    key="111"
                    src={ProfileUrl}
                    fit="cover"
                    style={{ marginLeft: "120px", marginTop: "15px", width: "80px", height: "80px",  borderRadius: 5 }}
                    alt={"111"}
                    lazy
                />
            </div>
            <Panel style={{ marginTop: "30px", marginLeft: "18px", marginBottom: "40px" }} header={UserInfoAuthority} key="4" />
            {(UserAuthority != 0) && <Panel style={{ marginLeft: "16px", marginBottom: "40px" }} header={UserInfoEntity} key="5" />}
            {(UserAuthority === 2 || UserAuthority === 3) && <Panel style={{ marginLeft: "16px", marginBottom: "30px" }} header={UserInfoDepartment} key="6" />}
            <Collapse
                accordion
                bordered={false}
                expandIconPosition="end"
                expandIcon={() => (
                    <Button type="text" style={{ color: "#1890ff" }}>
                                        更改
                    </Button>
                )}
                ghost
            >
                <Panel header={UserInfoName} key="1">
                    <Form
                        form={form}
                        onFinish={handleSubmit1}
                        style={{ maxWidth: "400px", marginLeft: "24px" }}
                    >
                        <Form.Item
                            name="username"
                            // label="新用户名"
                            rules={[{ message: "请输入新用户名" }]}
                        >
                            <Input placeholder="请输入新用户名" />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                                确认更改用户名
                            </Button>
                        </Form.Item>
                    </Form>
                </Panel>
                <Panel header={UserInfoPhone} key="2">
                    <Form
                        form={form}
                        onFinish={handleSubmit2}
                        style={{ maxWidth: "400px", marginLeft: "24px" }}
                    >
                        <Form.Item
                            name="phone"
                        >
                            <Input placeholder="请输入电话号码，绑定后可用于飞书登录" />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                                确认绑定该电话
                            </Button>
                        </Form.Item>
                    </Form>
                </Panel>
                <Panel header={UserInfoPassword} key="3">
                    <Form
                        form={form}
                        onFinish={handleSubmit3}
                        style={{ maxWidth: "400px", marginLeft: "24px" }}
                    >
                        <Form.Item name="old">
                            <Input placeholder="请输入原始密码" />
                        </Form.Item>
                        <Form.Item name="new1">
                            <Input placeholder="请输入新密码" />
                        </Form.Item>
                        <Form.Item name="new2">
                            <Input placeholder="请再次输入新密码" />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                                确认更改密码
                            </Button>
                        </Form.Item>
                    </Form>
                </Panel>


            </Collapse>
            <div>
                <Button style={{ marginLeft: "24px", fontSize: "18px" }} type="link" onClick={() => {console.log("sdsds");setProfileChangeOpen(true);}}> 更改头像</Button>
                <Modal
                    title="更新头像"
                    onOk={() => {
                        handleUpload();
                    }}
                    open={ProfileChangeOpen}
                    onCancel={() => {
                        setProfileChangeOpen(false);
                    }}
                >
                    <input
                        type="file"
                        id="upload-input"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                    <label htmlFor="upload-input" className="custom-upload-button">
                    </label>
                    <Space style={{width:"20px"}}> </Space>
                    <span id="selected-file-name"></span>
                </Modal>
            </div>
        </Content>
    );
};
export default UserSetting;