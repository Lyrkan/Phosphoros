import { Outlet } from 'react-router';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/RootStore';
import Navbar from '../components/Navbar';
import Splashscreen from '../components/Splashscreen';
import ToastContainer from "../components/ToastContainer";

export default observer(function Root({ children }: { children?: JSX.Element }) {
  const { settingsStore } = useStore();
  const showSplashscreen = !settingsStore.isLoaded;

  return (
    <>
      {!globalThis.isDev && showSplashscreen && <Splashscreen />}
      <Navbar/>
      <div id="content" className="d-flex flex-grow-1">
        { children ?? <Outlet /> }
      </div>
      <ToastContainer />
    </>
  );
});
