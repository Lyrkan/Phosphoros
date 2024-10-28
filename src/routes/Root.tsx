import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';

export default function Root({ children }: { children?: JSX.Element }) {
  return (
    <>
      <Navbar/>
      <div id="content" className="d-flex flex-grow-1">
        { children ?? <Outlet /> }
      </div>
    </>
  )
}
