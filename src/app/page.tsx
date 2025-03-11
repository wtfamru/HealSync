export default function Home() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900"
      style={{
        backgroundImage: "url('/background.jpg')", // Change this to your image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="p-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl text-center max-w-lg border border-white/20">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-md">
          Welcome to <span className="text-blue-300">HealSync</span> 🚀
        </h1>
        <p className="mt-4 text-lg text-white/90 leading-relaxed">
          A secure, blockchain-based organ donation platform.  
          Seamless, transparent, and powered by <strong>Web3</strong>.
        </p>

        <div className="mt-6">
          <button className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-full shadow-md transition-transform duration-300 hover:scale-105 hover:bg-blue-700">
            Get Started
          </button>
        </div>

        
      </div>
    </main>
  );
}