import React, {useState} from "react";
import { 
    UploadOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { Button, Upload, Modal, message } from "antd";
import * as XLSX from "xlsx";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";

interface ProDic {
    [key: string]: string;
}

interface MyDic {
    [key: string]: string | ProDic;
}

interface SendDic {
    [key: string]: MyDic[];
}

let AddList: MyDic[] = [];

const AssetAddFromExcelUI = () => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [itemlist, setitemlist] = useState<any[]>([]);

    const handleOk = () => {
        setConfirmLoading(true);
        for (let i = 0; i < itemlist.length; i++) {
            const item = itemlist[i];
            const keys = Object.keys(item);
            let now_dic: MyDic = {};
            let pro_dic: ProDic = {};
            // 遍历所有键并访问键值
            keys.forEach(key => {
                const value = item[key];
                if (key == "资产名称") {
                    now_dic["Name"] = value;
                }
                else if (key == "资产分类") {
                    now_dic["Type"] = value;
                }
                else if (key == "资产数量") {
                    now_dic["Number"] = value;
                }
                else if (key == "资产价值") {
                    now_dic["Value"] = value;
                }
                else if (key == "资产位置") {
                    now_dic["Position"] = value;
                }
                else if (key == "资产描述") {
                    now_dic["Describe"] = value;
                }
                else {
                    pro_dic[key] = value;
                }
            });
            now_dic["Property"] = pro_dic;
            AddList.push(now_dic);
        }
        request(
            `/api/Asset/MutiAppend/${LoadSessionID()}`,
            "POST",
            {
                chusheng: AddList,
            }
        )
            .then((res) => {
                message.success("提交成功");
                setOpen(false);
                setConfirmLoading(false);
                AddList = [];
            })
            .catch((err) => {
                setOpen(false);
                setConfirmLoading(false);
                Modal.error({
                    content: err.message.substring(5),
                });
                AddList = [];
            });
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
                    const Data_list = Array.from(Data_json.values()) as any[];
                    setitemlist(Data_list);
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
                <a href="https://cloud.tsinghua.edu.cn/f/9d0da52504d74bcbb1e8/?dl=1" target="_blank" rel="noopener noreferrer">点此下载模板文件</a>
                <br />
                <br />
                <Upload beforeUpload={beforeUpload}>
                    <Button icon={<UploadOutlined />}>选择Excel文件</Button>
                </Upload>
            </Modal>
            
        </div>       
    );
};

export default AssetAddFromExcelUI;