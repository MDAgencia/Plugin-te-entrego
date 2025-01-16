import createApp from "@shopify/app-bridge";
import type { ShopifyGlobal } from "@shopify/app-bridge-react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge/utilities";
import { useEffect, useState } from "react";
import type { ConfigType } from "../../../../plugin/src/views/Config/hooks/useConfig";

const useAuth = () => {
  const appBridge = useAppBridge();
  const [store, setStore] = useState<
    ShopifyGlobal & { accessToken: null | string }
  >({ ...appBridge, accessToken: null });
  const [sessionToken, setSessionToken] = useState<null | string>(null);
  const [accessToken, setAccessToken] = useState<null | string>(null);

  const handleGetAccessToken = async () => {
    const config: ConfigType = localStorage.getItem("config")
      ? JSON.parse(localStorage.getItem("config") ?? "")
      : null;
    console.log({ config });
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const req = await fetch(
      `/api/access-token?code=${code}&clientId=${config.platform_public_key}&clientSecret=${config.platform_secret_key}&shop=${appBridge.config.shop}&sessionToken=${sessionToken}`,
    );

    const tokens = await req.json();
    setAccessToken(tokens.access_token);
  };
  useEffect(() => {
    if (appBridge) {
      const app = createApp({
        apiKey: appBridge.config.apiKey,
        host: appBridge?.config?.host ?? "",
      });

      getSessionToken(app)
        .then((token) => {
          setSessionToken(token);
        })
        .catch((error) => {
          console.error("Error al obtener el session token:", error);
        });
    }
  }, [appBridge]);

  const handleSetStore = async () => {
    accessToken && setStore({ ...store, accessToken });
  };

  useEffect(() => {
    sessionToken !== null && handleGetAccessToken();
  }, [sessionToken]);

  useEffect(() => {
    accessToken !== null && handleSetStore();
  }, [accessToken]);

  return {
    store,
  };
};

export default useAuth;
