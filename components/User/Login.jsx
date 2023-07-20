import React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useDispatch } from "react-redux";
import { addLoggedUserInfo } from "../../Redux/Features/UserFeature/userSlice";
import { useRouter } from "next/router";
import Head from "next/head";
import CommonModal from "../Modal/CommonModal";
import ForgetPasswordReqModal from "../Modal/ForgetPasswordReqModal";
import { toast,ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
export const EMAIL_PATTERN =  /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export default function Login() {
  const dispatch=useDispatch()
  const router= useRouter()
  const [toggleLoginSignUp, setToggleLoginSignUp] = useState(false);
  const [userInput, setUserInput] = useState({
    email: "",
    password: "",
  });
  const [isOpen,setIsOpen]=useState(false);
  const  closeHandler= ()=>{
    setIsOpen(false)
  }
  const openHandler=()=>{
    setIsOpen(true)
  }

  const [errorMessage, setErrorMessage] = useState({});
 
  //! functions for the component
  const handleUserInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUserInput({ ...userInput, [name]: value });
    setErrorMessage({})
  };
  const handleLoginSignup = async (e) => {
    e.preventDefault();
    try {
      const { email, password } = userInput;
      //** checking empty field validation */
      if (!email &&  !password) {
        setErrorMessage({ email: "This field is required.",password: "This field is required"});
        return;
      }
      else if (!email) {
        setErrorMessage({ email: "This field is required."});
        return;
      }
     else   if ( !password) {
        setErrorMessage({password: "This field is required"});
        return;
      }
  
      //! validation check for email and password 
      if(email && !EMAIL_PATTERN.test(email)) {
         setErrorMessage({email:'Invalid email format.'});
         return
      }
      if(password && !PASSWORD_PATTERN.test(password)) {
        setErrorMessage({password:'Password must be alphanumeric of minimum 8 character.'});
      
        return
     }
  
     //! handling login or signup event
     if(toggleLoginSignUp){
      //?? it means user want to create a new account
      //** checking if the user is already registered */
       const isUserExist= await supabase.rpc('user_exist',{email})
        if(isUserExist.data){
          toast.error("User already exists")
          // setErrorMessage({invalidLogin:"User already exists."});
          
        }
        else{
          const newUser= await supabase.auth.signUp({email,password});
          toast.warning("Please verify your account.Check your email");
          setErrorMessage({verifyEmail:'Please verify your account.Check your email'})
      //  console.log("new user created: " , newUser)
        }
      //  console.log('user exist ', isUserExist)
      //  setErrorMessage({})
     }
     else{
      const isUserExist= await supabase.rpc('user_exist',{email})
      if(!isUserExist.data){
        // setErrorMessage({invalidLogin:"User already exists."});
        toast.error("User does not exist")
        return 
      }
      const logged= await supabase.auth.signInWithPassword({email,password});
       if(logged.error){
        if(logged.error?.message.startsWith("Email not")){
          // setErrorMessage({invalidLogin:logged.error?.message+".Please check your email"})
          toast.warning('Please verify your account')
          dispatch(addLoggedUserInfo({user:{},session:{}}));
          return
        }
        toast.error("Email or password did not match")
        // setErrorMessage({invalidLogin:logged.error?.message})
        dispatch(addLoggedUserInfo({user:{},session:{}}));
       }
       else{
        sessionStorage.setItem('user',JSON.stringify( logged.data?.user))
        dispatch(addLoggedUserInfo({user:logged.data?.user,session:logged.data?.session}));
        router.push('/')
       }
      // console.log('loggedUser',logged)
     }
    } catch (error) {
       console.log('error', error);
    }

  };
  return (
    <>
    <Head>
      <title>Login</title>
    </Head>
      <div className="container mx-auto">
        <div className=" sm:w-full lg:w-1/2 xl:w-1/2 border    mx-auto h-auto  gap-1  shadow grid place-items-center p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-14 h-1w-14 border  border-green-400  text-green-500  rounded-full p-3 "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <div className="lg:w-2/3 sm:w-full   gap-1 flex flex-col justify-start    px-10 py-2">
            {errorMessage.email? <p className=" text-sm text-red-500">{errorMessage.email}</p>: <p className=" text-md ">Email</p>}
            <input
              type="text"
              name="email"
              onChange={handleUserInput}
              className="px-5 mb-2 py-3 border "
              placeholder="i.e user@gmail.com"
            />
            
            {errorMessage.password? <p className=" text-sm text-red-500">{errorMessage.password}</p>: <p className=" text-md ">Password</p>}
            <input
              type="password"
              onChange={handleUserInput}
              name="password"
              className="px-5 mb-4 py-3 border "
              placeholder="password"
            />
            
            <button
              type="submit"
              onClick={handleLoginSignup}
              className="w-full p-2 rounded font-medium text-md text-slate-900 bg-orange-300"
            >
              {toggleLoginSignUp ? "Sign Up" : "Login"}
            </button>
            {errorMessage.invalidLogin && <p className="  text-sm text-center text-red-500">{errorMessage.invalidLogin}</p>}
            {errorMessage.verifyEmail && <p className=" text-sm text-center text-green-500">{errorMessage.verifyEmail}</p>}
            {!toggleLoginSignUp && (
            <h5 className=" text-blue-500 mb-0">
              Don&apos;t have an account ?{" "}
              <span
                className="text-black cursor-pointer"
                onClick={(e) => {
                  setToggleLoginSignUp(!toggleLoginSignUp);
                  setErrorMessage({})
                }}
              >
                Create new
              </span>
            </h5>
          )}
          {toggleLoginSignUp && (
            <h5 className=" text-blue-500 mb-0">
              Allready have an account ?{" "}
              <span
                className="text-black cursor-pointer"
                onClick={(e) => {
                  setToggleLoginSignUp(!toggleLoginSignUp);
                  setErrorMessage({})
                }}
              >
                Login
              </span>
            </h5>
          )}
           <h5 className=" text-red-500 mb-2">
             Forget your password ?{" "}
              <span
                className="text-black cursor-pointer"
                onClick={(e) => {
                 openHandler()
                  setErrorMessage({})
                }}
              >
               Change here 
              </span>
            </h5>
          </div>
        
        </div>
        
      </div>
      <CommonModal open={isOpen} onClose={closeHandler} >
       <ForgetPasswordReqModal/>
      </CommonModal>
      <ToastContainer/>
    </>
  );
}
