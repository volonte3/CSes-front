import { Breadcrumb, Modal, Space } from "antd";
import React, { PureComponent, useEffect, useState } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line} from "recharts";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";

interface  AssetStatisticData {
    Type: string;
    Value: number;
}
interface ValueData {
    Date: string;
    数量型价值: number;
    条目型价值: number;
    总价值: number;
}
const data1 = [
    { name: "维保中", Value: 400, color: "#E91E63" },
    { name: "闲置中", Value: 300, color: "#9C27B0" },
    { name: "使用中", Value: 300, color: "#2196F3" },
    { name: "已清退", Value: 200, color: "#4CAF50" }
];
const colors = data1.map(item => item.color);
const AssetStatistic= () => {
    const RADIAN = Math.PI / 180;
    const router = useRouter();
    const query = router.query;
    const [NumTotalNum, setNumTotalNum] = useState(0);
    const [ItemTotalNum, setItemTotalNum] = useState(0);
    const [NumProportion, setNumProportion] = useState<AssetStatisticData[]>([]);
    const [ItemProportion, setItemProportion] = useState<AssetStatisticData[]>([]);
    const [ValueList, setValueList] = useState<ValueData[]>([]);
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/Asset/Statistics/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setNumTotalNum(res.NumTotalNum);
                setItemTotalNum(res.ItemTotalNum);
                setNumProportion(res.NumProportion);
                setItemProportion(res.ItemProportion);
                setValueList(res.Value);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "获取信息失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [router, query]);
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    
    return (
        <div className="Div">
            <Breadcrumb style={{ marginLeft: "6px", marginBottom:"20px", fontSize:"26px"}}>
                <Breadcrumb.Item>资产统计</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{display:"flex"}}>
                <Breadcrumb style={{ marginLeft: "130px"}}>
                    <Breadcrumb.Item>数量型资产分布</Breadcrumb.Item>
                </Breadcrumb>
                <Breadcrumb style={{ marginLeft: "500px"}}>
                    <Breadcrumb.Item>条目型资产分布</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div style={{display:"flex", marginTop:"-20px"}}>
                <Space style={{marginLeft:"10px"}}> </Space>
                {NumTotalNum > 0 ? <PieChart width={400} height={400}>
                    <Pie
                        dataKey="Value"
                        isAnimationActive={false}
                        data={NumProportion}
                        cx="50%"
                        cy="50%"
                        width={800}
                        outerRadius={130}
                        fill="#8884d8"
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {data1.map((entry, index) => (
                            <Cell key={index} fill={data1[index].color} className="pie-slice" onClick={()=>{}}/>
                        ))}
                    </Pie>
                    <Tooltip/>
                    <Legend iconSize={20} />
                </PieChart> : <h1 style={{marginTop:"100px", marginLeft:"140px"}}>暂无数量型资产</h1>}
                <Space style={{marginLeft:"250px"}}> </Space>
                {ItemTotalNum > 0 ? <PieChart width={400} height={400}>
                    <Pie
                        dataKey="Value"
                        isAnimationActive={false}
                        data={ItemProportion}
                        cx="50%"
                        cy="50%"
                        width={800}
                        outerRadius={130}
                        fill="#8884d8"
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {data1.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={data1[index].color} className="pie-slice"/>
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={20} />
                </PieChart> : <h1 style={{marginTop:"100px", marginLeft:"140px"}}>暂无条目型资产</h1>}
            </div>
            <Breadcrumb style={{ marginLeft: "130px", marginTop:"40px", marginBottom:"20px"}}>
                <Breadcrumb.Item>单月资产净值变化</Breadcrumb.Item>
            </Breadcrumb>
            <LineChart
                width={500}
                height={300}
                data={ValueList}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" />
                <YAxis />
                <Tooltip
                />
                <Legend
                    payload={[
                        { value: "条目型价值", type: "line", color: "#8884d8" },
                        { value: "数量型价值", type: "line", color: "#82ca9d" },
                        { value: "总价值", type: "line", color: "#1890ff" },
                    ]}
                />
                <Line type="monotone" dataKey="ItemValue" name="条目型价值" stroke="#8884d8" />
                <Line type="monotone" dataKey="NumValue" name="数量型价值" stroke="#82ca9d" />
                <Line type="monotone" dataKey="TotalValue" name="总价值" stroke="#1890ff" />
            </LineChart>
        </div>
    );

};
export default AssetStatistic;