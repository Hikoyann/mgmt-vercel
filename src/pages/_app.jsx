import "@/styles/dist.css";


export default function App({ Component, pageProps }) {
  return (
    <div className="bg-gray-300 min-h-screen flex flex-col items-center w-full max-w-screen-xl mx-auto">
      <Component {...pageProps} />
    </div>
);
}
