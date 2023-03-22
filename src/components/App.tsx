import React from 'react';
import type { FC } from 'react';
import { Button } from 'antd';
// import 'antd/dist/reset.css';
// import './App.css';
interface LoginAppProps {
    name?: React.ReactNode;
    type?: number;
    // flip: (i: number, j: number) => void;
};
const LoginApp: FC<LoginAppProps> = (prop) => (
  <div className="LoginApp">
    <h1>登录界面</h1>
    <form>
        <input></input>
    </form>
    <Button type="primary">{prop.name}{prop.type}</Button>
  </div>
);

export default LoginApp;
// export AppButton default;