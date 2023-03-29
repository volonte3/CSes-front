// export default Login;
import LoginUI from "../components/LoginUI";
import { withRouter, Prompt } from "react-router-dom"; // 从react-router-dom中引出Prompt组件
// import { useCookies } from "react-cookies";
// import cookie from "react-cookies";
import {Button,Form} from "antd";
// import { request } from "../../utils/network";


const Login = () => {
    // LoginControl();
    // const state =  { token: loginUser() }
    // console.log(state)
    // loginUser();
    return <LoginUI />;
    //  <div style={{ display: "flex", justifyContent: "center" }}>
    {/* <Form.Item > */}

    {/* <Button type="primary" htmlType="submit" className="Test" onClick={()=>{onLogin("aaa");window.location.reload();}}>
            s
        </Button> */}
        
    {/* </Form.Item> */}
    // </div>;
};

export default Login;
