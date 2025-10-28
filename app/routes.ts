import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products", "routes/products.tsx"),
  route("share-media", "routes/share-media.tsx"),
  route("tiptap", "routes/tiptap.tsx"),
  route("lexical", "routes/lexical.tsx"),
  route("react-draft", "routes/react-draft.tsx"),
  route("quill", "routes/quill.tsx"),
  route("slate", "routes/slate.tsx"),
] satisfies RouteConfig;
