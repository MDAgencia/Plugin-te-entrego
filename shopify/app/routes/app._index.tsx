import { useEffect, useState } from "react";
import Wrapper from "../../../plugin/src/wrapper";
import { Layout } from "@shopify/polaris";
import useAuth from "./hooks/useAuth";
export default function Index() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  const { store } = useAuth();

  return (
    show && (
      <Layout>
        <Wrapper
          shopName="shopify"
          store={{
            ...store.config,
            accessToken: store.accessToken,
          }}
        />
      </Layout>
    )
  );
}
