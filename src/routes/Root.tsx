import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import ToastContainer from "../components/ToastContainer";


export default function Root({ children }: { children?: JSX.Element }) {
  return (
    <>
      <Navbar/>
      <div id="content" className="d-flex flex-grow-1">
        { children ?? <Outlet /> }
      </div>
      <ToastContainer />
    </>
  )
}
