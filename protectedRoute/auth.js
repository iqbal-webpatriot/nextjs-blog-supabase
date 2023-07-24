import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { addLoggedUserInfo } from '../Redux/Features/UserFeature/userSlice';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  
  const Wrapper = (props) => {
    const router = typeof window !== 'undefined' && useRouter();
    const user= JSON.parse(sessionStorage.getItem("user")) || {}
    // const {user,session} = useSelector((state) => state.userReducer);
    if ( !user?.id) {
      typeof window !== 'undefined' && router.push('/login');
      return null;
    }

    return <WrappedComponent {...props} />; // Render the wrapped component if token is present
  };

  return Wrapper;
};

export default withAuth;
