export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">
        SmartHire
      </h1>

      <p className="mt-4 text-lg text-gray-700">
        AI Powered Job Portal
      </p>

      <div className="mt-6 flex gap-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md">
          Find Jobs
        </button>

        <button className="px-6 py-2 bg-gray-200 rounded-md">
          Post a Job
        </button>
      </div>
    </main>
  );
}