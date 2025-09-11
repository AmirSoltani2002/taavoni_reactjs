import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome";
import {Signin} from "./pages/signin";
import {Signup} from "./pages/signup";
import Layout, {SimpleLayout} from "./components/app/layout";
import LockedPage from "./components/app/locked-page";
import ErrorBoundary from "./components/app/ErrorBoundry";
import ProjectCreate from "./pages/projects/create";
import UsersList from "./pages/users/userList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Welcome /></ErrorBoundary>} />
        <Route path="/signin" element={<SimpleLayout><Signin /></SimpleLayout>} />
        <Route path="/signup" element={<SimpleLayout><Signup /></SimpleLayout>} />
        <Route path="/*" element={
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/projects/create" element={<ProjectCreate />} />
                <Route path="/users/list" element={<UsersList />} />
                <Route path="/*" element={<LockedPage />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        } />
      </Routes>
    </Router>
  );
}

export default App;