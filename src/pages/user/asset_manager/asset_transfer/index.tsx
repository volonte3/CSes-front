import { useState } from "react";
import { Button } from "antd";
import EmployeeListModal from "../../../../components/AssetTransferUI";
import { MemberData } from "../../../../utils/types";
interface emloyedata{
    id: number;
    name: string;
    department: string;
}
const ParentComponent = () => {
    const [visible, setVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<MemberData | null>(null);

    const handleOpenModal = () => {
        setVisible(true);
    };

    const handleCloseModal = () => {
        setVisible(false);
        console.log("visible is false");
    };

    const handleSelectEmployee = (employee: MemberData | null) => {
        setSelectedEmployee(employee);
        setVisible(false);
    };

    const handleSubmit = () => {
    // 在这里处理提交操作，可以使用选中的员工信息
        console.log(selectedEmployee);
        handleCloseModal();
    };

    return (
        <div>
            <Button onClick={handleOpenModal}>选择员工</Button>
            {selectedEmployee && (
                <div>
                    <p>选中的员工：</p>
                    <p>{selectedEmployee.Name}</p>
                    <p>{selectedEmployee.Department}</p>
                    <Button onClick={handleSubmit}>提交</Button>
                </div>
            )}
        </div>
    );
};

export default ParentComponent;
