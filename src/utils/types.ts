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
    ID: string;   //资产编号 (唯一标识) （不同的产品可能有不同的ID)
    Status: number;  //0-4，生命周期状态
    Owner: string;  //所有者 (可以是任意字符串) （不同的产品可能有不同的Owner）
    Description: string; 	//描述 (可以是任意字符串) （不同的产品可以有不同的Description）
    CreateTime: string;
    IsReceive: boolean;  //是否可以领用（目前资产在该部门的资产管理员下且状态为闲置中
    IsReturn: boolean;  //是否可以退库（目前资产在该员工名下且状态为使用中）
    IsMaintenance: boolean; //是否可以维保（目前资产在该员工名下且状态为使用中）
    IsTransfers: boolean;   //是否可以转移（目前资产在该员工名下且状态为使用中）
}