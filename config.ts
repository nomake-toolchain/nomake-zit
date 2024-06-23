import * as NM from 'nomake';
export { NM }

export const BuildConfig = {
    version: '0.1.2',
    ZIT_DOWNLOAD_URL: 'https://github.com/thautwarm/zit/releases/download',
}

NM.option(
    "ZIT_DOWNLOAD_URL",
    {
        doc: "Custom URL to download 'zit' from.",
        callback: ({ value }) =>
        {
            while (value.endsWith("/"))
            {
                value = value.slice(0, -1);
            }
            BuildConfig.ZIT_DOWNLOAD_URL = value;
        }
    })
