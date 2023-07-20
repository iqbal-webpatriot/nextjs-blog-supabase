import Navbar from '../components/Navbar/Navbar'
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux'
import { store } from '../Redux/App/store'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  Hydrate,
  
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import BreadCrums from '../components/Navbar/BreadCrums'
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(()=>new QueryClient());
  //!to prevent hydration error between server rendering and client
  const [showChild, setShowChild] = useState(false)

  useEffect(() => {
    setShowChild(true)
  }, [])

  if (!showChild) {
    return null
  }
  
  return<>
  <QueryClientProvider client={queryClient}>
    <Hydrate state={pageProps.dehydratedState}>
  <Provider store={store}>
  <Navbar/>
  <BreadCrums/>
  <Component {...pageProps} />
  
  </Provider>
  </Hydrate>
  <ReactQueryDevtools initialIsOpen={false} />
  <ToastContainer/>
  </QueryClientProvider>
  </>
}
