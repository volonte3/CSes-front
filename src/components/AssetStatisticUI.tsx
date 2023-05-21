import { Breadcrumb, Button, Modal, Space } from "antd";
import React, { PureComponent, useEffect, useState } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line} from "recharts";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";
import { ProList } from "@ant-design/pro-components";
import {AreaChartOutlined} from "@ant-design/icons";

interface  AssetStatisticData {
    Type: string;
    Value: number;
}
interface ValueData {
    Date: string;
    NumValue: number;
    ItemValue: number;
    TotalValue: number;
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
    const [TotalNum, setTotalNum] = useState(0);
    const [NumTotalNum, setNumTotalNum] = useState(0);
    const [ItemTotalNum, setItemTotalNum] = useState(0);
    const [NumKindNum, setNumKindNum] = useState(0);
    const [NumProportion, setNumProportion] = useState<AssetStatisticData[]>([]);
    const [ItemProportion, setItemProportion] = useState<AssetStatisticData[]>([]);
    const [Proportion, setProportion] = useState<AssetStatisticData[]>([]);
    const [ValueList, setValueList] = useState<ValueData[]>([]);
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/Asset/StatisticsRealFast/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setTotalNum(res.TotalNum);
                setProportion(res.NumProportion);
                // setValueList(res.Value);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "获取信息失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        request(
            `/api/Asset/StatisticsFast/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setNumTotalNum(res.NumTotalNum);
                setNumKindNum(res.NumKindNum);
                setItemTotalNum(res.ItemTotalNum);
                setNumProportion(res.NumProportion);
                setItemProportion(res.ItemProportion);
                // setValueList(res.Value);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "获取信息失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        request(
            `/api/Asset/StatisticsSlow/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
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
    const data = [
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px", fontWeight:"bold", marginLeft:"30px"}}>{`数量型资产总数：${NumTotalNum}`}</div>
                </>
            ),
            colors: "#9bd4fd"
        },
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px",  fontWeight:"bold", marginLeft:"30px"}}>{`数量型资产类型数：${NumKindNum}`}</div>
                </>
            ),
            colors: "#82b3d5;"
        },
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px", fontWeight:"bold", marginLeft:"30px"}}>{`条目型资产总数：${ItemTotalNum}`}</div>
                </>
            ),
            colors:"#6b91ad"
        }
    ];
    const [ghost, setGhost] = useState<boolean>(false);
    const [openNumPie, setOpenNumPie] = useState(true);
    const [openNumBar, setOpenNumBar] = useState(false);
    const [openItemPie, setOpenItemPie] = useState(false);
    const [openItemBar, setOpenItemBar] = useState(false);
    const [AllAsset, setAllAsset] = useState(false);
    return (
        <div className="Div">
            

        </div>
    );

};
export default AssetStatistic;