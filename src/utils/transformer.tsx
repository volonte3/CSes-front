import {LabelVisible,AssetDetailInfo} from "./types";
const renderAuthority = (identity: number): string => {
    let label = "";
    switch (identity) {
    case 0:
        label = "超级管理员";
        break;
    case 1:
        label = "系统管理员";
        break;
    case 2:
        label = "资产管理员";
        break;
    case 3:
        label = "员工";
        break;
    default:
        break;
    }
    return label;
};
const renderStatus = (Status: any): string => {
    let label = "";
    switch (Status) {
    case 0:
        label = "闲置中";
        break;
    case 1:
        label = "使用中";
        break;
    case 2:
        label = "维保中";
        break;
    case 3:
        label = "已清退";
        break;
    case 4:
        label = "已删除";
        break;
    default:
        break;
    }
    return label;
};
const renderStatusBadge = (Status: any): "success" | "processing" | "error" | "default" | "warning" | undefined => {
    let label: "success" | "processing" | "error" | "default" | "warning" | undefined;
    switch (Status) {
    case 0:     //领用
        label = "success";
        break;
    case 1:     //退库
        label = "error";
        break;
    case 2:     //维保
        label = "warning";
        break;
    case 3:     //转移 
        label = "processing";
        break;
    case 4:     //清退
        label = "default";
        break;
    case 5:     //退维
        label = "success";
        break;
    case 6:     //调拨
        label = "processing";
        break;
    case 7:     //录入
        label = "success";
        break;
    case 8:     //变更
        label = "warning";
        break;
    default:
        label = "default";
        break;
    }
    return label;
};
const renderStatusChanges = (Status:number|undefined) =>{
    let label = "";
    switch (Status) {
    case 0:
        label = "领用";
        break;
        
    case 1:
        label = "退库";
        break;
    case 2:
        label = "维保";
        break;
    case 3:
        label = "转移";
        break;
    case 4:
        label = "清退";
        break;
    case 5:
        label = "退维";
        break;
    case 6:
        label = "调拨";
        break;
    case 7:
        label = "录入";
        break;
    case 8:
        label = "变更";
        break;
    default:
        label = "其它";
        break;
    }
    return label;
} ;
const DateTransform=(text:string|undefined)=>{
    if (text==undefined) return undefined;
    const date = new Date(text);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

};
const renderValue = (key: keyof LabelVisible, detailInfo?: AssetDetailInfo) => {
    switch (key) {
    case "Name": return detailInfo?.Name;
    case "ID": return detailInfo?.ID;
    case "Status": return renderStatus(detailInfo?.Status);
    case "Owner": return detailInfo?.Owner;
    case "Description": return detailInfo?.Description;
    case "CreateTime": return DateTransform(detailInfo?.CreateTime);
    default: return detailInfo?.[key];
    }
};
export {
    renderAuthority,
    renderStatus,
    DateTransform,
    renderStatusBadge,
    renderStatusChanges,
    renderValue
};