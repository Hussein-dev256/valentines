import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          Will You Be My Valentine? 💕
        </h1>
        <p className="text-gray-700 mb-6">
          Project initialized with Vite + React + TypeScript + Tailwind CSS
        </p>
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200"
        >
          Count: {count}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          ✅ Vite configured<br />
          ✅ React + TypeScript configured<br />
          ✅ Tailwind CSS configured<br />
          ✅ React Router ready to install
        </p>
      </div>
    </div>
  )
}

export default App
