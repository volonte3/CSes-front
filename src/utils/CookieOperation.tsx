const getCookie = (key: string, default_value: string): string => {
    const rgx = new RegExp("(?:^|(?:; ))" + key + "=([^;]*)");
    const result = document.cookie.match(rgx);
    if (result) {
        return result[1];
    } else {
        return default_value;
    }
};

const setCookie = (key: string, value: string) => {
    //设置 Cookie
    document.cookie = key + "=" + value;
};

const generateRandomString = (num: number) => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result1 = " ";
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
};

export { getCookie, setCookie, generateRandomString };