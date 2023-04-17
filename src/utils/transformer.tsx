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
const renderStatus = (Status: number): string => {
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
export {
    renderAuthority,
    renderStatus
};