/** @format */

import { ToastContainer, toast } from 'react-toastify'
import { ConnectionProvider } from '../components/ConnectionProvider'
import Layout from '../components/Layout'
import 'react-toastify/dist/ReactToastify.css'
import '../styles/globals.css'
import { StrictMode } from 'react'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ConnectionProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ConnectionProvider>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 900 }}
      />
    </>
  )
}

export default MyApp
