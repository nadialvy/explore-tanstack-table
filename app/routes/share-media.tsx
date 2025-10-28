import "~/app.css";
import { shareMediaFile } from "~/components/share-media/shareMediaFile";

export default function ShareMedia() {

  return (
    <div className="w-full h-screen gap-y-3 flex flex-col justify-center items-center p-4">
      <h2 className="text-xl font-bold mb-4">🧪 Share Media Testing</h2>

      {/* Local Assets */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <h3 className="text-sm font-semibold text-gray-600">Local Assets:</h3>
        <button
          className="bg-blue-400 px-4 py-2 rounded text-white"
          onClick={() => shareMediaFile({ url: "/cat.png" })}
        >
          📷 Local Image
        </button>
        <button
          className="bg-green-400 px-4 py-2 rounded text-white"
          onClick={() => shareMediaFile({ url: "/cat.mp4", type: "video" })}
        >
          🎥 Local Video
        </button>
      </div>

      {/* Public URLs */}
      <div className="flex flex-col gap-2 w-full max-w-md mt-4">
        <h3 className="text-sm font-semibold text-gray-600">Public URLs:</h3>
        <button
          className="bg-blue-500 px-4 py-2 rounded text-white text-sm"
          onClick={() =>
            shareMediaFile({
              url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg",
            })
          }
        >
          📷 Public Image (Wikipedia)
        </button>

        <button
          className="bg-green-500 px-4 py-2 rounded text-white text-sm"
          onClick={() =>
            shareMediaFile({
              url: "https://cdn.vlipsy.com/clips/YvbfprNp/480p-watermark.mp4?token=v1_f_1761053794_eoE6e6aSU",
              type: "video",
            })
          }
        >
          ✅ 🎥 Vlipsy (WORKS)
        </button>

        <button
          className="bg-orange-500 px-4 py-2 rounded text-white text-sm"
          onClick={() =>
            shareMediaFile({
              url: "https://assets.csm-staging.zero-one.cloud/brand-assets/1qxs8ce2j1rj40ct09mr7rp6bc_078d1e264a.mp4",
              type: "video",
            })
          }
        >
          ❌ 🎥 CSM-Staging (FAILS)
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Check console for debug logs 🔍
      </p>
    </div>
  );
}
