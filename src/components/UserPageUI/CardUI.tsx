import { Modal, Card, Button} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
interface CardUIProps {
    state: string;
    appname: string;
    img: string
}
const CardUI = (props: CardUIProps) => {
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
            {props.state == "1" && <Card className="card"
                cover={
                    <Image alt = "" className="card__icon" src={props.img}/>
                }
                onClick={handle_click}
            >
                <h1 className="card__title">{props.appname}</h1>
            </Card>}
            {props.state == "0" && <Card className="card"
                cover={
                    <Image alt = "" className="card__icon" src={props.img}/>
                }
                onClick={handle_click}
                color = "grey"
            >
                <h1 className="card__title">{props.appname}</h1>
            </Card>}
            {props.state == "1" && <Modal
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
            </Modal>}
            {props.state == "0" && <Modal
                title="抱歉，该功能已被您的管理员禁用"
                centered
                open={open}
                onCancel={handle_cancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handle_cancel}>
                      确定
                    </Button>,
                ]}
            >
                <p>请联系管理员申请解封</p>
            </Modal>}
        </>
    );
};