// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import { DELETE_SUCCESS, DELETE_USER_BOARD_SUCCESS, FAILURE_PREFIX } from "../../constants/string";
// import { request } from "../../utils/network";
// import { BoardMetaData } from "../../utils/types";


// interface ListScreenProps {
//     userName?: string;
// }

// const ListScreen = (props: ListScreenProps) => {
//     /**
//      * @todo [Step 5] 请在下述一处代码缺失部分填写合适的代码，完成游戏记录列表页面 UI
//      * @todo [Step 6] 请在下述两处代码缺失部分填写合适的代码，完成网络请求的管理
//      */
//     const [refreshing, setRefreshing] = useState<boolean>(true);
//     const [boardList, setBoardList] = useState<BoardMetaData[]>([]);

//     const router = useRouter();
//     const query = router.query;

//     useEffect(() => {
//         if (!router.isReady) {
//             return;
//         }

//         fetchList();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [router, query]);

//     const fetchList = () => {
//         setRefreshing(true);
//         request(props.userName ? `/api/user/${props.userName}` : "/api/boards", "GET")
//             .then((res) => {
//                 setBoardList(res.boards.map((val: any) => ({ ...val, name: val.boardName })));
//                 setRefreshing(false);
//             })
//             .catch((err) => {
//                 alert(FAILURE_PREFIX + err);
//                 setRefreshing(false);
//             });
//     };
//     const deleteBoard = (id: number) => {
//         // Step 6 BEGIN
//         request(`/api/boards/${id}`, "DELETE")
//             .then(() => { alert(DELETE_SUCCESS); fetchList(); })
//             .catch((err) => { alert(FAILURE_PREFIX + err); setRefreshing(true); });
//         // Step 6 END
//     };
//     const deleteUserBoard = () => {
//         // Step 6 BEGIN
//         request(`/api/user/${props.userName}`, "DELETE")
//             .then(() => { alert(DELETE_USER_BOARD_SUCCESS); router.push("/list"); })
//             .catch((err) => { alert(FAILURE_PREFIX + err); setRefreshing(true); });
//         // Step 6 END
//     };

//     return refreshing ? (
//         <p> Loading... </p>
//     ) : (
//         <div style={{ padding: 12 }}>
//             {props.userName ? (
//                 <h4> Boards of {props.userName} </h4>
//             ) : null}
//             <button onClick={() => router.push("/")}>
//                 Go back to free mode
//             </button>
//             {props.userName ? (
//                 <button onClick={() => router.push("/list")}>
//                     Go to full list
//                 </button>
//             ) : null}
//             {props.userName ? (
//                 <button onClick={deleteUserBoard}>
//                     Delete all boards of this user
//                 </button>
//             ) : null}
//             {boardList.length === 0 ? (
//                 <p> Empty list </p>
//             ) : (
//                 <div style={{ display: "flex", flexDirection: "column" }}>{
//                     // Step 5 BEGIN
//                     boardList.map((board) => {
//                         // 将board.createdAt转换为日期格式
//                         let date = new Date(board.createdAt * 1000);
//                         // 获取年份
//                         let year = date.getFullYear();
//                         // 获取月份
//                         let month = date.getMonth() + 1;
//                         // 获取日期
//                         let day = date.getDate();
//                         // 获取小时
//                         let hour = date.getHours();
//                         // 获取分钟
//                         let minute = date.getMinutes();
//                         // 获取秒
//                         let second = date.getSeconds();
//                         // 将日期格式转换为字符串
//                         let time_format = year + "-" + month + "-" + day + " " + hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0") + ":" + second.toString().padStart(2, "0");
//                         // 用div元素返回所有信息
//                         return <div key={board.id}>
//                             <div>ID: {board.id}</div>
//                             <div>Name: {board.name}</div>
//                             <div>Created At: {time_format}</div>
//                             <div>Created by: {board.userName}</div>
//                             <button onClick={() => router.push(`/${board.id}`)}>play it!</button>
//                             <button onClick={() => deleteBoard(board.id)}>Delete it!</button>
//                             <button onClick={() => router.push(`/list/${board.userName}`)}>View the user</button>
//                         </div>;
//                     }
//                     )
//                 // Step 5 END
//                 }
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ListScreen;
import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space } from "antd";
import AssetQueryCard from "../../components/UserPageUI/AssetQueryUI";
import UserManageCard from "../../components/UserPageUI/UserManageUI";
import GetAssetCard from "../../components/UserPageUI/GetAssetUI";
const { Header, Content } = Layout;

const DropdownMenu = (
    <Menu>
        <Menu.Item key="1">待办事项</Menu.Item>
        <Menu.Item key="2">已完成事项</Menu.Item>
    </Menu>
);

const App = () => {
    return (
        <Layout style={{
            display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
            backgroundImage: "url(\"LoginBackground.png\")", backgroundSize: "cover", backgroundPosition: "center"
        }}>
            <Header style={{background: "transparent", display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                <Button>用户姓名</Button>
                <Dropdown overlay={DropdownMenu}>
                    <Button>待办事项</Button>
                </Dropdown>
                <Button>登出</Button>
            </Header>
            <Content style={{ padding: "50px" }}>
                <Space size='large'>
                    <AssetQueryCard/>
                    <UserManageCard/>
                    <GetAssetCard/>
                </Space>
            </Content>
        </Layout>
    
    );
};

export default App;
