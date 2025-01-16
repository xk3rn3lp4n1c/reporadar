import {
  BrowserRouter as Router,
  Route,
  Outlet,
  Navigate,
  Routes,
} from "react-router-dom";
import Layout from "./Layout";
import Index from "./pages/Index";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="*" element={<Navigate to="/" />} />
          <Route index element={<Index />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
