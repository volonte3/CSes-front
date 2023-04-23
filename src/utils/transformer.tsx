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
    case 0:
        label = "success";
        break;
    case 1:
        label = "error";
        break;
    case 2:
        label = "warning";
        break;
    case 3:
        label = "processing";
        break;
    case 4:
        label = "default";
        break;
    default:
        break;
    }
    return label;
};
const DateTransform=(text:string)=>{
    const date = new Date(text);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;

};
export {
    renderAuthority,
    renderStatus,
    DateTransform,
    renderStatusBadge
};