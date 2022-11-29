import '@/assets/css/index.css';
import { DashboardPage } from '@/pages/DashboardPage';
import { IndexPage } from '@/pages/IndexPage';
import Router, { Route } from 'preact-router';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { QuestionPage } from '@/pages/QuestionPage';
import { AuthenticatedRoute } from '@/features/auth/AuthenticatedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Route
          path="/"
          component={IndexPage}
        />

        <AuthenticatedRoute
          path="/dashboard"
          component={DashboardPage}
        />
        <AuthenticatedRoute
          path="/workspace/:creatorId/:workspaceId"
          component={WorkspacePage}
        />
        <AuthenticatedRoute
          path="/workspace/:creatorId/:workspaceId/:questionId"
          component={QuestionPage}
        />
      </Router>
    </AuthProvider>
  );
};

