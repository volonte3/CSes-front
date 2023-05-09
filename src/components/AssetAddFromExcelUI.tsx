import React, {useState} from "react";
import { 
    UploadOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { Button, Upload, Modal } from "antd";
import * as XLSX from "xlsx";

const AssetAddFromExcelUI = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
        
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        console.log("Clicked cancel button");
        setOpen(false);
    };

    function beforeUpload(file: File) { 
        if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
            return Promise.reject(new Error("Only Excel files are allowed"));
        }
      
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const data = e.target?.result;
                if (data) {
                    const workbook = XLSX.read(data, { type: "array" });
                    const Sheet = workbook.Sheets["Sheet1"];
                    const Data_json = XLSX.utils.sheet_to_json(Sheet);
                    console.log(Data_json[0]);
                    resolve();
                } else {
                    reject(new Error("Failed to read file data"));
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }
      
    return (
        <div>
            <Button type="primary" onClick={showModal} icon={<PlusOutlined/>}>
                通过Excel批量录入
            </Button>
            <Modal title="通过Excel批量录入"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <Upload beforeUpload={beforeUpload}>
                    <Button icon={<UploadOutlined />}>选择Excel文件</Button>
                </Upload>
            </Modal>
            
        </div>       
    );
};

export default AssetAddFromExcelUI;