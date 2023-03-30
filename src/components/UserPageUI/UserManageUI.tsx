import { Modal, Card, Button} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
const UserManageCard = () => {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();
    const query = router.query;
    const handle_click = () => {
        setOpen(true);
    };
    const handle_cancel = () => {
        setOpen(false);
    };
    return (
        <>
            <Card className="card"
                cover={
                    <img className="card__icon" src="UserManage.jpg"/>
                }
                onClick={handle_click}
            >
                <h1 className="card__title">用户管理</h1>
            </Card>
            <Modal
                title="抱歉，该功能正在开发中"
                centered
                open={open}
                onCancel={handle_cancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handle_cancel}>
                      确定
                    </Button>,
                ]}
            >
                <p>请耐心等待我们的更新</p>
            </Modal>
        </>
    );
};

export default UserManageCard;
