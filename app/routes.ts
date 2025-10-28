import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products", "routes/products.tsx"),
  route("share-media", "routes/share-media.tsx"),
  route("tiptap", "routes/tiptap.tsx"),
  route("lexical", "routes/lexical.tsx"),
  route("react-draft", "routes/react-draft.tsx"),
] satisfies RouteConfig;
