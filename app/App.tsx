import { Route, Routes } from "react-router";
import { lazy, Suspense } from "react";

const Products = lazy(() => import("./routes/products"));
const ShareMedia = lazy(() => import("./routes/share-media"));
const TipTap = lazy(() => import("./routes/tiptap"));
const SimpleTipTap = lazy(() => import("./routes/simple-tiptap"));
const LexicalEditor = lazy(() => import("./routes/lexical"));
const ReactDraft = lazy(() => import("./routes/react-draft"));
const Quill = lazy(() => import("./routes/quill"));
const Slate = lazy(() => import("./routes/slate"));

function LoadingFallback() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/share-media" element={<ShareMedia />} />
        <Route path="/tiptap" element={<TipTap />} />
        <Route path="/simple-tiptap" element={<SimpleTipTap />} />
        <Route path="/lexical" element={<LexicalEditor />} />
        <Route path="/react-draft" element={<ReactDraft />} />
        <Route path="/quill" element={<Quill />} />
        <Route path="/slate" element={<Slate />} />
      </Routes>
    </Suspense>
  );
}

export default App;
