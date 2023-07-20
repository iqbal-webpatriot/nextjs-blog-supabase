import Link from 'next/link';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient';
import CommonModal from '../Modal/CommonModal';
import ForgetPassword from '../Modal/ForgetPassword';

export default function BreadCrums() {
    const router=useRouter();
    const pathnames = router.asPath.startsWith("/#")?[]: router.asPath.split('/').filter((x) => x);
    const [isOpen,setIsOpen]=useState(false);
    const  closeHandler= ()=>{
      setIsOpen(false)
    }
    const openHandler=()=>{
      setIsOpen(true)
    }
    useEffect(() => {
      let isPasswordRecovery = true;
    
      const handlePasswordRecovery = async (event, session) => {
        if (isPasswordRecovery && event === "PASSWORD_RECOVERY") {
          setIsOpen(true)
    
          // Set the flag to false after the password recovery logic is executed
          isPasswordRecovery = false;
        }
      };
    
      supabase.auth.onAuthStateChange(handlePasswordRecovery);
    
      return () => {
        // Reset the flag to false when the component unmounts
        isPasswordRecovery = false;
      };
    }, []);
    
  
  return (
    <>
    <div className=' container mx-auto my-28  mb-5 '>
    <nav className="flex  " aria-label="Breadcrumb">
     <ol className="inline-flex items-center space-x-1 md:space-x-3">
    <li className="inline-flex items-center">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
        <svg aria-hidden="true" className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
        Home
      </Link>
    </li>
      {   pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <li key={index}>
          <div className="flex items-center">
        <svg aria-hidden="true" className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        <a href="" onClick={e=>e.preventDefault()} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">{name}</a>
      </div>
    </li>
        ) : (
          <li key={index}>
          <div className="flex items-center">
        <svg aria-hidden="true" className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        <a href="" onClick={e=>e.preventDefault()} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">{name}</a>
      </div>
    </li>
        );
      })}
   {/* {breadcrumbs.slice(previousIndex, currentIndex + 1).map((currBreadcrumb)=>{
    return (
      <li>
      <div className="flex items-center">
        <svg aria-hidden="true" className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        <a href="" onClick={e=>e.preventDefault()} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">{currBreadcrumb.label}</a>
      </div>
    </li>
    )
   })} */}
   
  </ol>
    </nav>
    
    </div>
    <CommonModal open={isOpen} onClose={closeHandler}>
      <ForgetPassword/>
    </CommonModal>
    </>
  )
}
