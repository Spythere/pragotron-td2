import { createApp, Directive } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const pinia = createPinia();

const clickOutsideDirective: Directive = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value();
      }
    };

    document.addEventListener('click', el.clickOutsideEvent);
  }
};

createApp(App)
  .use(router)
  .use(pinia)
  .directive('click-outside', clickOutsideDirective)
  .mount('#app');
