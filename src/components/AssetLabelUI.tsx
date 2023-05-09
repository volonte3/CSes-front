import { AssetDetailInfo, LabelVisable } from "../utils/types";
import { ProCard } from "@ant-design/pro-components";
import { DateTransform, renderStatus, renderValue } from "../utils/transformer";
import { QRCode } from "react-qr-svg"; // 引入生成二维码的组件
import { Row, Col } from "antd";

const qrcodeData = "https://example.com"; // 二维码的链接地址
function getVisibleKeys(obj: LabelVisable): (keyof LabelVisable)[] {
    return Object.keys(obj).filter(key => obj[key as keyof LabelVisable]) as (keyof LabelVisable)[];
};
const LabelDef = (props: { DetailInfo: AssetDetailInfo | undefined, labelVisable: LabelVisable }) => {
    // const visibleKeys = Object.keys(props.labelVisable).filter(key => props.labelVisable[key]) as (keyof LabelVisable)[];
    const visableKeys = getVisibleKeys(props.labelVisable);
    const rows = [];
    for (let i = 0; i < visableKeys.length; i += 2) {
        const key1 = visableKeys[i];
        const key2 = visableKeys[i + 1];
        const value1 = renderValue(key1, props.DetailInfo);
        const value2 = renderValue(key2, props.DetailInfo);
        const col1 = <ProCard title={key1}>{value1}</ProCard>;
        const col2 = <ProCard title={key2}>{value2}</ProCard>;
        rows.push([col1, col2]);
    }
    return (
        <div >
            <ProCard split="horizontal" style={{ height: "300px" }}>
                <Row>
                    <Col span={18}>
                        <div style={{ height: "100%" }}>

                            {rows.map(row => (
                                <ProCard split="vertical" key={row.join()}>
                                    {row}
                                </ProCard>
                            ))}
                        </div>
                    </Col>
                    <Col span={6} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ height: "100%",display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <QRCode
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="Q"
                                style={{ width: 128 }}
                                value={qrcodeData}
                            />
                        </div>
                    </Col>
                </Row>

                <br></br>
            </ProCard>
        </div>
    );
};
export default LabelDef;