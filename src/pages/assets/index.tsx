import { useRouter } from "next/router";
import { BrowserRouter as Router, Route, useLocation } from "react-router-dom";
import { Collapse, Grid, List } from "antd-mobile";
import { ProCard } from "@ant-design/pro-components";
const AssetPage = () => {
    const router = useRouter();
    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get("id");
    const id = router.query.id;
    const assetData = {
        name: "Asset Name",
        type: "Asset Type",
        value: "$1,000",
        description: "Asset Description",
    };

    return (
        <div>
            <Collapse defaultActiveKey={["1"]}>
                <Collapse.Panel key='1' title='第一项'>
                    <ProCard split="horizontal">
                        <ProCard split="vertical">
                            <ProCard title="资产名称">{assetData.name}</ProCard>
                            <ProCard title="ID">{id}</ProCard>
                            <ProCard title="创建时间">{assetData.name}</ProCard>
                        </ProCard>
                        <ProCard split="vertical">
                            <ProCard title="当前所有者">{assetData.name}</ProCard>
                            <ProCard title="状态">
                                assetData.value
                            </ProCard>
                        </ProCard>
                        <ProCard split="vertical">
                            <ProCard title="资产描述">{assetData.description}</ProCard>
                        </ProCard>
                    </ProCard>
                </Collapse.Panel>
            </Collapse>
        </div>
    );
};

export default AssetPage;