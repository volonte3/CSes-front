import { Modal, Card, Button} from 'antd';
import { useRouter } from "next/router";
import { useState } from 'react';
const AssetQueryCard = () => {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();
    const query = router.query;
    const handle_click = () => {
        setOpen(true);
    }
    const handle_cancel = () => {
        setOpen(false);
    }
    return (
        <>
            <Card
                style={{ width: 160, height: 160 }}
                cover={
                    <img
                        alt="example"
                        src="AssetQuery.png"
                        // width="25"
                        height="100"
                    />
                }
                title='资产查询'
                onClick={handle_click}
            >
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
}

export default AssetQueryCard;
