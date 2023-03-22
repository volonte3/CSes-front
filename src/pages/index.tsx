// import { useRouter } from "next/router";
// import { useRef, useState } from "react";
// import BoardUI from "../components/BoardUI";
// import { CREATE_SUCCESS, FAILURE_PREFIX, UPDATE_SUCCESS } from "../constants/string";
// import { getBlankBoard, stepBoard, flipCell, badFlipCell, boardToString } from "../utils/logic";
// import { request } from "../utils/network";
import { Board } from "../utils/types";

interface BoardInit {
    id: number,
    initBoard: Board,
    initBoardName: string,
    initUserName: string,
}

export interface BoardScreenProps {
    init?: BoardInit,
}

// const BoardScreen = (props: BoardScreenProps) => {
//     /**
//      * @todo [Step 3] 请在下述一处代码缺失部分填写合适的代码，使得组件可以调用 logic.ts 中的代码处理点击棋盘事件
//      * @todo [Step 4] 请在下述三处代码缺失部分填写合适的代码，使得点击行为的处理符合预期且计时器资源分配、释放合理
//      */
//     const [board, setBoard] = useState<Board>(props.init?.initBoard ?? getBlankBoard());
//     const [autoPlay, setAutoPlay] = useState<boolean>(false);
//     const [userName, setUserName] = useState<string>(props.init?.initUserName ?? "");
//     const [boardName, setBoardName] = useState<string>(props.init?.initBoardName ?? "");
//     const timerRef = useRef<undefined | NodeJS.Timer>(undefined);

//     const router = useRouter();

//     const step = () => {
//         setBoard((board) => stepBoard(board));
//     };
//     const flip = (i: number, j: number) => {
//         // Step 3 & 4 BEGIN
//         if (timerRef.current === undefined) {
//             // 设置棋盘
//             setBoard((board) => flipCell(board, i, j));
//         }
//         // Step 3 & 4 END
//     };

//     const startAutoPlay = () => {
//         // Step 4 BEGIN
//         setAutoPlay(!autoPlay);
//         timerRef.current = setInterval(() => {
//             // 设置棋盘，并调用stepBoard函数
//             setBoard((board) => stepBoard(board));
//         }, 300);
//         // Step 4 END
//     };
//     const stopAutoPlay = () => {
//         // Step 4 BEGIN
//         clearInterval(timerRef.current); setAutoPlay(!autoPlay);
//         timerRef.current = undefined;
//         // Step 4 END
//     };

//     const saveBoard = () => {
//         request(
//             "/api/boards",
//             "POST",
//             {
//                 userName: userName,
//                 boardName: boardName,
//                 board: boardToString(board),
//             }
//         )
//             .then((res) => alert(res.isCreate ? CREATE_SUCCESS : UPDATE_SUCCESS))
//             .catch((err) => alert(FAILURE_PREFIX + err));
//     };
//     const updateBoard = () => {
//         request(
//             `/api/boards/${props.init?.id}`,
//             "PUT",
//             {
//                 userName: userName,
//                 boardName: boardName,
//                 board: boardToString(board),
//             },
//         )
//             .then(() => alert(UPDATE_SUCCESS))
//             .catch((err) => alert(FAILURE_PREFIX + err));
//     };

//     return (
//         <div style={{ padding: 12 }}>
//             {props.init ? <h4> Replay Mode, Board ID: {props.init.id} </h4> : <h4> Free Mode </h4>}
//             <BoardUI board={board} flip={flip} />
//             <div style={{ display: "flex", flexDirection: "column" }}>
//                 <div style={{ display: "flex", flexDirection: "row" }}>
//                     <button onClick={step} disabled={autoPlay}>
//                         Step the board
//                     </button>
//                     <button onClick={() => setBoard(getBlankBoard())} disabled={autoPlay}>
//                         Clear the board
//                     </button>
//                     {props.init ? (
//                         <button onClick={() => setBoard(props.init?.initBoard as Board)} disabled={autoPlay}>
//                             Undo all changes
//                         </button>
//                     ) : null}
//                     <button onClick={startAutoPlay} disabled={autoPlay}>
//                         Start auto play
//                     </button>
//                     <button onClick={stopAutoPlay} disabled={!autoPlay}>
//                         Stop auto play
//                     </button>
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "row" }}>
//                     <input
//                         type="text"
//                         placeholder="Your Name"
//                         value={userName}
//                         disabled={autoPlay}
//                         onChange={(e) => setUserName(e.target.value)}
//                     />
//                     <input
//                         type="text"
//                         placeholder="Name of this Board"
//                         value={boardName}
//                         disabled={autoPlay}
//                         onChange={(e) => setBoardName(e.target.value)}
//                     />
//                     <button onClick={props.init ? updateBoard : saveBoard} disabled={autoPlay}>
//                         {props.init ? "Update" : "Save"} board
//                     </button>
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "row" }}>
//                     <button onClick={() => router.push("/list")}>
//                         Go to full list
//                     </button>
//                     {props.init ? (
//                         <button onClick={() => router.push("/")}>
//                             Go back to free mode
//                         </button>
//                     ) : null}
//                 </div>
//             </div>
//         </div>

//     );
// };

// export default BoardScreen;

// import React from 'react';
// import type { FC } from 'react';
// import { Button } from 'antd';
// // import 'antd/dist/reset.css';
// // import './App.css';

// import { useRouter } from "next/router";
// import { useRef, useState } from "react";
// import BoardUI from "../components/BoardUI";
// import AppButton from "../components/App"
// import { CREATE_SUCCESS, FAILURE_PREFIX, UPDATE_SUCCESS } from "../constants/string";
// import { getBlankBoard, stepBoard, flipCell, badFlipCell, boardToString } from "../utils/logic";
// import { request } from "../utils/network";
// import { Board } from "../utils/types";
// const BoardScreen = (props: any) => {
//     return(
//       <div style={{ padding: 12 }}>
//           <AppButton name="new name" type={12} ></AppButton>
//       </div>
//     )
// }
// export default BoardScreen;

import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Image } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import BackGround from "public/LoginBackground.png";
import { useRouter } from "next/router";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const onFinish = (values: any) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log("Received values of form: ", values);
        }, 2000);
    };

    return (
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
            backgroundImage: "url(\"LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
        }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h1 style={{ marginBottom: 24 }}>企业资产管理系统</h1>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: 300 }}>

                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        style={{ width: 300 }}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: "Please input your Username!" }]}
                        >
                            <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Username" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "Please input your Password!" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                            />
                        </Form.Item>
                        {/* <img
              width={200}
              src="LoginBackground.png"
            ></img> */}
                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>

                            {/* <a href="/" style={{ float: "right" }}>
                Forgot password
                            </a> */}
                        </Form.Item>

                        <Form.Item >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} onClick={() => router.push("/list")}>
                  登录
                                </Button>
                                {/* Or <a href="/">register now!</a> */}
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div >
    );
};

export default Login;