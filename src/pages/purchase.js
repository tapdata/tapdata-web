import init from '../init'
import Purchase from '../views/Purchase/Purchase.vue'
import Result from '../views/Purchase/Result.vue'
import Error from '../views/Error.vue'

const routes = [
  {
    path: '/',
    name: 'Purchase',
    component: Purchase
  },
  {
    path: '/renew/:id',
    name: 'Renew',
    component: Purchase
  },
  {
    path: '/modify/:id',
    name: 'Modify',
    component: Purchase
  },
  {
    path: '/result',
    name: 'Result',
    component: Result
  },
  {
    path: '/500',
    name: 'Error',
    component: Error,
    meta: {
      isPurchase: true
    }
  },
  {
    path: '/invalid',
    name: 'Invalid',
    component: Error
  },
  {
    path: '/freeze',
    name: 'Freeze',
    component: Error
  },
  {
    path: '/off',
    name: 'Off',
    component: Error
  }
]
init({
  routes
})
