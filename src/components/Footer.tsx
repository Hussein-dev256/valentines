export default function Footer() {
  return (
    <footer className="py-6 text-center text-gray-600 text-sm">
      <p>
        Made with ❤️ by Web Developer Uganda
      </p>
      <p className="mt-2">
        Follow me on{' '}
        <a 
          href="https://x.com/son_of_antonn" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-700 underline"
        >
          X
        </a>
        {', '}
        <a 
          href="https://www.instagram.com/webdeveloper.256?igsh=ZjRuaXQ3dW45OWY3" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-700 underline"
        >
          Instagram
        </a>
        {', '}
        <a 
          href="https://tiktok.com/@webdeveloper_256" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-700 underline"
        >
          Tiktok
        </a>
      </p>
    </footer>
  );
}
