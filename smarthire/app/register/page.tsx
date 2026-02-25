export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create Account
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
          />

          <select className="w-full px-3 py-2 border rounded">
            <option value="">Select Role</option>
            <option value="seeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}