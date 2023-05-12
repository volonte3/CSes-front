export type Board = (0 | 1)[][];

/**
 * @note 用于前后端交互的 Board 数据格式
 */
export interface BoardMetaData {
    id: number;
    name: string;
    createdAt: number;
    userName: string;
}

export interface AssetData{
    Name: string;   //资产名称
    ID: number;   //资产编号 (唯一标识) （不同的产品可能有不同的ID)
    Status: number;  //0-4，生命周期状态
    Owner: string;  //所有者 (可以是任意字符串) （不同的产品可能有不同的Owner）
    Description: string; 	//描述 (可以是任意字符串) （不同的产品可以有不同的Description）
    CreateTime: string;
    IsReceive: boolean;  //是否可以领用（目前资产在该部门的资产管理员下且状态为闲置中
    IsReturn: boolean;  //是否可以退库（目前资产在该员工名下且状态为使用中）
    IsMaintenance: boolean; //是否可以维保（目前资产在该员工名下且状态为使用中）
    IsTransfers: boolean;   //是否可以转移（目前资产在该员工名下且状态为使用中）
}

export interface ApplyApprovalData{
    Name:string;
    AssetID:string;
    ApplyID:string;     //这次申请的ID
    ApplyTime:string;   //提出申请的时间
    Operation:number;   //0：领用，1：退库，2：维保，3：转移
    FromPerson:string;  //所有操作本质上都是从一个人的名下转到另一个人名下，这里写源员工/资产管理员名
    ToPerson:string;    //这里写目标员工/资产管理员名
    Applicant:string;   //提出申请的人
    Valid:boolean;  //0表示不可以被同意，对应的情况比如多个人申请同一个资产，但资产管理员刚刚同意把资产转移到另一个人名下，那么其他人提出的申请就是无效的，虽然要向资产管理员展示但资产管理员只能驳回申请
    Property:any;
}

export interface AppData {
    IsInternal: boolean;
    IsLock: boolean;
    AppName: string;
    AppUrl: string;
}
export interface CardUIProps {
    state: number;
    appname: string;
    img: string;
    url: string;
    internal:boolean;
}

export interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
export interface DepartmentData {
    DepartmentName: string;
    DepartmentPath: string;
    DepartmentId: number;
}
export interface DepartmentPathData {
    Name: string;
    Path: string;
}
export interface DataType {
    key: React.Key;
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
export interface AssetHistory{
    Review_Time:string,
    ID:number,
    Type:number,
    Initiator:string,
    Participant:string,
    Asset_Admin:string,
}
export interface AssetDetailInfo{
    Name:string,
    ID:number,
    Status:number,
    Owner:string,
    Description:string,
    CreateTime:string,
    History:AssetHistory[],
    PropertyName:string[],
    // PropertyValue:string[],
    Class:string,
    LabelVisible:LabelVisible
}

export interface LabelVisible{
    Name:boolean,
    ID:boolean,
    Status:boolean,
    Owner:boolean,
    Description:boolean,
    CreateTime:boolean,
    Class: boolean,
}