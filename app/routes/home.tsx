export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Nadia's Proof of Concept Page</h1>
      <p className="text-gray-600 mb-8">
        Yap intinya ini teh buat coba coba sama belajar aja
      </p>
      <nav className="flex gap-4">
        <a href="/products" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Products
        </a>
        <a href="/share-media" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Share Media
        </a>
      </nav>
    </main>
  );
}
