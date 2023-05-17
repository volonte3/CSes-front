import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Image, Modal } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { LoadSessionID,CreateCookie } from "../utils/CookieOperation";
import { request } from "../utils/network";
import CryptoJS from "crypto-js";
import styles from "../styles/login.module.css";
import Head from "next/head";

interface LoginInit {
    initUserName: string,
    initPassword: string,
}
export interface LoginScreenProps {
    init?: LoginInit,
}


const LoginUI = (props: LoginScreenProps) => {
    const router = useRouter();
    const ErrorInfo = (errinfo:string) => {
        Modal.error({
            title: "登录失败",
            content: errinfo.toString().substring(5),
        });
    };

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        // 其他表单字段
	  });
	
	  // 处理表单输入变化的函数
	  function handleInputChange(event: any) {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
		  ...prevFormData,
		  [name]: value
        }));
	  }
	
	  // 处理表单提交的函数
	  function handleSubmit(event: any) {
        CreateCookie("SessionID");
        event.preventDefault();
        console.log(formData);
        // 在这里访问表单的填写内容
        request(
            "/api/User/login",
            "POST",
            {
                UserName: formData.username,
                SessionID: LoadSessionID(),
                Password: CryptoJS.MD5(formData.password).toString(),
            }
        )
            .then(() => {router.push("/main_page");})
            // .catch((err) => alert(FAILURE_PREFIX + err));
            .catch((err) => ErrorInfo(err));
	  }

    const handlefeishu = () => {
        router.push("https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=cli_a4d587450378500e&redirect_uri=http%3A%2F%2Fcs-company-frontend-debug-cses.app.secoder.net%2Fmain_page&response_type=code&state=STATE");
    };

    return (
        <>
            <Head>
                <style>{`
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                padding: 0;
                font: 16px/20px microsft yahei;
             }
             h2 {
              text-align: center;
              color: black;
              margin-bottom: 30px;
          	}
			h1 {
				text-align: center;
				color: black;
				margin-bottom: 30px;
			}
        `}</style>
            </Head>
            <div className={`${styles.wrap}`}>
              	<h1>企业资产管理系统</h1>
                <div className={`${styles.loginBox}`}>
                    <h2>登录</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={`${styles.item}`}>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                            <label htmlFor="">&nbsp;&nbsp;用户名</label>
                        </div>
                        <div className={`${styles.item}`}>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <label htmlFor="">&nbsp;&nbsp;密码</label>
                        </div>
                        <div>
                            <button type="submit" className={`${styles.btn}`} style={{ margin: "30px" }}>提交
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            <button type="button" className={`${styles.btn}`} onClick={handlefeishu}>通过飞书登录
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>                  
                    </form>
                </div>
                <ul>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </>
        
    );
};

export default LoginUI;