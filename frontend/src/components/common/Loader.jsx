import { Ring } from "@uiball/loaders";

export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Ring size={60} lineWeight={5} speed={2} color="#4F46E5" />
      <p className="mt-4 text-gray-500 text-sm">Loading...</p>
    </div>
  );
}
