import React, { useState } from "react";
import { EMAIL_PATTERN, PASSWORD_PATTERN } from "../User/Login";
import { supabase } from "../../lib/supabaseClient";

export default function ForgetPassword() {
  const [errorMessage, setErrorMessage] = useState({});
  const [password, setPassword] = useState("");
  const sendForgetPasswordRequest = async () => {
   try {
    if (!password) {
      setErrorMessage({ password: "This field is required." });
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage({ password: "Invalid password." });
      return
    }
    const { data, error } = await supabase.auth.updateUser({ password });
    setErrorMessage({passwordChanged:"Password changed successfully."})
    console.log('password updated ',data)


//   console.log(' email req send ',forgetResponse)

    
   } catch (error) {
    console.log('error', error);
   }
  };

  return (
    <>
      <div className="p-6 ">
        {errorMessage.password ? (
          <p className=" text-sm text-red-500 mb-1">{errorMessage.password}</p>
        ) : (
          <p className=" mb-1 text-md ">New Password </p>
        )}
        <input
          type="password"
          name="password"
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessage({});
          }}
          className="px-5 mb-5 py-2  border w-full "
          
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
          errorMessage.passwordChanged && <p className="text-center text-sm  text-green-500">
            {errorMessage.passwordChanged}
          </p>
        }
      </div>
    </>
  );
}
