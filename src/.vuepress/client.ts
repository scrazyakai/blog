import { defineClientConfig } from "vuepress/client";
import HomeBannerProfile from "./components/HomeBannerProfile.vue";
import "./styles/index.css";

export default defineClientConfig({
  enhance({ app }) {
    app.component("HomeBannerProfile", HomeBannerProfile);
  },
});
