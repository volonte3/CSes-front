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
}