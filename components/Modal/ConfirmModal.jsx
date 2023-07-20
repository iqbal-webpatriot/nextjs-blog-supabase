import React from 'react'

export default function ConfirmModal({open,deleteBlogPostHandler,closeModalHandler}) {
  return (
   <>
    <div className='text-center'>
    <svg aria-hidden="true" className="mx-auto mb-4 text-gray-400 w-14 h-14" fill="none" stroke="red" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="mb-5 text-lg font-normal text-gray-500">Are you sure you want to delete this blog permanently?</h3>
        <button onClick={()=>{
            deleteBlogPostHandler()
            closeModalHandler()
        }} data-modal-hide="popup-modal" type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
          Yes, I'm sure
        </button>
        <button onClick={closeModalHandler} data-modal-hide="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
          No, cancel
        </button>
    </div>

   </>
  )
}
