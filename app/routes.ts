import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products", "routes/products.tsx"),
  route("share-media", "routes/share-media.tsx"),
  route("tiptap", "routes/tiptap.tsx"),
  route("simple-tiptap", "routes/simple-tiptap.tsx"),
] satisfies RouteConfig;
