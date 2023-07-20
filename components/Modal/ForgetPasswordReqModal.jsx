import React, { useState } from "react";
import { EMAIL_PATTERN } from "../User/Login";
import { supabase } from "../../lib/supabaseClient";

export default function ForgetPasswordReqModal() {
  const [errorMessage, setErrorMessage] = useState({});
  const [email, setEmail] = useState("");
  const sendForgetPasswordRequest = async () => {
   try {
    if (!email) {
      setErrorMessage({ email: "This field is required." });
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setErrorMessage({ email: "Invalid email address." });
      return
    }
    const isUserExist= await supabase.rpc('user_exist',{email})
    console.log('user exist',isUserExist)
    if(isUserExist.data){
      const forgetResponse = await supabase.auth.resetPasswordForEmail(email)
    setErrorMessage({
      emailSend:"We have send you reset password email. Please follow the instructions"
    })
    }
    else{
      setErrorMessage({invalidInfo:"User email does not exist."})
    }


//   console.log(' email req send ',forgetResponse)

    
   } catch (error) {
    console.log('error', error);
   }
  };

  return (
    <>
      <div className="p-6 ">
        {errorMessage.email ? (
          <p className=" text-sm text-red-500 mb-1">{errorMessage.email}</p>
        ) : (
          <p className=" mb-1 text-md ">Email</p>
        )}
        <input
          type="text"
          name="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMessage({});
          }}
          className="px-5 mb-5 py-2  border w-full "
          placeholder="i.e user@gmail.com"
        />
        <button
          onClick={sendForgetPasswordRequest}
          className="w-full p-2 mb-2 rounded font-medium text-md text-slate-900 bg-orange-300"
        >
          Submit
        </button>
       {errorMessage.invalidInfo && <h5 className="text-center text-red-500 ">
        {errorMessage.invalidInfo}
       
        </h5>}
        {
          errorMessage.emailSend && <p className="text-center text-sm  text-green-500">
            {errorMessage.emailSend}
          </p>
        }
      </div>
    </>
  );
}
