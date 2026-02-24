import "./globals.css";

export const metadata = {
  title: "SmartHire",
  description: "AI Powered Job Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="w-full px-6 py-4 bg-white shadow flex justify-between">
          <h1 className="font-bold text-xl text-blue-600">
            SmartHire
          </h1>

          <div className="space-x-4">
            <button className="text-gray-700">Login</button>
            <button className="text-gray-700">Register</button>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}