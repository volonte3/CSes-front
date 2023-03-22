import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BoardScreen from ".";
import { FAILURE_PREFIX } from "../constants/string";
import { stringToBoard } from "../utils/logic";
import { request } from "../utils/network";
import { Board } from "../utils/types";

// const BoardScreenWithInit = () => {
//     const [initBoard, setInitBoard] = useState<Board | undefined>(undefined);
//     const [initBoardName, setInitBoardName] = useState<string>("");
//     const [initUserName, setInitUserName] = useState<string>("");
//     const [refreshing, setRefreshing] = useState(true);
    
//     const router = useRouter();
//     const query = router.query;

//     useEffect(() => {
//         if (!router.isReady) {
//             return;
//         }

//         request(`/api/boards/${router.query.id}`, "GET")
//             .then((res) => {
//                 setInitBoard(stringToBoard(res.board));
//                 setInitBoardName(res.boardName);
//                 setInitUserName(res.userName);
//                 setRefreshing(false);
//             })
//             .catch((err) => {
//                 alert(FAILURE_PREFIX + err);
//                 router.push("/");
//             });
//     }, [router, query]);
    
//     return refreshing ? (
//         <p> Loading... </p>
//     ) : (
//         <BoardScreen init={{
//             id: Number(router.query.id),
//             initBoard: initBoard as Board,
//             initBoardName,
//             initUserName,
//         }} />
//     );
// };

// export default BoardScreenWithInit;
