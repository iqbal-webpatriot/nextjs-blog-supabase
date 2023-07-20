import { useEffect, useRef, useState } from "react";

const LoadMore = ({ onLoadMore, isVisible, blogs, totalBlogsCount }) => {
  const loadMoreRef = useRef(null);
  const [loadingText, setLoadingText] = useState("Load more");

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (
  //       loadMoreRef.current &&
  //       loadMoreRef.current.getBoundingClientRect().top <= window.innerHeight
  //     ) {
  //       onLoadMore();
  //     }
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [loadMoreRef]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 flex items-center justify-center py-4 ${
        isVisible ? "visible" : "invisible"
      }`}
    >
      <button
        ref={loadMoreRef}
        onClick={() => {
          if (blogs.length === totalBlogsCount) {
            // setLoadingText("No more records");
            return;
          }
          onLoadMore();
        }}
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
      >
        {blogs.length !== totalBlogsCount && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 animate-spin h-5 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        )}
        
        {blogs.length === totalBlogsCount ? "No more records" : "Load more"}
      </button>
      {/* <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          if (blogs.length === totalBlogsCount) {
            setLoadingText("No more records");
            return;
          }
          onLoadMore();
        }}
      >
        {blogs.length === totalBlogsCount ? "No more records" : "Load more"}
      </button> */}
    </div>
  );
};

export default LoadMore;
