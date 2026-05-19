import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style jsx>
        {`
          .errorPage {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
          }

          .textWrap {
            padding: 20px 0;
            text-align: center;
            color: #666666;
          }

          .buttonWrap {
            padding-top: 20px;
          }

          h1 {
            font-size: 72px;
            color: #c00000;
          }
        `}
      </style>

      <div className="errorPage">
        <div className="textWrap">
          <h2>Oops!</h2>
          <h1>404</h1>
          <p>Page not found.</p>
          <div className="buttonWrap">
            <Link href="/" className="primaryButton">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
