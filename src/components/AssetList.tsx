import React from "react";
import { Badge, Table, List, Button } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, Search } from "@ant-design/pro-components";

interface AssetListProps {
    Assets: AssetData[]
}
const AssetList = (props: AssetListProps) => {
    const [data, setData] = useState<AssetData[]>(props.Assets); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const [searchText, setSearchText] = useState<string>(""); // 存储搜索框中输入的值
    const onSearch = (value: string) => {
        setSearchText(value);
    };

    const columns: ProColumns<AssetData>[] = [
        {
            title: "资产名称",
            dataIndex: "Name",
            key: "Name",
            search: false,
        },
        {
            title: "资产编号",
            dataIndex: "ID",
            key: "ID",
            search: false,
        },
        {
            title: "生命周期状态",
            dataIndex: "Status",
            key: "Status",
            search: false,
        },
        {
            title: "所有者",
            dataIndex: "Owner",
            key: "Owner",
            search: false,
        },
        {
            title: "描述",
            dataIndex: "Description",
            key: "Description",
        },
        {
            title: "创建时间",
            dataIndex: "CreateTime",
            key: "CreateTime",
            search: false,
        },
    ];
    const FetchAssetList = () => {
        request(`/api/User/member/${LoadSessionID()}`, "GET")
            .then((res) => {
                setData(res.Asset);
            });
    };
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // FetchAssetList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    return (
        // <div>
        <ProTable
            columns={columns}
            options={false}

            // request={(params) => {
            //     const filteredData = props.Assets.filter(
            //         (item) =>
            //             item.Description.includes(searchText)
            //     );

            //     return Promise.resolve({
            //         data: filteredData,
            //         success: true,
            //     });
            // }}
            request={async(params={}) =>
                request(`/api/Asset/Info/${LoadSessionID()}`, "GET")
                    .then(response => {    // 将request请求的对象保存到state中
                        const filteredData = props.Assets.filter(
                            (item) =>
                                item.Description.includes(params.Description)
                        );
                        console.log(params.Description);
                        console.log(filteredData);
                        setData(filteredData);
                        console.log(data);
                        response.Asset = data;
                        console.log(response);
                        return Promise.resolve({ data: filteredData, success: true });
                    })
            }
            // request={async (params = {}, sort, filter) => {
            //     console.log(sort, filter);
            //     // await waitTime(2000);
            //     return request('/api/Asset/Info/{}', {
            //         params,
            //     });
            // }}
            form={{
                // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                syncToUrl: (values, type) => {
                    if (type === "get") {
                        return {
                            ...values,
                            created_at: [values.startTime, values.endTime],
                        };
                    }
                    return values;
                },
            }}
            rowKey="id"
            scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
            pagination={{
                showSizeChanger: true
            }}
            // search={{
            //     searchText,
            //     filterType: "query",
            // }}
            search={{
                defaultCollapsed: false,
                defaultColsNumber: 1,
                split: true,
                span: 8,
                // collapsed: false,   // 不收起查询
                // collapseRender: () => { return <></>; },  // 收起按钮渲染为空(去掉收起按钮)
                // optionRender: ({ searchText, resetText }, { form }) => {
                //     return [
                //         <Button key="searchText" type="primary"
                //             onClick={() => { form?.submit();console.log(form); }} >{searchText}</Button>,
                //         <Button key="resetText" type="default"
                //             onClick={() => { form?.resetFields(); }} >{resetText}</Button>,
                //     ];
                // },
                searchText: "查询"
            }}

        />
        // </div>
    );
};
export default AssetList;