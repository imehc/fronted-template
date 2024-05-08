import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import About from '~/views/about';
import Home from '~/views/home';
import Index from '~/views/index';

const rootRoute = createRootRoute({
  component: () => <Index />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <About />,
});

const routeTree = rootRoute.addChildren([homeRoute, aboutRoute]);
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default router;
