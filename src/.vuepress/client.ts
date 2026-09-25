import { defineClientConfig } from "vuepress/client";
import { withBase } from "vuepress/client";
import { defineGiscusConfig } from "@vuepress/plugin-comment/client";
import HomeBannerProfile from "./components/HomeBannerProfile.vue";
import AboutProfile from "./components/AboutProfile.vue";
import "./styles/index.css";

export default defineClientConfig({
  enhance({ app }) {
    if (typeof window !== "undefined") {
      // Absolute URLs are required because the stylesheet loads inside giscus.app.
      const themeUrl = (mode: string) =>
        new URL(withBase(`/comments/${mode}.css`), window.location.origin).href;
      defineGiscusConfig({
        lightTheme: themeUrl("light"),
        darkTheme: themeUrl("dark"),
      });
    }
    app.component("HomeBannerProfile", HomeBannerProfile);
    app.component("AboutProfile", AboutProfile);
  },
});
