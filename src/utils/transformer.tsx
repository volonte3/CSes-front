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
export {
    renderAuthority
};