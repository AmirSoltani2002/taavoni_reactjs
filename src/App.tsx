import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome";
import {Signin} from "./pages/signin";
import {Signup} from "./pages/signup";
import Layout, {SimpleLayout} from "./components/app/layout";
import LockedPage from "./components/app/locked-page";
import ErrorBoundary from "./components/app/ErrorBoundry";
import ProjectCreate from "./pages/projects/create";
import ProjectsList from "./pages/projects/list";
import UsersList from "./pages/users/userList";
import UserCreate from "./pages/users/create";
import ChatPage from "./pages/tickets/chat";
import TicketsList from "./pages/tickets/ticketList";
import { Suspense } from "react";
import { PageLoader } from "./components/ui/loader";

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<ErrorBoundary><Welcome /></ErrorBoundary>} />
          <Route path="/signin" element={<SimpleLayout><Signin /></SimpleLayout>} />
          <Route path="/signup" element={<SimpleLayout><Signup /></SimpleLayout>} />
          <Route path="/*" element={
            <ErrorBoundary>
              <Layout>
                <Routes>
                  <Route path="/projects/create" element={<ProjectCreate />} />
                  <Route path="/projects/list" element={<ProjectsList />} />
                  <Route path="/tickets/list" element={<TicketsList />} />
                  <Route path="/tickets/:ticketType/:ticketId" element={<ChatPage />} />
                  <Route path="/users/list" element={<UsersList />} />
                  <Route path="/users/create" element={<UserCreate />} />
                  <Route path="/*" element={<LockedPage />} />
                </Routes>
              </Layout>
            </ErrorBoundary>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;