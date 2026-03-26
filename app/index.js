import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

// Prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }

      await SplashScreen.hideAsync();
    };

    init();
  }, []);

  return null;
}