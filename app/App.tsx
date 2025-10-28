import { Route, Routes } from "react-router";
import Products from "./routes/products";
import ShareMedia from "./routes/share-media";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Products />} />
      <Route path="/share-media" element={<ShareMedia />} />
    </Routes>
  );
}

export default App;
