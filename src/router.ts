import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import HomeView from './views/HomeView.vue';
import PragotronView from './views/PragotronView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/board',
    component: PragotronView,
    props: (route) => ({ stationName: route.query.name, region: route.query.region })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
