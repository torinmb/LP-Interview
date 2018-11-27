import Home from '../components/Home.vue';

// This is where you add all your site routes
// Each route is set as an obect in the array
// For a the most basic route just set
// the path & component to load

export const routes = [
    {
        path: '',
        name: 'home',
        component: Home,
        meta: {
            title: 'Home',
        }
    },
    {
        path: '*',
        redirect: ''
    }
]