import { Breadcrumb, Space } from "antd";
import React, { PureComponent, useState } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid} from "recharts";
import dynamic from "next/dynamic";


const data1 = [
    { name: "维保中", value: 400, color: "#E91E63" },
    { name: "闲置中", value: 300, color: "#9C27B0" },
    { name: "使用中", value: 300, color: "#2196F3" },
    { name: "已清退", value: 200, color: "#4CAF50" }
];
const data2 = [
    {
        name: "Page A",
        uv: 4000,
        pv: 2400,
    },
    {
        name: "Page B",
        uv: 3000,
        pv: 1398,
    },
    {
        name: "Page C",
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: "Page D",
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: "Page E",
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: "Page F",
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: "Page G",
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];
const colors = data1.map(item => item.color);
const AssetStatistic= () => {
    const RADIAN = Math.PI / 180;
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
    const renderActiveShape = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        fill,
        index
    }: any) => {
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + outerRadius * cos;
        const sy = cy + outerRadius * sin;
        const mx = cx + outerRadius * cos * 0.85;
        const my = cy + outerRadius * sin * 0.85;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? "start" : "end";
        return (
            <g className="pie-slice">
                
            </g>
        );
    };
    const [activeIndex, setActiveIndex] = useState<number>();
    const handleMouseEnter = (_:any, index:any) => {
        setActiveIndex(index);
    };
  
    const handleMouseLeave = () => {
        setActiveIndex(undefined);
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
                <PieChart style width={400} height={400}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={data1}
                        cx="50%"
                        cy="50%"
                        width={800}
                        outerRadius={130}
                        fill="#8884d8"
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {data1.map((entry, index) => (
                            <Cell key={index} fill={data1[index].color} className="pie-slice"/>
                        ))}
                    </Pie>
                    <Tooltip/>
                    <Legend iconSize={20} />
                </PieChart>
                <Space style={{marginLeft:"250px"}}> </Space>
                <PieChart width={400} height={400}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={data1}
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
                </PieChart>
            </div>
            <Breadcrumb style={{ marginLeft: "130px", marginTop:"40px", marginBottom:"20px"}}>
                <Breadcrumb.Item>单月资产净值变化</Breadcrumb.Item>
            </Breadcrumb>
            <BarChart
                width={1200}
                height={300}
                data={data2}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip/>
                <Legend iconSize={20} />
                <Bar dataKey="pv" stackId="a" fill="#8884d8" />
                <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
            </BarChart>
        </div>
    );

};
export default AssetStatistic;