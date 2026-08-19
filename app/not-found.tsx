import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#0B132B]"
      style={{ color: "#F5ECD7" }}
    >
      <div className="text-center max-w-md space-y-6">
        <div
          className="w-28 h-28 rounded-2xl mx-auto flex items-center justify-center border"
          style={{
            background: "rgba(201, 168, 76, 0.1)",
            borderColor: "rgba(201, 168, 76, 0.45)",
          }}
        >
          <span className="text-4xl font-black" style={{ fontFamily: "var(--font-trajan), serif", color: "#C9A84C" }}>
            404
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-trajan), serif" }}>
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed text-neutral-300">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block rounded-md px-6 py-3 text-sm font-bold transition-all shadow-lg"
          style={{
            background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
            color: "#050200",
            fontFamily: "var(--font-trajan), serif",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
