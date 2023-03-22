import { useRouter } from "next/router";
import ListScreen from ".";

const ListScreenWithUserName = () => {
    const router = useRouter();

    return (
        <ListScreen userName={router.query.name as string} />
    );
};

export default ListScreenWithUserName;