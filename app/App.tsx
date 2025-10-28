import { Route, Routes } from "react-router";
import Products from "./routes/products";
import ShareMedia from "./routes/share-media";
import TipTap from "./routes/tiptap";
import SimpleTipTap from "./routes/simple-tiptap";
import LexicalEditor from "./routes/lexical";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Products />} />
      <Route path="/share-media" element={<ShareMedia />} />
      <Route path="/tiptap" element={<TipTap />} />
      <Route path="/simple-tiptap" element={<SimpleTipTap />} />
      <Route path="/lexical" element={<LexicalEditor />} />
    </Routes>
  );
}

export default App;
