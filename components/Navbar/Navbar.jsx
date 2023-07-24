import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLoggedUserInfo } from "../../Redux/Features/UserFeature/userSlice";
import { resetBlogStateOnLogout } from "../../Redux/Features/blogFeature/blogSlice";

export default function Navbar() {
  const [showAvatartMenu, setShowAvatartMenu] = useState(false);
  // const { session, user } = useSelector((store) => store.userReducer);
  const user= JSON.parse(sessionStorage.getItem("user")) || {}
  const dispatch = useDispatch();
  // console.log("avatart menu state ,", setShowAvatartMenu);
  const closeAvatarMenu = () => {
    setShowAvatartMenu(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0   z-20 w-full flex flex-wrap items-center justify-between py-6 bg-gray-900 text-gray-200 shadow-lg navbar navbar-expand-lg navbar-light">
        <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
          <Link href={"/"}>
            <p>Nextjs Blog</p>
          </Link>

          {/* <!-- Right elements --> */}
          <div className="flex items-center relative">
            {/* <!-- notification Icon --> */}
            {!user.id && (
              <Link href={"/login"}>
                <button
                  type="submit"
                  className=" bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                >
                  Login
                </button>
              </Link>
            )}
            <div className={` dropdown ${user.id ? "" : "hidden"} relative`}>
              <a
                className="text-white hidden opacity-60 hover:opacity-80 focus:opacity-80 mr-4 dropdown-toggle hidden-arrow flex items-center"
                href="#"
                id="dropdownMenuButton1"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="bell"
                  className="w-4"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z"
                  ></path>
                </svg>
                <span className="text-white bg-red-700 absolute rounded-full text-xs -mt-2.5 ml-2 py-0 px-1.5"></span>
              </a>
              <ul
                className="dropdown-menu min-w-max absolute  bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-lg mt-1 hidden m-0 bg-clip-padding border-none left-auto right-0"
                aria-labelledby="dropdownMenuButton1"
              >
                <li>
                  <a
                    className="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                    href="#"
                  >
                    New
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                    href="#"
                  >
                    Another action
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                    href="#"
                  >
                    Something else here
                  </a>
                </li>
              </ul>
            </div>
            {/* {user icons} */}
            <div className={` dropdown ${user.id ? "" : "hidden"} relative`}>
              <span className="absolute top-5 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <a
                className="dropdown-toggle flex items-center hidden-arrow"
                href=""
                id="userAvatar"
                role="button"
                data-bs-toggle="dropdownAvatar"
                aria-expanded="false"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAvatartMenu(!showAvatartMenu);
                }}
              >
                <img
                  src="https://mdbootstrap.com/img/new/avatars/2.jpg"
                  className="rounded-full dropdown-toggle"
                  style={{ height: "25px", width: "25px" }}
                  alt=""
                  loading="lazy"
                />
              </a>

              <ul
                style={{ visibility: showAvatartMenu ? "visible" : "hidden" }}
                id="dropdownAvatar"
                className={
                  "dropdown-menu min-w-max absolute  bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-lg mt-1   m-0 bg-clip-padding border-none left-auto right-0"
                }
                aria-labelledby="userAvatar"
              >
                <li>
                  <Link
                    className="dropdown-item flex items-center gap-2 text-sm py-2 px-4 justify-between font-normal  w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                    href="/blog/create"
                    onClick={closeAvatarMenu}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-plus-lg text-green-600"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                      />
                    </svg>
                    Create New
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item flex gap-2 items-center text-sm py-2 px-4 font-normal w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                    href="/blog"
                    onClick={closeAvatarMenu}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-list text-black"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                      />
                    </svg>
                    All blogs
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item text-sm flex gap-2 py-2 px-4 font-normal items-center w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      closeAvatarMenu();
                      sessionStorage.removeItem('user')
                      dispatch(addLoggedUserInfo({ user: {}, session: {} }));
                      dispatch(resetBlogStateOnLogout());
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi text-red-600 bi-box-arrow-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                      />
                      <path
                        fillRule="evenodd"
                        d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                      />
                    </svg>
                    Logout
                  </Link>
                </li>
              </ul>
              
            </div>
          </div>
          {/* <!-- Right elements --> */}
        </div>
       
      </nav>
    </>
  );
}
