import { useRouter } from "next/router";

const AssetPage = () => {
    const router = useRouter();
    const { id } = router.query;

    return <div>Asset Page {id}</div>;
};

export default AssetPage;