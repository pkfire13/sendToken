/** @format */

import React from 'react'
import Head from 'next/head'
import CookieConsent, { Cookies } from 'react-cookie-consent'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>sendToken</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <div className="px-8 bg-vanilla min-h-screen min-w-fit">{children}</div>
      <CookieConsent
        location="bottom"
        cookieName="agreeToAsIs"
        expires={2}
        overlay
        buttonText="I agree"
        style={{
          background: 'black',
          color: 'White',
        }}
        buttonStyle={{
          background: 'white',
        }}
      >
        <span className="text-xl"> Disclaimer :</span>
        <br />
        <br />
        You are agreeing to use this website as-is. No responsibility for
        incorrect or unitended usage will be assumed by the creators of this
        application. It is your responsibility to read any relevant code and to
        rely on the sole responsibility of yourself for understanding and usage
        of this application and its ramifications.
        <br />
        <br />
        <br />
        THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
        KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        <br />
        <br />
      </CookieConsent>
    </>
  )
}
