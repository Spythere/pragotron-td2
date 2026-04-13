import { createApp, type Directive } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import i18n from './i18n';

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
  .use(i18n)
  .directive('click-outside', clickOutsideDirective)
  .mount('#app');
